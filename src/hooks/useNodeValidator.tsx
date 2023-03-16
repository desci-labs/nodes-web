import { useCallback, useMemo } from "react";
import validate from "@src/modules/componentMetadataValidator";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import useConnectedWallet from "./useConnectedWallet";
import { useNodeReader } from "@src/state/nodes/hooks";

const recursiveCheck = (obj: any): boolean => {
  for (let val of Object.values(obj)) {
    if (!val || (typeof val === "object" && !recursiveCheck(val))) {
      return false;
    }
  }
  return true;
};

export function useNodeValidator() {
  const { manifest: manifestData } = useNodeReader();
  const { wallet } = useConnectedWallet();

  const validateComponents = useCallback(
    (components: ResearchObjectV1Component[]) => {
      return components.reduce((obj: any, component: any) => {
        return {
          ...obj,
          [component.id]: validate(component, manifestData!),
        };
      }, {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const nodeValidity = useMemo(
    () => ({
      components: {
        ...validateComponents(manifestData?.components || []),
      },
      // contributors: !!manifestData?.contributors?.length,
      // organizations: !!manifestData?.organizations?.length,
    }),
    [manifestData, validateComponents]
  );

  const isValid = () => {
    console.log("NODEVALID", nodeValidity);
    return (
      recursiveCheck(nodeValidity) &&
      wallet.isValidNetwork &&
      wallet.isValidWallet
    );
  };

  return { nodeValidity, isValid };
}
