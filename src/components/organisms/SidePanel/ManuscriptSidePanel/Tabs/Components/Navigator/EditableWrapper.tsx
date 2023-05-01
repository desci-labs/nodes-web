import { IconHamburger, IconPen, IconUnstar } from "icons";
import {
  ReactNode,
  forwardRef,
  useRef,
  useState,
} from "react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { popFromComponentStack } from "@src/state/nodes/nodeReader";
import ComponentRenamePopover from "@src/components/organisms/PopOver/ComponentRenamePopover";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { findDriveByPath } from "@src/components/driveUtils";
import { starComponentThunk } from "@src/state/drive/driveSlice";
import { useDrive } from "@src/state/drive/hooks";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import type { Identifier, XYCoord } from "dnd-core";
import { useDrag, useDrop } from "react-dnd";
import { animated } from "@react-spring/web";
import { useSpring, config } from "react-spring";

interface EditableWrapperProps {
  id: string;
  isEditable: boolean;
  component: ResearchObjectV1Component;
  index: number;
  children: ReactNode;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const EditableWrapper = forwardRef(
  (props: EditableWrapperProps, cardRef: any) => {
    const { children, isEditable, id, component, index, moveCard } = props;
    const dispatch = useSetter();
    const { nodeTree } = useDrive();
    const { componentStack } = useNodeReader();
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

    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId, offset }, drop] = useDrop<
      DragItem,
      void,
      { handlerId: Identifier | null; offset: XYCoord | null }
    >({
      accept: "card",
      collect(monitor) {
        // console.log("dropping", monitor);
        return {
          handlerId: monitor.getHandlerId(),
          offset: monitor.getClientOffset(),
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
      collect: (monitor: any) => {
        // console.log("dragging", monitor);
        return {
          isDragging: monitor.isDragging(),
        };
      },
    });

    drag(isEditable ? drop(ref) : null);

    console.log("drop offset ", handlerId, offset);

    const droppableStyles = useSpring({
      config: { ...config.gentle },
      from: {
        opacity: 0,
        transform: `translate3d(0px, ${index * 80}px, 0px) scale(1)`,
      },
      to: {
        opacity: isDragging ? 0 : 1,
        transform: `translate3d(0px, ${index * 80}px, 0px) scale(${
          isDragging ? 1.2 : 1
        })`,
      },
    });

    return (
      <animated.div
        className={`flex flex-row ${
          isEditable ? "absolute left-0 w-full" : ""
        }`}
        ref={ref}
        style={{
          ...(isEditable && {...droppableStyles}),
          background: isDragging ? "transparent" : "",
        }}
        data-handler-id={handlerId}
      >
        <div
          className="relative flex justify-start items-center transition-all ease-out duration-200 overflow-hidden"
          style={{ width: isEditable ? 31 : 0, minWidth: isEditable ? 31 : 0 }}
        >
          <span className="absolute">
            <button className="flex justify-center items-center cursor-pointer rounded-full w-6 h-6 bg-gray-300 text-black dark:bg-[#191B1C] dark:text-white">
              <IconHamburger fill="white" width={10} />
            </button>
          </span>
        </div>
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
        {isEditable && (
          <ComponentRenamePopover
            isVisible={showRenameModal}
            onClose={() => setShowRenameModal(false)}
            componentId={id}
          />
        )}
      </animated.div>
    );
  }
);

export default EditableWrapper;
