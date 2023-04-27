import { v4 as uuid } from "uuid";
import React, {
  HTMLProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import "./style.scss";
import { __log } from "@components/utils";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  setAnnotatingViaButton,
  setIsAnnotating,
  updatePdfPreferences,
} from "@src/state/nodes/pdf";
import {
  replaceAnnotations,
  updatePendingAnnotations,
} from "@src/state/nodes/viewer";

interface AnnotationEditCanvasProps {
  pageIndex: number;
}

let pagesAnnotated: any = {};
const AnnotationEditCanvas: React.FC<
  AnnotationEditCanvasProps & HTMLProps<HTMLDivElement>
> = (props) => {
  const dispatch = useSetter();

  const { isAnnotating, startedNewAnnotationViaButton } = usePdfReader();
  const { pageIndex, children, className, ...rest } = props;

  const [dragStart, setDragStart] = useState([0, 0]);
  const [dragging, setDragging] = useState(false);
  const [currentAnnotationId, setCurrentAnnotationId] = useState<
    string | null
  >();

  const { annotationsByPage, annotations } = useNodeReader();
  // const annotations = annotationsByPage[pageIndex] || [];
  const setAnnotations = (arg: any) => {
    // console.log("set annotations", arg);

    dispatch(replaceAnnotations(arg || []));
  };

  const divRef = useRef<HTMLDivElement | null>(null);
  /**
   * Required to make sure alt+mouse drag works consistently
   */
  useEffect(() => {
    if (startedNewAnnotationViaButton) {
      return;
    }
    const el = divRef.current;
    const handleAnnotationTrigger = (ev: MouseEvent) => {
      if (ev.altKey) {
        if (!isAnnotating) {
          dispatch(setIsAnnotating(true));
        }
      } else {
        if (isAnnotating) {
          dispatch(setIsAnnotating(false));
        }
      }
    };
    if (el) {
      el.addEventListener("mousemove", handleAnnotationTrigger);
      el.addEventListener("mouseenter", handleAnnotationTrigger);
      el.addEventListener("mouseleave", handleAnnotationTrigger);
    }
    return () => {
      if (el) {
        el.removeEventListener("mousemove", handleAnnotationTrigger);
        el.removeEventListener("mouseenter", handleAnnotationTrigger);
        el.removeEventListener("mouseleave", handleAnnotationTrigger);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef, startedNewAnnotationViaButton, isAnnotating]);

  /**
   * This is the default size of the annotation rectangle when the user starts dragging
   * If they simply click to annotate, it will make a small rect of this size
   */
  const DEFAULT_RADIUS = 10;

  /**
   * Sometimes the target element for the mouse interactions is not the page itself
   * We need a ref to the page element to calculate annotation rectangle accurately
   * This helps us get the right target element from the event
   */
  const findTarget = (e: any) => {
    let target: HTMLElement = e.target;
    if (target) {
      if (
        target.attributes.getNamedItem("data-annotation-target")?.value ===
        "should-skip"
      ) {
        // this condition should never trigger because we set pointer-events-none on the bubble elements while isAnnotating is true
        // see AnnotationLayer.tsx
        target = target.parentElement!;
      }
      return target;
    } else {
      return { clientWidth: 1, clientHeight: 1 };
    }
  };

  const mouseDown = (e: any) => {
    if (isAnnotating || e.altKey) {
      __log(
        "AnnotationEditCanvas::mouseDown",
        pageIndex,
        currentAnnotationId,
        JSON.stringify(annotations),
        e.target
      );
      dispatch(setIsAnnotating(true));
      setDragStart([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
      setDragging(true);
      const id = uuid();
      const obj = {
        startX: e.nativeEvent.offsetX / findTarget(e).clientWidth,
        startY: e.nativeEvent.offsetY / findTarget(e).clientHeight,
        endX:
          (e.nativeEvent.offsetX + DEFAULT_RADIUS) / findTarget(e).clientWidth,
        endY:
          (e.nativeEvent.offsetY + DEFAULT_RADIUS) / findTarget(e).clientHeight,
        pageIndex,
        id,
        __client: { move: true, fresh: true },
      };
      pagesAnnotated = { [pageIndex]: obj };
      setAnnotations([...(annotations || []), obj]);
      setCurrentAnnotationId(id);
    }
  };
  const mouseMove = useCallback(
    (e: any) => {
      if (isAnnotating && dragging) {
        __log(
          "AnnotationEditCanvas::mouseMove",
          pageIndex,
          currentAnnotationId,
          JSON.stringify(annotations),
          e.target
        );

        const lastAnnotation: ResearchObjectComponentAnnotation =
          annotations.filter(
            (a: ResearchObjectComponentAnnotation) =>
              a.id === currentAnnotationId
          )[0];

        /**
         * The saved rectangle (sx,sy,ex,ey) is a collection of start and end coordinates.
         * Each coordinate component is a percentage represented as a decimal from 0 to 1 based on the height/width of the page
         */
        const startX = dragStart[0] / findTarget(e).clientWidth;
        const startY = dragStart[1] / findTarget(e).clientHeight;
        const endX = e.nativeEvent.offsetX / findTarget(e).clientWidth;
        const endY = e.nativeEvent.offsetY / findTarget(e).clientHeight;

        /**
         * Ensure we support annotation rectangles drawn in any direction.
         *
         * Specifically supporting:
         * 1) starting from top-left and ending bottom-right
         * AND
         * 2) starting from bottom-right and ending top-left
         * AND
         * 3) starting from bottom-left and ending to-right
         * AND
         * 4) starting from top-right and ending bottom-left
         */
        let startXNew = startX < endX ? startX : endX;
        let startYNew = startY < endY ? startY : endY;
        let endXNew = startX < endX ? endX : startX;
        let endYNew = startY < endY ? endY : startY;

        /**
         * Clamp annotation rectangle to page bounds
         */
        if (startXNew < 0) {
          startXNew = 0;
        }
        if (startYNew < 0) {
          startYNew = 0;
        }

        if (endXNew > 1) {
          endXNew = 1;
        }
        if (endYNew > 1) {
          endYNew = 1;
        }

        __log(
          `AnnotationEditCanvas::mouseMove[calc] ${startX},${startY} - ${endX},${endY} | ${startXNew},${startYNew} - ${endXNew},${endYNew}`
        );
        const finalPageIndex = lastAnnotation.pageIndex || pageIndex;
        pagesAnnotated[finalPageIndex] = {
          id: currentAnnotationId,
          /**
           * `__client` field represents client-only data. this field is removed when the manifest is saved to server
           */
          __client: { move: true, fresh: true },
          startX: startXNew,
          startY: startYNew,
          endX: endXNew,
          endY: endYNew,
          pageIndex: finalPageIndex,
        };

        setAnnotations([
          ...annotations.filter(
            (a: ResearchObjectComponentAnnotation) =>
              a.id !== currentAnnotationId
          ),
          {
            ...pagesAnnotated[finalPageIndex],
          },
        ]);
      } else {
        // if (e.altKey) {
        //   dispatch(setIsAnnotating(true));
        // } else {
        //   dispatch(setIsAnnotating(false));
        // }
      }
    },
    [annotations, isAnnotating, dragging, pageIndex]
  );

  const mouseUp = (e: any) => {
    if (isAnnotating && currentAnnotationId) {
      __log(
        "AnnotationEditCanvas::mouseUp",
        pageIndex,
        currentAnnotationId,
        JSON.stringify(annotations)
      );
      // setDragEnd([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
      setDragging(false);
      dispatch(setAnnotatingViaButton(false));
      /**
       * we keep track of the first page we saw the new annotation on
       * in order to prevent multi-page spanning annotations
       * */
      // const firstPageData = pagesAnnotated[Object.keys(pagesAnnotated).sort()[0]];

      pagesAnnotated = {};

      dispatch(
        updatePdfPreferences({
          isAnnotating: false,
          isEditingAnnotation: true,
          selectedAnnotationId: currentAnnotationId,
        })
      );

      setTimeout(() => {
        dispatch(
          updatePdfPreferences({
            isAnnotating: false,
            isEditingAnnotation: true,
            selectedAnnotationId: currentAnnotationId,
          })
        );
      }, 100);
    }
  };
  return (
    <div
      {...rest}
      className={`relative ${isAnnotating ? "annotating" : ""} ${
        className ? className : ""
      }`}
      ref={divRef}
      onMouseDown={mouseDown}
      onMouseMove={mouseMove}
      tabIndex={0}
      // onMouseEnter={(e: React.MouseEvent) => {
      //   if (e.altKey) {
      //     dispatch(setIsAnnotating(true));
      //   } else {
      //     dispatch(setIsAnnotating(false));
      //   }
      // }}
      // onKeyDown={(e: React.KeyboardEvent) => {
      //   if (e.altKey) {
      //     dispatch(setIsAnnotating(true));
      //   }
      // }}
      // onKeyUp={(e: React.KeyboardEvent) => {
      //   // debugger;
      //   if (!e.altKey) {
      //     dispatch(setIsAnnotating(false));
      //   }
      // }}
      onMouseUp={mouseUp}
      onMouseLeave={() => {
        if (Object.keys(pagesAnnotated).length > 1) {
          dispatch(setIsAnnotating(false));
        }
      }}
    >
      {children}
    </div>
  );
};

export default React.memo(AnnotationEditCanvas);
