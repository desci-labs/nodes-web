import React, { Ref } from "react";

interface Props {
  autoUpload?: boolean;
  customReq: (files: FileList) => void;
  directoryPicker?: boolean;
  id: string;
}

const FileUploaderBare = React.forwardRef<HTMLInputElement, Props>(
  ({ autoUpload, customReq, directoryPicker, id }, ref) => {
    async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { files } = e.target as any;
      console.log("files: ", files);
      // await traverseFileTree(files, (f) => console.log("traversefiletree: ", f));
      // const allFiles: any = await getAllFileEntries(files);
      // console.log("allFiles: ", allFiles);
      if (files?.length && autoUpload) customReq(files);
    }

    const dirProps: any = directoryPicker
      ? {
          directory: "directory",
          webkitdirectory: "webkitdirectory",
        }
      : {};

    return (
      <input
        type="file"
        id={id}
        multiple
        ref={ref}
        onChange={onChange}
        {...dirProps}
      />
    );
  }
);

export default FileUploaderBare;
