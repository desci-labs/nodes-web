import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  PDF_PAGE_SPACING,
} from "@src/components/organisms/Paper";
import { APPROXIMATED_HEADER_HEIGHT } from "@src/components/utils";
import { useWindowDimensions } from "@src/hooks";
import { usePageZoomedOffset, usePdfReader } from "@src/state/nodes/hooks";
import { addToZoom, resetCenteredZoom } from "@src/state/nodes/pdf";
import { useSetter } from "@src/store/accessors";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGesture, usePinch } from "react-use-gesture";

export default function useGestureZoom() {
  const {
    pdfCurrentPage,
    isEditingAnnotation,
    zoom,
    pageMetadata,
    centeredZoom,
  } = usePdfReader();

  const [pinching, setPinching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useSetter();
  const { width: windowWidth } = useWindowDimensions();
  //   const pageWidth = Math.min(DEFAULT_WIDTH, windowWidth);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const getPageZoomedOffset = usePageZoomedOffset();

  const manuscriptControllerObj = useManuscriptController([
    "scrollRef",
    "scrollToPage$",
    "lastScrollTop",
  ]);

  const { scrollRef, scrollToPage$, lastScrollTop } = manuscriptControllerObj;
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

        // scrollRef?.current.scrollTo(newScrollX, newScrollY);
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

  return { containerRef, pinching, setPinching, isDragging, setIsDragging };
}
