import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";

import AnnotationSwitcher from "@components/atoms/AnnotationSwitcher";
import {
  ExternalLinkComponent,
  PdfComponentPayload,
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { cleanupManifestUrl } from "@components/utils";
import TooltipIcon from "@components/atoms/TooltipIcon";
import { findTarget } from "@components/organisms/ComponentLibrary";
import ButtonFair from "@components/atoms/ButtonFair";
import { SessionStorageKeys } from "../driveUtils";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/nodeReader";
import { updatePdfPreferences } from "@src/state/nodes/pdf";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  navigateToDriveByPath,
  setFileBeingCited,
  setFileBeingUsed,
} from "@src/state/drive/driveSlice";
import { IconDrive, IconPlayRounded, IconQuotes } from "@src/icons";
import { findDriveByPath } from "@src/state/drive/utils";
import { useDrive } from "@src/state/drive/hooks";
import { AccessStatus } from "@components/organisms/Drive";
import { getLicenseShortName } from "@components/organisms/PopOver/ComponentMetadataPopover";
import TooltipButton from "../atoms/TooltipButton";

const CardWrapper: StyledComponent<
  "div",
  any,
  { isSelected?: boolean; isHalfSelected?: boolean; isRecentlyAdded?: boolean },
  never
> = styled.div.attrs(
  ({ isSelected, isHalfSelected, isRecentlyAdded }: any) => ({
    className: `cursor-pointer shadow-md ${
      isSelected || isHalfSelected
        ? "border-2 border-black dark:border-white"
        : "border-[1px] border-muted-300 dark:border-muted-500 hover:border-black hover:dark:border-gray-500"
    } ${isRecentlyAdded ? "animate-pulsatingGlow" : null}`,
  })
)`
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
  className: " bg-zinc-200 dark:bg-muted-900 border-muted-300 dark:border-teal",
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
}

const labelFor = (component: ResearchObjectV1Component): string => {
  const subtype =
    "subtype" in component
      ? (component["subtype"] as ResearchObjectComponentSubtypes)
      : undefined;
  const obj = findTarget(component.type, subtype);
  if (obj) {
    return obj.title;
  }
  return "--";
};

const iconFor = (
  component: ResearchObjectV1Component,
  primary: boolean | undefined
) => {
  const subtype =
    "subtype" in component
      ? (component["subtype"] as ResearchObjectComponentSubtypes)
      : undefined;
  const obj = findTarget(component.type, subtype);
  if (obj) {
    return obj.icon;
  }
  return null;
};

const ComponentCard = ({ component }: ComponentCardProps) => {
  const dispatch = useSetter();
  const { componentStack, recentlyAddedComponent, manifest } = useNodeReader();
  const { nodeTree } = useDrive();
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
    // ReactTooltip.rebuild();
  }, [component]);

  const isSelected =
    componentStack[componentStack?.length - 1]?.id === component.id;

  const sortedAnnotations = [
    ...((component.payload as PdfComponentPayload).annotations || []),
  ].sort((b, a) => (b.pageIndex! - a.pageIndex!) * 10 + (b.startY - a.startY));

  const drive = useMemo(() => {
    if (nodeTree && isSelected) {
      return findDriveByPath(nodeTree, component.payload.path);
    }
    return null;
  }, [component.payload.path, nodeTree, isSelected]);

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
        if (
          component.type === ResearchObjectComponentType.DATA ||
          component.type === ResearchObjectComponentType.UNKNOWN
        ) {
          sessionStorage.removeItem(SessionStorageKeys.lastDirUid);
          // dispatch(
          //   navigateToDriveByPath({
          //     path: DRIVE_NODE_ROOT_PATH + "/" + DRIVE_DATA_PATH,
          //   })
          // );
          dispatch(
            navigateToDriveByPath({
              path: component.payload.path,
              selectPath: component.payload.path,
            })
          );
          dispatch(setComponentStack([component]));
        } else {
          if (!isSelected) {
            dispatch(setComponentStack([component]));
          }
        }
        // if (component.type === ResearchObjectComponentType.UNKNOWN) {
        //   dispatch(setComponentTypeBeingAssignedTo(component.payload.path));
        // }
      }
    }, 50);
  };

  let copyLinkUrl = component.payload.url
    ? cleanupManifestUrl(component.payload.url)
    : "";

  if (component.type === ResearchObjectComponentType.LINK) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    copyLinkUrl = (component as ExternalLinkComponent).payload.url;
  }

  const Icon = iconFor(component, false);

  const canCite =
    drive?.accessStatus &&
    (drive.accessStatus === AccessStatus.PUBLIC ||
      drive.accessStatus === AccessStatus.PARTIAL);

  return (
    <CardWrapper
      isSelected={isSelected}
      isHalfSelected={clicked}
      isRecentlyAdded={
        recentlyAddedComponent === component.payload?.path ?? false
      }
      onClick={handleComponentClick}
    >
      <FlexColumn>
        <HeaderWrapper>
          <span className="text-xs font-bold truncate">{component.name}</span>
          <span className="flex flex-col items-center">
            <div className="border-tint-primary border-[2px] p-1 rounded-full scale-75 block -my-1">
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
                  icon={Icon ? <Icon /> : <></>}
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
          </span>
        </HeaderWrapper>
        <div
          style={{
            height: isSelected ? 45 : 0,
            overflow: "hidden",
            transition: "height 0.1s ease-in",
          }}
        >
          <FlexRowSpaceBetween>
            <div className="flex justify-between dark:bg-muted-700 px-3 py-2 w-full">
              <>
                <div className="flex gap-2 justify-between w-full">
                  <div id="section-left">
                    <ButtonFair
                      isFair={false}
                      component={component}
                      text={getLicenseShortName(
                        drive?.metadata.licenseType ||
                          component.payload?.licenseType ||
                          manifest?.defaultLicense
                      )} //Should only ever hit unknown for deprecated tree
                      classname="w-auto bg-black hover:bg-neutrals-gray-2 text-white px-2 font-medium text-xs h-7"
                    />
                  </div>
                  <div id="section-right" className="flex gap-2">
                    <TooltipButton
                      className="py-[7px] px-[1px] rounded-md cursor-pointer text-xs bg-black flex items-center justify-center gap-1.5 hover:bg-dark-gray disabled:bg-opacity-25 disabled:cursor-not-allowed"
                      disabled={false}
                      onClick={(e) => {
                        e!.stopPropagation();
                        dispatch(
                          navigateToDriveByPath({
                            path: component.payload.path,
                            selectPath: component.payload.path,
                          })
                        );
                        if (
                          component.type === ResearchObjectComponentType.DATA ||
                          component.type === ResearchObjectComponentType.UNKNOWN
                        ) {
                          dispatch(setComponentStack([component]));
                        } else {
                          dispatch(setComponentStack([]));
                        }
                      }}
                      tooltipContent={<>Show File Location</>}
                    >
                      <IconDrive className="p-0 min-w-[28px] scale-[1.2]" />
                    </TooltipButton>
                    <TooltipButton
                      tooltipContent={"Cite"}
                      side="top"
                      // dataFor={`cite_${component.id}`}
                      className="`p-2 rounded-md cursor-pointer text-xs bg-black flex items-center justify-center gap-1.5 hover:bg-dark-gray  disabled:bg-opacity-25 disabled:cursor-not-allowed w-7 h-7"
                      disabled={!canCite}
                      onClick={(e) => {
                        e!.stopPropagation();
                        dispatch(setFileBeingCited(drive));
                      }}
                    >
                      <IconQuotes />
                    </TooltipButton>
                    {[
                      ResearchObjectComponentType.DATA,
                      ResearchObjectComponentType.CODE,
                      ResearchObjectComponentType.UNKNOWN,
                    ].includes(component.type) ? (
                      <TooltipButton
                        tooltipContent={"Methods"}
                        // dataFor={`use_${component.id}`}
                        side="top"
                        disabled={!drive}
                        className="p-0 min-w-[28px] h-7 `p-2 rounded-md cursor-pointer text-xs bg-black flex items-center justify-center gap-1.5 hover:bg-dark-gray 
      disabled:bg-opacity-25 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e!.stopPropagation();
                          dispatch(setFileBeingUsed(drive));
                        }}
                      >
                        <IconPlayRounded className="p-0" />
                      </TooltipButton>
                    ) : null}
                    <div
                      style={{
                        display:
                          component.type === ResearchObjectComponentType.PDF
                            ? ""
                            : "none",
                      }}
                    >
                      <AnnotationSwitcher
                        annotations={sortedAnnotations}
                        handleComponentClick={handleComponentClick}
                      />
                    </div>
                  </div>
                </div>
              </>
            </div>
          </FlexRowSpaceBetween>
        </div>
      </FlexColumn>
    </CardWrapper>
  );
};

export default React.memo(ComponentCard);
