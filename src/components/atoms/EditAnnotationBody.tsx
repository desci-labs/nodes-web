import AnnotationEditor, {
  SlateEditor,
} from "@components/molecules/AnnotationEditor";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import { useState } from "react";
import PrimaryButton from "./PrimaryButton";

interface EditAnnotationBodyProps {
  isCode: boolean;
  annotationText: string;
  setAnnotationText: (text: string) => void;
  setCounter: (num: number) => void;
  counter: number;
  readOnly?: boolean;
}
const EditAnnotationBody = ({
  isCode,
  annotationText,
  setAnnotationText,
  setCounter,
  counter,
  readOnly = false,
}: EditAnnotationBodyProps) => {
  const [mode, setMode] = useState<"editor" | "raw">("editor");
  return (
    <>
    {mode === "raw" ? (
      <div className="flex flex-row text-xs gap-2 justify-between h-12 font-mono p-4 bg-gray-200 -mx-3 w-[calc(100%+12px)]">Raw Annotation <a href="https://en.wikipedia.org/wiki/Markdown" target="blank" rel="noreferrer noopener">markdown format (?)</a></div>
    ) : null}
      <AnnotationEditor
        rawMarkdown={annotationText}
        setRawMarkdown={setAnnotationText}
        mode={mode}
        setMode={(e) => {
          setMode(e);
          setCounter(counter + 1);
        }}
        readOnly={readOnly}
      />
    </>
  );
};
export default EditAnnotationBody;
