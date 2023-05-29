import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { showMetadataForComponent } from "@src/state/drive/driveSlice";
import { useNodeReader } from "@src/state/nodes/hooks";
import React from "react";
import { useDispatch } from "react-redux";
import { IconOrcidOutline } from "./Icons";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";

interface MetadataPreviewProps {
  isFair: boolean;
  component: ResearchObjectV1Component;
  text?: string;
  className?: string;
}

const MetadataPreview: React.FC<MetadataPreviewProps> = ({
  isFair,
  component,
  className,
  text = "FAIR",
}) => {
  const dispatch = useDispatch();
  const { mode } = useNodeReader();

  return (
    <button
      data-tip={mode === "editor" ? "Edit Metadata" : "View Metadata"}
      data-place={"bottom"}
      data-for={`fair_${component.id}`}
      className={`bg-neutrals-black select-none hover:bg-dark-gray w-8 h-7 flex justify-start items-start rounded-md ${className}`}
      onClick={(e: React.MouseEvent) => {
        dispatch(showMetadataForComponent(component));
        e.stopPropagation();
        postUserAction(
          AvailableUserActionLogTypes.btnComponentCardViewMetadata
        );
      }}
    >
      <div className="flex items-center justify-between">
        <div className="bg-black rounded-tl-md rounded-bl-md h-7 shrink-0 px-2 flex items-center justify-center">
          <IconOrcidOutline width={18} />
        </div>
        <div
          className={`my-0 px-1 pr-2 font-mono line-clamp-1  ${
            isFair ? "fairBoxLit text-tint-primary-hover" : "text-[#CCCCCC]"
          }`}
        >
          {text}
          {/* <span className="inline-block truncate line-clamp-1">{text}</span> */}
        </div>
      </div>
    </button>
  );
};

export default MetadataPreview;
