import { getDataUsage } from "@api/index";
import { BytesToHumanFileSize } from "@components/utils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useEffect, useMemo, useState } from "react";

export interface State {
  consumption: number;
  limit: number;
  loading: boolean;
}

export default function useDataUsage() {
  const [state, setState] = useState<State>({
    consumption: 0,
    limit: 5000000000,
    loading: true,
  });

  const { manifest } = useNodeReader();

  async function getUsage() {
    const { data } = await getDataUsage();
    const initState = { loading: false };
    if (!data.consumption) {
      setState({
        ...initState,
        consumption: 0,
        limit: data.limit,
      });
      return;
    }
    if (data.consumption > data.limit)
      setState({
        ...initState,
        consumption: Math.max(data.limit, 0),
        limit: data.limit,
      });
    if (data.consumption < data.limit)
      setState({
        ...initState,
        consumption: data.consumption,
        limit: data.limit,
      });
  }

  useEffect(() => {
    getUsage();
  }, [manifest]);

  const freeStorageText = useMemo(
    () => BytesToHumanFileSize(Math.max(state.limit - state.consumption, 0)),
    [state]
  );
  const formattedSpaceUsed = useMemo(
    () => BytesToHumanFileSize(Math.max(state.consumption, 0)),
    [state]
  );

  const formattedLimit = useMemo(
    () => BytesToHumanFileSize(state.limit),
    [state]
  );

  return {
    ...state,
    freeStorageText,
    formattedLimit,
    formattedSpaceUsed,
    percent: (state.consumption / state.limit) * 100,
  };
}
