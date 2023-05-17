import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { showMetadataForComponent } from "@src/state/drive/driveSlice";
import { useNodeReader } from "@src/state/nodes/hooks";
import React from "react";
import { useDispatch } from "react-redux";
import { FlexRowSpaceBetween } from "../styled";
import { IconOrcidOutline } from "./Icons";

interface MetadataPreviewProps {
  isFair: boolean;
  component: ResearchObjectV1Component;
  text?: string;
  classname?: string;
}

const MetadataPreview: React.FC<MetadataPreviewProps> = ({
  isFair,
  component,
  classname,
  text = "FAIR",
}) => {
  const dispatch = useDispatch();
  const { mode } = useNodeReader();
  return (
    <button
      data-tip={mode === "editor" ? "Edit Metadata" : "View Metadata"}
      data-place={"bottom"}
      data-for={`fair_${component.id}`}
      className={`bg-neutrals-black select-none hover:bg-dark-gray w-8 h-7 flex justify-center items-center rounded-md ${classname}`}
      onClick={(e: React.MouseEvent) => {
        dispatch(showMetadataForComponent(component));
        e.stopPropagation();
      }}
    >
      <FlexRowSpaceBetween>
        <div className="bg-black rounded-tl-md rounded-bl-md h-7 shrink-0 px-2 flex items-center justify-center">
          <IconOrcidOutline width={18} />
        </div>
        <div
          className={`my-0 px-2 ${
            isFair ? "fairBoxLit text-tint-primary-hover" : "text-[#CCCCCC]"
          }`}
        >
          {text}
        </div>
      </FlexRowSpaceBetween>
    </button>
  );
};

export default MetadataPreview;
