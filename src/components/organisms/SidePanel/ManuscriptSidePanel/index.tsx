import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FlexColumn, FlexRow, FlexRowSpaceBetween } from "@components/styled";
import SidePanel from "@components/organisms/SidePanel";
import HistoryTab from "./Tabs/HistoryTab";
import SourceTab from "./Tabs/SourceTab";
import PerfectScrollbar from "react-perfect-scrollbar";
import PanelCloseButton from "@components/atoms/PanelCloseButton";
import ManuscriptAttributesSection from "@components/organisms/ManuscriptAttributesSection";
import ManuscriptComponentsSection from "@components/organisms/ManuscriptComponentsSection";
import {
  convertUUIDToHex,
  isWindows,
  lockScroll,
  restoreScroll,
  triggerTooltips,
} from "@components/utils";
import PrimaryButton from "@components/atoms/PrimaryButton";
import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import { useEffectOnce } from "react-use";
import NodeDrive from "@components/molecules/NodeDrive";
import useSaveManifest from "@src/hooks/useSaveManifest";
import { useUser } from "@src/state/user/hooks";
import {
  useNodeReader,
  useNodeVersions,
  usePdfReader,
} from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  popFromComponentStack,
  ResearchTabs,
  setResearchPanelTab,
  toggleCommitPanel,
  toggleResearchPanel,
} from "@src/state/nodes/viewer";

const ManuscriptSidePanelContainer = styled(SidePanel).attrs({
  className: "bg-light-gray dark:bg-dark-gray text-black dark:text-white",
})``;
const ContentWrapper = styled(FlexColumn)`
  position: relative;
  height: 100%;
`;
const ManuscriptHeader = styled(FlexRowSpaceBetween)`
  padding: 1rem 1.625rem;
  flex: unset;
  justify-content: center;
`;
const ManuscriptTitle = styled.p.attrs({
  className:
    "transition-all duration-750 select-none text-sm font-bold text-left w-full",
})``;
const SwitchButton: any = styled.div.attrs((props: any) => ({
  className: `select-none border-[1px] border-muted-300 dark:border-muted-800 font-inter ${
    props.isSelected
      ? "bg-black text-white font-bold"
      : "bg-white dark:bg-medium-gray dark:hover:bg-dark-gray text-black dark:text-white"
  }`,
}))`
  flex: 1;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 200ms linear, color 200ms linear;
  padding: 4px 0;
  border-left: 0;
  border-top: 0;
  border-bottom: 0;
`;
const SwitchBar = styled(FlexRow).attrs({
  className: "border-[1px] border-muted-300 dark:border-muted-900",
})`
  border-radius: 8px;
  overflow: hidden;
  flex: unset;

  & > ${SwitchButton}:last-child {
    border-right: none;
  }
`;

interface ManuscriptSidePanelProps {
  onClose: () => void;
}

