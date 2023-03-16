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
  const [short, setShort] = useState(false);
  const { selectedAnnotationId } = usePdfReader();
  const mountRef = useRef(true);

  useEffect(() => {
    if (mountRef.current === false) return;
    mountRef.current = true;

    if (!selectedAnnotationId) {
      setShort(true);
      setTimeout(() => {
        setShort(false);
      }, 500);
    }

    return () => {
      mountRef.current = false;
    };
  }, [selectedAnnotationId]);
  return (
    <div
      className={`rounded-md overflow-hidden shadow-2xl annotation-item cursor-pointer mx-auto transition-none ${
        short ? "w-5" : ""
      }`}
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
            className={`rounded-tr-lg opacity-100 duration-100 overflow-hidden ${
              darkMode ? "bg-neutrals-gray-1" : "bg-white"
            }`}
            style={{
              width: 242,
              height: 15,
              transition: `opacity ease-in 0.25s`,
            }}
          >
            <div
              className={`text-white text-sm font-bold py-2 px-3 pr-5 transition-font-size ease`}
              style={{
                transitionDuration: `${DURATION_BASE_MS}ms`,
                maxWidth: "100%",
              }}
            >
              {annotationTitle.length ? annotationTitle : null}
            </div>

            <div
              className={`bg-[rgb(216,216,216)] h-px ease-out`}
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
