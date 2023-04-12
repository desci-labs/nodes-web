import HistoryTab from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/HistoryTab";
import SourceTab from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/SourceTab";
import PerfectScrollbar from "react-perfect-scrollbar";
import ManuscriptComponentsSection from "@components/organisms/ManuscriptComponentsSection";
import { ResearchTabs, setResearchPanelTab } from "@src/state/nodes/viewer";
import {
  SwitchBar,
  SwitchButton,
} from "@src/components/atoms/SwitchBar/SwitchBar";
import { useSetter } from "@src/store/accessors";
import { useNodeReader, useNodeVersions } from "@src/state/nodes/hooks";
import { useUser } from "@src/state/user/hooks";
import { useState } from "react";

export default function Explorer() {
  const dispatch = useSetter();
  const {
    manifest: manifestData,
    publicView,
    isCommitPanelOpen,
    currentObjectId,
    isResearchPanelOpen,
    mode,
    researchPanelTab,
  } = useNodeReader();
  const nodeVersions = useNodeVersions(currentObjectId);

  const onSetResearchPanelTab = (tab: ResearchTabs) =>
    dispatch(setResearchPanelTab(tab));
  const [doPad] = useState(false);

  return (
    <>
      <div
        className="px-4 text-white"
        style={{ marginRight: doPad ? 15 : undefined }}
      >
        <SwitchBar style={{ margin: "1rem 0 1rem 0", height: 35 }}>
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

      <PerfectScrollbar className="overflow-auto text-white">
        <div className={`pl-4 ${doPad ? "pr-8" : "pr-4"}`}>
          {researchPanelTab === ResearchTabs.current ? (
            <ManuscriptComponentsSection />
          ) : null}
          {researchPanelTab === ResearchTabs.history ? <HistoryTab /> : null}
          {researchPanelTab === ResearchTabs.source ? <SourceTab /> : null}
        </div>
      </PerfectScrollbar>
    </>
  );
}
