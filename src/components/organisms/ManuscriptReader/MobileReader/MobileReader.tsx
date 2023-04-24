/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import "react-pdf/dist/umd/Page/AnnotationLayer.css";
import styled from "styled-components";
import { AvailableUserActionLogTypes, postUserAction } from "@api/index";
import useManuscriptReader from "@components/organisms/ManuscriptReader/hooks/useManuscriptReader";
import useReaderEffects from "@components/organisms/ManuscriptReader/hooks/useReaderEffects";
import { useNodeReader } from "@src/state/nodes/hooks";
import Header from "@components/organisms/ManuscriptReader/MobileReader/Header";
import {
  setMobileView,
  setShowMobileWarning,
  setShowComponentStack,
} from "@src/state/preferences/preferencesSlice";
import { useSetter } from "@src/store/accessors";
import { useAppPreferences } from "@src/state/preferences/hooks";
import Placeholder from "@components/organisms/ManuscriptReader/Placeholder";
import Explorer from "@components/organisms/ManuscriptReader/MobileReader/Explorer";
import ComponentStackModal from "@components/organisms/ManuscriptReader/MobileReader/ComponentStackModal";
import { IconX } from "@src/icons";
import { FlexColumn } from "@components/styled";

const MobileWrapper = styled(FlexColumn)`
  background-color: transparent;
  height: 100vh;
  width: 100%;
  left: 0;
  top: 0;
  background-color: #1e1e1e;
  position: relative;
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
  const { isMobileView, showMobileComponentStack } = useAppPreferences();

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
    dispatch(setShowMobileWarning(true));

    return () => {
      dispatch(setMobileView(false));
    };
  }, [dispatch, isMobileView]);

  return (
    <MobileWrapper>
      <Header />
      {isLoading && <Placeholder isLoading={true} fullHeight />}
      <Explorer />
      {showMobileComponentStack && (
        <ComponentStackModal
          isOpen={true}
          onDismiss={() => dispatch(setShowComponentStack(false))}
        />
      )}
      <MobileWarning />
    </MobileWrapper>
  );
};

const MobileWarning = () => {
  const dispatch = useSetter();
  const { mobileViewWarning } = useAppPreferences();

  return (
    <div
      className={`absolute bottom-0 mb-5 w-full bg-transparent px-4 pb-4 animate-slideFromBottom h-30 ${
        !mobileViewWarning ? "hidden" : ""
      }`}
    >
      <div className="bg-black p-2 rounded-lg flex items-start justify-between">
        <span className="inline-block text-white text-[12px]">
          Publishing research objects helps make science richer and more
          reproducible. For the best experience, view on desktop.{" "}
          <a
            href="https://docs.desci.com/"
            target="_blank"
            rel="noreferrer"
            className="text-tint-primary"
          >
            Learn More
          </a>
        </span>
        <button
          className="cursor-pointer p-2 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
          onClick={() => dispatch(setShowMobileWarning(false))}
        >
          <IconX />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ManuscriptReader);
