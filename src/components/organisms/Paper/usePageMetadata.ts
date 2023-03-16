import { usePageZoomedOffset, usePdfReader } from "@src/state/nodes/hooks";
import { setCurrentPage } from "@src/state/nodes/pdf";
import { useSetter } from "@src/store/accessors";
import { useCallback, useEffect, useState } from "react";
import {
  PDFDocumentProxy,
  PDFPageProxy,
} from "react-pdf/node_modules/pdfjs-dist/types/src/display/api";
import { PDF_PAGE_SPACING, viewportTarget$ } from ".";
import { useManuscriptController } from "../ManuscriptReader/ManuscriptController";

export interface PageMetadata {
  pageIndex: number;
  width: number;
  height: number;
  ratio: number;
  documentOffset: number;
  page: PDFPageProxy;
}

const usePageMetadata = (
  pdf: PDFDocumentProxy | null,
  pageWidth: number,
  pinching: boolean
) => {
  const dispatch = useSetter();
  const { zoom } = usePdfReader();
  const { pageMetadata, setPageMetadata } = useManuscriptController([
    "pageMetadata",
  ]);
  const getPageZoomedOffset = usePageZoomedOffset();

  const [avgPageHeight, setAvgPageHeight] = useState<number>(0);
  const [intersectingPages, setIntersectingPages] = useState<number[]>([]);

  useEffect(() => {
    if (pdf) {
      const promises = Array.from(
        { length: pdf.numPages },
        (v, i) => i + 1
      ).map((pageNumber) => {
        return pdf.getPage(pageNumber);
      });

      // Assuming all pages may have different heights. Otherwise we can just
      // load the first page and use its height for determining all the row
      // heights. NOTE: For PDFs each page can have different dimensions
      Promise.all(promises).then((pages) => {
        const pageDimensions: PageMetadata[] = [];

        let totalPageHeight = 0;
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];

          const w = page.view[2];
          const h = page.view[3];

          const ratio = h / w;
          const width = pageWidth;
          const height = pageWidth * ratio;

          let documentOffset = 0;
          if (i !== 0) {
            const prevPageOffset = pageDimensions[i - 1].documentOffset;
            const prevPageHeight = pageDimensions[i - 1].height;
            documentOffset = prevPageOffset + prevPageHeight + PDF_PAGE_SPACING;
          }

          pageDimensions.push({
            pageIndex: i,
            ratio,
            width,
            height,
            documentOffset,
            page,
          });
          totalPageHeight += height;
        }

        setPageMetadata(pageDimensions);
        setAvgPageHeight(totalPageHeight / pages.length);
      });
    }
  }, [pdf]);

  const getPercentOfViewport = (
    viewportTarget: any,
    pageMetadata: PageMetadata
  ) => {
    if (!pageMetadata) {
      return 0;
    }
    const pageDocumentOffset = getPageZoomedOffset(pageMetadata.pageIndex);
    const topMarginPercent =
      Math.max(pageDocumentOffset - viewportTarget.scrollTop, 0) /
      viewportTarget.offsetHeight;

    const bottomMarginPercent =
      Math.max(
        viewportTarget.scrollTop +
          viewportTarget.offsetHeight -
          (pageDocumentOffset + pageMetadata.height * zoom),
        0
      ) / viewportTarget.offsetHeight;

    const percentOfViewport = 1 - topMarginPercent - bottomMarginPercent;

    return percentOfViewport;
  };

  const onViewportChange = useCallback(
    (viewportTarget: any) => {
      if (pageMetadata && pageMetadata.length) {
        const searchRange = [0, pageMetadata.length - 1];

        // estimate what page index the viewport may be intersecting
        const estimatePageIndexInView = (
          scrollTop: number,
          fromIndex: number = 0
        ) => {
          const indexMagnitude = Math.min(
            Math.max(
              Math.round(scrollTop / (avgPageHeight * zoom + PDF_PAGE_SPACING)),
              searchRange[0]
            ),
            searchRange[1]
          );
          return fromIndex + indexMagnitude;
        };

        let firstInViewIndex = estimatePageIndexInView(
          viewportTarget?.scrollTop
        );

        /**
         * "Best Guess" Binary Search.
         * Using a pre-calculated average page height, guess what page is most likely in
         * the viewport.
         *
         * Continues to guess a page index in view until it finds one. Narrows potential page
         * index down each iteration. Pretty effective. Usually only takes one, at most two,
         * iterations to find a page intersecting with the viewport.
         */
        while (
          getPercentOfViewport(
            viewportTarget,
            pageMetadata[firstInViewIndex]
          ) === 0
        ) {
          const pageScrollTop = pageMetadata[firstInViewIndex].documentOffset;
          const pageHeight = pageMetadata[firstInViewIndex].height;

          // limit searchRange depending on which direction the viewport is
          if (
            viewportTarget.scrollTop + viewportTarget.height <
            pageScrollTop
          ) {
            searchRange[0] = firstInViewIndex + 1;
          }
          if (viewportTarget.scrollTop > pageScrollTop + pageHeight) {
            searchRange[1] = firstInViewIndex - 1;
          }

          // get the pixel offset distance from where we last guessed to the viewport
          let offsetDiffMagnitude =
            getPageZoomedOffset(firstInViewIndex) - viewportTarget.offsetTop;

          // estimate the page index again
          firstInViewIndex += estimatePageIndexInView(
            offsetDiffMagnitude,
            firstInViewIndex
          );
        }

        /**
         * Once we find a page that's in view, incrementally check that page's
         * neighboring pages to see if they are intersecting the viewport as well. As soon as all pages that
         * are in view are discovered, break.
         *
         * The page with the highest percent of the viewport (PoV) gets set as pdfCurrentPage
         */
        let maxPoV: { index: number; amount: number } = {
          index: firstInViewIndex,
          amount: getPercentOfViewport(
            viewportTarget,
            pageMetadata[firstInViewIndex]
          ),
        };
        const intersectingPages = [firstInViewIndex + 1];
        let start = firstInViewIndex - 1;
        let end = firstInViewIndex + 1;
        while (true) {
          const startPoV =
            start >= 0
              ? getPercentOfViewport(viewportTarget, pageMetadata[start])
              : 0;
          const endPoV =
            end < pageMetadata.length
              ? getPercentOfViewport(viewportTarget, pageMetadata[end])
              : 0;

          if (startPoV === 0 && endPoV === 0) {
            break;
          }

          if (startPoV > 0) {
            intersectingPages.push(start + 1);
            if (startPoV > maxPoV.amount) {
              maxPoV = {
                index: start,
                amount: startPoV,
              };
            }
          }

          if (endPoV > 0) {
            intersectingPages.push(end + 1);
            if (endPoV > maxPoV.amount) {
              maxPoV = {
                index: end,
                amount: endPoV,
              };
            }
          }

          start--;
          end++;
        }
        setIntersectingPages(intersectingPages);
        dispatch(setCurrentPage(maxPoV.index + 1));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageMetadata, pageWidth, zoom, avgPageHeight]
  );

  useEffect(() => {
    if (!pinching) {
      const subscription = viewportTarget$.subscribe(onViewportChange);
      return () => subscription.unsubscribe();
    }
  }, [onViewportChange, pinching]);

  return {
    pageMetadata,
    intersectingPages,
  };
};

export default usePageMetadata;
