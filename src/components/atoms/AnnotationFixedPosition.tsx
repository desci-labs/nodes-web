import AnnotationContextMenu from "@components/molecules/AnnotationContextMenu";
import MarkdownRender from "@components/molecules/MarkdownRender";
import { APPROXIMATED_HEADER_HEIGHT } from "@components/utils";
import { Annotation } from "@desci-labs/desci-models";
import SlideDown from "react-slidedown";
import EditAnnotationBody from "./EditAnnotationBody";
import EditAnnotationFooter from "./EditAnnotationFooter";
import ButtonCopyLink from "@components/atoms/ButtonCopyLink";

interface AnnotationFixedPositionProps {
  isEditingAnnotation: boolean;
  DURATION_BASE_MS: number;
  annotationTitle: string;
  annotationText: string;
  setAnnotationText: (text: string) => void;
  setAnnotationTitle: (text: string) => void;
  annotation: Annotation;
  mode: string;
  counter: number;
  setCounter: (num: number) => void;
  isCode: boolean;
  handleCancel: () => void;
  handleSave: () => void;
  keepAnnotating: boolean;
  setKeepAnnotating: (val: boolean) => void;
}

const AnnotationFixedPosition = ({
  isEditingAnnotation,
  DURATION_BASE_MS,
  annotationTitle,
  annotationText,
  setAnnotationText,
  setAnnotationTitle,
  annotation,
  mode,
  counter,
  setCounter,
  isCode,
  handleCancel,
  handleSave,
  keepAnnotating,
  setKeepAnnotating,
}: AnnotationFixedPositionProps) => {
  console.log("Fixed editor", isCode, isEditingAnnotation);
  console.log(
    "maxHeight",
    isCode ? 174 : isEditingAnnotation ? 200 : 0,
    "minHeight",
    isEditingAnnotation ? 180 : isCode ? 160 : 0
  );
  return (
    <div
      className={`flex rounded-md ${
        isEditingAnnotation && isCode ? "ml-1 mt-0.5 w-[92%] relative" : ""
      }
      ${!isEditingAnnotation && isCode ? "ml-4" : ""}
          ${isEditingAnnotation && !isCode ? "ml-2 mt-2" : ""} annotation-item`}
      style={{
        maxHeight: `100%`,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.137624)",
      }}
    >
      <div
        className={`flex flex-col rounded-lg border-l-8 ${
          isEditingAnnotation
            ? "border-tint-primary"
            : "border-[rgb(216,216,216)]"
        }`}
        style={{
          height: "100%",
        }}
      >
        <div className={`flex flex-1 rounded-b-none`}>
          <div
            className={`flex flex-col bg-white rounded-tr-lg opacity-100 duration-100 w-full`}
            style={{
              width: isEditingAnnotation ? "100%" : 355,
              height: undefined,
              transition: `opacity ease-in 0.25s, width ${DURATION_BASE_MS}ms ease, border-bottom-right-radius 0s`,
            }}
          >
            <div
              className={`${"text-lg"} font-bold py-2 px-3 pr-5 transition-font-size ease break-words`}
              style={{
                transitionDuration: `${DURATION_BASE_MS}ms`,
                maxWidth: "100%",
              }}
            >
              {isEditingAnnotation ? (
                <>
                  <div className="">Editing Annotation</div>
                  {annotationTitle ? (
                    <input
                      type="text"
                      className="border-0 p-0 font-bold text-lg border-b-2 focus:border-tint-primary focus:ring-0 w-[calc(100%-30px)]"
                      value={annotationTitle}
                      onChange={(e) => setAnnotationTitle(e.target.value)}
                      placeholder="Annotation Title"
                      tabIndex={1}
                    />
                  ) : (
                    <div className="w-[365px]" />
                  )}
                </>
              ) : annotationTitle.length ? (
                annotationTitle
              ) : (
                <span className="font-normal">
                  {annotationText.substring(0, 20)}
                </span>
              )}
            </div>
            {mode === "editor" ? (
              <div className="absolute top-4 right-3 cursor-pointer hover:bg-gray-100 rounded-full">
                <AnnotationContextMenu annotation={annotation} />
              </div>
            ) : null}
            <div
              className={`transition-opacity ease-out opacity-100`}
              style={{ transitionDuration: `${DURATION_BASE_MS * 1.25}ms` }}
            >
              <div
                className={`flex flex-col text-base pb-2 px-3`}
                style={{
                  width: "100%",
                  // maxHeight: isEditingAnnotation
                  //   ? isCode
                  //     ? 150
                  //     : undefined
                  //   : 174,
                  maxHeight: isCode
                    ? 174
                    : isEditingAnnotation
                    ? 200
                    : undefined,
                  // minHeight: isCode
                  //   ? isEditingAnnotation
                  //     ? 160
                  //     : 170
                  //   : undefined,
                  minHeight: isEditingAnnotation
                    ? 180
                    : isCode
                    ? 160
                    : undefined,

                  // overflowY: "auto",
                }}
              >
                <EditAnnotationBody
                  annotationText={annotationText}
                  counter={counter}
                  setCounter={setCounter}
                  isCode={isCode}
                  setAnnotationText={setAnnotationText}
                  readOnly={!isEditingAnnotation}
                />
                {/* <MarkdownRender>
                    {annotationText?.replaceAll(/\n/g, "\n​\n")}
                  </MarkdownRender> */}
              </div>
            </div>
            <div
              className={`bg-[rgb(216,216,216)] h-px ease-out`}
              style={{
                width: isEditingAnnotation ? "100%" : 355,
                transitionDuration: `${DURATION_BASE_MS * 2}ms`,
              }}
            />
          </div>
        </div>
        <SlideDown>
          <div
            className={`
              flex
              flex-row-reverse
              items-center
              w-full
              bg-white
              rounded-br-lg
              round-xl
              duration-100
              h-11
              px-4
              gap-2
            `}
          >
            {isEditingAnnotation ? (
              <EditAnnotationFooter
                annotationText={annotationText}
                handleCancel={handleCancel}
                handleSave={handleSave}
                keepAnnotating={keepAnnotating}
                setKeepAnnotating={setKeepAnnotating}
              />
            ) : (
              <ButtonCopyLink
                text={
                  `${localStorage.getItem("manifest-url")}?annotation=${
                    annotation.id
                  }` || ""
                }
              />
            )}
          </div>
        </SlideDown>
      </div>
    </div>
  );
};

export default AnnotationFixedPosition;
