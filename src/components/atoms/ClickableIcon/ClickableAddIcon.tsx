import { IconAdd } from "@icons";

interface ClickableAddIconProps {
  onClick?: React.MouseEventHandler;
  className?: string;
}

const ClickableAddIcon = (props: ClickableAddIconProps) => {
  return (
    <div
      className={`p-[4px] m-[-4px] group ${props.className}`}
      onClick={props.onClick}
    >
      <div
        className={`border border-black dark:border-white group-hover:border-gray-500 group-hover:dark:border-gray-400 rounded-full p-1 cursor-pointer  stroke-black dark:stroke-white group-hover:stroke-gray-500 group-hover:dark:stroke-gray-400`}
      >
        <IconAdd width={10} height={10} strokeWidth={1} />
      </div>
    </div>
  );
};

export default ClickableAddIcon;
