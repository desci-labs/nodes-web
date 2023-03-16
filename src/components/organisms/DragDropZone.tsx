import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setIsDraggingFiles } from "@src/state/nodes/viewer";
import { useSetter } from "@src/store/accessors";
import { flatten } from "lodash";
import { useEffect, DragEvent } from "react";
import { FileType } from "./Drive";

let counter = 0;
const DragDropZone = ({ children }: React.PropsWithChildren<any>) => {
  const { isDraggingFiles } = useNodeReader();
  const dispatch = useSetter();
  const { setDroppedFileList, setDroppedTransferItemList } =
    useManuscriptController([]);

  const handleExit = () => {
    counter--;
    if (counter === 0) {
      dispatch(setIsDraggingFiles(false));
    }
  };

  useEffect(() => {
    const handleNewTab = () => {
      if (document.visibilityState === "visible") {
      } else {
        handleExit();
      }
    };
    window.addEventListener("visibilitychange", handleNewTab);
    return () => {
      window.removeEventListener("visibilitychange", handleNewTab);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dragOverHandler = (e: DragEvent<HTMLDivElement>) => {
    // Prevent default behavior (Prevent file from being opened)
    if (isDraggingFiles) {
      e.preventDefault();
    }
  };

  const getFileTree = async (
    item: FileSystemEntry | FileSystemDirectoryEntry,
    path: string
  ): Promise<FileSystemEntry[] | FileSystemEntry> => {
    path = path || "";
    if (item.isDirectory) {
      console.log(item.fullPath); //console.log(item.name)

      // Get folder contents
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      const files: Promise<FileSystemEntry[] | FileSystemEntry>[] = [];
      const entries: FileSystemEntry[] = await new Promise((res, rej) => {
        dirReader.readEntries(async (entries) => {
          res(entries);
        }, rej);
      });
      for (let i = 0; i < entries.length; i++) {
        const subTree = getFileTree(entries[i], path + item.name + "/");
        files.push(subTree);
      }

      return flatten(await Promise.all(files));
    }
    return item;
  };
  const dropHandler = async (ev: DragEvent<HTMLDivElement>) => {
    console.log("File(s) dropped");

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)

      const processed: Array<FileSystemEntry[] | FileSystemEntry> = [];
      const items = [...ev.dataTransfer.items];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // If dropped items aren't files, reject them
        if (item.kind === FileType.File) {
          const file = item.webkitGetAsEntry();
          processed.push(await getFileTree(file!, ""));
          console.log(
            `[DataTransferItemList] … file[${i}].name = ${file!.name}`,
            file,
            item
          );
        }
      }
      setDroppedTransferItemList(flatten(processed));
    } else {
      setDroppedFileList(ev.dataTransfer.files);
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`[DataTransfer] … file[${i}].name = ${file.name}`);
      });
    }
    dispatch(setIsDraggingFiles(false));
  };
  return (
    <div
      className="drag-drop-zone"
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
      onDragEnter={(e) => {
        counter++;

        if (
          e.dataTransfer.items &&
          !!Array.from(e.dataTransfer.items).find(
            (i) => i.kind === FileType.File
          )
        ) {
          dispatch(setIsDraggingFiles(true));
        }
      }}
      onDragLeave={handleExit}
    >
      {children}
    </div>
  );
};

export default DragDropZone;
