import { IconChevronDown, IconChevronUp } from "@src/icons";
import { PropsWithChildren, useState } from "react";
import SlideDown from "react-slidedown";

const AdvancedSlideDown = ({ children, ...rest }: PropsWithChildren<any>) => {
  return (
    <>
      <div
        className="flex flex-rows text-xs gap-2 items-center justify-end cursor-pointer group hover:text-neutrals-gray-6 select-none overflow-hidden"
        onClick={() => rest.setClosed(!rest.closed)}
      >
        {rest.closed ? (
          <IconChevronUp
            width={12}
            className="fill-white group-hover:fill-neutrals-gray-6"
          />
        ) : (
          <IconChevronDown
            width={12}
            className="fill-white group-hover:fill-neutrals-gray-6"
          />
        )}{" "}
        Advanced
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
