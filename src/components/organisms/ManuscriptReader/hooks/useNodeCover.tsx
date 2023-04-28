import {
  PdfComponent,
  ResearchObjectComponentDocumentSubtype,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { useNodesMediaCoverQuery } from "@src/state/api/media";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import useNodeHistory from "@components/organisms/SidePanel/ManuscriptSidePanel/Tabs/History/useNodeHistory";
import { useEffect } from "react";
import { nodesApi } from "@src/state/api/nodes";
import { tags } from "@src/state/api/tags";

export default function useNodeCover() {
  const { manifest, currentObjectId } = useNodeReader();
  const { selectedHistoryId } = useHistoryReader();
  const { loadingChain, history } = useNodeHistory();

  const version = loadingChain
    ? selectedHistoryId
    : history.length
    ? `v${history.length}`
    : 0;

  const pdfs = manifest?.components.filter(
    (c) => c.type === ResearchObjectComponentType.PDF // component.subType should be used when available on model
  ) as PdfComponent[];
  const pdf = pdfs?.find(
    (doc) =>
      doc.subtype === ResearchObjectComponentDocumentSubtype.RESEARCH_ARTICLE
  );
  const { isLoading, data, isSuccess } = useNodesMediaCoverQuery(
    { cid: pdf?.payload?.url!, uuid: currentObjectId!, version },
    {
      skip: !currentObjectId,
    }
  );

  useEffect(() => {
    nodesApi.util.invalidateTags([
      { type: tags.mediaCover, id: `${currentObjectId}/${version}` },
    ]);
  }, [currentObjectId, version]);

  return {
    cover: isSuccess ? data.url : "",
    isLoading,
  };
}
