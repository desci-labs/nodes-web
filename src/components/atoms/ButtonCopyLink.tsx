import { IconCopyLink } from "@icons";
import { useEffect, useState, useRef, PropsWithChildren } from "react";
import ReactTooltip from "react-tooltip";
import { Place } from "react-tooltip";

interface ButtonCopyLinkProps {
  text: string;
  invert?: boolean;
  size?: number;
  place?: Place;
}

const ButtonCopyLink = (props: PropsWithChildren<ButtonCopyLinkProps>) => {
  const placement = props.place || "bottom";
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
        } p-1.5 w-fit h-fit flex justify-center items-center rounded-lg`}
        onClick={handleClick}
        data-tip={isCopied ? "Copied" : "Copy Link"}
        data-place={placement}
        data-type="info"
        data-background-color="black"
      >
        {props.children ? (
          props.children
        ) : (
          <IconCopyLink
            fill={props.invert ? "black" : "white"}
            height={props.size || 16}
            width={props.size || 16}
          />
        )}
      </button>
    </span>
  );
};

export default ButtonCopyLink;
