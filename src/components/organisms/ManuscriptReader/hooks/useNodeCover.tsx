import { useNodesMediaCoverQuery } from "@src/state/api/media";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import useNodeHistory from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/History/useNodeHistory";
import { useEffect } from "react";
import { nodesApi } from "@src/state/api/nodes";
import { tags } from "@src/state/api/tags";
import { useLoaderData } from "react-router-dom";
import { manuscriptLoader } from "@src/components/screens/Nodes";

export default function useNodeCover() {
  const parsedManuscript = useLoaderData() as Awaited<
    ReturnType<typeof manuscriptLoader>
  >;
  const { currentObjectId } = useNodeReader();
  const { selectedHistoryId } = useHistoryReader();
  const { loadingChain, history } = useNodeHistory();

  const version =
    "version" in parsedManuscript
      ? parsedManuscript.version
      : loadingChain
      ? ""
      : history.length
      ? `v${history.length}`
      : "0";

  const { isLoading, data, isSuccess } = useNodesMediaCoverQuery(
    { cid: "", uuid: currentObjectId!, version },
    {
      skip: !currentObjectId,
    }
  );

  useEffect(() => {
    console.log("load --version", version);
    if (isLoading) return;
    nodesApi.util.invalidateTags([
      { type: tags.mediaCover, id: `${currentObjectId}/${version}` },
    ]);
  }, [currentObjectId, isLoading, selectedHistoryId, version]);

  return {
    cover: isSuccess ? data.url : "",
    isLoading,
  };
}
