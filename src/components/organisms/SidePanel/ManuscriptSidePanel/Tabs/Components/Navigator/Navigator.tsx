import ClickableAddIcon from "@components/atoms/ClickableIcon/ClickableAddIcon";
import TooltipIcon from "@components/atoms/TooltipIcon";
// import ComponentCard from "@components/molecules/ComponentCard";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { lockScroll } from "@components/utils";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { IconData, IconInfo, IconStar } from "icons";
import React, { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import ComponentRenamePopover from "./PopOver/ComponentRenamePopover";
// import useSaveManifest from "@src/hooks/useSaveManifest";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
// import EditableWrapper from "./EditableWrapper";
import { Container } from "./Container";
import EditableWrapper from "./EditableWrapper";
import ComponentCard from "@src/components/molecules/ComponentCard";

export enum EditorHistoryType {
  ADD_ANNOTATION,
  REMOVE_ANNOTATION,
  UPDATE_ANNOTATION,
  ADD_COMPONENT,
  REMOVE_COMPONENT,
  UPDATE_COMPONENT,
}
export interface EditorHistory {
  action: EditorHistoryType;
  createdAt: Date;
  objectId: string;
}

const Navigator = () => {
  const { setIsAddingComponent } = useManuscriptController([
    "isAddingComponent",
  ]);
  const { mode, manifest: manifestData, currentObjectId } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const { deprecated: deprecatedDrive } = useDrive();

  /**
   * Hide component section if we don't have components
   */
  // if (
  //   mode !== "editor" &&
  //   (!manifestData ||
  //     !manifestData.components ||
  //     !manifestData.components.length)
  //     ) {
  //       return null;
  //     }

  const cardComponents = useMemo(() => {
    let components = manifestData && manifestData.components;
    const hasDataComponent = manifestData?.components.some(
      (c: ResearchObjectV1Component) =>
        c.type === ResearchObjectComponentType.DATA
    );
    if (deprecatedDrive) {
      if (hasDataComponent) {
        components = components?.filter(
          (c: ResearchObjectV1Component) =>
            c.type !== ResearchObjectComponentType.DATA
        );

        components?.push({
          name: "Node Data",
          id: "__virtual_node_data",
          payload: {},
          type: ResearchObjectComponentType.DATA,
          icon: IconData,
        });
      }
    } else {
      //Unopinionated drive
      components = components?.filter(
        (c: ResearchObjectV1Component) => c.starred
      );
    }
    return components;
  }, [manifestData, deprecatedDrive]);

  return (
    <>
      <CollapsibleSection
        forceExpand={mode === "editor"}
        startExpanded={true}
        title={
          <div className="flex w-full justify-between">
            <div className="flex items-end">
              <span>Navigate</span>
              {mode === "editor" ? (
                <span
                  className="text-xs text-tint-primary hover:text-tint-primary-hover cursor-pointer ml-1 mb-0.5 font-bold"
                  onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                    e.stopPropagation();
                    setIsEditable(!isEditable);
                  }}
                >
                  {isEditable ? "Done" : "Edit"}
                </span>
              ) : null}
            </div>
            {mode === "reader" ? (
              <TooltipIcon
                icon={<IconInfo className="fill-black dark:fill-[white]" />}
                id="manuscript-components"
                tooltip="Documents, code, data, videos, etc"
                placement={"left"}
                tooltipProps={{ "data-background-color": "black" }}
              />
            ) : null}
          </div>
        }
        collapseIconComponent={
          mode === "editor"
            ? () => {
                return (
                  <ClickableAddIcon
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.stopPropagation();
                      lockScroll();
                      setIsAddingComponent(true);
                    }}
                  />
                );
              }
            : undefined
        }
        className="mb-4"
      >
        <div className="flex flex-col gap-3 py-2 px-0">
          {isEditable &&
            cardComponents &&
            cardComponents.length &&
            cardComponents.map(
              (component: ResearchObjectV1Component, index: number) => (
                <EditableWrapper
                  key={`editable_hoc_${currentObjectId}_${component.id}`}
                  id={component.id}
                  index={index}
                  isEditable={isEditable}
                >
                  <ComponentCard component={component} />
                </EditableWrapper>
              )
            )}
          {cardComponents && cardComponents.length && !isEditable ? (
            <DndProvider backend={HTML5Backend}>
              <Container
                components={cardComponents}
                renderComponent={({
                  component,
                  index,
                  ref,
                  handlerId,
                  style,
                }) => (
                  <ComponentCard
                    ref={ref}
                    style={style}
                    data-handler-id={handlerId}
                    component={component}
                  />
                )}
              />
            </DndProvider>
          ) : (
            <></>
          )}
          {cardComponents?.length === 0 && (
            <div className="text-[10px] text-neutrals-gray-6 flex flex-row gap-1 items-center">
              <IconStar width={12} className="fill-tint-primary-hover" />
              Star a component in Drive to see it here
            </div>
          )}
        </div>
      </CollapsibleSection>
    </>
  );
};

export default React.memo(Navigator);
