import PanelCloseButton from "@components/atoms/PanelCloseButton";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconPlay } from "@icons";
import { useCallback, useEffect, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import SidePanel from "..";
// Windows fix
import "./index.css";
import "react-folder-tree/dist/style.css";
import PillButton from "@components/atoms/PillButton";
import GithubFileTree from "@components/organisms/FileTree/GithubFileTree";
import { CodeComponent } from "@desci-labs/desci-models";
import { isWindows } from "@components/utils";
import axios from "axios";
import { useSetter } from "@src/store/accessors";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { popFromComponentStack } from "@src/state/nodes/nodeReader";

// @ts-ignore
const Wrapper: StyledComponent<"div", any, any, any> = styled(SidePanel).attrs({
  className: "bg-gray-200 dark:bg-dark-gray dark:text-white",
})`
  ${(props) =>
    (props as any).initiallyVisibile
      ? "transition: all 0.4s;"
      : "transition: none !important;"}
  z-index: 9;
  ${(props) =>
    props.annotationVisible
      ? `height: calc(100vh - 340px);
  top: 340px; transition: all 0.1s;`
      : (props as any).initiallyVisibile
      ? "transition-delay: 0.2s;"
      : ""}
  ${(props) => ((props as any).doPad ? `` : ``)}
  color: #000000;
`;
const ContentWrapper = styled.div.attrs<{ className: string }>({
  className: "flex flex-col px-2 pb-2 w-full",
})`
  flex: 1;
  overflow: hidden;
`;
const Header = styled.div.attrs<{ className: string }>({
  className: "flex items-center justify-between w-full",
})`
  padding: 1.25rem 1.625rem;
  flex: unset;
  justify-content: flex-start;
`;
// const Title = styled.p.attrs({
//   className: "select-none text-lg font-bold",
// })``;

interface CodeDirectorySidePanelProps {}

const CodeDirectorySidePanel = (props: CodeDirectorySidePanelProps) => {
  const { selectedAnnotationId, isEditingAnnotation } = usePdfReader();
  const dispatch = useSetter();
  const { componentStack } = useNodeReader();

  const { codeViewState, setCodeViewState } = useManuscriptController([
    "codeViewState",
  ]);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [repoState, setRepoState] = useState({
    owner: "",
    repo: "",
    branch: "",
  });

  // const onTreeStateChange = (state: any) => setFolderData(state);

  const activeComponent = componentStack[componentStack.length - 1];
  const isCodeActive = activeComponent?.type === "code";

  useEffect(() => {
    if (isCodeActive) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    return () => {
      setCodeViewState({
        ...codeViewState,
        isTerminalVisible: false,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentStack, isEditingAnnotation]);

  // const handleNameClick = ({ defaultOnClick, nodeData }: any) => {
  //   const newFolderData = { ...folderData };
  //   const newChildren = newFolderData.children;
  //   const newNodeData = { ...nodeData };
  //   newNodeData.isOpen = !newNodeData.isOpen;
  //   newChildren.splice(newChildren.indexOf(nodeData), 1, newNodeData);
  //   newFolderData.children = newChildren;
  //   setFolderData(newFolderData);
  //   __log(newFolderData, newNodeData);
  // };

  const retrieveDefaultBranch = async (owner: string, repo: string) => {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const res = await axios.get(url);
    const { default_branch } = res.data;
    if (!default_branch)
      console.error(
        `Unable to retrieve default branch for github repo url: ${url}`
      );
    return default_branch;
  };

  const payload = activeComponent && (activeComponent as CodeComponent).payload;

  //initialize and update repoState
  useEffect(() => {
    const updateRepoInfo = async () => {
      let owner = "",
        repo = "",
        branch = "";

      if (payload && payload.externalUrl) {
        const spl = payload.externalUrl.split("github.com/");
        if (spl) {
          owner = spl[1].split("/")[0];
          repo = spl[1].split("/")[1];
          if (repo.includes(".")) repo = repo.split(".")[0];
        }
        if (payload.externalUrl.includes("/tree/")) {
          branch = payload.externalUrl.match(/\/tree\/([^\/]+)/)![1];
        } else {
          branch = await retrieveDefaultBranch(owner, repo);
        }
      }
      setRepoState({ owner: owner, repo: repo, branch: branch });
    };
    updateRepoInfo();
  }, [payload]);

  const panelOrientation = "left";

  const [doPad, setDoPad] = useState(false);
  useEffect(() => {
    if (isWindows()) {
      setDoPad(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (componentStack.length > 1 && isCodeActive) {
      dispatch(popFromComponentStack());
    } else {
      setIsVisible(false);
    }
    // setIsPanelOpen(false);
    // onClose();
  }, [componentStack, dispatch, setIsVisible, isCodeActive]);

  return (
    <Wrapper
      orientation={panelOrientation}
      isOpen={isVisible}
      width={isEditingAnnotation ? 420 : 420}
      doPad={doPad}
      annotationVisible={!!selectedAnnotationId}
      initiallyVisibile={!!selectedAnnotationId}
    >
      <div className="relative h-full">
        {selectedAnnotationId && (
          <PanelCloseButton
            panelOrientation={panelOrientation}
            className={`right-0 left-[unset]`}
            visible={isVisible}
            onClick={handleClose}
          />
        )}
        <div className="flex flex-col h-full">
          <Header className="w-full">
            <div className="mx-auto w-full">
              <PillButton
                disabled={true}
                className={` cursor-not-allowed ${
                  codeViewState.isTerminalVisible ? "cursor-not-allowed" : ""
                }`}
                leftIcon={() => (
                  <IconPlay
                    width={14}
                    fill="gray"
                    className={`dark:stroke-gray-300 stroke-black h-5 m-2 ml-3 cursor-not-allowed ${
                      codeViewState.isTerminalVisible
                        ? "cursor-not-allowed "
                        : ""
                    }`}
                  />
                )}
                rightIcon={() => (
                  <span
                    className={` text-md text-gray-300 text-center p-4 w-72 ${
                      codeViewState.isTerminalVisible || true
                        ? "cursor-not-allowed bg-zinc-900 p-[5px] rounded-r-md"
                        : ""
                    } `}
                  >
                    {codeViewState.isTerminalVisible ? (
                      "Running"
                    ) : (
                      <>Reproducible&nbsp;Run</>
                    )}
                  </span>
                )}
                onClick={() => {
                  if (codeViewState.isTerminalVisible || true) {
                    return;
                  }
                }}
              />
            </div>
          </Header>
          <ContentWrapper>
            <GithubFileTree
              owner={repoState.owner}
              repo={repoState.repo}
              branch={repoState.branch}
            />
          </ContentWrapper>
        </div>
      </div>
    </Wrapper>
  );
};

export default CodeDirectorySidePanel;
