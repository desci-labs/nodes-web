import { useCallback, useMemo } from "react";
import validate, {
  ValidationResult,
} from "@src/modules/componentMetadataValidator";
import { ResearchObjectV1Component } from "@desci-labs/desci-models";
import useConnectedWallet from "./useConnectedWallet";
import { useNodeReader } from "@src/state/nodes/hooks";

const recursiveCheck = (obj: any): boolean => {
  for (let val of Object.values(obj)) {
    if (Object.keys(val as any).indexOf("valid") > -1) {
      // is a ValidationResult
      const res = val as ValidationResult;
      return res.valid;
    } else {
      return recursiveCheck(val);
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
    const validityCheck = recursiveCheck(nodeValidity);
    console.log("NODEVALID", nodeValidity, "valid check", validityCheck);
    console.log(
      "wallet checks, network=",
      wallet.isValidNetwork,
      "wallet=",
      wallet.isValidWallet
    );
    return (
      recursiveCheck(nodeValidity) &&
      wallet.isValidNetwork &&
      wallet.isValidWallet
    );
  };

  return { nodeValidity, isValid };
}
