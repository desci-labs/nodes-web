const NodeCardLoader = ({ id }: any) => {
  return (
    <div role="status" className={`select-none flex flex-col group`}>
      <div
        className={`rounded-t-md p-4 bg-[#333333] gap-2 flex flex-col !border-neutrals-gray-3 border-2 border-b-0`}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gray-400 opacity-10 text-transparent font-bold text-sm px-2 py-0.5">
            Creator: Author
          </div>

          <div className="text-[11px] text-transparent bg-gray-400 opacity-10 rounded-md">
            Last update: 01/01/2023, 2:34 AM
          </div>
        </div>

        <div className="text-xl font-bold text-transparent w-full bg-gray-300 opacity-10 rounded-md overflow-hidden overflow-ellipsis">
          Untitled Node
        </div>
      </div>
      {/**TODO: convert following into BadgeComponent */}
      <div
        className={`w-full bg-neutrals-black-2 h-11 rounded-b-md border-t !border-t-gray-400 flex flex-shrink flex-row justify-between px-4 py-2 !border-neutrals-gray-3 border-2 border-transparent`}
      >
        <div className="bg-gray-300 opacity-10 rounded-md text-white text-[11px] px-2 font-medium flex items-center gap-1.5">
          <div className={`h-2 w-20 rounded-full w-4`} />
        </div>
      </div>
    </div>
  );
};

export default NodeCardLoader;
