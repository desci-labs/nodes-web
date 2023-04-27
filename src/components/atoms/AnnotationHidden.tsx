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
      className={`absolute left-[-300px] py-2 !cursor-pointer !z-[0] mx-auto pl-[288px] w-[300px] rounded-md-r h-18 annotation-item cursor-pointer transition-transform duration-1000`}
    >
      <div
        className={`shadow-sm rounded-lg w-18 h-3 block bg-tint-primary border-tint-primary-dark`}
        style={{
          boxShadow: "-1px 4px 11px -1px rgba(0,50,50,1)",
        }}
      ></div>
    </div>
  );
};

export default AnnotationHidden;
