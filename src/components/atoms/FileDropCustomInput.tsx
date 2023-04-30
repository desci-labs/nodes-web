import { IconFile } from "@icons";
import React from "react";

const FileDropCustomInput = ({
  accept,
  onFiles,
  files,
  getFilesFromEvent,
}: any) => {
  const ref = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={ref}
        className="hidden"
        type="file"
        accept={accept}
        multiple
        onChange={(e) => {
          getFilesFromEvent(e).then((chosenFiles: any) => {
            onFiles(chosenFiles);
          });
        }}
      />
      <div
        className="h-32 justify-center flex items-center relative cursor-pointer"
        onClick={() => {
          ref.current?.click();
        }}
      >
        <div className="flex flex-col items-center gap-2 text-xs">
          <IconFile height={20} width={20} />
          <div>
            Drag and drop files or{" "}
            <span className="text-primary">choose here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropCustomInput;
