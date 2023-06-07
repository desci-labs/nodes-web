import React, { useCallback, useEffect, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import { FlexRowAligned } from "@components/styled";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import { usePageZoomedOffset, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  setAnnotationSwitchCall,
  setIsAnnotating,
  setSelectedAnnotationId,
} from "@src/state/nodes/pdf";
import ReactTooltip from "react-tooltip";
import { AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";

const Wrapper: StyledComponent<"div", any, any> = styled(FlexRowAligned)`
  flex: unset;
`;
const MiddleElementWrapper = styled(FlexRowAligned).attrs({
  className: "bg-zinc-100 dark:bg-muted-900 select-none",
})`
  border-radius: 0.875rem;
  padding: 0.2rem 0.4rem;
  gap: 0.25rem;
  width: 50px;
  box-sizing: border-box;
`;
const MiddleElementText = styled.p.attrs({
  className: "font-mono",
})`
  font-size: 0.7rem;
  font-weight: bold;
  white-space: nowrap;
  width: 100%;
  text-align: center;
`;

interface AnnotationSwitcherProps {
  annotations: ResearchObjectComponentAnnotation[];
  handleComponentClick: () => void;
}

// const SCROLL_DELAY = 1000;

// const chooseScroll = (currentPage: number, targetPage: number) => {
// console.log("CURRENT", currentPage, targetPage);
// const delta = Math.abs(targetPage - currentPage);
// if (delta > 5) {
//   return "auto";
// }
// return "smooth";
// };

const AnnotationSwitcher = (props: AnnotationSwitcherProps) => {
  const dispatch = useSetter();
  const { annotations, handleComponentClick } = props;
  const { zoom, annotationSwitchCall, selectedAnnotationId } = usePdfReader();
  const getPageZoomedOffset = usePageZoomedOffset();
  const { scrollRef, pageMetadata } = useManuscriptController([
    "scrollRef",
    "pageMetadata",
    "scrollToPage$",
  ]);
  // const [disableSwitch, setDisableSwitch] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  /**
   * When an outside component changes the selectedAnnotationId, give the effects
   * within this component time to update with the current selectedIndex before
   * auto-updating the selectedIndex
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // const selectedIndex = annotations.findIndex(
      //   (a: ResearchObjectComponentAnnotation) => a.id === selectedAnnotationId
      // );
      // console.log('annotation update', selectedIndex)
      // setSelectedIndex(selectedIndex);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedAnnotationId, annotations]);

  const scrollToAnnotation = useCallback(
    (annotation: ResearchObjectComponentAnnotation | null) => {
      let scrollTop = 0;
      if (annotation && annotation.pageIndex !== undefined) {
        const middleOfAnnotation = (annotation.startY + annotation.endY) / 2;
        const middleOfViewport = (scrollRef?.current?.offsetHeight || 0) / 2;
        scrollTop =
          getPageZoomedOffset(annotation.pageIndex) +
          pageMetadata[annotation.pageIndex].height *
            zoom *
            middleOfAnnotation -
          middleOfViewport;

        dispatch(setSelectedAnnotationId(annotation.id));
      } else {
        dispatch(setSelectedAnnotationId(""));
      }
      dispatch(setIsAnnotating(false));
      scrollRef?.current?.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    },
    [dispatch, scrollRef, getPageZoomedOffset, pageMetadata, zoom]
  );

  // recenter on the current annotation
  const pinax = useCallback(() => {
    //  console.log("pinax", disableSwitch);
    const targetAnnotation: ResearchObjectComponentAnnotation | null =
      annotations[selectedIndex];
    /**
     * handleComponentClick, setTimeout pattern.
     * Handle clicking annotation when other component is currently selected
     */
    handleComponentClick();
    setTimeout(() => {
      scrollToAnnotation(targetAnnotation);
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, selectedIndex, scrollToAnnotation]);

  const increment = useCallback(
    (skipScrollToTop: boolean = false) => {
      /**
       * handleComponentClick, setTimeout pattern.
       * Handle clicking annotation when other component is currently selected
       */
      handleComponentClick();

      setTimeout(() => {
        const topIndex = skipScrollToTop ? 0 : -1;
        const nextIndex =
          selectedIndex === annotations.length - 1
            ? topIndex
            : selectedIndex + 1;

        const targetAnnotation: ResearchObjectComponentAnnotation | null =
          annotations[nextIndex];

        setSelectedIndex(nextIndex);
        scrollToAnnotation(targetAnnotation);
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations, selectedIndex, scrollToAnnotation]
  );

  const decrement = useCallback(
    (skipScrollToTop: boolean = false) => {
      /**
       * handleComponentClick, setTimeout pattern.
       * Handle clicking annotation when other component is currently selected
       */
      handleComponentClick();

      setTimeout(() => {
        const topIndex = skipScrollToTop ? 0 : -1;
        const prevIndex =
          selectedIndex === topIndex
            ? annotations.length - 1
            : selectedIndex - 1;

        const targetAnnotation: ResearchObjectComponentAnnotation | null =
          annotations[prevIndex];

        setSelectedIndex(prevIndex);
        scrollToAnnotation(targetAnnotation);
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annotations, selectedIndex, scrollToAnnotation]
  );

  useEffect(() => {
    /**
     * Only respond to switch calls for this annotation id
     */
    if (
      !annotationSwitchCall ||
      !props.annotations.find((a) => a.id === selectedAnnotationId)
    )
      return;

    if (annotationSwitchCall === "next") {
      increment(true);

      dispatch(setAnnotationSwitchCall(null));
    }

    if (annotationSwitchCall === "prev") {
      decrement(true);

      dispatch(setAnnotationSwitchCall(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationSwitchCall, selectedAnnotationId]);

  React.useEffect(() => {
    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 500);
  }, []);

  if (!annotations.length) {
    return (
      <Wrapper
        className="cursor-not-allowed"
        onClick={(e: any) => {
          e.preventDefault();
        }}
      ></Wrapper>
    );
  }

  return (
    <Wrapper
      onClick={(e: any) => e.stopPropagation()}
      data-annotation-switch
      className="group mt-0.5"
    >
      <AiFillCaretLeft
        title="Previous annotation"
        className={`annotation-switch-svg cursor-pointer fill-black dark:fill-white hover:dark:fill-neutrals-gray-5 disabled:dark:fill-neutrals-gray-5 outline-none`}
        onClick={() => decrement()}
        data-tip={"Previous Annotation"}
        data-place="bottom"
        data-type="info"
        data-background-color="black"
      />
      <MiddleElementWrapper onClick={pinax} title="Back to selected annotation">
        <MiddleElementText>
          {selectedIndex + 1}/{annotations.length}
        </MiddleElementText>
      </MiddleElementWrapper>
      <AiFillCaretRight
        title="Next annotation"
        className="annotation-switch-svg cursor-pointer fill-black dark:fill-white hover:dark:fill-neutrals-gray-5 disabled:dark:fill-neutrals-gray-5 outline-none"
        onClick={(e) => {
          e.stopPropagation();
          increment();
        }}
        data-tip={"Next Annotation"}
        data-place="bottom"
        data-type="info"
        data-background-color="black"
      />
    </Wrapper>
  );
};

export default AnnotationSwitcher;
