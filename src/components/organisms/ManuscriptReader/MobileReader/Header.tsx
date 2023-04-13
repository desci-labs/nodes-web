import { ResearchNodeIcon } from "@src/components/Icons";
import { IconShare } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";

export default function Header() {
  const { manifest } = useNodeReader();

  return (
    <div className="h-[27%] w-full p-2 mobile-reader-header relative flex items-end overflow-hidden shrink-0">
      <IconShare width={30} color="white" className="absolute top-3 right-3" />
      <div className="px-4 flex gap-3 items-center">
        <div className="shrink-0 w-fit">
          <ResearchNodeIcon width={40} className="" />
        </div>
        <div className="flex flex-col">
          <p className="text-tint-primary font-semibold text-md capitalize">
            Research Node
          </p>
          <span className="block text-sm font-bold w-full line-clamp-2 text-white leading-tight">
            {manifest?.title || ""}
          </span>
        </div>
      </div>
    </div>
  );
}
