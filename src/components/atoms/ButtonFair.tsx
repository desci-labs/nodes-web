import { ComponentCardProps } from "@components/molecules/ComponentCard";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import React from "react";

interface FairBtnProps {
  isFair: boolean;
  mode: ComponentCardProps["mode"];
  componentId: ResearchObjectV1Component["id"];
  setShowComponentMetadata: React.Dispatch<React.SetStateAction<boolean>>;
}

const FairBtn: React.FC<FairBtnProps> = ({
  isFair,
  mode,
  componentId,
  setShowComponentMetadata,
}) => {
  return (
    <button
      data-tip={mode === "editor" ? "Edit Metadata" : "View Metadata"}
      data-place={"bottom"}
      data-for={`fair_${componentId}`}
      className={`bg-black select-none hover:bg-neutrals-gray-3 active:bg-black w-8 h-7 flex justify-center items-center rounded-lg`}
      onClick={(e: React.MouseEvent) => {
        setShowComponentMetadata(true);
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
