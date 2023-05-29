/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import styled from "styled-components";
import { APPROXIMATED_HEADER_HEIGHT, __log } from "@components/utils";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import LoadProgressManager from "@components/molecules/LoadProgressManager";
import CurrentPdfManager from "@components/atoms/CurrentPdfManager";
import useManuscriptReader from "./hooks/useManuscriptReader";
import useReaderEffects from "./hooks/useReaderEffects";
import Reader from "./Reader";
import Editor from "./Editor";
import PublicationDetailsModal from "@src/components/molecules/NodeVersionDetails/PublicationDetailsModal";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { setFileMetadataBeingEdited } from "@src/state/drive/driveSlice";
import DriveDatasetMetadataPopOver from "@src/components/molecules/DriveDatasetMetadataPopOver";
import { useSetter } from "@src/store/accessors";
import ComponentUseModal from "@src/components/molecules/ComponentUseModal";
import CitationPopover from "../PopOver/CitationPopover";

const ManuscriptWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  background-color: #525659;
  position: relative;
  padding-top: ${APPROXIMATED_HEADER_HEIGHT}px;
  height: calc(100vh);
  &::before {
    content: " ";
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: #525659;
    position: fixed;
  }
`;

interface ManuscriptReaderProps {
  publicView?: boolean;
}
const ManuscriptReader = ({ publicView }: ManuscriptReaderProps) => {
  const dispatch = useSetter();
  __log("Render manuscript reader", publicView);
  const { currentObjectId } = useNodeReader();
  const { fileMetadataBeingEdited, fileBeingUsed, fileBeingCited } = useDrive();
  const { isLoading, isError } = useManuscriptReader(publicView);

  // trigger Reader side effects
  useReaderEffects(publicView);

  useEffect(() => {
    /**
     * TODO: This shouldn't be too noisy
     * We can either track that a node was viewed here or on node click
     */
    const sendNodeViewedTracking = async () => {
      await postUserAction(
        AvailableUserActionLogTypes.viewedNode,
        JSON.stringify({ nodeId: currentObjectId })
      );
    };

    sendNodeViewedTracking();
  }, [currentObjectId]);

  return (
    <ManuscriptWrapper>
      <LoadProgressManager />
      <CurrentPdfManager />
      {publicView && <Reader isError={isError} isLoading={isLoading} />}
      {!publicView && <Editor isLoading={isLoading} />}
      <PublicationDetailsModal />

      {/*
       ** Metadata modals used throughout the app
       */}
      {fileMetadataBeingEdited &&
        [
          ResearchObjectComponentType.PDF,
          ResearchObjectComponentType.CODE,
          ResearchObjectComponentType.DATA,
        ].includes(
          fileMetadataBeingEdited.componentType as ResearchObjectComponentType
        ) && (
          <DriveDatasetMetadataPopOver
            isVisible={!!fileMetadataBeingEdited}
            onClose={() => {
              dispatch(setFileMetadataBeingEdited(null));
            }}
          />
        )}
      {fileBeingUsed && (
        <ComponentUseModal isOpen={true} file={fileBeingUsed} />
      )}
      {fileBeingCited && <CitationPopover isOpen={true} />}
    </ManuscriptWrapper>
  );
};

export default React.memo(ManuscriptReader);
