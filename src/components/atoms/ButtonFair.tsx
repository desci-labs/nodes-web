import { ComponentCardProps } from "@components/molecules/ComponentCard";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import { showMetadataForComponent } from "@src/state/drive/driveSlice";
import React from "react";
import { useDispatch } from "react-redux";

interface FairBtnProps {
  isFair: boolean;
  mode: ComponentCardProps["mode"];
  component: ResearchObjectV1Component;
}

const FairBtn: React.FC<FairBtnProps> = ({ isFair, mode, component }) => {
  const dispatch = useDispatch();
  return (
    <button
      data-tip={mode === "editor" ? "Edit Metadata" : "View Metadata"}
      data-place={"bottom"}
      data-for={`fair_${component.id}`}
      className={`bg-black select-none hover:bg-neutrals-gray-3 active:bg-black w-8 h-7 flex justify-center items-center rounded-lg`}
      onClick={(e: React.MouseEvent) => {
        dispatch(showMetadataForComponent(component));
        e.stopPropagation();
      }}
    >
      <p
        className={`text-[10px] my-0 mx-1 ${
          isFair ? "fairBoxLit text-tint-primary-hover" : "text-[#CCCCCC]"
        }`}
      >
        FAIR
      </p>
    </button>
  );
};

export default FairBtn;
