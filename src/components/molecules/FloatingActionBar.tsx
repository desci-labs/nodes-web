import TooltipIcon from "@components/atoms/TooltipIcon";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { lockScroll } from "@components/utils";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { IconAdd, IconAddComment, IconRemoveComment } from "@icons";
import * as React from "react";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setAnnotatingViaButton, setIsAnnotating } from "@src/state/nodes/pdf";

const FloatingActionBar = () => {
  const dispatch = useSetter();
  const { isEditingAnnotation, isAnnotating } = usePdfReader();
  const { mode, componentStack } = useNodeReader();
  const { setIsAddingComponent } = useManuscriptController([
    "isAddingComponent",
  ]);

  const AnnotationButton = () => {
    return (
      <IconAddComment
        height={24}
        width={24}
        fill="white"
        className={`group-hover:fill-[#28AAC4] transition ease duration-100`}
      />
    );
  };

  const AnnotationButtonClose = () => {
    return (
      <IconRemoveComment
        height={24}
        width={24}
        fill="#28AAC4"
        className={`group-hover:fill-[#94d0d6] transition ease duration-100`}
      />
    );
  };

  const SelectedAnnotationButton = () =>
    isAnnotating ? (
      <>
        <TooltipIcon
          id="annotation-button"
          key={"tooltip-annotation-click"}
          placement={"bottom"}
          tipClassName="w-96"
          offset={{ left: 0, top: 80 }}
          tooltip="Click or drag on the PDF. Click this X to stop annotating"
          icon={<AnnotationButtonClose />}
        />
      </>
    ) : (
      <>
        <TooltipIcon
          id="annotation-button"
          placement="bottom"
          tooltip="Add annotation (or hold ALT and drag)"
          key={"tooltip-annotation-add"}
          tipClassName="w-48"
          offset={{ left: 5, top: 80 }}
          icon={<AnnotationButton />}
        />
      </>
    );
  const children = [
    <TooltipIcon
      id="add-component-button"
      placement="bottom"
      tooltip="Add component"
      key={"tooltip-component-add"}
      tipClassName="w-36"
      offset={{ left: 10, top: 80 }}
      icon={
        <div
          className="bg-tint-primary hover:bg-tint-primary-dark cursor-pointer w-8 h-8 rounded-full flex items-center justify-center"
          onClick={() => {
            lockScroll();
            setIsAddingComponent(true);
          }}
        >
          <IconAdd width={18} height={18} stroke="black" />
        </div>
      }
    />,
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center group transition-transform bg-black cursor-pointer"
      onClick={() => {
        dispatch(setIsAnnotating(!isAnnotating));
        dispatch(setAnnotatingViaButton(true));
      }}
    >
      <SelectedAnnotationButton />
    </div>,
  ];

  const isCode =
    componentStack &&
    componentStack[componentStack.length - 1]?.type ===
      ResearchObjectComponentType.CODE;

  if (mode === "editor" && !isEditingAnnotation && !isCode) {
    return (
      <div className="fixed top-[50px] left-[-8px] z-0">
        <div className="rounded-full w-12 h-[105px] text-white fill-current bg-black m-8 flex items-center pt-2 drop-shadow-lg shadow-lg flex-col gap-5">
          {children}
        </div>
      </div>
    );
  }
  return null;
};

export default FloatingActionBar;
