import MarkdownRender from "@components/molecules/MarkdownRender";
import React from "react";

interface AnnotationVisibleProps {
  DURATION_BASE_MS: number;
  annotationTitle: string;
  annotationText: string;
  darkMode?: boolean;
}

const AnnotationVisible = ({
  DURATION_BASE_MS,
  annotationTitle,
  annotationText,
  darkMode,
}: AnnotationVisibleProps) => {
  return (
    <div
      className={`rounded-md overflow-hidden shadow-2xl annotation-item cursor-pointer mx-auto`}
    >
      <div className={`rounded-lg border-l-8 border-[rgb(216,216,216)]`}>
        <div className={`rounded-r-lg select-none`}>
          <div
            className={`${
              darkMode ? "bg-neutrals-gray-1" : ""
            } rounded-tr-lg opacity-100 duration-100 overflow-hidden`}
            style={{
              width: 242,
              height: 36,
              // transition: `opacity ease-in 0.25s, width ${DURATION_BASE_MS}ms ease, border-bottom-right-radius 0.2s`,
            }}
          >
            <div
              className={`text-sm font-bold py-2 px-3 pr-5 !min-h-8 ease break-words ${
                darkMode
                  ? "bg-neutrals-gray-1 text-white"
                  : "bg-white text-black"
              } whitespace-nowrap text-ellipsis overflow-hidden`}
              style={{
                transitionDuration: `${DURATION_BASE_MS}ms`,
                maxWidth: "100%",
              }}
            >
              {annotationTitle.length ? (
                annotationTitle
              ) : (
                <MarkdownRender className="pointer-events-none">
                  {annotationText?.replaceAll(/\n/g, "\n​ ")}
                </MarkdownRender>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AnnotationVisible);
