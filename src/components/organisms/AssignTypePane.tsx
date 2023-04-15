import * as React from "react";
import {
  COMPONENT_LIBRARY,
  SectionHeading,
  Title,
  UiComponentDefinition,
} from "@components/organisms/ComponentLibrary";
import { restoreScroll } from "@components/utils";
import { IconRemove } from "@icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  assignTypeThunk,
  setComponentTypeBeingAssignedTo,
} from "@src/state/drive/driveSlice";
import { useDrive } from "@src/state/drive/hooks";
import { findDriveByPath } from "@src/state/drive/utils";

const ComponentButton = ({
  title,
  icon,
  componentType,
  componentSubType,
}: UiComponentDefinition) => {
  const dispatch = useSetter();
  const { componentTypeBeingAssignedTo, nodeTree } = useDrive();
  return (
    <button
      className=""
      onClick={() => {
        const driveItem = findDriveByPath(
          nodeTree,
          componentTypeBeingAssignedTo
        );
        if (driveItem)
          dispatch(
            assignTypeThunk({
              type: componentType,
              ...(componentSubType && { subType: componentSubType }),
              item: driveItem,
            })
          );
      }}
    >
      <div className="h-[120px] w-[120px] bg-neutrals-gray-2 text-xs flex rounded-xl shadow-lg border border-[#3C3C3C] cursor-pointer hover:bg-neutrals-gray-3 flex-col items-center gap-3 text-center pt-[18.5px]">
        {icon}
        <h3 className="text-[12px] px-4">{title}</h3>
      </div>
    </button>
  );
};

const AssignTypePane = () => {
  const { currentObjectId } = useNodeReader();
  const dispatch = useSetter();

  /**
   * Allow user to hit escape to get out of the Add Component screen
   */
  React.useEffect(() => {
    window.onkeydown = (e) => {
      if (e.key === "Escape") {
        dispatch(setComponentTypeBeingAssignedTo(null));
        restoreScroll();
      }
    };
    return () => {
      window.onkeydown = null;
    };
  });

  return (
    <>
      {/** We use z-105 to place above My Collection + PopOverNewNode */}
      <div
        className={`fixed z-[101] select-none font-inter top-[55px] left-0 h-[calc(100vh-55px)] w-screen bg-neutrals-black text-white will-change-transform p-8 animate-scaleIn`}
      >
        <div className="w-[calc(100%-320px)]">
          <div
            className={`absolute left-6 rounded-full hover:bg-neutrals-gray-3 p-4 cursor-pointer z-10 ${
              currentObjectId ? "" : "hidden"
            }`}
            onClick={() => {
              dispatch(setComponentTypeBeingAssignedTo(null));
              restoreScroll();
            }}
          >
            <span className="stroke-[#212121] dark:stroke-white">
              <IconRemove />
            </span>
          </div>
          <div className="overflow-auto h-[calc(100vh-55px)] absolute top-0 pt-8 w-[calc(100%)] pr-8">
            <div className="flex flex-col max-w-2xl mx-auto pb-10">
              <Title
                text="Choose Component Type"
                description="For better usability of your Node please select a component type."
              />
              <SectionHeading title="What research component type is this file / folder?" />
              <div
                className="grid gap-8 mb-8 mt-2 justify-center content-start"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, 120px)",
                }}
              >
                {COMPONENT_LIBRARY.filter((c) => !c.doNotRender).map((c) => (
                  <ComponentButton
                    key={c.title}
                    icon={c.icon()}
                    title={c.title}
                    componentType={c.componentType}
                    componentSubType={c.componentSubType}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignTypePane;
