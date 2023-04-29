import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { IconDeleteForever, IconPen, IconUnstar } from "icons";
import { forwardRef, useCallback, useState } from "react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  deleteComponent,
  popFromComponentStack,
  saveManifestDraft,
} from "@src/state/nodes/nodeReader";
import ComponentRenamePopover from "@src/components/organisms/PopOver/ComponentRenamePopover";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { findDriveByPath } from "@src/components/driveUtils";
import { starComponentThunk } from "@src/state/drive/driveSlice";
import { useDrive } from "@src/state/drive/hooks";

const EditableWrapper = forwardRef((props: any, cardRef: any) => {
  const { children, isEditable, id, component } = props;
  const dispatch = useSetter();
  const { nodeTree } = useDrive();
  const { componentStack, manifest: manifestData } = useNodeReader();
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);

  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const handleUnstar = () => {
    const file = findDriveByPath(nodeTree!, component?.payload?.path);
    if (file) {
      dispatch(starComponentThunk({ item: file }));
    }
    if (componentStack[componentStack.length - 1]?.id === id) {
      dispatch(popFromComponentStack());
    }
  };

  const handleRef = useCallback(
    (node: HTMLDivElement) => {
      if (cardRef && node) {
        cardRef.current = node;
      }
    },
    [cardRef]
  );

  return (
    <div className="flex flex-row" ref={handleRef} {...props}>
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
                  title: "Unstar Component",
                  message: "Are you sure you want to unstar this component?",
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
                          className="text-md cursor-pointer rounded-md shadow-sm text-white bg-primary px-3 py-1 hover:bg-tint-primary"
                          onClick={() => {
                            handleUnstar();
                            close();
                          }}
                        >
                          Unstar
                        </button>
                      </div>
                    );
                  },
                },
              ]);
            }}
          >
            <IconUnstar className="p-0 w-[14px] h-[14px]" />
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
});

export default EditableWrapper;
