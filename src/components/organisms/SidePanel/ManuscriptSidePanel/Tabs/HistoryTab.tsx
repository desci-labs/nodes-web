/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import "./history.scss";
import { ResearchObjectV1History } from "@desci-labs/desci-models";
import HistoryEntry from "./HistoryEntry";
import { TimelineGutter } from "./Timeline";
import useNodeHistory from "./useNodeHistory";
import LoaderHistoryEntry from "@src/components/molecules/LoaderHistoryEntry";
import { useNodeVersionHistory } from "@src/state/nodes/hooks";

interface HistoryTabProps {}

const HistoryTab = (props: HistoryTabProps) => {
  const [height] = useState(0);
  const { loadingChain, history, pendingHistory } = useNodeHistory();
  const { selectedHistoryId } = useNodeVersionHistory();
  console.log("selectedHistoryId", selectedHistoryId);
  return (
    <div className="flex flex-row">
      <TimelineGutter style={{ height: height }}></TimelineGutter>
      <div className="flex-1 flex flex-col gap-5 py-0.5">
        <div className="text-[10px] -mb-5 -ml-6 flex gap-2 rounded-md text-center text-gray-400 w-full justify-center">
          {loadingChain && !history.length ? (
            <div>
              <LoaderHistoryEntry selected={true} />
              <LoaderHistoryEntry selected={false} />
            </div>
          ) : (
            <>&nbsp;</>
          )}
        </div>
        {!loadingChain && !history.length && (
          <div className="text-xs italic text-gray-500 w-[85%] text-center">
            Node is not yet published
          </div>
        )}
        {pendingHistory.map((data: ResearchObjectV1History, index: number) => (
          <HistoryEntry
            key={index}
            data={data}
            index={pendingHistory.length - index + history.length}
            pending={true}
            selected={false}
          />
        ))}
        {history.map((data: ResearchObjectV1History, index: number) => (
          <HistoryEntry
            key={index}
            data={data}
            index={history.length - index}
            pending={false}
            selected={selectedHistoryId === `${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;
