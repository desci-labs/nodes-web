import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import {
  CodeComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { IconPlay } from "@icons";
import { PropsWithChildren, useState } from "react";
import { useSetter } from "@src/store/accessors";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  popFromComponentStack,
  pushToComponentStack,
} from "@src/state/nodes/viewer";
let execCount = 1;
const CodePillButton = ({
  children,
  href,
  onClick,
}: PropsWithChildren<any>) => {
  const { setCodeFileTabs, setRequestedCodeFile } = useManuscriptController([]);

  const dispatch = useSetter();
  const { manifest: manifestData, componentStack } = useNodeReader();

  const [flipped] = useState(
    componentStack[componentStack.length - 1]?.type ===
      ResearchObjectComponentType.CODE
  );
  return (
    <button
      onClick={
        onClick
          ? onClick
          : () => {
              const codeComponent =
                manifestData &&
                manifestData.components.find(
                  (component: ResearchObjectV1Component) =>
                    component.type === ResearchObjectComponentType.CODE
                );
              if (codeComponent) {
                if (
                  componentStack[componentStack.length - 1].id ===
                  codeComponent.id
                ) {
                  // popFromComponentStack();
                  dispatch(popFromComponentStack());
                } else {
                  dispatch(pushToComponentStack(codeComponent));
                  // !!!HARDCODED

                  if (href) {
                    const [blank, name, path, sha] = href
                      .split("?")[1]
                      .split(/&?[nusp]=/);
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
      } hover:bg-zinc-700 leading-loose h-6 items-center focus:outline-none rounded-full pr-2 font-serif text-sm font-light inline-flex flex-row`}
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
      ) : null}
    </button>
  );
};

export default CodePillButton;
