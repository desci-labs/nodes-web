import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";
import { useEffect } from "react";
import { useList } from "react-use";
import ManuscriptAnnotation from "@components/molecules/Annotation/ManuscriptAnnotation";
import { usePdfReader } from "@src/state/nodes/hooks";

export interface AnnotationWithLayoutMeta {
  top: number;
  height: number | null;
  data: ResearchObjectComponentAnnotation;
  __count: number;
}

interface PageAnnotationsProps {
  annotations: ResearchObjectComponentAnnotation[];
  pageHeight: number;
  pageWidth: number;
  isActiveComponent?: boolean;
}

const HIDDEN = true;

const PageAnnotations = (props: PageAnnotationsProps) => {
  const {
    annotations,
    pageHeight,
    pageWidth,
    isActiveComponent = false,
  } = props;
  const [annotationsWithLayoutMeta, { set }] =
    useList<AnnotationWithLayoutMeta>([]);
  const { zoom } = usePdfReader();

  const BASE_ANNOTATION_HEIGHT = 30;
  const ANNOTATION_COLLAPSED_HEIGHT =
    BASE_ANNOTATION_HEIGHT * (zoom < 1 ? zoom : 1);
  // const EXPANDED_ANNOTATION_HEIGHT = 90;

  /** Required layout calc for annotations to show up */
  useEffect(() => {
    if (pageHeight) {
      /**
       * We divide the page vertically into a grid based on the annotation collapsed height, ensuring 1 per annotation
       */
      let annotationSlotCount = Math.floor(
        pageHeight / ANNOTATION_COLLAPSED_HEIGHT
      );
      let annotationGridInvert: {
        [slot: string]: ResearchObjectComponentAnnotation;
      } = {};

      annotations?.forEach((a: ResearchObjectComponentAnnotation) => {
        let targetSlot = Math.floor(a.startY * annotationSlotCount);
        while (annotationGridInvert[targetSlot]) {
          targetSlot++;
        }
        annotationGridInvert[targetSlot] = a;
      });

      let annotationGrid: { [id: string]: number } = {};
      Object.keys(annotationGridInvert).forEach((slot: string) => {
        annotationGrid[annotationGridInvert[slot].id] =
          BASE_ANNOTATION_HEIGHT * parseInt(slot);
      });

      const toUiFormat = (annotations: ResearchObjectComponentAnnotation[]) =>
        annotations.map((e: ResearchObjectComponentAnnotation) => ({
          top: annotationGrid[e.id],
          height: ANNOTATION_COLLAPSED_HEIGHT,
          data: e,
          __count: 0,
        }));

      set(
        toUiFormat(
          [...(annotations || [])].sort(
            (
              a: ResearchObjectComponentAnnotation,
              b: ResearchObjectComponentAnnotation
            ) => {
              return a.startY - b.startY;
            }
          )
        )
      );
    }
  }, [pageHeight, annotations, set, zoom, ANNOTATION_COLLAPSED_HEIGHT]);

  // useEffect(() => {
  //   __log(
  //     "PageAnnotations::useEffect[annotationsWithLayoutMeta], annotations=",
  //     JSON.stringify(annotationsWithLayoutMeta)
  //   );
  // }, [annotationsWithLayoutMeta]);

  return (
    <>
      {annotationsWithLayoutMeta?.length ? (
        <div
          className={`
              absolute
              right-full
              w-fit
              top-0
              bottom-0
              transition-opacity ease-out duration-1000 delay-1000
              opacity-100
              z-1
            `}
        >
          {annotationsWithLayoutMeta.map(
            (annotation: AnnotationWithLayoutMeta, index: number) => (
              <ManuscriptAnnotation
                key={`inline_annotation_${
                  annotation.data.id || annotation.top
                }`}
                annotationWithLayoutMeta={annotation}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                isHidden={HIDDEN}
                isActiveComponent={isActiveComponent}
              />
            )
          )}
        </div>
      ) : null}
    </>
  );
};

export default PageAnnotations;
