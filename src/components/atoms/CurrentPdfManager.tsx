import { cleanupManifestUrl } from "@components/utils";
import {
  PdfComponentPayload,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { useNodeReader, usePdfReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setCurrentPage, setCurrentPdf } from "@src/state/nodes/pdf";
import { useEffect } from "react";

const CurrentPdfManager = () => {
  const dispatch = useSetter();
  const { currentPdf } = usePdfReader();

  const { componentStack } = useNodeReader();
  /**
   * Ensure the PDF starts loading when a PDF component is selected
   */
  useEffect(() => {
    const selectedComponent =
      componentStack &&
      [...componentStack]
        .filter(Boolean)
        .reverse()
        .filter((a) => a.type === ResearchObjectComponentType.PDF)[0];
    // console.log("[selectedComponent]::", selectedComponent);

    if (selectedComponent) {
      let targetPdf = cleanupManifestUrl(
        (selectedComponent.payload as PdfComponentPayload).url
      );

      if (currentPdf !== targetPdf) {
        dispatch(setCurrentPdf(targetPdf));
        dispatch(setCurrentPage(1));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentStack, currentPdf]);
  return null;
};
export default CurrentPdfManager;
