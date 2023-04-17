import AnnotationEditor from "@components/molecules/AnnotationEditor";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import { __log } from "../utils";

interface EditAnnotationBodyProps {
  isCode: boolean;
  annotationText: string;
  setAnnotationText: (text: string) => void;
  readOnly?: boolean;
}
const EditAnnotationBody = ({
  isCode,
  annotationText,
  setAnnotationText,
  readOnly = false,
}: EditAnnotationBodyProps) => {
  const [annotationMode, setAnnotationMode] = useState<"editor" | "raw">(
    "editor"
  );
  // __log("<EditAnnotationBody render>", annotationText, annotationMode);
  return (
    <>
      {annotationMode === "raw" ? (
        <div className="flex flex-row text-xs gap-2 justify-between h-12 font-mono p-4 bg-gray-200 -mx-3 w-[calc(100%+12px)]">
          Raw Annotation{" "}
          <a
            href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
            target="blank"
            rel="noreferrer noopener"
          >
            markdown format (?)
          </a>
        </div>
      ) : null}
      <AnnotationEditor
        rawMarkdown={annotationText}
        setRawMarkdown={setAnnotationText}
        mode={annotationMode}
        setMode={(e) => {
          setAnnotationMode(e);
          // setCounter(counter + 1);
        }}
        readOnly={readOnly}
      />
    </>
  );
};
export default React.memo(EditAnnotationBody);
