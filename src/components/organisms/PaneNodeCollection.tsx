import PrimaryButton from "@components/atoms/PrimaryButton";
import NodeCard from "@components/molecules/NodeCard";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconNodeCollection } from "@icons";
import { useEffect, useState } from "react";
import { useEffectOnce } from "react-use";
import NodeCollectionEmptyState from "../atoms/NodeCollectionEmptyState";
import NodeCardLoader from "../molecules/NodeCardLoader";
import { useGetter, useSetter } from "@src/store/accessors";
import { nodesApi, useGetNodesQuery } from "@src/state/api/nodes";
import { toggleToolbar } from "@src/state/preferences/preferencesSlice";
import AddResearchNode from "@src/components/organisms/Modals/AddResearchNode/AddResearchNode";
import { useNodeReader } from "@src/state/nodes/hooks";
import {
  setCurrentObjectId,
  setPublicView,
  toggleResearchPanel,
} from "@src/state/nodes/viewer";
import { tags } from "@src/state/api/tags";
import { api } from "@src/state/api";

export interface EditNodeInfo {
  uuid: string;
  title: string;
  licenseType: any;
}

export default function PaneNodeCollection() {
  const {
    setIsAddingComponent,
    setIsAddingSubcomponent,
    showAddNewNode,
    setShowAddNewNode,
  } = useManuscriptController(["showAddNewNode"]);

  const dispatch = useSetter();
  const { isNew, currentObjectId } = useNodeReader();

  const { isToolbarVisible } = useGetter((state) => state.preferences);
  const [, setMounted] = useState(false);

  const { data: nodes, isLoading } = useGetNodesQuery();
  const [, setShowModal] = useState<boolean>(false);

  const onClose = (dontHideToolbar?: boolean) => {
    if (!dontHideToolbar) {
      dispatch(toggleToolbar(false));
    }
  };

  useEffectOnce(() => {
    setMounted(true);
  });

  /**
   * Refresh node list when we view this screen
   */
  useEffect(() => {
    // dispatch(nodesApi.util.invalidateTags([{ type: tags.nodes }]));
  }, [dispatch, isToolbarVisible]);

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      if (!currentObjectId) {
        dispatch(setCurrentObjectId(nodes[0]?.uuid));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, nodes]);

  const NodeCollectionView = () => (
    <div className="max-w-2xl w-full self-center flex flex-col gap-6 pb-10">
      {nodes &&
        nodes?.map((node) => (
          <NodeCard
            {...node}
            key={`node-card-sidepanel-${node.uuid}`}
            isCurrent={node.uuid === currentObjectId}
            onClick={() => {
              setTimeout(() => {
                setIsAddingComponent(false);
                setIsAddingSubcomponent(false);
                dispatch(toggleResearchPanel(true));
              });
              onClose();
            }}
          />
        ))}
    </div>
  );

  const NodeCollectionLoader = () => (
    <div className="max-w-2xl w-full self-center flex flex-col gap-6 pb-10 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7].map((i: number) => (
        <NodeCardLoader key={`node-card-sidepanel-loader-${i}`} />
      ))}
    </div>
  );

  const LoadedNodesCollection = () =>
    nodes?.length ? <NodeCollectionView /> : <NodeCollectionEmptyState />;

  return (
    <div
      className={`h-screen w-screen fixed left-0 pl-16 pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
    >
      <div className="flex flex-col pt-20 h-full overflow-y-scroll">
        <div className="flex mx-auto pb-5 border-b border-neutrals-gray-3 mb-5 max-w-2xl w-full justify-between items-center">
          <div className="flex gap-3 ">
            <IconNodeCollection width={42} height={42} />
            <div>
              <div className="text-white font-bold text-[21px] leading-[27px]">
                My Collection
              </div>
              <div className="text-neutrals-gray-5 text-sm">
                Below is a collection of your contributions
              </div>
            </div>
          </div>
          <PrimaryButton
            onClick={() => {
              dispatch(setPublicView(false));
              setShowAddNewNode(true);
            }}
            className="h-10 text-lg"
          >
            Create Research Node
          </PrimaryButton>
        </div>
        {isLoading ? <NodeCollectionLoader /> : <LoadedNodesCollection />}
        <AddResearchNode
          onRequestClose={() => {
            setShowModal(false);
            setShowAddNewNode(false);
          }}
          isVisible={showAddNewNode}
          toggleModal={setShowAddNewNode}
        />
      </div>
    </div>
  );
}
