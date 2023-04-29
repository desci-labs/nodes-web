import React, { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import irBlack from "react-syntax-highlighter/dist/esm/styles/hljs/ir-black";
import PerfectScrollbar from "react-perfect-scrollbar";
import Terminal from "../Terminal";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconX } from "@icons";
import axios from "axios";
import {
  CodeComponent,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { usePdfReader } from "@src/state/nodes/hooks";

interface CodeViewerProps extends ResearchObjectV1Component {
  payload: CodeComponent["payload"];
}

// const TABS = [
//   {
//     name: "Tab1",
//   },
//   {
//     name: "Tab2",
//   },
//   {
//     name: "Tab3",
//   },
// ];

const CodeViewer = (props: CodeViewerProps) => {
  const {
    payload: { language },
  } = props;
  const { selectedAnnotationId } = usePdfReader();
  const {
    codeFileTabs,
    removeAtIndexCodeFileTabs,
    codeFileTabIndex,
    setCodeFileTabIndex,
    codeViewState,
    setCodeViewState,
  } = useManuscriptController([
    "codeFileTabs",
    "codeFileTabIndex",
    "codeViewState",
  ]);

  const [opened, setOpened] = useState(false);
  const { isTerminalVisible } = codeViewState;
  const [content, setContent] = useState<string>();

  useEffect(() => {
    setOpened(true);
  }, []);

  useEffect(() => {
    if (codeFileTabs?.length && codeFileTabs[codeFileTabIndex]) {
      axios.get(codeFileTabs[codeFileTabIndex].url).then((resp: any) => {
        setContent(atob(resp?.data?.content));
      });
    }
  }, [codeFileTabs, codeFileTabIndex]);

  return (
    <div
      className={`w-fit p-2 fixed right-0 bottom-0 dark:bg-dark-gray bg-gray-200 ${
        opened ? "translate-x-[-320px]" : "translate-x-[390px]"
      } ease-out ${
        selectedAnnotationId ? "duration-[0.1s] transition-all" : ""
      } `}
      style={{
        height: "calc(100vh - 55px)",
        width: "calc(100vw - 375px - 360px)",
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      <div
        className="flex flex-row items-center text-xl ml-2"
        style={{ height: 60, color: "gray" }}
      >
        {codeFileTabs[codeFileTabIndex]?.path
          .slice(0, -1)
          .split("/")
          .map((p: string, index: number) => {
            return (
              <span
                key={index}
                className="dark:text-teal text-gray-600 cursor-pointer pr-2 hover:text-gray-400"
              >
                {p} /
              </span>
            );
          })}
        <span className="dark:text-[rgb(200,206,212)] text-black">
          {codeFileTabs[codeFileTabIndex]?.name}
        </span>
      </div>
      <div
        className="rounded-lg overflow-hidden"
        style={{
          height: "calc(100vh - 130px)",
          border: "solid 2px rgb(50,54,59)",
        }}
      >
        <div className="" style={{ backgroundColor: "rgb(23,26,32)" }}>
          <div
            className="w-full flex flex-row"
            style={{ borderBottom: "solid 2px rgb(50,54,59)" }}
          >
            {codeFileTabs.length ? null : <div className="h-9"></div>}
            {codeFileTabs.map((tab: any, index: number) => (
              <div
                key={index}
                className={`
                    flex items-center gap-2
                    text-black dark:text-white
                    py-2 px-4
                    border-r border-r-[#333]
                    cursor-pointer
                    text-sm
                    ${
                      index === codeFileTabIndex
                        ? "bg-[#999] dark:bg-[#333]"
                        : ""
                    }
                  `}
                onClick={() => {
                  setCodeFileTabIndex(index);
                }}
              >
                {tab.name}
                <IconX
                  width={12}
                  className="cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    removeAtIndexCodeFileTabs(index);
                    if (codeFileTabIndex >= index) {
                      setCodeFileTabIndex(Math.max(codeFileTabIndex - 1, 0));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div
          className="overflow-hidden"
          style={{ height: "calc(100% - 39px)" }}
        >
          <PerfectScrollbar className="relative w-fit h-full overflow-y-scroll w-[100%]">
            {/* <div className="flex flex-row">
              {
                TABS.map((tab: any, index: number) => (
                  <div key={index} className="bg-black px-4 py-2.5">
                    { tab.name }
                  </div>
                ))
              }
            </div> */}
            <SyntaxHighlighter
              language={language}
              style={irBlack}
              showLineNumbers
              wrapLongLines
              customStyle={{
                width: "100%",
                minHeight: "100%",
                fontSize: 12,
                backgroundColor: "#0D1117",
              }}
              lineNumberStyle={{ color: "rgb(73,79,87)" }}
            >
              {codeFileTabs.length ? content : "Select a file to get started"}
            </SyntaxHighlighter>
          </PerfectScrollbar>
        </div>
      </div>
      {isTerminalVisible ? (
        <Terminal
          onRequestClose={() =>
            setCodeViewState({
              ...codeViewState,
              isTerminalVisible: false,
            })
          }
        />
      ) : null}
    </div>
  );
};

export default CodeViewer;
