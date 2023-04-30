import * as React from "react";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { updatePendingAnnotations } from "@src/state/nodes/viewer";
import { ResearchObjectComponentAnnotation } from "@desci-labs/desci-models";

interface ManifestUpdaterProps {
  pendingAnnotations: ResearchObjectComponentAnnotation[];
  setPendingAnnotations: React.Dispatch<
    React.SetStateAction<ResearchObjectComponentAnnotation[]>
  >;
  componentId: string;
}

const ManifestUpdater = ({
  componentId,
  pendingAnnotations,
  setPendingAnnotations,
}: ManifestUpdaterProps) => {
  const dispatch = useSetter();
  const { manifest: manifestData, componentStack } = useNodeReader();

  React.useEffect(() => {
    if (manifestData) {
      const index = manifestData.components.findIndex(
        (c: any) => c.id === componentId
      );
      setPendingAnnotations(
        manifestData?.components[index]?.payload?.annotations ?? []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifestData, componentStack, componentId]);

  React.useEffect(() => {
    if (pendingAnnotations.length === 0) return;

    if (manifestData) {
      const index = manifestData.components.findIndex(
        (c: any) => c.id === componentId
      );
      if (
        manifestData.components[index]?.payload &&
        manifestData.components[index].payload?.annotations?.length !==
          pendingAnnotations.length
      ) {
        dispatch(
          updatePendingAnnotations({
            componentIndex: index,
            annotations: pendingAnnotations,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnnotations, componentId]);
  return null;
};

export default React.memo(ManifestUpdater);
