/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import "./history.scss";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import { TimelineGutter } from "./Timeline";
import useNodeHistory from "./useNodeHistory";
import LoaderHistoryEntry from "@src/components/molecules/LoaderHistoryEntry";
import { useHistoryReader } from "@src/state/nodes/hooks";
import PreviewEntry from "./PreviewEntry";

export default function HistoryPreview() {
  const [height] = useState(0);
  const { selectedHistoryId } = useHistoryReader();
  const { loadingChain, history } = useNodeHistory();
  const selectedId = selectedHistoryId || (history.length - 1).toString();

  return (
    <div className="flex flex-row">
      <TimelineGutter style={{ height: height }}></TimelineGutter>
      <div className="flex-1 flex flex-col gap-5 py-0.5">
        {loadingChain && !history.length ? (
          <div className="text-[10px] -mb-5 -ml-6 flex gap-2 rounded-md text-center text-gray-400 w-full justify-center">
            <div>
              <LoaderHistoryEntry selected={true} />
              <LoaderHistoryEntry selected={false} />
            </div>
          </div>
        ) : (
          <></>
        )}
        {!loadingChain && !history.length && (
          <div className="text-xs italic text-gray-500 w-[85%] text-center">
            Node is not yet published
          </div>
        )}
        {history.map((data: ResearchObjectV1History, index: number) => (
          <PreviewEntry
            key={index}
            data={data}
            pending={false}
            latest={index === 0}
            index={history.length - index}
            selected={index === history.length - +selectedId - 1}
          />
        ))}
      </div>
    </div>
  );
}
