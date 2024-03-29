import PerfectScrollbar from "react-perfect-scrollbar";
import { ResearchTabs, setResearchPanelTab } from "@src/state/nodes/nodeReader";
import { SwitchBar, SwitchButton } from "@src/components/atoms/SwitchBar";
import { useSetter } from "@src/store/accessors";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import ComponentsPreview from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/Components/ComponentsPreview";
import HistoryPreview from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/History/Preview";
import CreditsPreview from "@src/components/organisms/SidePanel/ManuscriptSidePanel/Tabs/CreditTab/CreditsPreview";
import useNodeHistory from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/History/useNodeHistory";

export default function Explorer() {
  const dispatch = useSetter();
  const { researchPanelTab } = useNodeReader();
  const { selectedHistoryId } = useHistoryReader();
  const { history } = useNodeHistory();

  const onSetResearchPanelTab = (tab: ResearchTabs) =>
    dispatch(setResearchPanelTab(tab));

  const isPreviousHistory = selectedHistoryId
    ? history && Number(selectedHistoryId) < history.length - 1
    : false;

  return (
    <div className="w-full">
      {isPreviousHistory && (
        <div className="w-full py-2 flex items-center justify-center bg-tint-primary">
          <span className="text-sm">
            You're viewing a previous version of this node.
          </span>
        </div>
      )}
      <div className="px-4 text-white">
        <SwitchBar style={{ margin: "1rem 0 1rem 0", height: 35 }}>
          <SwitchButton
            isSelected={researchPanelTab === ResearchTabs.current}
            onClick={() => onSetResearchPanelTab(ResearchTabs.current)}
          >
            <p className="text-xs flex justify-center items-center h-full">
              Components
            </p>
          </SwitchButton>
          <SwitchButton
            isSelected={researchPanelTab === ResearchTabs.history}
            onClick={() => onSetResearchPanelTab(ResearchTabs.history)}
          >
            <p className="text-xs flex justify-center items-center h-full">
              Activity
            </p>
          </SwitchButton>
          <SwitchButton
            isSelected={researchPanelTab === ResearchTabs.credit}
            onClick={() => onSetResearchPanelTab(ResearchTabs.credit)}
          >
            <p className="text-xs flex justify-center items-center h-full">
              Credit
            </p>
          </SwitchButton>
        </SwitchBar>
      </div>

      <PerfectScrollbar className="overflow-auto text-white pb-4 w-full overflow-x-hidden">
        <div className="px-4">
          {researchPanelTab === ResearchTabs.current ? (
            <ComponentsPreview />
          ) : null}
          {researchPanelTab === ResearchTabs.history ? (
            <HistoryPreview />
          ) : null}
          {researchPanelTab === ResearchTabs.credit ? <CreditsPreview /> : null}
        </div>
      </PerfectScrollbar>
    </div>
  );
}
