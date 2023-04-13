import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  CodeComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { IconPlay } from "@icons";
import { PropsWithChildren, useCallback, useState } from "react";
import { useSetter } from "@src/store/accessors";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  popFromComponentStack,
  pushToComponentStack,
  setAnnotationLinkConfig,
} from "@src/state/nodes/viewer";
import { parseAnnotationLink } from "../molecules/AnnotationEditor/components";
let execCount = 1;
const CodePillButton = ({
  children,
  href,
  onClick,
}: PropsWithChildren<any>) => {
  const { setCodeFileTabs, setRequestedCodeFile } = useManuscriptController([]);

  const dispatch = useSetter();
  const {
    manifest: manifestData,
    componentStack,
    annotationLinkConfig,
  } = useNodeReader();

  const thisLinkConfig = parseAnnotationLink(href);

  const getCodeComponent = useCallback(() => {
    const targetId = thisLinkConfig.url?.split("#/code/")[1];
    const codeComponent =
      manifestData &&
      manifestData.components.find(
        (component: ResearchObjectV1Component) =>
          component.type === ResearchObjectComponentType.CODE &&
          component.id === targetId
      );

    return codeComponent;
  }, [manifestData]);

  const flipped =
    annotationLinkConfig?.url == thisLinkConfig.url &&
    annotationLinkConfig?.extraPath == thisLinkConfig?.extraPath &&
    annotationLinkConfig?.lineNumber == thisLinkConfig?.lineNumber;

  return (
    <button
      onClick={
        onClick
          ? onClick
          : () => {
              const codeComponent = getCodeComponent();
              if (codeComponent) {
                if (flipped) {
                  // popFromComponentStack();
                  dispatch(popFromComponentStack());
                  dispatch(setAnnotationLinkConfig(null));
                } else {
                  if (
                    componentStack[componentStack.length - 1]?.type === "code"
                  ) {
                    dispatch(popFromComponentStack());
                  }
                  dispatch(pushToComponentStack(codeComponent));
                  if (href) {
                    const annotationLinkConfig = parseAnnotationLink(href);
                    dispatch(setAnnotationLinkConfig(annotationLinkConfig));
                  }

                  if (href && href.indexOf("?") > 0) {
                    const [query, name, path, sha] = href
                      .split("?")[1]
                      .split(/&?[nusp]=/);
                    const queryParams = query.split("&");
                    const queryObj = queryParams.reduce(
                      (acc: any, curr: string) => {
                        const [key, value] = curr.split("=");
                        acc[key] = value;
                        return acc;
                      },
                      {}
                    );

                    setRequestedCodeFile({
                      name,
                      path,
                    });
                    setCodeFileTabs([
                      {
                        name,
                        url: `https://api.github.com/repos/${
                          (
                            codeComponent as CodeComponent
                          ).payload!.externalUrl!.split("github.com/")[1]
                        }/git/blobs/${sha}`,
                        path,
                        sha,
                      },
                    ]);
                  }
                }
              }
            }
      }
      className={`component-code-link ${
        flipped
          ? "bg-gray-300 text-black hover:text-white"
          : "bg-black text-white"
      } hover:bg-zinc-700 leading-loose h-6 items-center focus:outline-none rounded-full pr-2 font-serif text-sm font-light inline-flex flex-row group`}
    >
      <div
        className={`select-none ${
          !flipped ? "bg-gray-300 text-black " : "bg-black text-white"
        } h-full block align-top leading-loose pl-1 pr-0 rounded-l-full mr-2 text-xs font-mono`}
      >
        {/* contentEditable={false} is for when this is in annotation editor. */}
        <span
          className="inline-block"
          style={{ transform: "scaleX(0.5)" }}
          //   contentEditable={false}
        >
          &lt;/&gt;
        </span>
      </div>
      {children}
      {flipped ? (
        <>
          <span className="text-[10px] font-mono group-hover:text-gray-400 text-gray-700 ml-1">
            [viewing]
          </span>{" "}
        </>
      ) : (
        ""
      )}
      {/* {flipped ? (
        <div
          onClick={(e) => {
            if (href) {
              const [blank, name, path, sha] = href
                .split("?")[1]
                .split(/&?[nusp]=/);
              setRequestedCodeFile({
                name,
                path,
                exec: `${execCount++}`,
              });
            }
            e.stopPropagation();
          }}
          className={`select-none text-white bg-tint-primary hover:bg-tint-primary-hover active:bg-tint-primary fill-current h-full flex w-5 justify-center align-top leading-loose pl-0 pr-0.5 rounded-r-full ml-2 -mr-2 text-xs font-mono`}
        >
          <IconPlay width={10} />
        </div>
      ) : null} */}
    </button>
  );
};

export default CodePillButton;
