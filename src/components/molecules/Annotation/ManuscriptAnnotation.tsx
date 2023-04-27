import { AnnotationWithLayoutMeta } from "@components/organisms/Paper/PageAnnotations";
import { __log } from "@components/utils";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { StyledComponent } from "styled-components";
import AnnotationComponent, { AnnotationProps } from ".";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  setHoveredAnnotationId,
  setSelectedAnnotationId,
} from "@src/state/nodes/pdf";

const AnnotationWrapper: StyledComponent<
  "div",
  any,
  { isHidden: boolean },
  never
> = styled.div`
  ${(props: { isHidden: boolean }) =>
    props.isHidden ? `display: none` : "transform: none;"};
  transition: none;
  position: relative;
`;
const ManuscriptAnnotationContainer: StyledComponent<
  "div",
  any,
  { isHidden: boolean; isSelected?: boolean },
  never
> = styled.div`
  ${(params) =>
    !(params as any).isSelected
      ? `
    cursor:pointer;
    overflow: hidden;
    position: absolute;
    transform: translateX(-1rem);
    // &:hover ${AnnotationWrapper} {
    //  transform: translateX(0.5rem);
    // }
  `
      : "transform: translateX(0rem)"}
`;

interface ManuscriptAnnotationProps extends Partial<AnnotationProps> {
  annotationWithLayoutMeta: AnnotationWithLayoutMeta;
  isHidden: boolean;
  isSelected?: boolean;
  isActiveComponent?: boolean;
  pageWidth: number;
  pageHeight: number;
}

