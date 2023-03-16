import React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { Switch } from "@headlessui/react";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface SwitchProps {
  IconOff?: React.FC;
  IconOn?: React.FC;
  isEnabled: () => boolean;
  toggle: () => void;
  enabledBkgColorClass?: string; //tailwind e.g. 'bg-gray-700'
}
const ToggleSwitch = ({
  IconOff,
  IconOn,
  isEnabled,
  toggle,
  enabledBkgColorClass = "bg-gray-700",
}: SwitchProps) => {
  let enabled = isEnabled();

  return (
    <Switch
      checked={enabled}
      onChange={toggle}
      className={classNames(
        enabled ? enabledBkgColorClass : "bg-gray-400",
        "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none "
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          enabled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        )}
      >
        <span
          className={classNames(
            enabled
              ? "opacity-0 ease-out duration-100"
              : "opacity-100 ease-in duration-200",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          {IconOff && <IconOff />}
        </span>
        <span
          className={classNames(
            enabled
              ? "opacity-100 ease-in duration-200"
              : "opacity-0 ease-out duration-100",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          {IconOn && <IconOn />}
        </span>
      </span>
    </Switch>
  );
};

export default ToggleSwitch;
