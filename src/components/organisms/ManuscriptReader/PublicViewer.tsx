import ButtonMysterious from "@src/components/atoms/ButtonMysterious";
import FloatingActionBar from "@src/components/molecules/FloatingActionBar";
import { useSetter } from "@src/store/accessors";
import { setHeaderHidden } from "@src/state/preferences/preferencesSlice";
import { useEffect } from "react";
import CitationPopover from "../PopOver/CitationPopover";
import ManuscriptSidePanel from "../SidePanel/ManuscriptSidePanel";
import Toolbar from "../Toolbar";
import VSCodeViewer from "../VSCodeViewer";
import ComponentStackView from "./ComponentStackView";
import Placeholder from "./Placeholder";
import { useNodeReader } from "@src/state/nodes/hooks";
import { setPublicView, toggleResearchPanel } from "@src/state/nodes/viewer";

interface ReaderViewerProps {
  isLoading: boolean;
}
export default function PublicViewer({ isLoading }: ReaderViewerProps) {
  const dispatch = useSetter();
  const { manifest: manifestData, componentStack } = useNodeReader();

  useEffect(() => {
    // setPublicView(true);
    // setIsResearchPanelOpen(false);
    dispatch(setPublicView(true));
    dispatch(toggleResearchPanel(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading && <Placeholder isLoading />}
      {!isLoading && !manifestData ? <Placeholder isLoading={false} /> : ""}
      {!isLoading && manifestData ? (
        <>
          <ComponentStackView />
          <Toolbar />
          <CitationPopover isOpen={true} />
          {!isLoading && !!manifestData && (
            <ManuscriptSidePanel
              onClose={() => {
                dispatch(setHeaderHidden(true));
              }}
            />
          )}
          {!isLoading && <ButtonMysterious />}
          {componentStack.length > 0 ? <FloatingActionBar /> : null}
          <VSCodeViewer />
        </>
      ) : (
        ""
      )}
    </>
  );
}
