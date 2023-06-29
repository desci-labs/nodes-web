import axios from "axios";
import React, { useEffect, useState } from "react";
import styled, { StyledComponent } from "styled-components";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";

import {
  ExternalLinkComponent,
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { cleanupManifestUrl } from "@components/utils";
import ReactTooltip from "react-tooltip";
import { findTarget } from "@components/organisms/ComponentLibrary";
import { SessionStorageKeys } from "../driveUtils";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/nodeReader";
import { updatePdfPreferences } from "@src/state/nodes/pdf";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  navigateFetchThunk,
  navigateToDriveByPath,
} from "@src/state/drive/driveSlice";
// import { useDrive } from "@src/state/drive/hooks";

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

export interface MiniComponentCardProps extends SectionCardProps {
  component: ResearchObjectV1Component;
}

const iconFor = (
  component: ResearchObjectV1Component,
  primary: boolean | undefined
) => {
  const obj = findTarget(component.type);
  if (obj) {
    return obj.icon;
  }
  return null;
};

const MiniComponentCard = React.forwardRef(
  ({ component }: MiniComponentCardProps, orderRef: any) => {
    const dispatch = useSetter();
    const { componentStack, recentlyAddedComponent } = useNodeReader();
    // const { nodeTree } = useDrive();
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
            dispatch(
              navigateFetchThunk({ path: component.payload.path, driveKey: "" })
            );
            dispatch(setComponentStack([component]));
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      copyLinkUrl = (component as ExternalLinkComponent).payload.url;
    }

    const Icon = iconFor(component, false);

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
      </CardWrapper>
    );
  }
);

export default React.memo(MiniComponentCard);
