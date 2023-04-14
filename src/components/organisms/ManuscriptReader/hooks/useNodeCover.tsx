import { ResearchObjectComponentType } from "@desci-labs/desci-models";
import { useNodesMediaCoverQuery } from "@src/state/api/media";
import { useNodeReader } from "@src/state/nodes/hooks";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1679669693237-74d556d6b5ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2298&q=80";

export default function useNodeCover() {
  const { manifest } = useNodeReader();
  const pdf = manifest?.components.find(
    (c) => c.type === ResearchObjectComponentType.PDF
  );
  const { isLoading, data, isSuccess } = useNodesMediaCoverQuery(
    pdf?.payload?.url,
    {
      skip: !pdf?.payload?.url,
    }
  );

  return {
    cover: isSuccess ? data.url : DEFAULT_COVER,
    isLoading,
  };
}
