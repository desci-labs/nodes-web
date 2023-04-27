import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";

import AnnotationSwitcher from "@components/atoms/AnnotationSwitcher";
import {
  ExternalLinkComponent,
  PdfComponentPayload,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { cleanupManifestUrl } from "@components/utils";
import ReactTooltip from "react-tooltip";
import { findTarget } from "@components/organisms/ComponentLibrary";
import ButtonFair from "@components/atoms/ButtonFair";
import { SessionStorageKeys } from "../driveUtils";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/viewer";
import { updatePdfPreferences } from "@src/state/nodes/pdf";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  navigateToDriveByPath,
  setFileBeingCited,
  setFileBeingUsed,
} from "@src/state/drive/driveSlice";
import BlackGenericButton from "../atoms/BlackGenericButton";
import { IconPlayRounded, IconQuotes } from "@src/icons";
import { findDriveByPath } from "@src/state/drive/utils";
import { useDrive } from "@src/state/drive/hooks";
import { AccessStatus } from "../organisms/Drive";
import { getLicenseShortName } from "../organisms/PopOver/ComponentMetadataPopover";
import type { Identifier, XYCoord } from "dnd-core";
import { useDrag, useDrop } from "react-dnd";

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
  id: any;
  component: ResearchObjectV1Component;
  index: number;
  moveCard?: (dragIndex: number, hoverIndex: number) => void;
}

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

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ComponentCard = React.forwardRef(
  ({ id, index, moveCard, component }: ComponentCardProps, orderRef: any) => {
    const dispatch = useSetter();
    // const { component } = props;
    const { componentStack, recentlyAddedComponent, manifest } =
      useNodeReader();
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
      ReactTooltip.rebuild();
    }, [component]);

    const isSelected =
      componentStack[componentStack?.length - 1]?.id === component.id;

    const sortedAnnotations = [
      ...((component.payload as PdfComponentPayload).annotations || []),
    ].sort(
      (b, a) => (b.pageIndex! - a.pageIndex!) * 10 + (b.startY - a.startY)
    );

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
            dispatch(navigateToDriveByPath(component.payload.path));
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

    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<
      DragItem,
      void,
      { handlerId: Identifier | null }
    >({
      accept: "card",
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover(item: DragItem, monitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY =
          (clientOffset as XYCoord).y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Time to actually perform the action
        moveCard?.(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: "card",
      item: () => {
        return { id, index };
      },
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
      <CardWrapper
        ref={ref}
        style={{ opacity, transform: "translateZ(0)" }}
        data-handler-id={handlerId}
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
                  className={` cursor-pointer rounded-full overflow-hidden border-black p-4 w-7 h-7 flex justify-center items-center`}
                  data-type={component.type}
                  data-subtype={(component as any).subtype}
                >
                  {Icon ? (
                    <button className="outline-none">
                      <Icon />
                    </button>
                  ) : (
                    <></>
                  )}
                </span>
              </div>
            </span>
          </HeaderWrapper>
        </FlexColumn>
        <div
          style={{
            height: isSelected ? 45 : 0,
            overflow: "hidden",
            transition: "height 0.1s ease-in",
            visibility: isSelected ? "visible" : "hidden",
          }}
        >
          <div className="flex justify-between dark:bg-muted-700 px-3 py-2 w-full">
            <div className="flex gap-2 justify-between items-center w-full">
              <div id="section-left">
                <ButtonFair
                  isFair={false}
                  component={component}
                  text={getLicenseShortName(
                    drive?.metadata.licenseType ||
                      component.payload?.licenseType ||
                      manifest?.defaultLicense
                  )} //Should only ever hit unknown for deprecated tree
                  classname="w-auto bg-neutrals-gray-2 px-2 font-medium text-xs h-7"
                />
              </div>
              <div id="section-right" className="flex gap-2">
                <BlackGenericButton
                  dataTip={"Cite"}
                  dataFor={`cite_${component.id}`}
                  className="w-7 h-7"
                  disabled={!canCite}
                  onClick={(e) => {
                    e!.stopPropagation();
                    dispatch(setFileBeingCited(drive));
                  }}
                >
                  <IconQuotes />
                </BlackGenericButton>
                {[
                  ResearchObjectComponentType.DATA,
                  ResearchObjectComponentType.CODE,
                  ResearchObjectComponentType.UNKNOWN,
                ].includes(component.type) ? (
                  <BlackGenericButton
                    dataTip={"Methods"}
                    dataFor={`use_${component.id}`}
                    disabled={!drive}
                    className="p-0 min-w-[28px] h-7"
                    onClick={(e) => {
                      e!.stopPropagation();
                      dispatch(setFileBeingUsed(drive));
                    }}
                  >
                    <IconPlayRounded className="p-0" />
                  </BlackGenericButton>
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
          </div>
        </div>
      </CardWrapper>
    );
  }
);

export default React.memo(ComponentCard);
