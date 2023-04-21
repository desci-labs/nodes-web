import { ResearchNodeIcon } from "@src/components/Icons";
import { IconShare } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import useComponentDpid from "@components/organisms/Drive/hooks/useComponentDpid";
import useNodeCover from "@components/organisms/ManuscriptReader/hooks/useNodeCover";
import React, { useCallback, useRef } from "react";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;

export default function Header() {
  const { manifest } = useNodeReader();
  const { dpid } = useComponentDpid();
  const { cover } = useNodeCover();
  const headerRef = useRef<HTMLDivElement>();
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

  const onHandleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (headerRef.current === e.target) {
      const pdf = manifest?.components.find(
        (c) => c.type === ResearchObjectComponentType.PDF
      );
      pdf && window.open(`${IPFS_URL}/${pdf.payload.url}`, "_blank");
    }
  };

  const handleRef = useCallback((node: HTMLDivElement) => {
    headerRef.current = node;
  }, []);

  return (
    <div
      className="h-[30%] min-h-[250px] w-full p-2 relative flex items-end overflow-hidden shrink-0"
      style={{
        backgroundImage: `linear-gradient(
          180deg,
          rgba(2, 0, 36, 0.015865721288515378) 0%,
          rgba(0, 0, 0, 0.8618040966386554) 100%
        ), url(${cover})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        objectFit: "cover",
      }}
      ref={handleRef}
      onClick={onHandleClick}
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
