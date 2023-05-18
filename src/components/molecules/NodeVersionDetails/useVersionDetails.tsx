import { getNodeVersionDetails } from "@api/index";
import {
  Node,
  NodeVersion,
  PublicDataReference,
  PublicDataReferenceOnIpfsMirror,
} from "@src/types/client";

import { useCallback, useEffect, useState } from "react";

type State = {
  size: number;
  copies: number;
  mirrors: PublicDataReferenceOnIpfsMirror[];
  node: Node | null;
  nodeVersion: NodeVersion | null;
  loading: boolean;
};

export default function useVersionDetails(transactionHash: string) {
  const [state, setState] = useState<State>({
    size: 0,
    copies: 0,
    mirrors: [],
    node: null,
    nodeVersion: null,
    loading: true,
  });

  function getTotalCopies(
    references: (PublicDataReference & {
      mirrors: PublicDataReferenceOnIpfsMirror[];
    })[]
  ) {
    const manifestRef = references.find((ref) => ref.type === "MANIFEST");
    return manifestRef?.mirrors[0]?.providerCount ?? 6;
  }

  const getVersionDetails = useCallback(async () => {
    const data = await getNodeVersionDetails(transactionHash);
    if (data.ok === true) {
      const isPublished = data.publicDataReferences.length > 0;
      const fallbackSize = data.dataReferences.reduce(
        (total, ref) => ref.size + total,
        0
      );

      const size = data.publicDataReferences.reduce(
        (total, ref) => ref.size + total,
        0
      );
      setState((prev) => ({
        ...prev,
        size: size || fallbackSize,
        loading: false,
        node: data.node,
        nodeVersion: data.nodeVersion,
        copies: isPublished ? getTotalCopies(data.publicDataReferences) : 0,
        mirrors: isPublished ? data.publicDataReferences[0]?.mirrors : [],
      }));
    }
  }, [transactionHash]);

  useEffect(() => {
    transactionHash && getVersionDetails();
  }, [getVersionDetails, transactionHash]);

  return state;
}
