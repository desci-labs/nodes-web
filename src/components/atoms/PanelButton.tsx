import { HTMLAttributes, PropsWithChildren } from "react";

interface PanelButtonProps extends HTMLAttributes<HTMLButtonElement> {
  orientation?: "left" | "right";
}

const PanelButton = ({
  orientation,
  children,
  ...rest
}: PropsWithChildren<PanelButtonProps>) => {
  return (
    <button
      {...rest}
      className={`group text-white fixed top-[50px] ${
        orientation === "right" ? "right-[0px]" : "left-[0px]"
      }`}
    >
      {children}
    </button>
  );
};

export default PanelButton;
