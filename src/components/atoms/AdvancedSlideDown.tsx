import { IconChevronDown, IconChevronUp } from "@src/icons";
import { PropsWithChildren } from "react";
import SlideDown from "react-slidedown";

type AdvancedSlideDownProps = {
  closed: boolean;
  className?: string;
  setClosed: (value: boolean) => void;
};
const AdvancedSlideDown = ({
  children,
  className,
  ...rest
}: PropsWithChildren<AdvancedSlideDownProps>) => {
  return (
    <>
      <div
        className={`flex flex-rows text-sm gap-2 items-center justify-start cursor-pointer group text-tint-primary font-bold hover:text-neutrals-gray-6 select-none overflow-hidden ${
          className ? className : ""
        }`}
        onClick={() => rest.setClosed(!rest.closed)}
      >
        {rest.closed ? "Hide" : "View"} Additional Information
        {rest.closed ? (
          <IconChevronUp
            width={12}
            className="fill-tint-primary group-hover:fill-neutrals-gray-6"
          />
        ) : (
          <IconChevronDown
            width={12}
            className="fill-tint-primary group-hover:fill-neutrals-gray-6"
          />
        )}
      </div>
      <SlideDown
        {...rest}
        closed={!rest.closed}
        className="!overflow-hidden transition-transform"
      >
        {children}
      </SlideDown>
    </>
  );
};

export default AdvancedSlideDown;
