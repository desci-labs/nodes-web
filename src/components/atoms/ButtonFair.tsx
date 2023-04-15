import { ComponentCardProps } from "@components/molecules/ComponentCard";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { showMetadataForComponent } from "@src/state/drive/driveSlice";
import { useNodeReader } from "@src/state/nodes/hooks";
import React from "react";
import { useDispatch } from "react-redux";

interface FairBtnProps {
  isFair: boolean;
  component: ResearchObjectV1Component;
  text?: string;
  classname?: string;
}

const FairBtn: React.FC<FairBtnProps> = ({
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
      className={`bg-black select-none hover:bg-neutrals-gray-3 active:bg-black w-8 h-7 flex justify-center items-center rounded-lg ${classname}`}
      onClick={(e: React.MouseEvent) => {
        dispatch(showMetadataForComponent(component));
        e.stopPropagation();
      }}
    >
      <p
        className={`my-0 mx-1 ${
          isFair ? "fairBoxLit text-tint-primary-hover" : "text-[#CCCCCC]"
        }`}
      >
        {text}
      </p>
    </button>
  );
};

export default FairBtn;
