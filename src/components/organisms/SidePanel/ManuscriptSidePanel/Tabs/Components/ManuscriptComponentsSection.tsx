import ClickableAddIcon from "@components/atoms/ClickableIcon/ClickableAddIcon";
import TooltipIcon from "@components/atoms/TooltipIcon";
import ComponentCard from "@components/molecules/ComponentCard";
import CollapsibleSection from "@components/organisms/CollapsibleSection";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { lockScroll } from "@components/utils";
import {
  ResearchObjectComponentType,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import { IconData, IconDeleteForever, IconInfo, IconPen } from "icons";
import React, { useState } from "react";
import ComponentRenamePopover from "@components/organisms/PopOver/ComponentRenamePopover";
// import useSaveManifest from "@src/hooks/useSaveManifest";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  deleteComponent,
  popFromComponentStack,
  saveManifestDraft,
} from "@src/state/nodes/viewer";

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

const EditableHOC = (props: any) => {
  const { children, isEditable, id } = props;
  const dispatch = useSetter();
  const { componentStack, manifest: manifestData } = useNodeReader();
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);

  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const doDelete = () => {
    // console.log(componentStack);
    if (componentStack[componentStack.length - 1]?.id === id) {
      dispatch(popFromComponentStack());
    }

    if (manifestData) {
      const index = manifestData.components.findIndex((c) => c.id === id);
      if (index > -1) {
        dispatch(deleteComponent({ componentId: id }));
        dispatch(saveManifestDraft({}));
      }
    }
  };

  return (
    <div className="flex flex-row">
      {/* <div
        className="relative flex justify-start items-center transition-all ease-out duration-200 overflow-hidden"
        style={{ width: isEditable ? 31 : 0, minWidth: isEditable ? 31 : 0 }}
      >
        <span className="absolute">
          <div
            className="flex justify-center items-center cursor-pointer rounded-full w-6 h-6 bg-gray-300 text-black dark:bg-[#191B1C] dark:text-white"
            onClick={() => {
              // pushToChangesToCommit(true);
            }}
          >
            <IconHamburger fill="white" width={10} />
          </div>
        </span>
      </div> */}
      {children}
      <div
        className="relative flex justify-end items-center transition-all ease-out duration-200 overflow-hidden"
        style={{ width: isEditable ? 31 : 0, minWidth: isEditable ? 31 : 0 }}
      >
        <span className="absolute flex flex-col gap-2">
          <div
            className="flex justify-center items-center cursor-pointer rounded-full w-6 h-6 bg-gray-300 text-black dark:bg-[#191B1C] dark:text-white"
            onClick={() => {
              setShowRenameModal(true);
            }}
          >
            <IconPen stroke="white" width={10} />
          </div>

          <div
            className="flex justify-center items-center cursor-pointer rounded-full w-6 h-6 bg-gray-300 text-black dark:bg-[#191B1C] dark:text-white"
            onClick={() => {
              setDialogs([
                ...dialogs,
                {
                  title: "Are you sure?",
                  message: "",
                  actions: ({ close }) => {
                    return (
                      <div className="flex gap-2 pt-4">
                        <button
                          className="text-md cursor-pointer rounded-md shadow-sm text-white bg-black px-3 py-1 hover:bg-neutrals-gray-2"
                          onClick={() => {
                            close();
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          className="text-md cursor-pointer rounded-md shadow-sm text-white bg-red-700 px-3 py-1 hover:bg-neutrals-gray-3"
                          onClick={() => {
                            doDelete();
                            close();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    );
                  },
                },
              ]);
            }}
          >
            <IconDeleteForever
              stroke="rgb(188,107,103)"
              strokeWidth={4}
              width={12}
            />
          </div>
        </span>
      </div>
      <ComponentRenamePopover
        isVisible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        componentId={id}
      />
    </div>
  );
};

const ManuscriptComponentsSection = () => {
  const { setIsAddingComponent } = useManuscriptController([
    "isAddingComponent",
  ]);
  const {
    mode,
    manifest: manifestData,
    componentStack,
    currentObjectId,
  } = useNodeReader();
  const [isEditable, setIsEditable] = useState<boolean>(false);

  /**
   * Hide component section if we don't have components
   */
  if (
    mode !== "editor" &&
    (!manifestData ||
      !manifestData.components ||
      !manifestData.components.length)
  ) {
    return null;
  }

  const hasDataComponent =
    manifestData &&
    manifestData.components.filter(
      (c) => c.type === ResearchObjectComponentType.DATA
    ).length;
  const components = manifestData && manifestData.components;
  let componentsWithOneData = components;
  if (hasDataComponent) {
    componentsWithOneData = components?.filter(
      (c) => c.type !== ResearchObjectComponentType.DATA
    );

    componentsWithOneData?.push({
      name: "Node Data",
      id: "__virtual_node_data",
      payload: {},
      type: ResearchObjectComponentType.DATA,
      icon: IconData,
    });
  }

  return (
    <>
      <CollapsibleSection
        forceExpand={mode === "editor"}
        startExpanded={true}
        title={
          <div className="flex w-full justify-between">
            <div className="flex items-end">
              <span>Components</span>
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
          {componentsWithOneData &&
            componentsWithOneData.map(
              (component: ResearchObjectV1Component, index: number) => (
                <EditableHOC
                  key={`editable_hoc_${currentObjectId}_${component.id}`}
                  id={component.id}
                  index={index}
                  isEditable={isEditable}
                >
                  <ComponentCard
                    component={component}
                    currentObjectId={currentObjectId!}
                    componentStack={componentStack}
                    manifestData={manifestData!}
                    mode={mode}
                  />
                </EditableHOC>
              )
            )}
        </div>
      </CollapsibleSection>
    </>
  );
};

export default ManuscriptComponentsSection;
