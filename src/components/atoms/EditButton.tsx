import { IconPenFancy } from "@icons";
import React from "react";

interface Props {
  onClick?: () => void;
}

const EditButton: React.FC<Props> = ({ onClick }) => {
  return (
    <div
      className="bg-black w-[28px] h-[28px] rounded-lg flex justify-center items-center hover:bg-neutrals-gray-2 cursor-pointer"
      onClick={onClick}
    >
      <IconPenFancy />
    </div>
  );
};

export default EditButton;
