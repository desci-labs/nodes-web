import ButtonMysterious from "@src/components/atoms/ButtonMysterious";
import DropTargetFullScreen from "@src/components/atoms/DropTargetFullScreen";
import IndicatorSaving from "@src/components/atoms/IndicatorSaving";
import SavingIndicator from "@src/components/atoms/SavingIndicator";
import FloatingActionBar from "@src/components/molecules/FloatingActionBar";
import PopOverAlphaConsent from "@src/components/molecules/PopOverAlphaConsent";
import ComponentAdd from "@src/components/screens/ComponentAdd";
import { useGetter, useSetter } from "@src/store/accessors";
import { setHeaderHidden } from "@src/state/preferences/preferencesSlice";
import DragDropZone from "../DragDropZone";
import AddComponentPopOver from "../PopOver/AddComponentPopOver";
import CommitSidePanel from "../SidePanel/CommitSidePanel";
import ManuscriptSidePanel from "../SidePanel/ManuscriptSidePanel";
import UploadPanel from "../UploadPanel";
import VSCodeViewer from "../VSCodeViewer";
import ComponentStackView from "./ComponentStackView";
import { useManuscriptController } from "./ManuscriptController";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
import AssignTypePane from "../AssignTypePane";
import { useCallback } from "react";
import { filterForNonData } from "@src/components/utils";

interface ReaderViewerProps {
  isLoading: boolean;
}
export default function Editor({ isLoading }: ReaderViewerProps) {
  const dispatch = useSetter();
  const { publicView, isDraggingFiles, componentStack } = useNodeReader();
  const { componentTypeBeingAssignedTo } = useDrive();
  const { isToolbarVisible } = useGetter((state) => state.preferences);
  const { showUploadPanel } = useDrive();

  const {
    isAddingComponent,
    isAddingSubcomponent,
    setIsAddingSubcomponent,
    setIsAddingComponent,
  } = useManuscriptController([
    "scrollToPage$",
    "isAddingComponent",
    "isAddingSubcomponent",
  ]);

  return (
    <DragDropZone>
      {!isToolbarVisible && isDraggingFiles && !publicView ? (
        <DropTargetFullScreen />
      ) : null}
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
        onClose={useCallback(() => {
          dispatch(setHeaderHidden(true));
        }, [dispatch])}
      />
      <IndicatorSaving />
      <ButtonMysterious />
      <PopOverAlphaConsent />
      <SavingIndicator />
      <CommitSidePanel />
      <VSCodeViewer />
      {showUploadPanel && <UploadPanel show={showUploadPanel} />}
      {componentStack.filter(filterForNonData).length > 0 ? (
        <FloatingActionBar />
      ) : null}
      {(isAddingComponent || isAddingSubcomponent) && <ComponentAdd />}
      {componentTypeBeingAssignedTo && <AssignTypePane />}
    </DragDropZone>
  );
}
