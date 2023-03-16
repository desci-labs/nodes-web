import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { PDF_PAGE_SPACING } from "@src/components/organisms/Paper/constants";
import { useGetter } from "@src/store/accessors";
import { useCallback } from "react";

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
