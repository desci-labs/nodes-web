import { IconCopyLink } from "@icons";
import { useEffect, useState, useRef } from "react";
import ReactTooltip from "react-tooltip";

interface ButtonCopyLinkProps {
  text: string;
  invert?: boolean;
  size?: number;
}

const ButtonCopyLink = (props: ButtonCopyLinkProps) => {
  const { text } = props;
  const [isCopied, setIsCopied] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  const handleClick = (e: React.MouseEvent) => {
    setIsCopied(true);
    navigator.clipboard.writeText(text);
    ReactTooltip.hide();

    setTimeout(() => {
      ReactTooltip.rebuild();
      ReactTooltip.show(ref.current!);
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    e.stopPropagation();
  };

  return (
    <span className="relative">
      <button
        ref={ref}
        className={`${
          props.invert
            ? "bg-transparent hover:bg-neutrals-gray-7 active:bg-black text-black"
            : "bg-black hover:bg-neutrals-gray-3 active:bg-black text-white"
        } w-7 h-7 flex justify-center items-center rounded-lg`}
        onClick={handleClick}
        data-tip={isCopied ? "Copied" : "Copy Link"}
        data-place="bottom"
        data-type="info"
        data-background-color="black"
      >
        <IconCopyLink
          fill={props.invert ? "black" : "white"}
          height={props.size || 16}
          width={props.size || 16}
        />
      </button>
    </span>
  );
};

export default ButtonCopyLink;
