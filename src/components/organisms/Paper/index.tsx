import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document } from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import "./style.scss";

import { APPROXIMATED_HEADER_HEIGHT } from "@components/utils";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import { useScrolling, useUpdateEffect } from "react-use";
import { PageComponentHOC } from "./Page";

import { useGesture } from "@use-gesture/react";
import { useResponsive, useWindowDimensions } from "hooks";
import debounce from "lodash.debounce";
import { usePinch } from "react-use-gesture";
import { BehaviorSubject } from "rxjs";

import { pdfjs } from "react-pdf";
import { PDFDocumentProxy } from "react-pdf/node_modules/pdfjs-dist/types/src/display/api";
import {
  handleTextSelect,
  HighlightCallbackProps,
} from "@components/textSelectUtils";
import { LTWHP } from "lib/highlight-types";
import usePageMetadata, { PageMetadata } from "./usePageMetadata";
import React from "react";
import ManifestUpdater from "@components/atoms/ManifestUpdater";
import {
  DEFAULT_WIDTH,
  PDF_PAGE_SPACING,
  MAX_ZOOM,
  MIN_ZOOM,
} from "./constants";
import {
  useNodeReader,
  usePageZoomedOffset,
  usePdfReader,
} from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  addToZoom,
  initialState,
  resetCenteredZoom,
  setCurrentPage,
  setLoadState,
  setViewLoading,
  setZoom,
  updatePdfPreferences,
} from "@src/state/nodes/pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const viewportTarget$ = new BehaviorSubject<any>(null);
export * from "./constants";
// how many pages you can scroll before dismissing selected annotation
const Paper = ({ id, options, dirtyComment, payload }: any) => {
  const dispatch = useSetter();
  const { isResearchPanelOpen, componentStack } = useNodeReader();
  const { annotations } = payload;
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ResearchObjectComponentAnnotation[]
  >(annotations || []);
  const [pinching, setPinching] = useState<boolean>(false);
  // const [annotationsByPage, setAnnotationsByPage] = useState<any>([]);
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = Math.min(DEFAULT_WIDTH, windowWidth);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const { isDesktop } = useResponsive();
  const {
    pdfCurrentPage,
    currentPdf,
    zoom,
    viewLoading,
    isAnnotating,
    selectedAnnotationId,
    centeredZoom,
    isEditingAnnotation,
    loadState: { loadPercent, loadProgressTaken },
  } = usePdfReader();

  const getPageZoomedOffset = usePageZoomedOffset();

  const manuscriptControllerObj = useManuscriptController([
    "scrollRef",
    "scrollToPage$",
    "lastScrollTop",
  ]);

  const { scrollRef, scrollToPage$, lastScrollTop } = manuscriptControllerObj;

  const { pageMetadata, intersectingPages } = usePageMetadata(
    documentRef?.current,
    pageWidth,
    pinching
  );

  const PAGE_BUFFER = 5;
  const intersectingPagesWithPadding = [...intersectingPages].sort(
    (a: number, b: number) => a - b
  );
  const minIntersect = intersectingPagesWithPadding[0];
  const pageCount = Object.keys(pageMetadata).length;
  const maxIntersect =
    intersectingPagesWithPadding[intersectingPages.length - 1];
  // const pageDelta = maxIntersect - minIntersect;
  const maxSteps = PAGE_BUFFER + 1;
  for (let i = 1; i < maxSteps; i++) {
    const smaller = minIntersect - i;
    if (smaller > 0) {
      intersectingPagesWithPadding.unshift(smaller);
    }
    const bigger = maxIntersect + i;
    if (bigger <= pageCount) {
      intersectingPagesWithPadding.push(bigger);
    }
  }
  // console.log("INTER", intersectingPagesWithPadding, pageDelta);

  const isScrolling = useScrolling(scrollRef ? scrollRef : containerRef);
  // const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const doCenteredZoom = useCallback(
    (zoomMagnitude: number, centerCoords?: [number, number]) => {
      const bounds = containerRef!.current!.getBoundingClientRect();
      const { width } = bounds;
      if (!scrollRef?.current) {
        console.warn("Missing scroll ref for centered zoom");
        return;
      }
      const {
        scrollTop,
        scrollLeft,
        offsetWidth: containerWidth,
        offsetHeight: containerHeight,
      } = scrollRef?.current;

      centerCoords = centerCoords || [containerWidth / 2, containerHeight / 2];

      const accumulativePdfSpacing = PDF_PAGE_SPACING * (pdfCurrentPage - 1);

      // prevent zooming when rubberbanding on mobile (while zoomed in) to prevent zooming bug
      if (
        width > containerWidth &&
        (scrollLeft < 0 || scrollLeft - (width - containerWidth) > 1)
      ) {
        return;
      }

      // const zoomToAdd = delta[0] / (windowWidth / 2); // use windowWidth otherwise behavior is noticeably different with different screen sizes
      dispatch(addToZoom(zoomMagnitude));

      let newScrollX = scrollLeft;
      let newScrollY = scrollTop;
      // zoom centering - zoom point of the cursor on the page to the point of the cursor in the viewport
      if (
        (zoom < MAX_ZOOM || zoom + zoomMagnitude < MAX_ZOOM) &&
        (zoom > MIN_ZOOM || zoom + zoomMagnitude > MIN_ZOOM)
      ) {
        const oldZoom = zoom;
        const newZoom = Math.max(
          Math.min(zoom + zoomMagnitude, MAX_ZOOM),
          MIN_ZOOM
        );

        /**
         * Gets new y scroll position when zooming to cursor
         *
         * 1. Get document position by adding scrollTop and the cursor y coord in viewport.
         * 2. Get height to be zoomed by removing header heights and page margins from document position (heightNotToBeZoomed)
         * 3. Get zoomed document position by applying zoom to heightToBeZoomed and adding back heightNotToBeZoomed
         * 4. Get new scroll position by subtracting the cursor y coord from the new document position
         *
         * TODO: replace APPROXIMATED_HEADER_HEIGHT with something more dynamic in case header isn't there
         */
        const documentPositionY = scrollTop + centerCoords[1];
        const heightNotToBeZoomed =
          APPROXIMATED_HEADER_HEIGHT + accumulativePdfSpacing;
        const heightToBeZoomed = documentPositionY - heightNotToBeZoomed;
        const newDocumentPositionY =
          (heightToBeZoomed * newZoom) / oldZoom + heightNotToBeZoomed;
        newScrollY = newDocumentPositionY - centerCoords[1];

        // If you understand the y position algorithm above, this one should be cake
        // Easier because there is no header or static margins to deal with
        const documentPositionX = scrollLeft + centerCoords[0];
        const newDocumentPositionX = (documentPositionX * newZoom) / oldZoom;
        newScrollX = newDocumentPositionX - centerCoords[0];

        scrollRef?.current.scrollTo(newScrollX, newScrollY);
      }
    },
    [scrollRef, pdfCurrentPage, addToZoom, zoom]
  );

  useGesture(
    {
      // onHover: ({ active, event }) => console.log('hover', event, active),
      // onMove: ({ event }) => console.log("move", event),
      onDrag: (state: any) => {
        const { pinching, dragging, cancel, movement, event } = state;

        /**
         * Without this, if we are editing an annotation and the user presses arrow keys the app crashes
         */
        if (isEditingAnnotation) {
          return;
        }
        if (event.pointerType === "mouse" || pinching) return cancel();
        setIsDragging(dragging && (movement[0] > 0 || movement[1] > 0));
        // TODO: allow dragging while pinching (code might need to actually reside in onPinch instead of here)
      },
      onPinch: (state: any) => {
        const { pinching } = state;

        /**
         * Without this, if we are editing an annotation and the user presses arrow keys the app crashes
         */
        if (isEditingAnnotation) {
          return;
        }
        // this function is better at detecting pinch event than usePinch, but usePinch is better at scaling
        setPinching(pinching);
      },
    },
    {
      target: scrollRef,
      // drag: { preventScroll: true },
      // pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
      eventOptions: {
        passive: false,
      },
    }
  );

  usePinch(
    (state: any) => {
      const {
        pinching,
        delta,
        origin, // mouse coordinates in viewport (i.e. not larger than dimensions of screen)
      } = state;
      console.log("pinch");
      setPinching(pinching);

      /**
       * Modifying dampening on desktop so that each mouse wheel click results ~15% zoom
       * Conversely, on mobile, we want the zoom to feel close to iOS native, which needs less dampening
       */
      const dampening = windowWidth > 500 ? 2 : 2;
      const zoomMagnitude = delta[0] / (windowWidth / 2) / dampening; // use windowWidth otherwise behavior is noticeably different with different screen sizes

      doCenteredZoom(zoomMagnitude, origin);

      // setOutput({
      //   sX: parseInt(newScrollX),
      //   sY: parseInt(newScrollY),
      //   o: [parseInt(origin[0]), parseInt(origin[1])],
      //   d: delta[0].toFixed(2),
      //   pinching,
      // });
    },
    {
      domTarget: scrollRef,
      eventOptions: {
        passive: false,
      },
    }
  );

  useEffect(() => {
    if (scrollRef?.current) {
      const subscription = scrollToPage$.subscribe((pageNum: number | null) => {
        if (pageNum) {
          scrollRef.current.scrollTo({
            top: getPageZoomedOffset(pageNum - 1),
            behavior: "smooth",
          });
        }
      });
      return () => subscription.unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPage$, pageMetadata, scrollRef?.current]);

  const openLinkInNewTab = (e: any) => {
    e.preventDefault();
    const target = e.target as HTMLAnchorElement;
    if (target.tagName.toLowerCase() === "a") {
      // !!!HARDCODED
      // TODO: go to annotation based on query-string or other URL param
      if (target.href.indexOf("a=2") > -1) {
        setTimeout(() => {
          // setSelectedAnnotationId("ba055c79-1cf0-4dab-bc72-465d7bb480fe");
        }, 0);
        return;
      }
    }
  };

  useUpdateEffect(
    () => () => {
      dispatch(setCurrentPage(0));
    },
    []
  );

  const gestureContainerRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: any) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    document.addEventListener("gestureend", handler);

    setHighlightPrompt(null);
    const keydownHandler = function (e: any) {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.keyCode === 61 ||
          e.keyCode === 107 ||
          e.keyCode === 173 ||
          e.keyCode === 109 ||
          e.keyCode === 187 ||
          e.keyCode === 189)
      ) {
        e.preventDefault();
        if (e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 187) {
          doCenteredZoom(0.25);
        }
        if (e.keyCode === 173 || e.keyCode === 109 || e.keyCode === 189) {
          doCenteredZoom(-0.25);
        }
      }
    };

    document.addEventListener("keydown", keydownHandler, false);

    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
      document.removeEventListener("keydown", keydownHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]); // need zoom here or it doesn't update in doCenteredZoom for some reason

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdate = useCallback(
    debounce((pct) => {
      if (!loadProgressTaken && pct > loadPercent) {
        // setLoadPercent(pct);
        dispatch(setLoadState({ loadPercent: pct }));
      }
    }, 100),
    [loadProgressTaken, loadPercent]
  );

  /**TODO: Annotate a selection */
  const [, setRectsByPage] = useState<{ [key: string]: LTWHP[] }>({});

  const [highlightPrompt, setHighlightPrompt] =
    useState<HighlightCallbackProps | null>();

  const onTextSelect = (select: HighlightCallbackProps) => {
    let rects: { [key: string]: LTWHP[] } = {};
    select.rects.forEach((r: LTWHP) => {
      const num = r.pageNumber! + "";
      if (!rects[num]) {
        rects[num] = [];
      }
      rects[num].push(r);
    });
    setHighlightPrompt(select);
    setRectsByPage(rects);
  };

  const onTextSelectCancel = () => {
    setHighlightPrompt(null);
  };

  // __log("Paper::beforeRender, currentPdf", currentPdf);

  //listen for centered zoom calls and execute them
  useEffect(() => {
    if (centeredZoom) {
      doCenteredZoom(
        centeredZoom.zoomMagnitude,
        centeredZoom.centerCoords && centeredZoom.centerCoords
      );
      // console.log("exected centered zoom: ", centeredZoom.zoomMagnitude);
      dispatch(resetCenteredZoom());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centeredZoom, doCenteredZoom]);

  const isActiveComponent =
    componentStack && !!componentStack.filter((a) => a.id === id).length;

  const canPan = useMemo(() => {
    if (!containerRef.current) return false;
    // const visibleWidth = isResearchPanelOpen ? windowWidth - 320 : windowWidth;
    return containerRef.current.clientWidth >= windowWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResearchPanelOpen, containerRef?.current?.clientWidth]);

  return (
    <>
      <div
        className={`w-screen left-0 right-0 bottom-0`}
        onDoubleClick={() => {
          if (!isDesktop) {
            if (zoom === initialState["zoom"]) {
              dispatch(addToZoom(0.25));
            } else {
              dispatch(setZoom(initialState["zoom"]));
            }
          }
        }}
        style={{
          height: `calc(${window.innerHeight}px - ${
            APPROXIMATED_HEADER_HEIGHT + 5
          }px)`,
        }}
        onClick={onTextSelectCancel}
      >
        <ManifestUpdater
          componentId={id}
          pendingAnnotations={pendingAnnotations}
          setPendingAnnotations={setPendingAnnotations}
        />

        <div
          ref={gestureContainerRef}
          onClick={openLinkInNewTab}
          className={`w-fit overflow-x-auto h-fit flex flex-row  ${
            isResearchPanelOpen ? "w-[100%]" : "min-w-full"
          } ${canPan ? "justify-start" : "justify-center"}`}
          style={{
            maxWidth: isResearchPanelOpen ? `${windowWidth}px` : "100vw",
          }}
        >
          <Document
            inputRef={(ref: HTMLDivElement) => (containerRef.current = ref)}
            noData={<></>}
            file={currentPdf}
            onItemClick={(pageNumber: any) => {
              scrollToPage$.next(parseInt(pageNumber.pageNumber));
            }}
            onLoadProgress={useCallback(
              (data) => {
                // setLoadError(false);
                // setLoadProgressTaken(true);
                dispatch(
                  setLoadState({ loadError: false, loadProgressTaken: true })
                );
                const pct = Math.round((data.loaded / data.total) * 100);
                if (pct >= loadPercent && viewLoading) {
                  debounceUpdate(pct);
                }
              },
              [dispatch, loadPercent, viewLoading, debounceUpdate]
            )}
            onSourceSuccess={() => {
              dispatch(setViewLoading(true));
            }}
            onLoadSuccess={(document: PDFDocumentProxy) => {
              const { numPages } = document;
              documentRef.current = document;
              // cachePageDimensions(document);
              // console.log("REST", rest);
              // setViewLoading(false);
              dispatch(setViewLoading(false));
              // setLoadProgressTaken(false);
              dispatch(
                setLoadState({
                  loadProgressTaken: true,
                })
              );

              debounceUpdate(0);
              // setNumPages(numPages);
              // setPdfTotalPages(numPages);
              // resetPdfCurrentPage();

              dispatch(
                updatePdfPreferences({
                  pdfTotalPages: numPages,
                  pdfCurrentPage: 0,
                })
              );

              const lastScroll =
                lastScrollTop[componentStack[componentStack.length - 1].id];
              if (lastScroll) {
                const times = [50, 100, 500];
                times.forEach((dur) => {
                  setTimeout(() => {
                    window.document.scrollingElement!.scrollTop = lastScroll;
                  }, dur);
                });
              }
            }}
            onLoadError={() => {
              // setLoadProgressTaken(false);
              // setLoadError(true);
              dispatch(
                setLoadState({
                  loadProgressTaken: false,
                  loadError: true,
                  loadPercent: 0,
                })
              );
              throw Error(`Document failed to load`);
            }}
            options={{
              standardFontDataUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
              cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
              // disableFontFace: true,
              ...options,
            }}
            // loading={<PaperLoader />}
            loading={""}
            error={
              <div className="mt-10 bg-gray-300 p-3 rounded-sm">
                This document failed to load
              </div>
            }
            className={`relative w-fit`}
            // renderMode="svg"
          >
            {pageMetadata.map(
              (pageMetadataItem: PageMetadata, index: number) => {
                // return Math.abs(pdfCurrentPage - (index + 1)) < PAGE_RENDER_DISTANCE ? (
                // return false && false ? (
                return (
                  <div
                    key={`Placeholder_div_${index + 1}`}
                    // key={`PageComponentHOC_${currentPdf}_${index + 1}`}
                    style={{
                      position: "relative",
                      width: pageWidth * zoom,
                      height: pageWidth * (pageMetadataItem.ratio || 1) * zoom,
                      marginBottom: PDF_PAGE_SPACING,
                      backgroundColor: "white",
                    }}
                  >
                    <PlaceholderImage
                      pageNumber={index + 1}
                      page={pageMetadataItem.page}
                    />
                  </div>
                );
              }
            )}

            {
              // [-2, -1, 0, 1, 2].map((mag: number) => pdfCurrentPage + mag)
              intersectingPagesWithPadding.map((pageNum: number) => {
                const index = pageNum - 1;
                if (!pageMetadata || !pageMetadata[index]) return null;
                const pageMetadataItem = pageMetadata[index];
                return (
                  <div
                    key={`intersecting_page_${index}`}
                    style={{
                      position: "absolute",
                      width: pageWidth * zoom,
                      height: pageWidth * (pageMetadataItem.ratio || 1) * zoom,
                      top: getPageZoomedOffset(index),
                      left: 0,
                    }}
                  >
                    <div
                      key={`wrap_PageComponentHOC_${currentPdf}_${pageNum}`}
                      className={`flex flex-row justify-center items-center ${
                        isEditingAnnotation &&
                        pendingAnnotations &&
                        selectedAnnotationId !== undefined &&
                        pendingAnnotations.filter(
                          (a) => a.id === selectedAnnotationId
                        )[0]?.pageIndex !== index
                          ? ""
                          : ""
                      }`}
                      onMouseUp={handleTextSelect(
                        containerRef,
                        documentRef,
                        index,
                        onTextSelect,
                        onTextSelectCancel
                      )}
                    >
                      <PageComponentHOC
                        key={`PageComponentHOC_${currentPdf}_${pageNum}`}
                        pageNumber={pageNum}
                        width={pageWidth}
                        pageAnnotations={pendingAnnotations}
                        setPageAnnotations={setPendingAnnotations}
                        dirtyComment={dirtyComment}
                        isActiveComponent={isActiveComponent}
                        isPinching={pinching}
                        // cachedPageDimensions={cachedPageDimensions}
                        isScrolling={isScrolling || isDragging}
                        setHighlightPrompt={setHighlightPrompt}
                        highlightPrompt={
                          highlightPrompt?.boundingRect.pageNumber === index
                            ? highlightPrompt
                            : undefined
                        }
                        zoom={zoom}
                        selectedAnnotationId={selectedAnnotationId}
                        isAnnotating={isAnnotating}
                        pageMetadata={pageMetadataItem}
                        isIntersecting={intersectingPagesWithPadding.includes(
                          pageNum
                        )}
                      />
                    </div>
                  </div>
                );
              })
            }
          </Document>
          <div
            style={{
              display: canPan && isResearchPanelOpen ? "block" : "none",
              minWidth: isResearchPanelOpen ? "320px" : "0",
              position: canPan && isResearchPanelOpen ? "relative" : "absolute",
              right: "0",
              top: "0",
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Paper;

/**
 * TODO: React 18 should allow us to render these faster without
 * blocking the main UI thread
 */
const PlaceholderImage = React.memo((props: any) => {
  const [image] = useState<string>();

  /**
   * Each page is rendering a placeholder image at the specified rate in
   * PLACEHOLDER_IMAGE_GENERATION_RATE_IN_MS multiplied by its page index,
   * ensuring they aren't all trying to render at the same time, blocking
   * the UI.
   */
  // useEffect(() => {
  //   setTimeout(() => {
  //     const canvas = document.createElement("canvas");
  //     const viewport = page.getViewport({ scale: 1 });
  //     const context = canvas.getContext("2d");
  //     canvas.height = viewport.height;
  //     canvas.width = viewport.width;

  //     page.render({ canvasContext: context || {}, viewport: viewport }).promise.then(() => {
  //       const base64String = canvas.toDataURL()
  //       setImage(base64String)
  //       canvas.remove()
  //     });
  //   }, (pageNumber - 1) * PLACEHOLDER_IMAGE_GENERATION_RATE_IN_MS)
  // }, [pageNumber])

  return image ? (
    <img
      src={image}
      alt=""
      className={`absolute top-0 left-0 right-0 bottom-0 w-full h-full`}
    />
  ) : null;
});
