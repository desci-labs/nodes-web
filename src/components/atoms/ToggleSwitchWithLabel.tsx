import { PropsWithChildren, ReactChildren, useCallback } from "react";
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
  const toggle = useCallback(
    (e: any) => {
      setEnabled(!isEnabled);
      e.preventDefault();
      e.stopPropagation();
    },
    [setEnabled, isEnabled]
  );
  return (
    <div
      onClick={toggle}
      className="text-xs select-none cursor-pointer text-white justify-end gap-2 flex items-center"
    >
      <div>{children}</div>
      <ToggleSwitch isEnabled={() => isEnabled} toggle={() => {}} />
    </div>
  );
};

export default ToggleSwitchWithLabel;
