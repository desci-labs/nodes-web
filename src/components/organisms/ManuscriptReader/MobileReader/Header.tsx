import { ResearchNodeIcon } from "@src/components/Icons";
import { IconShare } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import useComponentDpid from "@components/organisms/Drive/hooks/useComponentDpid";
import useNodeCover from "@components/organisms/ManuscriptReader/hooks/useNodeCover";
import React, { useCallback, useRef } from "react";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { Helmet } from "react-helmet";
import { useSpring } from "react-spring";
import { animated } from "@react-spring/web";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;
const DEFAULT_URL =
  "http://d3ibh1pfr1vlpk.cloudfront.net/desci-nodes-preview.jpg";

export default function Header() {
  const { manifest } = useNodeReader();
  const { dpid } = useComponentDpid();
  const { cover } = useNodeCover();
  const headerRef = useRef<HTMLDivElement>();
  const [height, api] = useSpring(() => ({
    from: { height: 0 },
    to: { height: 250 },
  }));
  const [expanded, setExpanded] = React.useState(false);

  const url = dpid || window.location.href;
  const description = `Have a look at this Research Node published with DeSci Nodes.\n${dpid}`;

  const onHandleShare = async () => {
    try {
      await navigator.share({
        text: description,
        title: manifest?.title,
        url: url,
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
    <animated.div
      className="min-h-[320px] w-full p-2 relative flex items-end overflow-hidden shrink-0"
      style={{
        height: expanded ? 500 : 250,
        backgroundImage: `linear-gradient(
          180deg,
          rgba(2, 0, 36, 0.015865721288515378) 0%,
          rgba(0, 0, 0, 0.8618040966386554) 100%
        ), url(${cover})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        objectFit: "cover",
        transition: "height 0.3s ease-in-out",
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
      <button
        className="px-4 flex gap-3 items-center text-left w-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setExpanded(!expanded);
        }}
        onBlur={() => {
          setExpanded(false);
        }}
      >
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
      </button>
      <Helmet>
        <title>{manifest?.title || "Research Node"}</title>
        {/* Default tags */}
        <meta name="description" content={description} />
        <meta itemProp="image" content={cover || DEFAULT_URL} />

        {/* Facebook tags */}
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={manifest?.title || "DeSci Nodes: Elevate your Research"}
        />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={cover || DEFAULT_URL} />
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={manifest?.title || "DeSci Nodes: Elevate your Research"}
        />
        <meta property="twitter:url" content={url} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={cover || DEFAULT_URL} />
      </Helmet>
    </animated.div>
  );
}
