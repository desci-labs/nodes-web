import ButtonMysterious from "@src/components/atoms/ButtonMysterious";
import DropTargetFullScreen from "@src/components/atoms/DropTargetFullScreen";
import IndicatorSaving from "@src/components/atoms/IndicatorSaving";
import SavingIndicator from "@src/components/atoms/SavingIndicator";
import DialogViewer from "@src/components/molecules/DialogViewer";
import FloatingActionBar from "@src/components/molecules/FloatingActionBar";
import PublicationDetailsModal from "@src/components/molecules/NodeVersionDetails/PublicationDetailsModal";
import PopOverAlphaConsent from "@src/components/molecules/PopOverAlphaConsent";
import ComponentAdd from "@src/components/screens/ComponentAdd";
import { useGetter, useSetter } from "@src/store/accessors";
import { setHeaderHidden } from "@src/state/preferences/preferencesSlice";
import DragDropZone from "../DragDropZone";
import AddComponentPopOver from "../PopOver/AddComponentPopOver";
import CitationPopover from "../PopOver/CitationPopover";
import CommitSidePanel from "../SidePanel/CommitSidePanel";
import ManuscriptSidePanel from "../SidePanel/ManuscriptSidePanel";
import UploadPanel from "../UploadPanel";
import VSCodeViewer from "../VSCodeViewer";
import ComponentStackView from "./ComponentStackView";
import { useManuscriptController } from "./ManuscriptController";
import { useNodeReader } from "@src/state/nodes/hooks";

interface ReaderViewerProps {
  isLoading: boolean;
}
export default function Editor({ isLoading }: ReaderViewerProps) {
  const dispatch = useSetter();
  const { isDraggingFiles, componentStack } = useNodeReader();
  const { isToolbarVisible } = useGetter((state) => state.preferences);

  const {
    isAddingComponent,
    isAddingSubcomponent,
    setIsAddingSubcomponent,
    setIsAddingComponent,
    showUploadPanel,
  } = useManuscriptController([
    "scrollToPage$",
    "isAddingComponent",
    "isAddingSubcomponent",
    "showUploadPanel",
  ]);


  return (
    <DragDropZone>
      {!isToolbarVisible && isDraggingFiles ? <DropTargetFullScreen /> : null}
      <AddComponentPopOver
        onDismiss={() => {
          setIsAddingSubcomponent(false);
          setIsAddingComponent(true);
        }}
        onClose={(force: boolean) => {
          setIsAddingSubcomponent(false);
          if (!force) {
            setIsAddingComponent(true);
          }
        }}
        isOpen={isAddingSubcomponent}
      />
      <ComponentStackView />

      <ManuscriptSidePanel
        onClose={() => {
          dispatch(setHeaderHidden(true));
        }}
      />

      <>
        <IndicatorSaving />
        <DialogViewer />

        <ButtonMysterious />
        {componentStack.length > 0 ? <FloatingActionBar /> : null}

        <PopOverAlphaConsent />

        <CitationPopover isOpen={true} />
        <PublicationDetailsModal />

        {(isAddingComponent || isAddingSubcomponent) && <ComponentAdd />}

        <SavingIndicator />
      </>
      <CommitSidePanel />
      <VSCodeViewer />
      {showUploadPanel && <UploadPanel show={showUploadPanel} />}
    </DragDropZone>
  );
}
