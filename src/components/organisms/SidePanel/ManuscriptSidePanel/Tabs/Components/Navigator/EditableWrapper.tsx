
import {
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import {
  IconDeleteForever,
  IconPen,
} from "icons";
import { useState } from "react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  deleteComponent,
  popFromComponentStack,
  saveManifestDraft,
} from "@src/state/nodes/viewer";
import ComponentRenamePopover from "@src/components/organisms/PopOver/ComponentRenamePopover";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

export default function EditableWrapper(props: any) {
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
      const index = manifestData.components.findIndex(
        (c: ResearchObjectV1Component) => c.id === id
      );
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
