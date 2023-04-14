import axios from "axios";
import React, { useEffect, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import ButtonCopyLink from "@components/atoms/ButtonCopyLink";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";

import AnnotationSwitcher from "@components/atoms/AnnotationSwitcher";
import {
  ExternalLinkComponent,
  PdfComponent,
  PdfComponentPayload,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { cleanupManifestUrl } from "@components/utils";
import ComponentMetadataPopover from "@components/organisms/PopOver/ComponentMetadataPopover";
import TooltipIcon from "@components/atoms/TooltipIcon";
import ReactTooltip from "react-tooltip";
import {
  COMPONENT_LIBRARY,
  EXTERNAL_COMPONENTS,
  UiComponentDefinition,
} from "@components/organisms/ComponentLibrary";
import ButtonFair from "@components/atoms/ButtonFair";
import { SessionStorageKeys } from "../driveUtils";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/viewer";
import { updatePdfPreferences } from "@src/state/nodes/pdf";

const CardWrapper: StyledComponent<
  "div",
  any,
  { isSelected?: boolean; isHalfSelected?: boolean },
  never
> = styled.div.attrs(({ isSelected, isHalfSelected }: any) => ({
  className: `cursor-pointer shadow-md ${
    isSelected || isHalfSelected
      ? "border-2 border-black dark:border-white"
      : "border-[1px] border-muted-300 dark:border-muted-500 hover:border-black hover:dark:border-gray-500"
  }`,
}))`
  width: 100%;
  margin: ${(props: { isSelected?: boolean; isHalfSelected?: boolean }) =>
    props.isSelected || props.isHalfSelected
      ? "0"
      : "1px"}; /** prevent layout shift when border size changes **/
  border-radius: 0.5rem;
  overflow: hidden;
  ${({ isHalfSelected }: any) =>
    isHalfSelected ? "border-color: #888 !important; " : ""}
`;
const HeaderWrapper = styled(FlexRowSpaceBetween).attrs({
  className:
    "border-b-[1px] bg-zinc-200 dark:bg-muted-900 border-muted-300 dark:border-teal",
})`
  align-items: flex-start;
  padding: 0.75rem;
`;

export interface SectionCardProps {
  isSelected?: boolean;
  headerLeft?: React.FC;
  headerRight?: React.FC;
  controllerLeft?: React.FC;
  controllerRight?: React.FC;
  icon?: React.CElement<any, any>;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export interface ComponentCardProps extends SectionCardProps {
  component: ResearchObjectV1Component;
  currentObjectId: string;
  componentStack: ResearchObjectV1Component[];
  mode: string;
  manifestData: ResearchObjectV1;
}

const findTarget = (
  component: ResearchObjectV1Component
): UiComponentDefinition | undefined => {
  const foundEntry = COMPONENT_LIBRARY.concat(EXTERNAL_COMPONENTS).find(
    (target) => {
      const matchesType = target.componentType === component.type;
      switch (target.componentType) {
        case ResearchObjectComponentType.PDF:
          const documentPayload = component as PdfComponent;
          return (
            matchesType && documentPayload.subtype === target.componentSubType
          );
        case ResearchObjectComponentType.LINK:
          const externalLinkPayload = component as ExternalLinkComponent;
          return (
            matchesType &&
            externalLinkPayload.subtype === target.componentSubType
          );
        default:
          return matchesType;
      }
    }
  );

  return foundEntry;
};

const labelFor = (component: ResearchObjectV1Component): string => {
  const obj = findTarget(component);
  if (obj) {
    return obj.title;
  }
  return "--";
};

const iconFor = (
  component: ResearchObjectV1Component,
  primary: boolean | undefined
) => {
  const obj = findTarget(component);
  if (obj) {
    return obj.icon;
  }
  return null;
};

const ComponentCard = (props: ComponentCardProps) => {
  const dispatch = useSetter();
  const { component, componentStack, mode, currentObjectId, manifestData } =
    props;
  const [showComponentMetadata, setShowComponentMetadata] =
    useState<boolean>(false);
  const { setDriveJumpDir } = useManuscriptController([]);
  /***
   * Use local click tracking for fast click response
   * */
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    // toggle off decently quickly
    if (clicked) {
      setTimeout(() => setClicked(false), 50);
    }
  }, [clicked]);

  /**
   * This checks if the component has an asset url in its payload and preloads it
   */
  useEffect(() => {
    // PRELOAD ASSET
    if (
      component &&
      component.payload.url &&
      component.type === ResearchObjectComponentType.PDF
    ) {
      setTimeout(() => {
        try {
          axios.get(cleanupManifestUrl(component.payload.url));
        } catch (err) {
          console.log("preload err", component.payload.url, err);
        }
      }, 1000);
    }
    ReactTooltip.rebuild();
  }, [component]);

  const isSelected =
    componentStack[componentStack.length - 1]?.id === component.id;

  const sortedAnnotations = [
    ...((component.payload as PdfComponentPayload).annotations || []),
  ].sort((b, a) => (b.pageIndex! - a.pageIndex!) * 10 + (b.startY - a.startY));

  const handleComponentClick = () => {
    setClicked(true);
    setTimeout(() => {
      if (component.type === "code") {
        const newStack = [
          ...componentStack.filter((a) => a.id !== component.id),
          component,
        ];
        dispatch(setComponentStack(newStack));
      } else {
        dispatch(
          updatePdfPreferences({
            isEditingAnnotation: false,
            selectedAnnotationId: "",
          })
        );
        if (component.type === ResearchObjectComponentType.DATA) {
          sessionStorage.removeItem(SessionStorageKeys.lastDirUid);
          setDriveJumpDir({ targetPath: "Data" });
          dispatch(setComponentStack([]));
        } else {
          if (!isSelected) {
            dispatch(setComponentStack([component]));
          }
        }
      }
    }, 50);
  };

  let copyLinkUrl = component.payload.url
    ? cleanupManifestUrl(component.payload.url)
    : "";

  if (component.type === ResearchObjectComponentType.LINK) {
    copyLinkUrl = (component as ExternalLinkComponent).payload.url;
  }

  return (
    <CardWrapper
      isSelected={isSelected}
      isHalfSelected={clicked}
      onClick={handleComponentClick}
    >
      <FlexColumn>
        <HeaderWrapper>
          <span className="text-xs font-bold">{component.name}</span>
          {/* {headerRight} */}
          <span className="flex flex-col items-center">
            <div className="border-white border-[1px] p-1 rounded-full scale-75 block -my-1">
              <span
                className={`
                cursor-pointer
                rounded-full
                overflow-hidden
                border-black
                p-4 w-7 h-7
                flex
                justify-center
                items-center
              `}
                data-type={component.type}
                data-subtype={(component as any).subtype}
              >
                <TooltipIcon
                  icon={<>{iconFor(component, false)}</>}
                  id={`icon_component_${component.id}`}
                  tooltip={labelFor(component)}
                  placement={"left"}
                  tooltipProps={{
                    "data-background-color": "black",
                    width: "240",
                  }}
                />
              </span>
            </div>

            <ReactTooltip
              backgroundColor="black"
              effect="solid"
              id={`fair_${component.id}`}
            />
          </span>
        </HeaderWrapper>
        <FlexRowSpaceBetween>
          <div className="flex justify-between dark:bg-muted-700 px-3 py-2 w-full">
            {component.type !== ResearchObjectComponentType.DATA ? (
              <>
                <AnnotationSwitcher
                  annotations={sortedAnnotations}
                  handleComponentClick={handleComponentClick}
                />
                <div className="flex gap-2">
                  <ButtonFair
                    isFair={
                      component.payload.licenseType &&
                      component.payload.description
                    }
                    mode={mode}
                    setShowComponentMetadata={setShowComponentMetadata}
                    componentId={component.id}
                  />
                  <ButtonCopyLink text={copyLinkUrl} />
                </div>
              </>
            ) : (
              <div
                className="text-[10px] text-neutrals-gray-4 text-right w-full"
                title="This component is pointing to a nested data structure"
              >
                DeSci Node Drive
              </div>
            )}
          </div>
        </FlexRowSpaceBetween>
      </FlexColumn>
      {/** If we keep this rendered everytime, it results in a performance problem when switching to "current" tab */}
      {showComponentMetadata &&
      component.type !== ResearchObjectComponentType.DATA ? (
        <ComponentMetadataPopover
          currentObjectId={currentObjectId}
          manifestData={manifestData}
          mode={mode}
          componentId={component.id}
          isVisible={showComponentMetadata}
          onClose={() => setShowComponentMetadata(false)}
        />
      ) : null}
    </CardWrapper>
  );
};

export default ComponentCard;
