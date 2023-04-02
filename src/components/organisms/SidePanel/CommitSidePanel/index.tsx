import PanelCloseButton from "@components/atoms/PanelCloseButton";
import PrimaryButton from "@components/atoms/PrimaryButton";
import Footer from "@components/molecules/Footer";
import CommitAdditionalInfoPopOver from "@components/organisms/PopOver/CommitAdditionalInfoPopover";
import CommitStatusPopover from "@components/organisms/PopOver/CommitStatusPopover";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";
import { useNodeValidator } from "@src/hooks/useNodeValidator";
import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import styled, { StyledComponent } from "styled-components";
import SidePanel from "..";
import NodeChanges from "./Changes/NodeChanges";
import useNodeDiff from "./Changes/useNodeDiff";
import General from "./General";
import NodeMetadata from "./NodeMetadata";
import { lockScroll, restoreScroll } from "@src/components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { toggleCommitPanel } from "@src/state/nodes/viewer";
import { animated, useTransition } from "react-spring";

// @ts-ignore
const Wrapper: StyledComponent<"div", any, any, any> = styled(SidePanel).attrs({
  className: "bg-gray-200 dark:bg-dark-gray dark:text-white",
})`
  color: #000000;
`;
const ContentWrapper = styled(FlexColumn).attrs({
  className: "flex flex-col h-full",
})`
  flex: 1;
  overflow: hidden;
`;
const Title = styled.p.attrs({
  className: "text-lg font-bold",
})``;
const Subtitle = styled.p.attrs({
  className: "text-xs text-neutrals-gray-5 mt-1",
})``;

const FooterUpdatesText: any = styled.p.attrs((props: any) => ({
  // children: `${props.numUpdates} updates`,
  className: "text-xs",
}))``;

interface CommitSidePanelProps {}

const CommitSidePanel = (props: CommitSidePanelProps) => {
  const [showAdditionalInfoPopover, setShowAdditionalInfoPopover] =
    useState<boolean>(false);
  const [showCommitStatusPopover, setShowCommitStatusPopover] = useState(false);
  const { isCommitPanelOpen } = useNodeReader();
  const dispatch = useSetter();

  const { isValid } = useNodeValidator();
  const { isError: fail } = useNodeDiff();

  // Panel overlay transition
  const fadeTransition = useTransition(isCommitPanelOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  // const [fail, setFail] = useState(true);
  const panelOrientation = "left";

  useEffect(() => {
    function preventScroll(e: any) {
      e.preventDefault();
      e.stopPropagation();

      return false;
    }
    const overlay = document.querySelector("#commit-sidepanel-overlay");
    if (overlay) {
      console.log("asdf");
      overlay.addEventListener("wheel", preventScroll, { passive: false });
      return () => overlay.removeEventListener("wheel", preventScroll);
    }
  }, []);

  useEffect(() => {
    if (isCommitPanelOpen) {
      lockScroll();
    } else {
      restoreScroll();
    }
  }, [isCommitPanelOpen]);

  if (!isCommitPanelOpen) {
    return (
      <Wrapper
        orientation={panelOrientation}
        isOpen={isCommitPanelOpen}
        width={320}
      />
    );
  }

  return (
    <>
      {fadeTransition(
        ({ opacity }, item) =>
          item && (
            <animated.div
              id="commit-sidepanel-overlay"
              className="fixed w-screen h-screen top-0 left-0 z-10"
              style={{
                background: "rgba(0, 0, 0, 0.86)",
                opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
                // opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
              }}
              onClick={() => dispatch(toggleCommitPanel(false))}
            >
              <Wrapper
                orientation={panelOrientation}
                isOpen={isCommitPanelOpen}
                width={320}
              >
                <div
                  className="relative h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PanelCloseButton
                    panelOrientation={panelOrientation}
                    visible={isCommitPanelOpen}
                    onClick={() => dispatch(toggleCommitPanel(false))}
                  />
                  <ContentWrapper>
                    <div className="p-4">
                      <Title>Commit Changes</Title>
                      <Subtitle>
                        Review your changes and complete the items below before
                        publishing
                      </Subtitle>
                    </div>
                    <PerfectScrollbar>
                      <div className="py-4">
                        <NodeChanges />
                        <NodeMetadata />
                        <General />
                      </div>
                    </PerfectScrollbar>
                    <Footer>
                      <FlexRowSpaceBetween>
                        <FooterUpdatesText numUpdates={5} />
                        <PrimaryButton
                          onClick={() => setShowAdditionalInfoPopover(true)}
                          disabled={!isValid || fail}
                        >
                          Continue
                        </PrimaryButton>
                      </FlexRowSpaceBetween>
                    </Footer>
                  </ContentWrapper>
                </div>
                <CommitAdditionalInfoPopOver
                  isOpen={showAdditionalInfoPopover}
                  onDismiss={() => {
                    setShowAdditionalInfoPopover(false);
                  }}
                  onSuccess={() => {
                    setShowCommitStatusPopover(true);
                  }}
                />
                <CommitStatusPopover
                  isOpen={showCommitStatusPopover}
                  onDismiss={() => {
                    setShowCommitStatusPopover(false);
                  }}
                  onSuccess={() => {
                    dispatch(toggleCommitPanel(false));
                  }}
                />
              </Wrapper>
            </animated.div>
          )
      )}
    </>
  );
};

export default CommitSidePanel;
