import React from "react";

interface Props {
  disabled?: boolean;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: JSX.Element | string;
  dataTip?: string;
  dataPlace?: "top" | "bottom" | "left" | "right";
  dataFor?: string;
}

const BlackGenericButton = ({
  disabled = false,
  className,
  onClick,
  children,
  dataTip,
  dataPlace,
  dataFor,
}: Props) => {
  return (
    <button
      data-tip={dataTip}
      data-place={dataPlace || "bottom"}
      data-for={dataFor}
      className={`p-2 rounded-md cursor-pointer text-xs bg-black flex items-center justify-center gap-1.5 hover:bg-dark-gray 
      disabled:bg-opacity-25 disabled:cursor-not-allowed
      ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default BlackGenericButton;