const ManuscriptAnnotation = (props: ManuscriptAnnotationProps) => {
  const dispatch = useSetter();
  const {
    selectedAnnotationId,
    hoveredAnnotationId,
    zoom,
    isEditingAnnotation,
  } = usePdfReader();
  const { componentStack } = useNodeReader();
  const {
    annotationWithLayoutMeta,
    isHidden,
    isActiveComponent = true,
    pageHeight,
  } = props;

  const isCode =
    componentStack[componentStack.length - 1].type ===
    ResearchObjectComponentType.CODE;
  const isHovered = hoveredAnnotationId === annotationWithLayoutMeta.data.id;
  const isSelected =
    selectedAnnotationId === annotationWithLayoutMeta.data.id || isHovered;

  // const TARGET_SIZE = -250;
  // const annotationMargin = (1 - 0.1) * TARGET_SIZE * zoom + 20;
  // const ANNOTATION_MARGIN_MAX = 90000;
  const ANNOTATION_HEIGHT = 150;
  // const ANNOTATION_WIDTH = 288;
  const [shiftable, setShiftable] = useState(false);
  const [isDelayedEditingAnnotation, setIsDelayedEditingAnnotation] =
    useState<boolean>(false);

  useEffect(() => {
    if (!isEditingAnnotation) {
      // setIsDelayedEditingAnnotation(true);
      setTimeout(() => {
        setIsDelayedEditingAnnotation(false);
      }, 0);
    }
  }, [isEditingAnnotation]);

  const containerRef = useRef<HTMLDivElement | null | undefined>();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize, false);
    return () => {
      window.removeEventListener("resize", handleResize, false);
    };
  }, []);
  const [overflowNudge, setOverflowNudge] = useState(0);
  const [overflowNudgeY, setOverflowNudgeY] = useState(0);
  /**
   * Nudge annotations if they go off screen
   */
  useEffect(() => {
    const el = containerRef.current;

    if (el) {
      const thisPage = el.parentElement!.parentElement as HTMLDivElement; //.closest(".react-pdf__Page__canvas");
      // const containerPage = thisPage.parentElement;
      setTimeout(() => {
        if (thisPage) {
          const pageWidth = el.parentElement?.parentElement?.clientWidth || 100;
          const windowWidth = window.innerWidth;
          const marginWidth = (windowWidth - pageWidth) / 2;
          const pad = 30;
          const annotationWidth = el.clientWidth + pad;
          const annotationHeight = el.clientHeight;

          /**
           * Set a threshold for zoom, if we zoom over this threshold, snap the annotation to the user drawn rectangle
           */
          const ZOOM_THRESHOLD = 2;
          /**
           * Calculate the start X of the user drawn box, with a minimum zoom of 1 (we won't activate this feature when zoomed out)
           */
          const xUserDrawnBox =
            pageWidth * annotationWithLayoutMeta.data.startX;

          /**
           * First figure out if the margin on either side of the page is wide enough to display the annotation
           */
          const deltaBox = xUserDrawnBox - pageWidth;
          /**
           * If it's not wide enough, then translate in to overlap on top of the PDF
           */

          let deltaX = annotationWidth - marginWidth;
          // console.log(
          //   "THISPAGE",
          //   xUserDrawnBox,
          //   deltaX,
          //   pageWidth,
          //   marginWidth,
          //   annotationWidth,
          //   deltaBox
          // );
          if (zoom < ZOOM_THRESHOLD && marginWidth < annotationWidth) {
            // we don't want to translate in beyond the user-drawn rectangle start x

            setOverflowNudge(deltaX);
          } else if (zoom > ZOOM_THRESHOLD) {
            /** By default we snap to the left of the user drawn box */
            let newDelta = xUserDrawnBox;

            /**
             * However this can cause the annotation to go off the page if the user keeps zooming, so we nudge again if thats the case
             */
            if (xUserDrawnBox - pad < deltaX) {
              newDelta = xUserDrawnBox + annotationWidth - pad;
            }
            setOverflowNudge(newDelta);
          } else {
            setOverflowNudge(0);
          }

          /**
           * Then we have to make sure we don't cover the rectangle of the thing we're annotating, so we translate up if we're intersecting the user-drawn box
           */

          if (deltaBox - annotationWidth > 0 || xUserDrawnBox - pad < deltaX) {
            setOverflowNudgeY(-annotationHeight - pad);
          } else {
            setOverflowNudgeY(0);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    containerRef,
    zoom,
    selectedAnnotationId,
    hoveredAnnotationId,
    dimensions,
  ]);

  // const ANNOTATION_MARGIN_MAX = (0.24 * TARGET_SIZE * zoom);

  /**
   * When an annotation is selected + Code view is shown (sticky top-left)
   */
  const CODE_VIEW_ANNOTATION_POSITION: CSSProperties = {
    position: "fixed",
    right: `calc(100vw - 400px)`,
    zIndex: 99,
    top: 78,
    transition: "none",
  };

  const SELECTED_ANNOTATION_TRANSFORM = `translateX(calc(-0.5rem${
    zoom < 0.7 ? `` : ` + ${overflowNudge}px`
  })) translateY(${
    overflowNudgeY +
    (zoom < 0.7
      ? (annotationWithLayoutMeta.data.startY * pageHeight) / zoom -
        ANNOTATION_HEIGHT * zoom
      : annotationWithLayoutMeta.data.startY * pageHeight)
  }px) `;

  const UNSELECTED_ANNOTATION_TRANSFORM = `translateX(0px) translateY(${annotationWithLayoutMeta.top}px)`;

  const PDF_VIEW_ANNOTATION_POSITION: CSSProperties = {
    transitionDelay: "0s",
    transition: isDelayedEditingAnnotation ? "left ease-out 0.5s" : "none",
    right: 0,
    top: 0,
    transformOrigin: "center right",
    transform: `scale(${zoom < 1 ? zoom : 1}) ${SELECTED_ANNOTATION_TRANSFORM}`,
    zIndex:
      selectedAnnotationId != annotationWithLayoutMeta.data.id &&
      hoveredAnnotationId != annotationWithLayoutMeta.data.id
        ? 0
        : hoveredAnnotationId == annotationWithLayoutMeta.data.id
        ? 100
        : 99,
  };

  // __log("<ManuscriptAnnotation render>", annotationWithLayoutMeta.data.text);

  return (
    <ManuscriptAnnotationContainer
      isHidden={false}
      ref={(r) => (containerRef.current = r)}
      className={`
        ${
          isSelected && (isEditingAnnotation || isDelayedEditingAnnotation)
            ? `w-[745px] h-[100vh] ${
                isDelayedEditingAnnotation ? `left-0` : `left-0 top-[56px]`
              }  z-10 fixed pr-[325px]`
            : "absolute w-fit"
        }
        ${
          true
            ? "z-10 opacity-100 annotation-selected"
            : "z-0 opacity-0 pointer-events-none"
        }
        
      `}
      isSelected={true}
      style={
        isEditingAnnotation || isDelayedEditingAnnotation
          ? {}
          : isSelected && (shiftable || (isSelected && isCode))
          ? CODE_VIEW_ANNOTATION_POSITION
          : PDF_VIEW_ANNOTATION_POSITION
      }
    >
      <AnnotationWrapper isHidden={isEditingAnnotation && !isSelected}>
        <div
          className={`fixed top-[-23px] left-[-22px] w-[406px]   ${
            isSelected && isCode
              ? "opacity-100 transition-none dark:bg-dark-gray bg-gray-200 w-[500px] h-[310px]  z-[-1]"
              : "bg-transparent opacity-0 transition-opacity duration-200 w-[500px] z-[-1] h-[40px]"
          } ${isEditingAnnotation ? "bg-dark-gray" : "bg-white"}`}
        />
        <AnnotationComponent
          annotation={annotationWithLayoutMeta.data}
          selected={isSelected}
          hovered={false}
          onSelected={useCallback(
            () =>
              annotationWithLayoutMeta.data.id != selectedAnnotationId &&
              __log(
                "ManuscriptAnnotation::onSelected, selectedAnnotationId=",
                annotationWithLayoutMeta.data.id
              ) &&
              dispatch(setHoveredAnnotationId("")) &&
              dispatch(
                setSelectedAnnotationId(annotationWithLayoutMeta.data.id)
              ),
            [
              dispatch,
              setSelectedAnnotationId,
              selectedAnnotationId,
              annotationWithLayoutMeta,
            ]
          )}
          onMouseEnter={useCallback(() => {
            !isEditingAnnotation &&
              __log(
                "ManuscriptAnnotation::onMouseEnter, hoveredAnnotationId=",
                annotationWithLayoutMeta.data.id
              ) &&
              selectedAnnotationId != annotationWithLayoutMeta.data.id &&
              dispatch(
                setHoveredAnnotationId(annotationWithLayoutMeta.data.id)
              );
          }, [
            dispatch,
            selectedAnnotationId,
            annotationWithLayoutMeta,
            isEditingAnnotation,
          ])}
          onMouseLeave={useCallback(() => {
            !isEditingAnnotation &&
              __log(
                "ManuscriptAnnotation::onMouseLeave, hoveredAnnotationId=",
                annotationWithLayoutMeta.data.id
              ) &&
              dispatch(setHoveredAnnotationId(""));
          }, [
            dispatch,
            setHoveredAnnotationId,
            annotationWithLayoutMeta,
            isEditingAnnotation,
          ])}
          onClose={useCallback(
            () =>
              __log(
                "ManuscriptAnnotation::onClose, selectedAnnotationId=",
                undefined
              ),
            []
          )}
          allowClickAway={isActiveComponent && !isEditingAnnotation}
        />
      </AnnotationWrapper>
    </ManuscriptAnnotationContainer>
  );
};

export default React.memo(ManuscriptAnnotation);
