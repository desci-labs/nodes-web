import React from "react";

interface Props {
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  children: JSX.Element | string;
}

const BlackGenericButton = ({
  disabled = false,
  className,
  onClick,
  children,
}: Props) => {
  return (
    <button
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
