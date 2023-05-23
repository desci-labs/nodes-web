import { useNodesMediaCoverQuery } from "@src/state/api/media";
import { useNodeReader } from "@src/state/nodes/hooks";
import { FlexRowAligned } from "../styled";

export default function NodeMetadataPreview({
  uuid,
  version,
  dpidLink,
}: {
  uuid: string;
  version: number;
  dpidLink: string;
}) {
  const { manifest } = useNodeReader();
  const { isLoading, data, isSuccess } = useNodesMediaCoverQuery(
    { cid: "", uuid, version },
    {
      skip: !uuid,
    }
  );

  if (isLoading || !isSuccess) return null; // return placeholder

  return (
    <FlexRowAligned className="w-full max-w-[400px] bg-neutrals-gray-1 p-4 mt-5 rounded-lg justify-start gap-3">
      <img
        alt={`${data?.title} node cover banner`}
        className="rounded-md w-[80px] h-[80px]"
        src={data?.url || ""}
      />
      <div className="">
        <h1 className="font-bold text-left">
          {data?.title || manifest?.title}
        </h1>
        <p className="text-neutrals-gray-5 text-xs">authors</p>
        <span className="text-xs text-neutrals-gray-5">{dpidLink}</span>
      </div>
    </FlexRowAligned>
  );
}
