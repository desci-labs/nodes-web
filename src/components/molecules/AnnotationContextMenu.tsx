import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { Menu, Transition } from "@headlessui/react";
import { IconEllipsis, IconThreeDotsHoriz } from "@icons";
import {
  PdfComponent,
  ResearchObjectComponentAnnotation,
} from "@desci-labs/desci-models";
import { Fragment } from "react";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import {
  deleteAnnotation,
  saveManifestDraft,
} from "@src/state/nodes/nodeReader";
import {
  setIsEditingAnnotation,
  updatePdfPreferences,
} from "@src/state/nodes/pdf";

interface MenuItem {
  label: string;
  onClick: (e: any) => void;
}

interface AnnotationContextMenuProps {
  annotation: ResearchObjectComponentAnnotation;
  darkMode?: boolean;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const AnnotationContextMenu = (props: AnnotationContextMenuProps) => {
  const dispatch = useSetter();
  const { isEditingAnnotation } = usePdfReader();
  const { manifest: manifestData, componentStack } = useNodeReader();
  const { dialogs, setDialogs } = useManuscriptController(["dialogs"]);

  const { darkMode } = props;

  const doDelete = () => {
    const selectedComponent = componentStack[componentStack.length - 1];
    const manifestDataCopy = Object.assign({}, manifestData);
    if (manifestDataCopy) {
      const index = manifestDataCopy.components.findIndex(
        (c) => c.id === selectedComponent.id
      );
      if (index > -1) {
        const annotations = (manifestDataCopy.components[index] as PdfComponent)
          .payload.annotations;
        if (annotations) {
          const annotationIndex = annotations.findIndex(
            (a) => a.id === props.annotation.id
          );
          if (annotationIndex > -1) {
            setTimeout(() => {
              dispatch(
                updatePdfPreferences({
                  selectedAnnotationId: "",
                  hoveredAnnotationId: "",
                  isEditingAnnotation: false,
                })
              );

              dispatch(
                deleteAnnotation({
                  componentIndex: index,
                  annotationId: props.annotation.id,
                })
              );

              dispatch(saveManifestDraft({}));
            });
          }
        }
      }
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Edit",
      onClick: () => {
        dispatch(setIsEditingAnnotation(true));
      },
    },
    //   {
    //     label: "Edit Highlight"
    // },
    // {
    //     label: "Redraw Highlight"
    // }
    {
      label: "Delete",
      onClick: () => {
        setDialogs([
          ...dialogs,
          {
            title: "Are you sure?",
            message: "",
            actions: ({ close }) => {
              return (
                <div className="flex gap-2 pt-4">
                  <button
                    className="text-md cursor-pointer rounded-md shadow-sm bg-black text-white px-3 py-1 hover:bg-neutrals-gray-2"
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
      },
    },
  ];

  /**
   * We are editing annotation so don't need to show "edit" in context menu
   */
  if (isEditingAnnotation) {
    delete menuItems[0];
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={
            isEditingAnnotation
              ? "focus:bg-gray-100 rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500"
              : `cursor-pointer ${
                  darkMode
                    ? "hover:bg-neutrals-gray-3 active:bg-black"
                    : "hover:bg-neutrals-gray-7"
                } w-7 h-7 flex justify-center items-center rounded-lg`
          }
          tabIndex={4}
        >
          <span className="sr-only">Open options</span>
          {isEditingAnnotation ? (
            <IconEllipsis />
          ) : (
            <IconThreeDotsHoriz width={16} fill="current" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="overflow-hidden origin-top-right absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-neutrals-gray-2 ring-1 ring-black ring-opacity-5 focus:outline-none -top-3">
          {menuItems.map((m) => (
            <Menu.Item key={m.label}>
              {({ active }) => (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    m.onClick && m.onClick(e);
                  }}
                  className={classNames(
                    active ? "bg-neutrals-gray-3" : "",
                    "block px-4 py-2 text-sm text-white"
                  )}
                >
                  {m.label}
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AnnotationContextMenu;
