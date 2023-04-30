import { InformationCircleIcon } from "@heroicons/react/solid";
import { PropsWithChildren } from "react";

interface PaneInfoProps {
  icon?: React.FC;
}
const PaneInfo = ({ icon, children }: PropsWithChildren<PaneInfoProps>) => {
  return (
    <div className="rounded-md bg-transparent border-2 border-tint-primary text-tint-primary h-10 w-full flex flex-row items-center justify-center gap-1">
      {icon ? icon : <InformationCircleIcon width={16} />} {children}
    </div>
  );
};

export default PaneInfo;
