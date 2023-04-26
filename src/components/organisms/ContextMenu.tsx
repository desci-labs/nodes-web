import React, { useRef } from "react";
import { useClickAway } from "react-use";

export interface ContextMenuOption {
  label: JSX.Element;
  icon?: JSX.Element;
  labelClass?: string;
  onClick: () => void;
  //   show: boolean
}

interface ContextMenuProps {
  items: ContextMenuOption[];
  close: () => void;
  className?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  close,
  className,
}) => {
  const containerRef = useRef<HTMLUListElement>(null);
  useClickAway(containerRef, close);

  return (
    <ul
      ref={containerRef}
      className={`bg-neutrals-gray-1 text-white absolute drop-shadow-xl first-of-type:rounded-t-md last-of-type:rounded-b-md ${className}`}
    >
      {items.map((item, idx) => {
        return (
          <li
            key={"ctx" + idx}
            className={`grid grid-cols-[20px_1fr] font-medium whitespace-nowrap gap-2 py-2 px-3 cursor-pointer hover:bg-neutrals-gray-2 first-of-type:rounded-t-md last-of-type:rounded-b-md ${item.labelClass}`}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
              close();
            }}
          >
            <div className="w-5 h-5 flex">{item.icon}</div>
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default ContextMenu;
