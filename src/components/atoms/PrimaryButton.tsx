import { cn } from "@src/lib/utils";
import React, { ButtonHTMLAttributes } from "react";
import { SpinnerCircular } from "spinners-react";

// TODO: Change to ButtonPrimary (follow the naming convention of Base->Descriptor->Subdescriptor)

const PrimaryButton = ({
  isLoading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) => {
  return (
    <button
      {...props}
      className={cn(
        "select-none",
        props.disabled
          ? "bg-[#525659] text-[#C3C3C3] cursor-not-allowed"
          : "bg-tint-primary text-gray-900 hover:bg-tint-primary-dark cursor-pointer",
        "font-bold text-sm transition-colors rounded-lg py-2 px-4",
        props.className
      )}
    >
      {props.children}{" "}
      {isLoading && <SpinnerCircular color="white" size={20} />}
    </button>
  );
};

export default PrimaryButton;
