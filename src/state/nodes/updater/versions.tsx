import {
  publishApi,
  useResearchObjectVersionsQuery,
} from "@src/state/api/publish";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import { ethers } from "ethers";
import { VersionResponse } from "@src/state/api/types";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setNodeHistory, setPendingCommits } from "@src/state/nodes/history";
import { getResearchObjectVersions } from "@src/api";
import { tags } from "@src/state/api/tags";
import { HistoryMap } from "../types";

export const LOCALSTORAGE_DESCI_USER_PROFILE =
  "LOCALSTORAGE_DESCI_USER_PROFILE";

const readOnlyProvider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_DEFAULT_RPC_URL
);
readOnlyProvider.pollingInterval = 5000;

export default function NodesUpdater(props: PropsWithChildren<{}>) {
  const dispatch = useSetter();
  const { currentObjectId } = useNodeReader();
  const { pendingCommits } = useHistoryReader();
  const { refetch } = useResearchObjectVersionsQuery(currentObjectId!, {
    skip: !currentObjectId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const intervalRef = useRef<any>(undefined);

  const transformVersions = (vr: VersionResponse): ResearchObjectV1History[] =>
    vr.versions.map((v) => ({
      author: { id: vr.owner, name: "" },
      content: "",
      title: "Published",
      date: parseInt(v.time) * 1000,
      transaction: { id: v.id },
    }));

  const updatePendingCommits = useCallback(
    (update: ResearchObjectV1History[]) => {
      dispatch(setPendingCommits({ id: currentObjectId!, commits: update }));
    },
    [dispatch, currentObjectId]
  );

  // Pull updated history for selected Research object
  useEffect(() => {
    if (currentObjectId) {
      refetch();
    }
  }, [currentObjectId, refetch]);

  const refresh = useCallback(
    (uuid: string, index: number, arr: any[]) => {
      (async () => {
        try {
          // console.log("Refersh Node", uuid);
          const versions = await getResearchObjectVersions(uuid);
          const currentHistory = transformVersions(versions);
          // console.log("Update history", uuid, currentHistory);
          dispatch(setNodeHistory({ id: uuid, history: currentHistory }));
          dispatch(
            publishApi.util.invalidateTags([
              { type: tags.nodeVersions, id: uuid },
            ])
          );
        } catch (e) {
          console.log("ERROR", e);
        }
      })();
    },
    [dispatch]
  );

  const checkPendingNodes = useCallback(
    async (pendingNodeUuids: string[], pendingCommits: HistoryMap) => {
      setIsUpdating(true);
      const pendings = await asyncMap(
        pendingNodeUuids,
        async (uuid: string) => {
          try {
            const commits = pendingCommits[uuid];
            const txHashes = commits
              .map((commit) => commit.transaction?.id ?? "")
              .filter(Boolean);

            let receipts = await Promise.all(
              txHashes.map((hash) =>
                readOnlyProvider.getTransactionReceipt(hash)
              )
            );

            const confirmedHashes = receipts
              .filter(Boolean)
              .map((receipt) => receipt.transactionHash);

            const update = commits.filter((commit) =>
              commit.transaction?.id
                ? !confirmedHashes.includes(commit.transaction?.id!)
                : true
            );

            if (commits.length !== update.length) {
              updatePendingCommits(update);
              dispatch(setPendingCommits({ id: uuid!, commits: update }));
            }

            return confirmedHashes.length > 0 ? uuid : false;
          } catch (e) {
            console.log("Error checking Pending Nodes", e);
            return false;
          }
        }
      );
      const updated = pendings.filter(Boolean) as string[];
      updated.forEach(refresh);
      setIsUpdating(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  useEffect(() => {
    const pendingNodeUuids = Object.keys(pendingCommits);
    const total = Object.values(pendingCommits).flat();

    if (isUpdating) return;

    if (total.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsUpdating(false);
      return;
    }

    if (!intervalRef.current) {
      checkPendingNodes(pendingNodeUuids, pendingCommits);
      intervalRef.current = setInterval(
        () => checkPendingNodes(pendingNodeUuids, pendingCommits),
        3000
      );
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCommits, refresh, checkPendingNodes]);

  return null;
}

async function asyncMap<T, E>(
  arr: E[],
  predicate: (input: E) => Promise<T>
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate));

  return results as T[];
}
