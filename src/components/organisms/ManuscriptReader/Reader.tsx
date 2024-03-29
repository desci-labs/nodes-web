import ButtonMysterious from "@src/components/atoms/ButtonMysterious";
import FloatingActionBar from "@src/components/molecules/FloatingActionBar";
import { useSetter } from "@src/store/accessors";
import { setHeaderHidden } from "@src/state/preferences/preferencesSlice";
import { useCallback, useEffect } from "react";
import ManuscriptSidePanel from "@src/components/organisms/SidePanel/ManuscriptSidePanel";
import Toolbar from "@src/components/organisms/Toolbar";
import VSCodeViewer from "@src/components/organisms/VSCodeViewer";
import ComponentStackView from "@src/components/organisms/ManuscriptReader/ComponentStackView";
import Placeholder from "@src/components/organisms/ManuscriptReader/Placeholder";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  setPublicView,
  toggleResearchPanel,
} from "@src/state/nodes/nodeReader";

interface ReaderViewerProps {
  isLoading: boolean;
  isError: boolean;
}
export default function Reader({ isLoading, isError }: ReaderViewerProps) {
  const dispatch = useSetter();
  const { manifest: manifestData, componentStack } = useNodeReader();

  useEffect(() => {
    dispatch(setPublicView(true));
    dispatch(toggleResearchPanel(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    dispatch(setHeaderHidden(true));
  }, [dispatch]);

  return (
    <>
      {isLoading && <Placeholder isLoading />}
      {isError ? <Placeholder isError={isError} isLoading={false} /> : ""}
      {!isLoading && manifestData ? (
        <>
          <ComponentStackView />
          <Toolbar />
          {!isLoading && !!manifestData && (
            <ManuscriptSidePanel onClose={handleClose} />
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
