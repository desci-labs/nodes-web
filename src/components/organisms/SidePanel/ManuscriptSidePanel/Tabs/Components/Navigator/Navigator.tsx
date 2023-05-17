import ClickableAddIcon from "@components/atoms/ClickableAddIcon";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { lockScroll } from "@components/utils";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { IconData, IconInfo, IconStar } from "icons";
import React, { useCallback, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useDrive } from "@src/state/drive/hooks";
import EditableWrapper from "./EditableWrapper";
import ComponentCard from "@src/components/molecules/ComponentCard";
import { useSetter } from "@src/store/accessors";
import {
  reorderComponent,
  saveManifestDraft,
} from "@src/state/nodes/nodeReader";
import MiniComponentCard from "@src/components/molecules/MiniComponentCard";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@src/components/atoms/tooltip";

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
  const {
    mode,
    manifest: manifestData,
    currentObjectId,
    componentStack,
  } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const { deprecated: deprecatedDrive } = useDrive();
  const dispatch = useSetter();

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
  }, [manifestData, deprecatedDrive, componentStack]);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (!cardComponents) return;
      const draggedComponent = cardComponents[dragIndex];
      const hoveredComponent = cardComponents[hoverIndex];
      const indexToMove = manifestData?.components.findIndex(
        (c) => c.id === draggedComponent.id
      );
      const indexToHover = manifestData?.components.findIndex(
        (c) => c.id === hoveredComponent.id
      );
      if (!(indexToMove !== undefined && indexToHover !== undefined)) return;
      dispatch(
        reorderComponent({ dragIndex: indexToMove, hoverIndex: indexToHover })
      );
    },
    [cardComponents, dispatch, manifestData?.components, componentStack]
  );

  const renderEditableComponents = useCallback(
    (components: ResearchObjectV1Component[]) => {
      return (
        <>
          {components.map(
            (component: ResearchObjectV1Component, index: number) => (
              <EditableWrapper
                key={`editable_hoc_${currentObjectId}_${component.id}_${isEditable}_${componentStack.length}`}
                id={component.id}
                index={index}
                isEditable={isEditable}
                component={component}
                moveCard={moveCard}
              >
                {isEditable ? (
                  <MiniComponentCard key={component.id} component={component} />
                ) : (
                  <ComponentCard component={component} />
                )}
              </EditableWrapper>
            )
          )}
        </>
      );
    },
    [currentObjectId, isEditable, moveCard, componentStack]
  );

  return (
    <>
      <CollapsibleSection
        forceExpand={mode === "editor"}
        startExpanded={true}
        title={
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-1">
              <span>Navigate</span>
              {mode === "editor" ? (
                <ClickableAddIcon
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    lockScroll();
                    setIsAddingComponent(true);
                  }}
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <IconInfo className="fill-black dark:fill-[white] w-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Documents, code, data, videos, etc</p>
                    <TooltipArrow height={5} />
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        }
        collapseIconComponent={() => {
          return mode === "editor" ? (
            <span
              className="text-xs text-tint-primary hover:text-tint-primary-hover cursor-pointer ml-1 mb-0.5 font-bold"
              onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.stopPropagation();
                if (isEditable) {
                  dispatch(saveManifestDraft({}));
                }
                setIsEditable(!isEditable);
              }}
            >
              {isEditable ? "Done" : "Edit"}
            </span>
          ) : null;
        }}
        className="mb-4"
      >
        <DndProvider backend={HTML5Backend}>
          <div
            className="flex flex-col gap-3 py-2 px-0"
            style={{
              ...(isEditable && {
                height: (cardComponents?.length || 1) * 80,
                position: "relative",
              }),
            }}
          >
            {cardComponents && cardComponents.length && (
              <>{renderEditableComponents(cardComponents)}</>
            )}
            {cardComponents?.length === 0 && (
              <div className="text-[10px] text-neutrals-gray-6 flex flex-row gap-1 items-center">
                <IconStar width={12} className="fill-tint-primary-hover" />
                Star a component in Drive to see it here
              </div>
            )}
          </div>
        </DndProvider>
      </CollapsibleSection>
    </>
  );
};

export default React.memo(Navigator);
