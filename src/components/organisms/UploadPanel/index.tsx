import RadialLoader from "@components/atoms/RadialLoader";
import {
  IconDirectory,
  IconFile,
  IconFolderStroke,
  IconGreenCheck,
  IconIpfs,
  IconX,
} from "@icons";
import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import { SessionStorageKeys } from "@src/components/driveUtils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/viewer";
import { useDrive } from "@src/state/drive/hooks";
import {
  cleanupUploadProgressMap,
  navigateToDriveByPath,
  setShowUploadPanel,
} from "@src/state/drive/driveSlice";
import { UploadQueueItem, UploadTypes } from "@src/state/drive/types";

export interface UploadPanelProps {
  show: boolean;
}

export function getIconForUploadType(type: UploadTypes) {
  switch (type) {
    case UploadTypes.DIR:
      return <IconFolderStroke />;
    case UploadTypes.CID:
      return <IconIpfs />;
    case UploadTypes.FILE:
    default:
      return <IconFile width={18} height={18} />;
  }
}

const UploadPanel: React.FC<UploadPanelProps> = ({ show }) => {
  const { currentObjectId, componentStack } = useNodeReader();
  const { batchUploadProgress, uploadQueue } = useDrive();
  const dispatch = useSetter();

  const [localQueue, setLocalQueue] = useState<UploadQueueItem[]>([]);
  const [uploadTransitioned, setUploadTransitioned] = useState<
    Record<string, boolean>
  >({});

  //sync between local and global queue
  useEffect(() => {
    if (!localQueue.length) {
      setLocalQueue([...uploadQueue]);
    } else {
      const localBatches = new Map();

      const diffAdditions = uploadQueue.filter(
        (qI: UploadQueueItem) => !localBatches.has(qI.batchUid)
      );

      const newUploadsTransitioned = Object.fromEntries(
        diffAdditions.map((e: UploadQueueItem) => [e.batchUid, false])
      );

      setUploadTransitioned((prev) => ({ ...prev, ...newUploadsTransitioned }));
      setLocalQueue((current) => [...current, ...diffAdditions]);
    }
    console.log("[DRIVE UPLOAD QUEUE]: ", localQueue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadQueue]);

  // const allComplete = Object.values(batchUploadProgress).every(
  //   (e) => e === 100
  // );

  useEffect(() => {
    Object.entries(batchUploadProgress).forEach((kv) => {
      if (kv[1] === 100) {
        setTimeout(() => {
          setUploadTransitioned((prev) => ({ ...prev, [kv[0]]: true }));
        }, 1500);
      }
    });
    // debugger;
  }, [batchUploadProgress]);

  function close() {
    dispatch(cleanupUploadProgressMap);
    dispatch(setShowUploadPanel(false));
  }

  const globalQLength = uploadQueue.length;
  const localQLength = localQueue.length;

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  return (
    <div className="w-[350px] fixed bottom-0 left-20 drop-shadow-2xl rounded-t-lg font-medium animate-slideFromBottom">
      <header className="bg-neutrals-gray-2 text-white flex justify-between rounded-t-lg p-3">
        <p>
          {uploadQueue.length
            ? `Uploading ${globalQLength} item${globalQLength === 1 ? "" : "s"}`
            : `${localQLength} upload${localQLength !== 1 ? "s" : ""} complete`}
        </p>
        <button onClick={close}>
          <IconX />
        </button>
      </header>
      {/* <div //temp disabled
        id="midStatus"
        className="bg-neutrals-gray-8 text-black flex justify-between px-3 py-2"
      >
        <p>Less than a minute</p>
        <button className="text-tint-primary font-bold">Cancel</button>
      </div> */}
      <ul className="bg-white text-black list-none max-h-[400px] overflow-y-scroll">
        {localQueue.map((qI, idx) => {
          const viewingTargetNode = currentObjectId! === qI.nodeUuid;
          return (
            <li
              className="flex justify-between p-3 h-12"
              key={qI.batchUid + idx}
            >
              <div className="flex items-center gap-2">
                <span>{getIconForUploadType(qI.uploadType)}</span>
                {qI.path.split("/").pop()}
              </div>
              <aside>
                {batchUploadProgress[qI.batchUid] === -1 ? (
                  <IconX
                    className="fill-current text-states-error"
                    data-tip={"Upload Failed"}
                    data-place="top"
                    data-type="info"
                    data-background-color="black"
                    width={24}
                    height={24}
                  />
                ) : batchUploadProgress[qI.batchUid] < 100 ? (
                  <RadialLoader percent={batchUploadProgress[qI.batchUid]} />
                ) : uploadTransitioned[qI.batchUid] && viewingTargetNode ? (
                  <IconDirectory
                    className="w-[22px] h-[22px] animate-expandOut cursor-pointer fill-tint-primary"
                    data-tip={"Show File Location"}
                    data-place="top"
                    data-type="info"
                    data-background-color="black"
                    onClick={() => {
                      dispatch(navigateToDriveByPath({ path: qI.path }));
                      if (componentStack.length) {
                        sessionStorage.removeItem(
                          SessionStorageKeys.lastDirUid
                        );
                        dispatch(setComponentStack([]));
                      }
                    }}
                  />
                ) : (
                  <IconGreenCheck
                    className="w-[27px] h-[27px] animate-expandOut"
                    {...(!viewingTargetNode
                      ? {
                          "data-tip": "File was uploaded to a different node",
                          "data-place": "top",
                          "data-type": "info",

                          "data-background-color": "black",
                        }
                      : {})}
                  />
                )}
              </aside>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UploadPanel;
