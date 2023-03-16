import React from "react";

interface Props {
  text: string;
  icon?: JSX.Element;
  className?: string;
  onClick?: () => void;
}

const IconOutlineButton: React.FC<Props> = ({
  text,
  icon,
  className,
  onClick,
}) => {
  return (
    <div
      className={`text-white border border-white w-fit px-3 rounded-lg text-sm font-medium cursor-pointer flex items-center hover:bg-neutrals-gray-1 ${className}`}
      onClick={onClick}
    >
      {icon && (
        <div id="icon" className="pr-2">
          {icon}
        </div>
      )}
      <span className="py-1.5">{text}</span>
    </div>
  );
};

export default IconOutlineButton;
