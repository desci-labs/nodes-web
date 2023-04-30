import { RESEARCH_OBJECT_NODES_PREFIX } from "@desci-labs/desci-models";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function useParseObjectID() {
  let params = useParams<{ cid: string; "*": string }>();
  const { cid } = params;
  const location = useLocation();
  const pid = useMemo(() => {
    const res = `${RESEARCH_OBJECT_NODES_PREFIX}/${cid}`;
    if (location.pathname.includes(res)) return res;
    return params["*"];
  }, [cid, location.pathname, params]);
  return pid;
}
