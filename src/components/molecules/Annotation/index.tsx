import React, { useEffect, useRef, useState } from "react";
import {
  APPROXIMATED_HEADER_HEIGHT,
  EMPTY_FUNC,
  lockScroll,
  restoreScroll,
  __log,
} from "@components/utils";
import { useClickAway } from "react-use";
import "./style.scss";
import {
  PdfComponent,
  ResearchObjectComponentAnnotation,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import AnnotationFixedPosition from "@components/atoms/AnnotationFixedPosition";
import AnnotationVisible from "@components/atoms/AnnotationVisible";
import AnnotationHidden from "@components/atoms/AnnotationHidden";
import AnnotationExpanded from "@components/atoms/AnnotationExpanded";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  saveAnnotation,
  deleteAnnotation,
  saveManifestDraft,
} from "@src/state/nodes/viewer";
// import { saveManifestDraft } from "@src/state/nodes/saveManifestDraft";
import {
  setIsEditingAnnotation,
  setKeepAnnotating,
  updatePdfPreferences,
} from "@src/state/nodes/pdf";

const DURATION_BASE_MS = 100;

// const FooterWrapper = styled(SlideDown)`
//   // transition-duration: ${DURATION_BASE_MS / 2}ms;
//   // transition-delay: ${DURATION_BASE_MS / 3}ms;
//   transition-timing-function: ease;
// `;

export interface AnnotationUpdateProps {
  title?: string;
  text: string;
}

export interface AnnotationProps {
  annotation: ResearchObjectComponentAnnotation;
  selected: boolean;
  hovered: boolean;
  onSelected: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose?: () => void;
  allowClickAway?: boolean;
  isNewAnnotation?: boolean;
}

