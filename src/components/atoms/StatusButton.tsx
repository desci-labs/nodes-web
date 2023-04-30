import React from "react";

export enum ButtonState {
  SUCCESS = "bg-state-success",
  PENDING = "bg-state-pending",
  ERROR = "bg-state-error",
}

interface Props {
  status: ButtonState;
  className?: string;
  children: JSX.Element | string;
  onClick?: () => void;
  disabled?: boolean;
}

const StatusButton = ({
  status,
  className,
  disabled,
  onClick,
  children,
}: Props) => {
  return (
    <button
      className={`p-2 rounded-md cursor-pointer text-xs bg-black flex items-center gap-1.5 hover:bg-dark-gray disabled:bg-opacity-25 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={`w-[8px] h-[8px] ${status} rounded-full font-bold`}></div>
      {children}
    </button>
  );
};

export default StatusButton;
