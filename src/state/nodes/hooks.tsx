import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { PDF_PAGE_SPACING } from "@src/components/organisms/Paper/constants";
import { useGetter } from "@src/store/accessors";
import { useCallback, useMemo } from "react";
import { ManifestDataStatus } from "./viewer";

export const useNodeReader = () => {
  const state = useGetter((state) => state.nodes.nodeReader);
  return state;
};

export const usePdfReader = () => {
  const state = useGetter((state) => state.nodes.pdfViewer);
  return state;
};

export const usePageZoomedOffset = () => {
  const { zoom } = useGetter((state) => state.nodes.pdfViewer);
  const { pageMetadata } = useManuscriptController(["pageMetadata"]);

  return useCallback(
    (index: number) => {
      const totalSpacing = PDF_PAGE_SPACING * index;
      return (
        (pageMetadata[index].documentOffset - totalSpacing) * zoom +
        totalSpacing
      );
    },
    [pageMetadata, zoom]
  );
};

export const useManifestStatus = () => {
  const { manifestStatus } = useGetter((state) => state.nodes.nodeReader);

  return {
    isLoading: manifestStatus === ManifestDataStatus.Pending,
    isSuccess: manifestStatus === ManifestDataStatus.Fulfilled,
    isError: manifestStatus === ManifestDataStatus.Rejected,
  };
};

export const useNodeVersions = (uuid: string = "") => {
  const { publishMap } = useGetter((state) => state.nodes.nodeHistory);
  return useMemo(() => publishMap[uuid], [publishMap, uuid]);
};

export const useCurrentNodeVersion = () => {
  const { currentObjectId } = useGetter((state) => state.nodes.nodeReader);
  const { publishMap } = useGetter((state) => state.nodes.nodeHistory);
  return useMemo(
    () => publishMap[currentObjectId ?? ""],
    [publishMap, currentObjectId]
  );
};

export const useNodeVersionHistory = (uuid: string = "") => {
  const {
    histories,
    selectedHistory,
    selectedHistoryId,
    pendingCommits: commits,
  } = useGetter((state) => state.nodes.nodeHistory);

  console.log("history", selectedHistoryId, histories[uuid]);
  return useMemo(
    () => ({
      selectedHistory,
      selectedHistoryId,
      history: histories[uuid] ?? [],
      pendingCommits: commits,
      pendingHistory: commits[uuid] ?? [],
    }),
    [commits, histories, selectedHistory, selectedHistoryId, uuid]
  );
};
