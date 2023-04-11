/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import styled from "styled-components";
import { FlexRow } from "@components/styled";
import { APPROXIMATED_HEADER_HEIGHT } from "@components/utils";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import LoadProgressManager from "@components/molecules/LoadProgressManager";
import CurrentPdfManager from "@components/atoms/CurrentPdfManager";
import useManuscriptReader from "./hooks/useManuscriptReader";
import useReaderEffects from "./hooks/useReaderEffects";
import Reader from "./Reader";
import Editor from "./Editor";
import PublicationDetailsModal from "@src/components/molecules/NodeVersionDetails/PublicationDetailsModal";
import { useNodeReader } from "@src/state/nodes/hooks";

const ManuscriptWrapper = styled(FlexRow)`
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
  console.log("Render manuscript reader");
  const { currentObjectId } = useNodeReader();
  const { isLoading } = useManuscriptReader(publicView);

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
      {publicView && <Reader isLoading={isLoading} />}
      {!publicView && <Editor isLoading={isLoading} />}
      <PublicationDetailsModal />
    </ManuscriptWrapper>
  );
};

export default React.memo(ManuscriptReader);
