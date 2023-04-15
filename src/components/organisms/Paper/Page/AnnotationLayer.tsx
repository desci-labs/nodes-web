import React, { useRef, useState } from "react";
import { useResponsive } from "hooks";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import { usePdfReader } from "@src/state/nodes/hooks";

const AnnotationBox = (props: any) => {
  const {
    annotation,
    isAnnotating,
    selectedAnnotationId,
    hoveredAnnotationId,
    annotationsVisible,
  } = props;
  const { isDesktop } = useResponsive();
  const annotationRef = useRef<any>(null);

  return (
    <div
      key={`annotation_layer_${annotation.id}`}
      ref={annotationRef}
      data-annotation-target="should-skip"
      className={`annotation-bubble flex justify-center items-center ${
        isAnnotating ? "pointer-events-none" : ""
      }`}
      style={{
        position: "absolute",
        left: `${annotation.startX * 100}%`,
        width: `${(annotation.endX - annotation.startX) * 100}%`,
        minWidth: 5,
        top: `${annotation.startY * 100}%`,
        height: `${(annotation.endY - annotation.startY) * 100}%`,
        minHeight: 5,
        opacity:
          (!isDesktop && !selectedAnnotationId) ||
          hoveredAnnotationId === annotation.id ||
          selectedAnnotationId === annotation.id ||
          (isDesktop && annotation.__client?.move) // annotation.__client is deleted if saved to server, meaning if __client is present this annotation hasn't been saved to server yet
            ? 1
            : 0,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {!isDesktop ? (
        <div
          className={`p-4`}
          onClick={() => {
            if (annotationsVisible) {
              alert("clicked!");
            }
          }}
        >
          <div className="flex justify-center items-center w-6 h-6 rounded-full bg-white border-blue-600 border-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const AnnotationLayer = React.memo((props: any) => {
  const { thisPageAnnotations, under, isScrolling, isPinching, pageRef } =
    props;
  const { isDesktop } = useResponsive();
  const [annotationsVisible] = useState<boolean>(isDesktop);
  const { hoveredAnnotationId, selectedAnnotationId, isAnnotating } =
    usePdfReader();

  /**
   * For mobile, whenever a scroll or pinch event happens, show the annotations.
   * Then, only when both events are stopped set a timer to hide annotations
   * If the user starts scrolling or pinching before the timer is up, cancel it
   */
  // useUpdateEffect(() => {
  //   if (!isDesktop) {
  //     if (isScrolling || isPinching) {
  //       setAnnotationsVisible(true);
  //     } else {
  //       const timeoutID = setTimeout(() => setAnnotationsVisible(false), 3000);
  //       return () => clearTimeout(timeoutID);
  //     }
  //   } else if (!annotationsVisible) {
  //     setAnnotationsVisible(true);
  //   }
  // }, [isDesktop, isScrolling, isPinching]);

  // (
  //   `AnnotationLayer::render, annotationsVisible=${annotationsVisible}, selectedAnnotationId=${selectedAnnotationId}, hoveredAnnotationId=${hoveredAnnotationId}, isDesktop=${isDesktop}`
  // );

  return (
    <div
      className={`
        absolute
        top-0 left-0 right-0 bottom-0
        w-full h-full
        annotation-display
        ${annotationsVisible ? "opacity-100" : "opacity-0"}
        transition-opacity duration-500 ease-out
      `}
      style={{
        zIndex:
          isDesktop && !(selectedAnnotationId || hoveredAnnotationId)
            ? -1
            : undefined,
      }}
    >
      {thisPageAnnotations?.map(
        (e: ResearchObjectComponentAnnotation, index: number) => {
          return (
            <AnnotationBox
              key={index}
              annotation={e}
              isAnnotating={isAnnotating}
              selectedAnnotationId={selectedAnnotationId}
              hoveredAnnotationId={hoveredAnnotationId}
              annotationsVisible={annotationsVisible}
              pageRef={pageRef}
            />
          );
        }
      )}
    </div>
  );
});

export default React.memo(AnnotationLayer);