let playTime = 0;
const ManuscriptSidePanel = (props: ManuscriptSidePanelProps) => {
  const { onClose } = props;
  const dispatch = useSetter();
  const { selectedAnnotationId } = usePdfReader();
  const {
    manifest: manifestData,
    publicView,
    isCommitPanelOpen,
    currentObjectId,
    isResearchPanelOpen,
    mode,
    componentStack,
    researchPanelTab,
  } = useNodeReader();
  const nodeVersions = useNodeVersions(currentObjectId);

  const onSetResearchPanelTab = (tab: ResearchTabs) =>
    dispatch(setResearchPanelTab(tab));
  const [doPad] = useState(false);
  const { saveManifest } = useSaveManifest();
  const userProfile = useUser();

  useEffect(() => {
    triggerTooltips();
  }, []);

  useEffect(() => {
    if (isWindows()) {
    }
  }, []);

  const activeComponent = componentStack[componentStack.length - 1];
  const isCodeActive =
    activeComponent?.type === ResearchObjectComponentType.CODE;

  const [isAdmin, setIsAdmin] = useState(false);
  const [shouldBeBlue, setShouldBeBlue] = useState(false);
  const [showManifest, setShowManifest] = useState(false);

  const [tempManifestData, setTempManifestData] = useState<
    ResearchObjectV1 | undefined
  >(manifestData);
  const [, setMounted] = useState(false);
  const refVideo = useRef(null);

  useEffect(() => {
    const didPush = !!nodeVersions;

    setShouldBeBlue(didPush);

    if (refVideo.current) {
      (refVideo.current! as HTMLVideoElement).currentTime = playTime + 0.25;
    }
  }, [manifestData, isCommitPanelOpen, currentObjectId, mode, nodeVersions]);

  useEffect(() => {
    if (!refVideo.current) {
      return;
    }

    //open bug since 2017 that you cannot set muted in video element https://github.com/facebook/react/issues/10389
    (refVideo.current! as HTMLVideoElement).defaultMuted = true;
    (refVideo.current! as HTMLVideoElement).muted = true;

    // refVideo.current.srcObject = src;
  }, []);
  useEffectOnce(() => {
    setMounted(true);
    const panelEl = document.getElementById("manuscript-side-panel");
    if (panelEl) {
      panelEl.onmouseover = lockScroll;
      panelEl.onmouseout = restoreScroll;
    }
  });

  useEffect(() => {
    if (isCodeActive) {
      dispatch(toggleResearchPanel(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentStack]);

  useEffect(() => {
    setTempManifestData(manifestData);
  }, [manifestData]);

  useEffect(() => {
    if (userProfile && userProfile.email.indexOf("@desci.com") > -1) {
      setIsAdmin(true);
    }
  }, [userProfile]);

  const showCloseButton =
    componentStack.length > 0 && (!isCodeActive || selectedAnnotationId);
  const isResearchPanelReallyOpen =
    isResearchPanelOpen || componentStack.length < 1;

  return (
    <ManuscriptSidePanelContainer
      id="manuscript-side-panel"
      orientation="right"
      isOpen={isResearchPanelReallyOpen}
      width={320}
    >
      <ContentWrapper>
        {showCloseButton ? (
          <PanelCloseButton
            visible={isResearchPanelReallyOpen}
            onClick={() => {
              if (componentStack.length > 1 && isCodeActive) {
                dispatch(popFromComponentStack());
              } else {
                dispatch(toggleResearchPanel(false));
                onClose();
              }
            }}
          />
        ) : null}

        <ManuscriptHeader>
          <ManuscriptTitle>
            {mode === "editor" ? <>Edit Node</> : "Research Node Navigator"}
          </ManuscriptTitle>
          {/* <IconResearchObject /> */}
        </ManuscriptHeader>
        <div
          className={` relative overflow-hidden z-[-1]`}
          style={{ height: 276 }}
        >
          <div
            className={`overflow-hidden relative w-[420px] h-[260px]`}
            key={`cube-wrapper-${mode}-${shouldBeBlue}`}
            style={{
              filter: `${
                mode === "reader" || shouldBeBlue
                  ? null
                  : "sepia(1.0) saturate(0)"
              }`,
            }}
          >
            <video
              loop
              ref={refVideo}
              playsInline
              autoPlay
              key={`cube-panel`}
              muted
              onTimeUpdate={() => {
                if (refVideo.current) {
                  playTime = (refVideo.current! as HTMLVideoElement)
                    .currentTime;
                }
              }}
              src={`https://d3ibh1pfr1vlpk.cloudfront.net/two.mp4`}
              className="absolute"
              style={{
                left: "-50px",
                height: 260,
                top: -35,
              }}
            ></video>
          </div>
        </div>
        <PrimaryButton
          disabled={isCommitPanelOpen}
          className={`${
            mode === "reader"
              ? "opacity-0 h-0 !mx-0 !py-0 overflow-hidden"
              : "opacity-100 mt-4 mx-4 py-1 shadow-md hover:shadow-none"
          } block transition-all duration-200 text-sm font-medium`}
          // disabled={!changesToCommit.length} // uncomment when this func is implemented
          onClick={() => {
            dispatch(toggleCommitPanel(true));
          }}
          style={{ marginRight: doPad ? 35 : undefined }}
        >
          {isCommitPanelOpen ? "Finish in Commit Panel (Left)" : "Publish Node"}
        </PrimaryButton>
        <div className="px-4" style={{ marginRight: doPad ? 15 : undefined }}>
          <SwitchBar style={{ margin: "1rem 0 1rem 0", height: 28 }}>
            <SwitchButton
              isSelected={researchPanelTab === ResearchTabs.current}
              onClick={() => onSetResearchPanelTab(ResearchTabs.current)}
            >
              <p className="text-xs flex justify-center items-center h-full">
                Current
              </p>
            </SwitchButton>
            <SwitchButton
              isSelected={researchPanelTab === ResearchTabs.history}
              onClick={() => onSetResearchPanelTab(ResearchTabs.history)}
            >
              <p className="text-xs flex justify-center items-center h-full">
                History
              </p>
            </SwitchButton>
            <SwitchButton
              isSelected={researchPanelTab === ResearchTabs.source}
              onClick={() => onSetResearchPanelTab(ResearchTabs.source)}
            >
              <p className="text-xs flex justify-center items-center h-full">
                Source
              </p>
            </SwitchButton>
          </SwitchBar>
        </div>

        <PerfectScrollbar className="overflow-auto">
          {!publicView && researchPanelTab === ResearchTabs.current ? (
            <NodeDrive
              className={`mb-4 ${doPad ? "w-[calc(100%-16px)]" : "w-full"}`}
            />
          ) : null}
          <div className={`pl-4 ${doPad ? "pr-8" : "pr-4"}`}>
            {researchPanelTab === ResearchTabs.current ? (
              <>
                <ManuscriptAttributesSection />
                {/* <ManuscriptValidationSection /> */}
                <ManuscriptComponentsSection />
              </>
            ) : null}
            {researchPanelTab === ResearchTabs.history ? <HistoryTab /> : null}
            {researchPanelTab === ResearchTabs.source ? <SourceTab /> : null}
            {isAdmin ? (
              <>
                <div
                  className="text-xs text-gray-500 cursor-pointer text-right fixed bottom-1 right-4 z-0 w-20"
                  onClick={() => setShowManifest(!showManifest)}
                >
                  debug
                </div>
                {showManifest ? (
                  <div className="relative">
                    <span className="text-[9px]">
                      tokenId: {convertUUIDToHex(currentObjectId!)}
                    </span>
                    <textarea
                      className="text-black text-xs"
                      onChange={(e: any) =>
                        setTempManifestData(JSON.parse(e.target.value))
                      }
                    >
                      {JSON.stringify(tempManifestData)}
                    </textarea>
                    <button
                      onClick={async () => {
                        await saveManifest(tempManifestData!);
                        setShowManifest(false);
                      }}
                    >
                      save
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </PerfectScrollbar>
      </ContentWrapper>
    </ManuscriptSidePanelContainer>
  );
};

export default ManuscriptSidePanel;
