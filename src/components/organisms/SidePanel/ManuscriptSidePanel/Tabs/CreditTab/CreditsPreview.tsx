import Identicon from "@src/components/atoms/Identicon";
import EmptyPreview from "@src/components/molecules/EmptyPreview";
import { useNodeReader } from "@src/state/nodes/hooks";

export default function CreditsPreview() {
  const { manifest: manifestData } = useNodeReader();

  if (!manifestData?.authors || manifestData?.authors?.length === 0) {
    return (
      <EmptyPreview
        title="No Credited Authors"
        message="To access the data of this node, please view it on a desktop browser."
        className="h-fit min-h-[25vh]"
      />
    );
  }
  console.log('authors', manifestData.authors)
  return (
    <div className="flex flex-col gap-2">
      {manifestData?.authors &&
        manifestData?.authors.map((author, index: number) => (
          <div
            key={index}
            className="flex flex-col p-2 dark:bg-muted-900 rounded-lg dark:hover:border-zinc-500 dark:border-black border mt-[1px]"
          >
            <div className="w-full flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold">{author.name}</span>
                <span className="text-xs text-gray-400">{author.role}</span>
                {author.organizations ? (
                  <span className="text-xs text-gray-400">
                    {author.organizations[0].name}
                  </span>
                ) : null}
              </div>
              <Identicon string={author.name} size={20} />
            </div>
          </div>
        ))}
    </div>
  );
}
