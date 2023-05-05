import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./history.scss";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import { CHAIN_DEPLOYMENT } from "@components/../chains";
import { ethers } from "ethers";
import { getResearchObjectVersions } from "@src/api";
import { VersionResponse } from "@src/state/api/types";
import { useHistoryReader, useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setNodeHistory, setPendingCommits } from "@src/state/nodes/history";
import { tags } from "@src/state/api/tags";
import { publishApi } from "@src/state/api/publish";
import CID from "cids";
import { convertHexToCID } from "@src/components/utils";

// const LS_HISTORY_MAP = "DESCI::node-version-history";

export default function useNodeHistory() {
  const dispatch = useSetter();
  const { currentObjectId } = useNodeReader();
  const { histories, pendingCommits } = useHistoryReader();

  const pendingHistory = useMemo(
    () => pendingCommits[currentObjectId!] ?? [],
    [currentObjectId, pendingCommits]
  );
  const history = useMemo(
    () => histories[currentObjectId!] ?? [],
    [currentObjectId, histories]
  );

  const loadRef = useRef(false);
  const [loadingChain, setLoadingChain] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const transformVersions = (vr: VersionResponse): ResearchObjectV1History[] =>
    vr.versions.map((v) => {
      let cid = v.cid;
      debugger;
      if (cid) {
        cid = convertHexToCID(cid);
      }
      return {
        author: { id: vr.owner, name: "" },
        content: "",
        title: "Published",
        date: parseInt(v.time) * 1000,
        transaction: { id: v.id, cid },
      };
    });

  const updatePendingCommits = useCallback(
    (update: ResearchObjectV1History[]) => {
      dispatch(setPendingCommits({ id: currentObjectId!, commits: update }));
      dispatch(
        publishApi.util.invalidateTags([
          { type: tags.nodeVersions, id: currentObjectId },
        ])
      );
      // localStorage.setItem(LS_PENDING_COMMITS_KEY, JSON.stringify(pending));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingCommits]
  );

  useEffect(() => {
    if (pendingHistory.length > 0) {
      const hashes = history.map((h) => h.transaction?.id);
      const update = pendingHistory.filter(
        (p) => !hashes.includes(p.transaction?.id)
      );
      // only update if there are new commits
      if (!pendingCommits[currentObjectId!]) {
        updatePendingCommits(update);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, pendingHistory, pendingCommits]);

  const processHistory = useCallback(async () => {
    // debugger;
    if (!currentObjectId) return;
    try {
      const versions = await getResearchObjectVersions(currentObjectId);
      const currentHistory = transformVersions(versions);
      if (history.length === currentHistory.length) return;
      debugger;

      dispatch(
        setNodeHistory({ id: currentObjectId, history: currentHistory })
      );
      dispatch(
        publishApi.util.invalidateTags([
          { type: tags.nodeVersions, id: currentObjectId },
        ])
      );
    } catch (e) {
      console.log("ERROR", e);
    } finally {
      setIsFetching(false);
      setLoadingChain(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId]);

  useEffect(() => {
    let isMounted = true;
    if (loadRef.current === false) {
      setLoadingChain(true);
    }

    if (currentObjectId) {
      const refresh = () => {
        if (isMounted) setIsFetching(true);

        processHistory();
      };

      refresh();

      const readOnlyProvider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_DEFAULT_RPC_URL
      );
      readOnlyProvider.pollingInterval = 5000;
      const contractAddress = CHAIN_DEPLOYMENT.address;

      let contract = new ethers.Contract(contractAddress, CHAIN_DEPLOYMENT.abi);
      contract = contract.connect(readOnlyProvider);
      // const eventFilter = contract.filters.VersionPush();
      contract.on("VersionPush", (event) => {
        console.log("Event VersionPush", event);
        const update = pendingHistory.filter(
          (commit) => commit.transaction?.id !== event.transactionHash
        );
        updatePendingCommits(update);
        refresh();
        // wait for graph node index
        setTimeout(refresh, 5000);
        setTimeout(refresh, 10000);
      });

      loadRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentObjectId]);

  return {
    history,
    isFetching,
    loadingChain,
    pendingHistory: pendingCommits[currentObjectId!] ?? [],
  };
}
