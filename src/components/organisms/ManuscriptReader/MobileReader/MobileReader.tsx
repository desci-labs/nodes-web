/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import styled from "styled-components";
import { FlexRow } from "@components/styled";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import useManuscriptReader from "@components/organisms/ManuscriptReader/hooks/useManuscriptReader";
import useReaderEffects from "@components/organisms/ManuscriptReader/hooks/useReaderEffects";
import { useNodeReader } from "@src/state/nodes/hooks";
import Header from "./Header";
import { setMobileView } from "@src/state/preferences/preferencesSlice";
import { useSetter } from "@src/store/accessors";
import { useAppPreferences } from "@src/state/preferences/hooks";
import Placeholder from "@components/organisms/ManuscriptReader/Placeholder";
import Explorer from "./Explorer";

const MobileWrapper = styled(FlexRow)`
  background-color: transparent;
  position: relative;
  height: calc(100vh);
  width: 100%;
  left: 0;
  top: 0;
  background-color: #1e1e1e;
  position: fixed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface ManuscriptReaderProps {
  publicView?: boolean;
}
const ManuscriptReader = ({ publicView }: ManuscriptReaderProps) => {
  console.log("Render manuscript reader");
  const dispatch = useSetter();
  const { currentObjectId } = useNodeReader();
  const { isLoading } = useManuscriptReader(publicView);
  const { isMobileView } = useAppPreferences();

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

  useEffect(() => {
    dispatch(setMobileView(true));

    return () => {
      dispatch(setMobileView(false));
    };
  }, [dispatch, isMobileView]);

  return (
    <MobileWrapper>
      <Header />
      {isLoading && <Placeholder isLoading={true} fullHeight />}
      <Explorer />
    </MobileWrapper>
  );
};

export default React.memo(ManuscriptReader);
