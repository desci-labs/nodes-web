import React from "react";

// Define interface for component props/api:
export interface FileUploadProps {
  onDragStateChange?: (isDragActive: boolean) => void;
  onDrag?: () => void;
  onDragIn?: () => void;
  onDragOut?: () => void;
  onDrop?: () => void;
  onFilesDrop?: (files: File[]) => void;
}
// Create helper method to map file list to array of files:
export const mapFileListToArray = (files: FileList): File[] => {
  const array: File[] = [];

  for (let i = 0; i < files.length; i++) {
    array.push(files.item(i) as File);
  }

  return array;
};

const FileUpload = React.memo(
  (props: React.PropsWithChildren<FileUploadProps>) => {
    const {
      onDragStateChange,
      onFilesDrop,
      onDrag,
      onDragIn,
      onDragOut,
      onDrop,
    } = props;

    // Create state to keep track when dropzone is active/non-active:
    const [isDragActive, setIsDragActive] = React.useState(false);
    // Prepare ref for dropzone element:
    const dropZoneRef = React.useRef<null | HTMLDivElement>(null);

    // Create handler for dragenter event:
    const handleDragIn = React.useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragIn?.();

        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
          setIsDragActive(true);
        }
      },
      [onDragIn]
    );

    // Create handler for dragleave event:
    const handleDragOut = React.useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        onDragOut?.();

        setIsDragActive(false);
      },
      [onDragOut]
    );

    // Create handler for dragover event:
    const handleDrag = React.useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        onDrag?.();
        if (!isDragActive) {
          setIsDragActive(true);
        }
      },
      [isDragActive, onDrag]
    );

    // Create handler for drop event:
    const handleDrop = React.useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragActive(false);
        onDrop?.();

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = mapFileListToArray(event.dataTransfer.files);

          onFilesDrop?.(files);
          event.dataTransfer.clearData();
        }
      },
      [onDrop, onFilesDrop]
    );

    // Obser active state and emit changes:
    React.useEffect(() => {
      onDragStateChange?.(isDragActive);
    }, [isDragActive]);

    // Attach listeners to dropzone on mount:
    React.useEffect(() => {
      const tempZoneRef = dropZoneRef?.current;
      if (tempZoneRef) {
        tempZoneRef.addEventListener("dragenter", handleDragIn);
        tempZoneRef.addEventListener("dragleave", handleDragOut);
        tempZoneRef.addEventListener("dragover", handleDrag);
        tempZoneRef.addEventListener("drop", handleDrop);
      }

      // Remove listeners from dropzone on unmount:
      return () => {
        tempZoneRef?.removeEventListener("dragenter", handleDragIn);
        tempZoneRef?.removeEventListener("dragleave", handleDragOut);
        tempZoneRef?.removeEventListener("dragover", handleDrag);
        tempZoneRef?.removeEventListener("drop", handleDrop);
      };
    }, []);

    // Render <div> with ref and children:
    return <div ref={dropZoneRef}>{props.children}</div>;
  }
);

export default FileUpload;
