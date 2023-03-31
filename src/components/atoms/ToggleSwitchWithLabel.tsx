import { PropsWithChildren, ReactChildren } from "react";
import ToggleSwitch from "./ToggleSwitch";

interface ToggleSwitchWithLabelProps {
  isEnabled: boolean;
  setEnabled: (isEnabled: boolean) => void;
}

const ToggleSwitchWithLabel = ({
  children,
  isEnabled,
  setEnabled,
}: ToggleSwitchWithLabelProps & PropsWithChildren<any>) => {
  const toggle = (e: any) => {
    setEnabled(true);
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      onClick={toggle}
      className="text-xs cursor-pointer text-white justify-around flex items-center"
    >
      <ToggleSwitch isEnabled={() => isEnabled} toggle={toggle} />
      <div>{children}</div>
    </div>
  );
};

export default ToggleSwitchWithLabel;
