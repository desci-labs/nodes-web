import PrimaryButton from "@components/atoms/PrimaryButton";
import NodeCard from "@components/molecules/NodeCard";
import SidePanel from "@components/organisms/SidePanel";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { FlexColumn, FlexRowSpaceBetween } from "@components/styled";
import { lockScroll, restoreScroll } from "@components/utils";
import { useEffect, useRef, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useNavigate } from "react-router-dom";
import { useEffectOnce } from "react-use";
import styled from "styled-components";
import { app, site } from "@src/constants/routes";
import { useUser } from "@src/state/user/hooks";
import { useGetNodesQuery } from "@src/state/api/nodes";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setIsNew, setPublicView } from "@src/state/nodes/viewer";

const ManuscriptSidePanelContainer = styled(SidePanel).attrs({
  className: "bg-light-gray dark:bg-dark-gray text-black dark:text-white",
})`
  z-index: 101; // be above the modal
`;
const ContentWrapper = styled(FlexColumn)`
  position: relative;
  height: 100%;
`;
const ManuscriptHeader = styled(FlexRowSpaceBetween)`
  padding: 1rem 1.625rem;
  flex: unset;
  justify-content: center;
`;
const ManuscriptTitle = styled.p.attrs({
  className:
    "cursor-pointer transition-all duration-750 hover:text-zinc-200 select-none text-sm font-bold text-left w-full",
})``;

interface SidePanelNodeCollectionProps {
  onClose: () => void;
}

let lastUserEmail = "";
const SidePanelNodeCollection = (props: SidePanelNodeCollectionProps) => {
  const userProfile = useUser();
  const { publishMap, setPublishMap } = useManuscriptController(["publishMap"]);
  const { isNew } = useNodeReader();
  const dispatch = useSetter();

  const navigate = useNavigate();
  const { data: nodeCollection } = useGetNodesQuery();

  const [mounted, setMounted] = useState(false);
  // __log("<SidePanelNodeCollection>");
  // const SWR_KEY_COLLECTION = "getNodesForUser";
  // const { data: nodes, mutate } = useSWR(
  //   mounted ? SWR_KEY_COLLECTION : null,
  //   getNodesForUser
  // );

  useEffectOnce(() => {
    setMounted(true);
  });
  const scrollRef = useRef<HTMLDivElement | undefined>();
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.onmouseenter = () => {
        lockScroll();
      };
      scrollRef.current.onmouseleave = () => {
        restoreScroll();
      };
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.onmouseenter = null;
        scrollRef.current.onmouseleave = null;
      }
    };
  }, [scrollRef]);

  useEffect(() => {
    if (nodeCollection) {
      // setNodeCollection(nodes);
      /**
       * Update which nodes we know are published based on graph index
       */
      const publishedNodes = nodeCollection
        .filter((n: any) => n.isPublished)
        .map((n: any) => ({ uuid: n.uuid, index: n.index }));
      if (publishedNodes.length) {
        const newPublishMap = { ...publishMap };
        publishedNodes.forEach((n: any) => {
          newPublishMap[n.uuid] = n.index;
        });
        setPublishMap(newPublishMap);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, nodeCollection, publishMap]);

  useEffect(() => {
    // FIXME: can't get this to trigger
    if (mounted && lastUserEmail !== userProfile.email) {
      lastUserEmail = userProfile.email;
      // reset collection on logout
      // mutate(SWR_KEY_COLLECTION);
    }
  }, [userProfile, mounted]);

  if (!nodeCollection) {
    return <></>;
  }

  return (
    <ManuscriptSidePanelContainer orientation="left" isOpen={false} width={320}>
      {/* <PanelCloseButton
        panelOrientation={"left"}
        visible={false}
        // onClick={() => setIsCollectionOpen(false)}
      /> */}
      <ContentWrapper>
        <ManuscriptHeader>
          <ManuscriptTitle>My Collection</ManuscriptTitle>
          {/* <IconResearchObject /> */}
        </ManuscriptHeader>
        <PrimaryButton
          className={`opacity-100 mx-4 py-1 block transition-all duration-200 text-sm font-medium`}
          onClick={() => {
            setTimeout(() => dispatch(setIsNew(true)));
            dispatch(setPublicView(false));
            navigate(`${site.app}${app.nodes}`);
          }}
        >
          Create Research Node
        </PrimaryButton>
        {/* <PerfectScrollbar
          containerRef={(r) => {
            scrollRef.current = r;
            // debugger; didn't
            // r.style["overscrollBehavior"] = "none";
          }}
        >
          {nodeCollection.map((e) => (
            <NodeCard {...e} key={`node-card-sidepanel-${(e as any).uuid}`} />
          ))}
        </PerfectScrollbar> */}
      </ContentWrapper>
    </ManuscriptSidePanelContainer>
  );
};

export default SidePanelNodeCollection;
