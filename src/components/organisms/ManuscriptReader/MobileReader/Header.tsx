import { ResearchNodeIcon } from "@src/components/atoms/Icons";
import { IconShare } from "@src/icons";
import { useNodeReader } from "@src/state/nodes/hooks";
import useComponentDpid from "@components/organisms/Drive/hooks/useComponentDpid";
import useNodeCover from "@components/organisms/ManuscriptReader/hooks/useNodeCover";
import React, { CSSProperties, useCallback, useRef } from "react";
import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { Helmet } from "react-helmet";
import { animated, useSpring, config } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

const IPFS_URL = process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE;
const DEFAULT_URL =
  "http://d3ibh1pfr1vlpk.cloudfront.net/desci-nodes-preview.jpg";

const height = 320;

const bgStyles: (url: string) => CSSProperties = (cover: string) => ({
  backgroundImage: `linear-gradient(
  180deg,
          rgba(2, 0, 36, 0.015865721288515378) 0%,
          rgba(0, 0, 0, 0.8618040966386554) 100%
        ), url(${cover})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center top",
  backgroundSize: "cover",
});

export default function Header() {
  const { manifest } = useNodeReader();
  const { dpid } = useComponentDpid();
  const { cover } = useNodeCover();
  const headerRef = useRef<HTMLDivElement>();

  const [{ height: y }, api] = useSpring(() => ({ height: 320 }));

  const close = (velocity = 0) => {
    api.start({
      from: { height: y.get() },
      to: { height: 320 },
      immediate: false,
      config: {
        ...config.gentle,
        velocity,
        tension: 700,
        friction: 20,
        mass: 0.1,
      },
    });
  };

  const bind = useDrag(
    (state) => {
      const {
        last,
        velocity: [, vy],
        direction: [, dy],
        movement: [, my],
      } = state;
      if (dy < 0) return close(vy);
      // if user drags down passed a threshold, then we cancel the drag
      // so that the header resets to its open position
      if (y.get() > height * 1.2)
        api.start({
          from: { height: y.get() },
          to: { height: y.get() + my * 0.1 },
          immediate: true,
          config: { ...config.stiff, friction: 5, tension: 10 },
        });

      if (last) {
        close(vy);
      } else
        api.start({
          from: { height: y.get() },
          to: { height: y.get() + my * 0.05 },
          immediate: true,
          config: { ...config.stiff, velocity: vy, tension: 40 },
        });
    },
    {
      from: () => [height, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
    }
  );

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
        ...bgStyles(cover),
        height: y,
        touchAction: "none",
      }}
      ref={handleRef}
      onClick={onHandleClick}
      {...bind()}
    >
      <div className="absolute top-0 right-0 p-3" onClick={onHandleShare}>
        <IconShare width={30} color="white" />
      </div>
      <button className="px-4 flex gap-3 items-center text-left w-full">
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
