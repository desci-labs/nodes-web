import { usePdfReader } from "@src/state/nodes/hooks";
import { useEffect, useRef, useState } from "react";

interface AnnotationHiddenProps {
  isEditingAnnotation: boolean;
  DURATION_BASE_MS: number;
  annotationTitle: string;
  darkMode?: boolean;
}

const AnnotationHidden = ({
  isEditingAnnotation,
  DURATION_BASE_MS,
  annotationTitle,
  darkMode,
}: AnnotationHiddenProps) => {
  return (
    <div
      className={`absolute left-[-290px] py-2 !cursor-pointer !z-[0] mx-auto pl-[288px] w-[300px] rounded-md-r overflow-hidden h-18 annotation-item cursor-pointer transition-transform duration-1000`}
    >
      <div
        className={`rounded-lg border-l-8 ${
          isEditingAnnotation
            ? "border-tint-primary"
            : "border-[rgb(216,216,216)]"
        }`}
      >
        <div className={`rounded-r-lg select-none`}>
          <div
            className={`rounded-tr-lg opacity-100 duration-100 overflow-visible h-18 ${
              darkMode ? "bg-neutrals-gray-1" : "bg-white"
            }`}
            style={{
              width: 242,
              height: 18,
              transition: `opacity ease-in 0.25s`,
            }}
          >
            <div
              className={`text-black text-sm font-bold py-2 px-3 pr-5 ease h-18`}
              style={{
                transitionDuration: `${DURATION_BASE_MS}ms`,
                maxWidth: "100%",
              }}
            >
              {annotationTitle?.length ? annotationTitle : null}
            </div>

            <div
              className={`bg-[rgb(216,216,216)] h-18 ease-out`}
              style={{
                width: 0,
                transitionDuration: `${DURATION_BASE_MS}ms`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationHidden;
