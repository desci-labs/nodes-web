import PerfectScrollbar from "react-perfect-scrollbar";
import { SlideDown } from "react-slidedown";

// @ts-ignore
import { IconFile, IconFolder, IconOpenFolder } from "@icons";
import React, { useState } from "react";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { CodeComponent } from "@desci-labs/desci-models";
import { useNodeReader } from "@src/state/nodes/hooks";

interface RecursiveFileTreeProps {
  type: "folder" | "file";
  name: string;
  isOpen?: boolean;
  children?: any;
  url?: string;
  sha: string;
  path?: string;
}

const RecursiveFolder = (props: RecursiveFileTreeProps) => {
  const { type, name, isOpen = false, children, url, sha, path = "" } = props;
  const [isFolderOpen, setIsFolderOpen] = useState<boolean>(isOpen);
  const { codeFileTabs, pushToCodeFileTabs, setCodeFileTabIndex } =
    useManuscriptController(["codeFileTabs"]);
  const { componentStack } = useNodeReader();

  return (
    <>
      <div
        className="flex flex-row items-center gap-1.5 cursor-pointer hover:text-teal py-1"
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "text/plain",
            `[Code Path](#/code/${
              (componentStack[componentStack.length - 1] as CodeComponent).id
            }?n=${name}&p=${path}&s=${sha})`
          );
        }}
        onClick={() => {
          if (type === "folder") {
            setIsFolderOpen(!isFolderOpen);
          } else {
            let index = codeFileTabs.findIndex((obj: any) => obj.sha === sha);
            if (index === -1) {
              pushToCodeFileTabs({
                name,
                url,
                path: path,
                sha,
              });
              index = codeFileTabs.length;
            }
            setCodeFileTabIndex(index);
          }
        }}
      >
        {type === "folder" ? (
          <>
            {isFolderOpen ? (
              <IconOpenFolder width={16} />
            ) : (
              <IconFolder width={16} />
            )}
          </>
        ) : (
          <IconFile width={16} />
        )}
        <div>{name}</div>
      </div>
      {type === "folder" && children && children.length ? (
        <SlideDown
          closed={!isFolderOpen}
          style={{ transitionDuration: "200ms" }}
          className="ml-4 overflow-hidden"
        >
          {children.map((data: any, index: number) => (
            <RecursiveFolder key={`folder_${data.sha}`} {...data} path={`${path}${name}/`} />
          ))}
        </SlideDown>
      ) : null}
    </>
  );
};

interface FileTreeProps {
  data: any;
}

const FileTree = (props: FileTreeProps) => {
  const { data } = props;

  return (
    <div
      className="border-2 border-[#32363b] h-fit overflow-hidden rounded-lg"
      style={{ minHeight: "calc(100%)" }}
    >
      <PerfectScrollbar
        className="
          bg-white dark:bg-[#0E1116]
          rounded-lg
          py-3 px-4
          text-black dark:text-gray-200 text-xs
          overflow-hidden"
      >
        <RecursiveFolder {...data} isOpen={true} />
      </PerfectScrollbar>
    </div>
  );
};

export default FileTree;