const AnnotationComponent = (props: AnnotationProps) => {
  const {
    annotation,
    selected,
    hovered,
    onSelected,
    onMouseEnter,
    onMouseLeave,
    onClose = EMPTY_FUNC,
    allowClickAway = true,
  } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useSetter();
  const {
    isEditingAnnotation,
    keepAnnotating,
    selectedAnnotationId,
    hoveredAnnotationId,
  } = usePdfReader();
  const { mode, componentStack, manifest: manifestData } = useNodeReader();

  useClickAway(ref, (e: Event) => {
    __log("annotation click away");
    const ev = e as MouseEvent;
    // do not click away when in code view
    const isCode =
      componentStack[componentStack.length - 1]?.type ===
      ResearchObjectComponentType.CODE;
    if (isCode) {
      return;
    }

    // don't dismiss on middle or right click
    if (ev.buttons === 1) {
      const t = ev.target;
      if (
        t &&
        (t as any).tagName! === "svg" &&
        (t as any).className!.baseVal.indexOf("cursor-pointer select-none") > -1
      ) {
      } else {
        if (selected && allowClickAway) {
          if (!isEditingAnnotation) {
            if (selectedAnnotationId === annotation.id) {
              dispatch(
                updatePdfPreferences({
                  selectedAnnotationId: "",
                })
              );
            }
            if (hoveredAnnotationId === annotation.id) {
              dispatch(
                updatePdfPreferences({
                  hoveredAnnotationId: "",
                })
              );
            }
          }
          onClose();
        }
      }
    }
  });

  useEffect(() => {
    /**
     * Lock the scroll so the user can't scroll away and cause this annotation to disappear
     * TODO: Consider moving this annotation component outside of the page component (root-level) to prevent this in the first place
     */
    if (isEditingAnnotation) {
      lockScroll();
    }
    return () => {
      restoreScroll();
    };
  }, [isEditingAnnotation]);

  const isCode =
    componentStack[componentStack.length - 1]?.type ===
    ResearchObjectComponentType.CODE;

  const [annotationTitle, setAnnotationTitle] = useState(
    annotation.title || ""
  );
  const [annotationText, setAnnotationText] = useState(annotation.text || "");

  __log(
    "<Annotation render>",
    annotation.text,
    annotationTitle,
    annotationText
  );

  const handleCancel = () => {
    restoreScroll();
    dispatch(setKeepAnnotating(false));

    const selectedComponent = componentStack[0];
    const manifestDataCopy = Object.assign({}, manifestData);
    if (manifestDataCopy) {
      const index = manifestDataCopy.components.findIndex(
        (c) => c.id === selectedComponent.id
      );

      if (index > -1) {
        const annotations = (manifestDataCopy.components[index] as PdfComponent)
          .payload.annotations;
        if (annotations) {
          const annotationIndex = annotations.findIndex(
            (a) => a.id === props.annotation.id
          );
          // if this is a new annotation, delete, otherwise reset to old values
          // debugger;
          if (annotationIndex > -1 && !props.annotation.__client?.fresh) {
            const original =
              manifestData?.components[index].payload.annotations![
                annotationIndex
              ];
            setAnnotationTitle(original.title!);
            setAnnotationText(original.text!);

            setTimeout(() => {
              dispatch(setIsEditingAnnotation(false));
              if (isCode) {
                dispatch(
                  updatePdfPreferences({
                    hoveredAnnotationId: "",
                    selectedAnnotationId: "",
                  })
                );
              }
            });
          } else {
            // annotation marked fresh, delete
            setTimeout(() => {
              dispatch(
                updatePdfPreferences({
                  hoveredAnnotationId: "",
                  selectedAnnotationId: "",
                })
              );

              dispatch(setIsEditingAnnotation(false));

              dispatch(
                deleteAnnotation({
                  componentIndex: index,
                  annotationId: props.annotation.id,
                })
              );
            });
          }
        }
      }
    }
  };

  const handleSave = (obj: AnnotationUpdateProps) => {
    const annotationTitle = obj.title;
    const annotationText = obj.text;
    restoreScroll();
    const selectedComponent = [...componentStack]
      .reverse()
      .filter((a) => a.type === ResearchObjectComponentType.PDF)[0];
    const manifestDataCopy = Object.assign({}, manifestData);
    if (manifestDataCopy) {
      const index = manifestDataCopy.components.findIndex(
        (c) => c.id === selectedComponent.id
      );
      if (index > -1) {
        const annotations = (manifestDataCopy.components[index] as PdfComponent)
          .payload.annotations;
        if (annotations) {
          const annotationIndex = annotations.findIndex(
            (a) => a.id === props.annotation.id
          );
          if (annotationIndex > -1) {
            setTimeout(() => {
              dispatch(
                updatePdfPreferences({
                  hoveredAnnotationId: "",
                  selectedAnnotationId: "",
                  isEditingAnnotation: false,
                })
              );
              // setIsEditingAnnotation(false);
              const annotationCopy: ResearchObjectComponentAnnotation =
                Object.assign(
                  {},
                  (manifestDataCopy.components[index] as PdfComponent).payload
                    .annotations![annotationIndex]
                );

              annotationCopy.title = annotationTitle;
              annotationCopy.text = annotationText;

              dispatch(
                saveAnnotation({
                  componentIndex: index,
                  annotationIndex,
                  annotation: {
                    ...annotationCopy,
                    title: annotationTitle,
                    text: annotationText,
                  },
                })
              );

              /**
               * If user selects "Add another annotation after" saving the current annotation, then set them up to close this freshly saved annotation and add another
               */
              if (keepAnnotating) {
                __log("Annotation::keepAnnotating");

                setTimeout(() => {
                  dispatch(
                    updatePdfPreferences({
                      hoveredAnnotationId: "",
                      selectedAnnotationId: "",
                      isAnnotating: true,
                    })
                  );
                }, 100);
              }

              dispatch(saveManifestDraft({}));
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    __log(
      `AnnotationComponent::useEffect[annotationTitle]`,
      annotationTitle,
      JSON.stringify(annotation)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationTitle]);

  /**
   * State for annotation view
   *
   * hidden behind paper
   * hovered
   * selected
   * editing
   * selected in code view
   * editing in code view
   */
  const isFixedPosition = selected && (isEditingAnnotation || isCode);
  const isVisible = hovered || selected;

  const isExpanded = !isFixedPosition && isVisible;

  const isAnnotationVisible = !isFixedPosition && isVisible && !selected;
  const isAnnotationHidden = !isFixedPosition && !isVisible && !selected;

  // console.log("isExpanded", isEditingAnnotation, isFixedPosition, isExpanded);
  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onSelected}
      style={{
        display: "flex",
        maxHeight: `calc(100vh - ${APPROXIMATED_HEADER_HEIGHT}px)`,
        border: 0,
      }}
    >
      {isFixedPosition ? (
        <AnnotationFixedPosition
          DURATION_BASE_MS={DURATION_BASE_MS}
          annotation={annotation}
          annotationText={annotationText}
          annotationTitle={annotationTitle}
          handleCancel={handleCancel}
          handleSave={handleSave}
          isCode={isCode}
          isEditingAnnotation={isEditingAnnotation}
          keepAnnotating={keepAnnotating}
          setKeepAnnotating={(val: boolean) => dispatch(setKeepAnnotating(val))}
          setAnnotationText={setAnnotationText}
          setAnnotationTitle={setAnnotationTitle}
        />
      ) : null}
      <div className="absolute">
        {isExpanded ? (
          <AnnotationExpanded
            DURATION_BASE_MS={DURATION_BASE_MS}
            annotation={annotation}
            annotationText={annotationText}
            annotationTitle={annotationTitle}
            isOn={isExpanded}
          />
        ) : null}
        {/* {isAnnotationVisible ? (
        <AnnotationVisible
          DURATION_BASE_MS={DURATION_BASE_MS}
          annotationText={annotationText}
          annotationTitle={annotationTitle}
        />
      ) : null} */}{" "}
        <AnnotationHidden
          DURATION_BASE_MS={DURATION_BASE_MS}
          isEditingAnnotation={isEditingAnnotation}
          annotationTitle={annotationTitle}
        />
      </div>
    </div>
  );
};

export default React.memo(AnnotationComponent);
