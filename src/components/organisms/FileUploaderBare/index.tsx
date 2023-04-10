import React, { Ref } from "react";

interface Props {
  autoUpload?: boolean;
  customReq: (files: FileList) => void;
}

const FileUploaderBare = React.forwardRef<HTMLInputElement, Props>((
  { autoUpload, customReq },
  ref
  ) => {
    async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { files } = e.target as any;
      console.log("files: ", files);
      // await traverseFileTree(files, (f) => console.log("traversefiletree: ", f));
      // const allFiles: any = await getAllFileEntries(files);
      // console.log("allFiles: ", allFiles);
      if (files?.length && autoUpload) customReq(files);
    }

    const dirProps: any = {
      // directory: "directory",
      // webkitdirectory: "webkitdirectory",
    };

    return (
      <input
        type="file"
        id="input"
        multiple
        ref={ref}
        onChange={onChange}
        {...dirProps}
      />
    );
  }
);

export default FileUploaderBare;
