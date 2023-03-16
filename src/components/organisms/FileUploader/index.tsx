import { useEffect, useRef, useState } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";
import {
  RcFile,
  UploadProps,
  UploadProgressEvent,
  UploadRequestError,
  BeforeUploadFileType,
} from "./interface";
import getUid from "./uid";
import attrAccept from "./attrAccept";
import traverseFileTree from "./traverseFileTree";
import defaultRequest from "./request";

interface ParsedFileInfo {
  origin: RcFile | null;
  action: string | null;
  data: Record<string, unknown> | null;
  parsedFile: RcFile | null;
}

const FileUploader = ({
  accept,
  data,
  multiple,
  directory,
  children,
  onClick,
  onStart,
  beforeUpload,
  customRequest,
  name,
  headers,
  onProgress,
  onSuccess,
  onError,
  capture,
  action,
  withCredentials,
  method,
  onBatchStart,
  onMouseEnter,
  onMouseLeave,
}: UploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const acceptedFiles = [...files!].filter(
      (file: File) => !directory || attrAccept(file as RcFile, accept!)
    );
    uploadFiles(acceptedFiles);
    reset();
  };

  const handleOnClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    const el = fileInputRef.current;
    if (!el) {
      return;
    }

    if (children && (children as ReactElement).type === "button") {
      const parent = el.parentElement as HTMLInputElement;
      parent.focus();
      parent.querySelector("button")!.blur();
    }
    el.click();
    if (onClick) {
      onClick(e);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleOnClick(e);
    }
  };

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === "dragover") {
      return;
    }

    if (directory) {
      traverseFileTree(
        Array.prototype.slice.call(e.dataTransfer.items),
        uploadFiles,
        (_file: RcFile) => attrAccept(_file, accept!)
      );
    } else {
      let files = [...e.dataTransfer.files].filter((file: File) =>
        attrAccept(file as RcFile, accept!)
      );

      if (multiple === false) {
        files = files.slice(0, 1);
      }

      uploadFiles(files);
    }
  };

  let _isMounted = false;
  useEffect(() => {
    _isMounted = true;
    return () => {
      _isMounted = false;
      abort();
    };
  }, []);

  const uploadFiles = (files: File[]) => {
    const originFiles = [...files] as RcFile[];
    const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
      // eslint-disable-next-line no-param-reassign
      file.uid = getUid();
      return processFile(file, originFiles);
    });

    // Batch upload files
    Promise.all(postFiles).then((fileList) => {
      onBatchStart?.(
        fileList.map(({ origin, parsedFile }) => ({
          file: origin!,
          parsedFile: parsedFile!,
        }))
      );

      fileList
        .filter((file) => file.parsedFile !== null)
        .forEach((file) => {
          post(file);
        });
    });
  };

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  const processFile = async (
    file: RcFile,
    fileList: RcFile[]
  ): Promise<ParsedFileInfo> => {
    let transformedFile: BeforeUploadFileType | void = file;
    if (beforeUpload) {
      try {
        transformedFile = await beforeUpload(file, fileList);
      } catch (e) {
        // Rejection will also trade as false
        transformedFile = false;
      }
      if (transformedFile === false) {
        return {
          origin: file,
          parsedFile: null,
          action: null,
          data: null,
        };
      }
    }

    // Get latest action

    let mergedAction: string;
    if (typeof action === "function") {
      mergedAction = await action(file);
    } else {
      mergedAction = action!;
    }

    // Get latest data

    let mergedData: Record<string, unknown>;
    if (typeof data === "function") {
      mergedData = await data(file);
    } else {
      mergedData = data!;
    }

    const parsedData =
      // string type is from legacy `transformFile`.
      // Not sure if this will work since no related test case works with it
      (typeof transformedFile === "object" ||
        typeof transformedFile === "string") &&
      transformedFile
        ? transformedFile
        : file;

    let parsedFile: File;
    if (parsedData instanceof File) {
      parsedFile = parsedData;
    } else {
      parsedFile = new File([parsedData], file.name, { type: file.type });
    }

    const mergedParsedFile: RcFile = parsedFile as RcFile;
    mergedParsedFile.uid = file.uid;

    return {
      origin: file,
      data: mergedData,
      parsedFile: mergedParsedFile,
      action: mergedAction,
    };
  };

  const post = ({ data, origin, action, parsedFile }: ParsedFileInfo) => {
    if (!_isMounted) {
      return;
    }

    const { uid } = origin!;
    const request = customRequest || defaultRequest!;

    const requestOption = {
      action: action!,
      filename: name!,
      data: data!,
      file: parsedFile!,
      headers: {
        ...headers,
        authorization: `Bearer ${localStorage.getItem("auth")}`,
      },
      withCredentials: true,
      method: method || "post",
      onProgress: (e: UploadProgressEvent) => {
        onProgress?.(e, parsedFile!);
      },
      onSuccess: (ret: any, xhr?: XMLHttpRequest) => {
        onSuccess?.(ret, parsedFile!, xhr!);

        delete reqs[uid];
      },
      onError: (
        err: UploadRequestError | ProgressEvent<EventTarget>,
        ret?: any
      ) => {
        onError?.(err as Error, ret, parsedFile!);

        delete reqs[uid];
      },
    };

    onStart && onStart(origin!);
    reqs[uid] = request(requestOption);
  };

  let reqs: any = {};
  const [uid, setUid] = useState("");

  const reset = () => {
    setUid(getUid());
  };

  const abort = (file?: any) => {
    if (file) {
      const uid = file.uid ? file.uid : file;
      if (reqs[uid] && reqs[uid].abort) {
        reqs[uid].abort();
      }
      delete reqs[uid];
    } else {
      Object.keys(reqs).forEach((uid) => {
        if (reqs[uid] && reqs[uid].abort) {
          reqs[uid].abort();
        }
        delete reqs[uid];
      });
    }
  };

  // because input don't have directory/webkitdirectory type declaration
  const dirProps: any = directory
    ? { directory: "directory", webkitdirectory: "webkitdirectory" }
    : {};
  const events = {
    onClick: handleOnClick,
    onKeyDown: () => {},
    onMouseEnter,
    onMouseLeave,
    onDrop: onFileDrop,
    onDragOver: onFileDrop,
    // tabIndex: "0",
  };

  return (
    <div {...events} className="" role="button">
      <input
        ref={fileInputRef}
        type="file"
        onClick={(e) => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
        key={uid}
        style={{ display: "none" }}
        accept={accept}
        {...dirProps}
        multiple={multiple}
        onChange={onChange}
        {...(capture != null ? { capture } : {})}
      />
      {children}
    </div>
  );
};

export default FileUploader;
