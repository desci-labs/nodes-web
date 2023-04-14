import { ResearchNodeIcon } from "@src/components/Icons";
import { IconShare } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import useComponentDpid from "@components/organisms/Drive/hooks/useComponentDpid";

const BANNER_URL =
  "https://images.unsplash.com/photo-1679669693237-74d556d6b5ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2298&q=80";

export default function Header() {
  const { manifest } = useNodeReader();
  const { dpid } = useComponentDpid();

  const onHandleShare = async () => {
    try {
      await navigator.share({
        text: `Have a look at this Research Node published with DeSci Nodes. ${dpid}`,
        title: manifest?.title,
        url: dpid || window.location.href,
      });
    } catch (e) {
      console.log("Error: Unable to share", dpid, e);
    }
  };

  return (
    <div
      className="h-[27%] w-full p-2 mobile-reader-header relative flex items-end overflow-hidden shrink-0"
      style={{
        backgroundImage: `url(${BANNER_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        objectFit: "cover",
      }}
    >
      <IconShare
        width={30}
        color="white"
        className="absolute top-3 right-3"
        onClick={onHandleShare}
      />
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
