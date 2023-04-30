import PopOver from "@components/organisms/PopOver";
import { IconX } from "@icons";
import React, { FC, PropsWithChildren } from "react";

interface PopOverBasicProps {
  onClose: () => void;
  title: JSX.Element | string;
  isVisible: boolean;
  footer?: FC;
  styleOverride?: React.CSSProperties;
  bodyClassNames?: string;
}

const PopOverBasic = (props: PropsWithChildren<PopOverBasicProps>) => {
  return (
    <PopOver
      isVisible={props.isVisible}
      style={{
        color: "black",
        width: 600,
        margin: "3rem 0.75rem",
        overflow: "auto",
        ...props.styleOverride,
      }}
      containerStyle={{
        backgroundColor: "#3A3A3ABF",
      }}
      footer={props.footer || (() => <></>)}
      onClose={props.onClose}
      className="rounded-lg bg-zinc-100 dark:bg-zinc-900"
    >
      <div className="py-3 px-6">
        <div className="flex flex-row justify-between items-center">
          <div
            className="cursor-pointer p-5 -m-5 absolute right-5 top-5 stroke-black dark:stroke-white hover:stroke-muted-300 hover:dark:stroke-muted-300"
            onClick={props.onClose}
          >
            <IconX />
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">{props.title}</h1>
        <div
          className={`mt-2 mb-6 text-xs text-white min-h-[180px] h-full flex flex-col ${props.bodyClassNames}`}
        >
          {props.children}
        </div>
      </div>
    </PopOver>
  );
};

export default PopOverBasic;
