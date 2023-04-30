import getClientRects from "@components/../lib/get-client-rects";
import getBoundingRect from "@components/../lib/get-bounding-rect";
import { MutableRefObject } from "react";
import { PDFDocumentProxy } from "react-pdf/node_modules/pdfjs-dist/types/src/display/api";
import { LTWHP } from "lib/highlight-types";

// `itemIndex` is given
const getItemOffset = async (
  documentRef: MutableRefObject<PDFDocumentProxy | null>,
  pageNumber: number,
  itemIndex = Infinity
) => {
  const page = await documentRef.current!.getPage(pageNumber);
  const textContent = await page.getTextContent();

  return textContent.items
    .slice(0, itemIndex)
    .reduce((acc: number, item: any) => acc + item.str.length, 0);
};

// Calculates total length of all previous pages
const getPageOffset = async (
  documentRef: MutableRefObject<PDFDocumentProxy | null>,
  pageNumber: number
) => {
  const pageLengths = await Promise.all(
    Array.from({ length: pageNumber - 1 }, (_, index) =>
      getItemOffset(documentRef, index + 1)
    )
  );

  return pageLengths.reduce((acc, pageLength) => acc + pageLength, 0);
};

const getItemIndex = (item: any) => {
  let index = 0;

  while ((item = item.previousSibling) !== null) {
    index++;
  }

  return index;
};

const getTotalOffset = async (
  documentRef: MutableRefObject<PDFDocumentProxy | null>,
  container: any,
  offset: number
) => {
  const textLayerItem = container.parentNode;
  const textLayer = textLayerItem.parentNode;
  const page = textLayer.parentNode;

  const pageNumber = parseInt(page.dataset.pageNumber, 10);
  const itemIndex = getItemIndex(textLayerItem);

  const [pageOffset, itemOffset] = await Promise.all([
    getPageOffset(documentRef, pageNumber),
    getItemOffset(documentRef, pageNumber, itemIndex),
  ]);

  return pageOffset + itemOffset + offset;
};

export interface HighlightCallbackProps {
  startTotalOffset: number;
  endTotalOffset: number;
  commonAncestorContainer: Node;
  endContainer: Node;
  endOffset: number;
  startContainer: Node;
  startOffset: number;
  selection: Selection;
  rects: LTWHP[];
  boundingRect: LTWHP;
}

export const handleTextSelect =
  (
    containerRef: MutableRefObject<HTMLDivElement | null>,
    documentRef: MutableRefObject<PDFDocumentProxy | null>,
    pageNumber: number,
    callback: (props: HighlightCallbackProps) => void,
    cancel: () => void
  ) =>
  async () => {
    if (containerRef.current === null || documentRef.current === null) {
      // Not loaded yet
      cancel();
      return;
    }

    const selection = window.getSelection()!;

    if (selection.toString() === "") {
      // Selection is empty
      cancel();
      return;
    }
    const {
      commonAncestorContainer,
      endContainer,
      endOffset,
      startContainer,
      startOffset,
    } = selection.getRangeAt(0);

    if (!containerRef!.current!.contains(commonAncestorContainer)) {
      // Selection partially outside PDF document
      return;
    }

    const [startTotalOffset, endTotalOffset] = await Promise.all([
      getTotalOffset(documentRef, startContainer, startOffset),
      getTotalOffset(documentRef, endContainer, endOffset),
    ]);

    console.log(`Selected ${startTotalOffset} to ${endTotalOffset}`);

    const closestPage = startContainer.parentElement!.closest(
      ".react-pdf__Page__textContent"
    )! as HTMLElement;
    let pages = [
      {
        node: closestPage,
        number: pageNumber,
      },
    ];

    const rects = getClientRects(selection.getRangeAt(0), pages, false);

    const boundingRect = getBoundingRect(rects);

    callback({
      startTotalOffset,
      endTotalOffset,
      commonAncestorContainer,
      endContainer,
      endOffset,
      startContainer,
      startOffset,
      selection,
      rects,
      boundingRect,
    });
  };
