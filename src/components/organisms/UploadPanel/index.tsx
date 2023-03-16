import RadialLoader from "@components/atoms/RadialLoader";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { IconDirectory, IconFolderStroke, IconGreenCheck, IconX } from "@icons";
import React, { useEffect, useState } from "react";
import { DriveObject } from "../Drive";
import ReactTooltip from "react-tooltip";
import {
  removeCidsFromPath,
  SessionStorageKeys,
} from "@src/components/driveUtils";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setComponentStack } from "@src/state/nodes/viewer";

export enum UploadQueuedItemType {
  UPDATE_DATASET = "Update Dataset",
  UPLOAD_DATASET = "Upload Dataset",
}

export interface UploadQueueItem {
  nodeUuid: string;
  driveObj: DriveObject;
  batchUid: string;
  uploadQueueType?: UploadQueuedItemType;
}

export interface UploadPanelProps {
  show: boolean;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ show }) => {
  const { currentObjectId, componentStack } = useNodeReader();
  const dispatch = useSetter();

  const {
    uploadQueue,
    setShowUploadPanel,
    batchUploadProgress,
    setBatchUploadProgress,
    setDriveJumpDir,
  } = useManuscriptController(["uploadQueue", "batchUploadProgress"]);
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
        (qI) => !localBatches.has(qI.batchUid)
      );

      const newUploadsTransitioned = Object.fromEntries(
        diffAdditions.map((e) => [e.batchUid, false])
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
    //clean upload progress map
    const incomplete = Object.entries(batchUploadProgress).filter(
      (k, v) => v !== 100
    );
    setBatchUploadProgress(Object.fromEntries(incomplete));

    setShowUploadPanel(false);
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
              className="flex justify-between p-3 h-12 animate-expandOut"
              key={qI.batchUid + idx}
            >
              <div className="flex items-center gap-2">
                <span>
                  <IconFolderStroke />
                </span>
                {qI.driveObj.name}
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
                    className="w-[22px] h-[22px] animate-expandOut animate-fadeIn cursor-pointer"
                    data-tip={"Show File Location"}
                    data-place="top"
                    data-type="info"
                    data-background-color="black"
                    onClick={() => {
                      if (qI.driveObj.parent) {
                        setDriveJumpDir({
                          targetUid: qI.driveObj.parent.uid!,
                          targetPath: removeCidsFromPath(
                            qI.driveObj.parent.path!
                          ),
                          itemUid: qI.driveObj.uid,
                          itemPath: removeCidsFromPath(qI.driveObj.path!),
                        });
                        if (componentStack.length) {
                          sessionStorage.removeItem(
                            SessionStorageKeys.lastDirUid
                          );
                          dispatch(setComponentStack([]));
                        }
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
