import React, { useEffect } from "react";
import Paper from "@components/organisms/Paper";
import { useManuscriptController } from "./ManuscriptController";
import Youtube from "@components/atoms/Youtube";
import {
  ExternalLinkComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { __log, filterForNonData } from "@components/utils";

import tw from "tailwind-styled-components";
import PaneDrive from "@components/organisms/PaneDrive";
import ExternalLinkViewer from "@components/molecules/ExternalLinkViewer";
import { useNodeReader } from "@src/state/nodes/hooks";
import { isMobile } from "react-device-detect";

const RenderedDrive = () => (
  <div
    className={`${
      isMobile
        ? "w-full h-fit"
        : "pt-10 w-[calc(100%-320px)] h-[calc(100vh-56px)] bg-neutrals-black absolute left-0"
    }`}
  >
    <PaneDrive />
  </div>
);

export const ViewWrapper = tw.div`
relative
w-screen
flex-1
flex
justify-center
`;
const ComponentWrapper: any = tw.div`
w-fit
relative
${(p) => p.className}
`;

interface ComponentStackViewProps {}

const ComponentStackView = (props: ComponentStackViewProps) => {
  const { forceRefreshDrive, setForceRefreshDrive } = useManuscriptController([
    "forceRefreshDrive",
  ]);
  const { manifest: manifestData, componentStack } = useNodeReader();

  const renderComponent = (component: ResearchObjectV1Component) => {
    __log("ComponentStackView::renderComponent", component);
    switch (component.type) {
      case ResearchObjectComponentType.PDF:
        return <Paper {...component} />;
      case ResearchObjectComponentType.CODE:
        const Viewer = (props: any) => <></>;
        return <Viewer {...component} />;
      case ResearchObjectComponentType.LINK:
        return (
          <ExternalLinkViewer component={component as ExternalLinkComponent} />
        );
      case ResearchObjectComponentType.VIDEO:
        return (
          <Youtube
            {...component}
            embedId={component.payload.url.split("=")[1]}
          />
        );
      default:
        return <RenderedDrive />;
    }
  };

  useEffect(() => {
    if (forceRefreshDrive) setTimeout(() => setForceRefreshDrive(false));
  }, [forceRefreshDrive, setForceRefreshDrive]);

  return (
    <ViewWrapper>
      {/**
       * When no components, show the drive
       */}
      {!componentStack ||
      (componentStack.filter(filterForNonData).length < 1 &&
        !forceRefreshDrive &&
        manifestData) ? (
        <RenderedDrive />
      ) : (
        componentStack
          .filter(Boolean)
          .map((component: ResearchObjectV1Component, index: number) => {
            const isDataComponent =
              component.type === ResearchObjectComponentType.DATA ||
              component.type === ResearchObjectComponentType.DATA_BUCKET ||
              component.type === ResearchObjectComponentType.UNKNOWN;
            return (
              <ComponentWrapper
                key={`component_${component.id}`}
                style={{ zIndex: index }}
                className={isDataComponent ? "absolute left-0 w-full" : ""}
              >
                {renderComponent(component)}
              </ComponentWrapper>
            );
          })
      )}
    </ViewWrapper>
  );
};

export default React.memo(ComponentStackView);
