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
import { useNodeReader } from "@src/state/nodes/hooks";

export default function Explorer() {
  const dispatch = useSetter();
  const { researchPanelTab } = useNodeReader();

  const onSetResearchPanelTab = (tab: ResearchTabs) =>
    dispatch(setResearchPanelTab(tab));

  return (
    <>
      <div className="px-4 text-white">
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
        <div className="px-4">
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
