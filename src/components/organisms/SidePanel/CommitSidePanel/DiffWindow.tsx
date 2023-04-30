import PerfectScrollbar from "react-perfect-scrollbar";
import DeepDiff from "deep-diff";

export default function DiffWindow({ diff }: any) {
  return (
    <>
      {diff.kind === "A" ? (
        <>
          <span className="text-xs">Changes to .{diff.path?.join(".")}</span>
          <div className="flex flex-row text-[10px] max-w-2xl font-mono">
            <div className="flex flex-1  overflow-auto break-all p-2"></div>
            <div className="flex flex-1 overflow-auto break-all bg-green-900 p-2">
              {JSON.stringify(
                (
                  (diff as DeepDiff.DiffArray<any>)
                    .item as DeepDiff.DiffNew<any>
                ).rhs
              )}
            </div>
          </div>
          <PerfectScrollbar className="font-mono text-[10px] overflow-auto max-w-2xl mt-10">
            {JSON.stringify(diff as DeepDiff.DiffArray<any>)}
          </PerfectScrollbar>
        </>
      ) : null}
      {diff.kind === "N" ? (
        <>
          <span className="text-xs mb-10 block">
            Created .{diff.path?.join(".")}
          </span>
          <div className="flex flex-row text-[10px] max-w-2xl font-mono">
            <div className="flex flex-1  overflow-auto break-all p-2"></div>
            <div className="flex flex-1 overflow-auto break-all bg-green-900 p-2">
              {JSON.stringify((diff as DeepDiff.DiffNew<any>)?.rhs)}
            </div>
          </div>
          <PerfectScrollbar className="font-mono text-[10px] overflow-auto max-w-2xl mt-10 bg-gray-800">
            {JSON.stringify(diff as DeepDiff.DiffArray<any>)}
          </PerfectScrollbar>
        </>
      ) : null}
      {diff.kind === "E" ? (
        <>
          <span className="text-xs mb-10 block">
            Updated .{diff.path?.join(".")}
          </span>
          <div className="flex flex-row text-[10px] max-w-2xl font-mono">
            <div className="flex flex-1  overflow-auto break-all p-2">
              {JSON.stringify((diff as DeepDiff.DiffEdit<any>)?.lhs)}
            </div>
            <div className="flex flex-1 overflow-auto break-all bg-green-900 p-2">
              {JSON.stringify((diff as DeepDiff.DiffEdit<any>)?.rhs)}
            </div>
          </div>
          <PerfectScrollbar className="font-mono text-[10px] overflow-auto max-w-2xl mt-10 bg-gray-800">
            {JSON.stringify(diff as DeepDiff.DiffEdit<any>)}
          </PerfectScrollbar>
        </>
      ) : null}
      {diff.kind === "D" ? (
        <>
          <span className="text-xs mb-10 block">
            Delete .{diff.path?.join(".")}
          </span>
          <div className="flex flex-row text-[10px] max-w-2xl font-mono">
            <div className="flex flex-1  overflow-auto break-all p-2">
              {JSON.stringify((diff as DeepDiff.DiffDeleted<any>)?.lhs)}
            </div>
            <div className="flex flex-1 overflow-auto break-all bg-red-900 p-2">
              --deleted--
            </div>
          </div>
          <PerfectScrollbar className="font-mono text-[10px] overflow-auto max-w-2xl mt-10 bg-gray-800">
            {JSON.stringify(diff as DeepDiff.DiffDeleted<any>)}
          </PerfectScrollbar>
        </>
      ) : null}
    </>
  );
}
