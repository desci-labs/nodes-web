import { addDatasetComponent, updateDatasetComponent } from "@api/index";
import DropTargetFullScreen from "@components/atoms/DropTargetFullScreen";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import {
  addPlaceholderDataset,
  constructBreadCrumbs,
  createVirtualDrive,
  DEFAULT_CID_PENDING,
  DRIVE_DATA_PATH,
  DRIVE_RESEARCH_REPORT_PATH,
  fillOuterSizes,
  findDriveByPath,
  findRootComponentCid,
  formatDbDate,
  generateFlatPathUidMap,
  gracefullyAssignTreeUids,
  ipfsTreeToDriveTree,
  isDataComponent,
  removeFromUploadQueue,
  resetAccessStatus,
  SessionStorageKeys,
  strIsCid,
  VirtualDrivePaths,
} from "@components/driveUtils";
import DriveDatasetMetadataPopOver, {
  DATASET_METADATA_FORM_DEFAULTS,
} from "@components/molecules/DriveDatasetMetadataPopOver";
import SidePanelStorage from "@components/molecules/SidePanelStorage";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { __log } from "@components/utils";
import {
  DataComponentMetadata,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import DriveTable, {
  AccessStatus,
  DriveObject,
  FileDir,
  FileType,
  oldComponentMetadata,
} from "./Drive";
import toast from "react-hot-toast";
import { UploadQueuedItemType } from "./UploadPanel";
import { BreadCrumb } from "../molecules/DriveBreadCrumbs";

import { v4 as uuidv4 } from "uuid";
import ComponentMetadataPopover from "./PopOver/ComponentMetadataPopover";
import ContextMenuProvider from "./Drive/ContextMenu/provider";
import LoaderDrive from "../molecules/LoaderDrive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setManifestCid, setManifestData } from "@src/state/nodes/viewer";

export interface DatasetMetadataInfo {
  prepopulateFromName?: string;
  prepopulateMetadata?: DataComponentMetadata;
  componentsSelected?: string[];
  rootCid?: string;
}

export interface MetaStaging {
  index?: number | string;
  file: DriveObject;
}

export interface UpdateDataContext {
  path: string;
  rootCid: string;
}

export interface NodeDriveSetter {
  setDirectory: React.Dispatch<React.SetStateAction<DriveObject[]>>; //(directory: DriveObject[]) => void;
  setRenameComponentId: React.Dispatch<React.SetStateAction<string | null>>;
}
export const nodeDriveSetContext = createContext<NodeDriveSetter>({
  setDirectory: () => { },
  setRenameComponentId: () => { },
});

const datasetMetadataInfoRefDefaults: DatasetMetadataInfo = {
  prepopulateMetadata: DATASET_METADATA_FORM_DEFAULTS,
  componentsSelected: [],
};

const PaneDrive = () => {
  const {
    droppedFileList,
    droppedTransferItemList,
    setDroppedFileList,
    setDroppedTransferItemList,
    setUploadQueue,
    uploadQueue,
    setShowUploadPanel,
    setBatchUploadProgress,
    batchUploadProgress,
    privCidMap,
    setPrivCidMap,
  } = useManuscriptController([
    "privCidMap",
    "uploadQueue",
    "droppedFileList",
    "droppedTransferItemList",
    "batchUploadProgress",
  ]);
  const dispatch = useSetter();
  const {
    manifest: manifestData,
    isDraggingFiles,
    currentObjectId,
  } = useNodeReader();

  const [directory, setDirectory] = useState<Array<DriveObject>>([]);
  const [renameComponentId, setRenameComponentId] = useState<string | null>(
    null
  );
  const [nodeDrived, setNodeDrived] = useState<DriveObject | null>(null);
  const [showEditMetadata, setShowEditMetadata] = useState<boolean>(false);
  const [metaStaging, setMetaStaging] = useState<MetaStaging[]>([]);
  const [breadCrumbs, setBreadCrumbs] = useState<BreadCrumb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [OldComponentMetadata, setOldComponentMetadata] =
    useState<oldComponentMetadata | null>(null); //temporary fallback for old metadata used for documents and code

  const datasetMetadataInfoRef = useRef<DatasetMetadataInfo>(
    datasetMetadataInfoRefDefaults
  );

  function updateProgress(batch: string, progress: number) {
    //change to useCb
    // console.log(`batch ${batch} updated progress to ${progress}`);
    // uploadQueue.forEach((qI) => {
    //   if (qI.batchUid === batch) qI.progress = progress;
    // });
    // const newQueue = uploadQueue.map((qI) => {
    //   if (qI.batchUid !== batch) return qI;
    //   qI.progress = progress;
    //   return qI;
    // });
    // setUploadQueue(newQueue);
    setBatchUploadProgress({ ...batchUploadProgress, [batch]: progress });
  }

  const handleUpload = useCallback(
    async (
      files: FileList | FileSystemEntry[],
      errorHandle: (err: any) => void
    ) => {
      console.log("files passed in");
      const snapshotNodeUuid = currentObjectId!;
      const dataDriveIdx = nodeDrived?.contains?.findIndex(
        (d) => d.path === DRIVE_DATA_PATH
      );
      const dataDrive =
        dataDriveIdx !== undefined
          ? nodeDrived?.contains![dataDriveIdx]
          : undefined;

      const placeHolder = dataDrive
        ? addPlaceholderDataset(dataDrive)
        : undefined;

      const dataFields = {
        title: placeHolder?.name || Date.now().toString(),
      };

      const batchUid = Date.now().toString();
      if (dataDrive && placeHolder) {
        dataDrive.contains?.push(placeHolder);
        setBatchUploadProgress({ ...batchUploadProgress, [batchUid]: 0 });
        setUploadQueue([
          ...uploadQueue,
          {
            nodeUuid: currentObjectId!,
            driveObj: placeHolder,
            batchUid,
          },
        ]);
        setShowUploadPanel(true);
      }
      // if (dataDrive && placeHolder)
      //   setDirectory([...dataDrive.contains!, placeHolder]);

      try {
        const { manifest, rootDataCid, manifestCid, tree, date } =
          await addDatasetComponent(
            currentObjectId!,
            files,
            dataFields,
            manifestData!,
            (e) => {
              const perc = Math.ceil((e.loaded / e.total) * 100);
              const passedPerc = perc < 90 ? perc : 90;
              updateProgress(batchUid, passedPerc);
            }
          );
        if (rootDataCid) {
          setPrivCidMap({ ...privCidMap, [rootDataCid]: true });
          updateProgress(batchUid, 100);
        }
        setUploadQueue(removeFromUploadQueue(uploadQueue, batchUid));
        if (placeHolder) {
          placeHolder.cid = rootDataCid;
          placeHolder.path = `Data/${rootDataCid}`;
          tree.forEach((fd: FileDir) => (fd.parent = placeHolder));
          placeHolder.contains = tree;
          const formattedDate = formatDbDate(date);
          if ("lastModified" in placeHolder)
            placeHolder.lastModified = formattedDate;
          placeHolder.contains!.forEach(
            (fd, idx) =>
              (placeHolder.contains![idx] = ipfsTreeToDriveTree(
                fd,
                formattedDate,
                manifestData!
              ))
          );
          placeHolder.accessStatus = AccessStatus.PRIVATE;
        }
        if (dataDrive) fillOuterSizes(dataDrive);

        setDirectory((cwd) => {
          if (cwd[0]?.parent?.path === VirtualDrivePaths.DRIVE_DATA_PATH) {
            return dataDrive!.contains!;
          }
          return cwd;
        });

        //only handles if user is in the node root post upload, updates the size of data.
        setDirectory((old) => {
          const isNodeRoot = old.findIndex(
            (fd) => fd.path === DRIVE_RESEARCH_REPORT_PATH
          );
          if (isNodeRoot === -1) return old;

          const virtualData = createVirtualDrive({
            name: "Data",
            componentType: ResearchObjectComponentType.DATA,
            contains: old,
            path: DRIVE_DATA_PATH,
          });
          const sizesFilledDrive = fillOuterSizes(virtualData);
          const newDir = [...sizesFilledDrive.contains!];
          const newCrumbs = constructBreadCrumbs(
            newDir[0].parent! as DriveObject
          );
          setBreadCrumbs(newCrumbs);
          return newDir;
          // return old;
        });

        //for edge case of switching node whilst uploading
        setDirectory((old) => {
          console.log(
            `[SAVING]snapshotUuid: ${snapshotNodeUuid} currentObjId: ${currentObjectId!}`
          );
          dispatch(setManifestData({ manifest, cid: manifestCid }));
          return old;
        });
        resetAccessStatus(nodeDrived!);
        // if (snapshotNodeUuid === currentObjectId!) {
        // }
      } catch (e: any) {
        console.log(e);
        updateProgress(batchUid, -1);
        setUploadQueue(removeFromUploadQueue(uploadQueue, batchUid));
        setDirectory((prev) => {
          if (placeHolder) placeHolder.accessStatus = AccessStatus.FAILED;
          if (prev[0]?.parent?.path !== DRIVE_DATA_PATH) return prev;
          const newDir = [...prev];
          return newDir;
        });
        __log(
          "PaneDrive::handleUpload",
          files,
          dataDrive,
          placeHolder,
          dataFields,
          e
        );
        errorHandle(e);
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDirectory, nodeDrived, currentObjectId, manifestData]
  );

  const handleUpdate = useCallback(
    async (
      files: FileList | FileSystemEntry[],
      updateContext: UpdateDataContext,
      errorHandle: (err: any) => void
    ) => {
      const updateQueued = uploadQueue.some(
        (queuedItem) =>
          queuedItem.uploadQueueType &&
          queuedItem.uploadQueueType === UploadQueuedItemType.UPDATE_DATASET &&
          queuedItem.nodeUuid === currentObjectId!
      );

      if (updateQueued) {
        toast.error(
          "A dataset update is already pending, please wait for it to complete before adding more data.",
          {
            position: "top-center",
            duration: 5000,
            style: {
              marginTop: 55,
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              zIndex: 150,
            },
          }
        );
        return;
      }

      const dirs: Record<string, string> = {};
      const placeholderInfo = Array.prototype.filter
        .call(files, (f) => {
          const split = f.fullPath.split("/");
          if (split.length === 2) return split;
          if (split.length === 3) {
            dirs[split[1]] = "/" + split[1];
          }
          return false;
        })
        .map((f) => {
          console.log("file: ", f);
          return {
            isDirectory: f.isDirectory,
            name: f.name,
            path: f.fullPath,
          };
        });

      Object.keys(dirs).forEach((key) =>
        placeholderInfo.push({ isDirectory: true, name: key, path: dirs[key] })
      );
      const oldDatasetRootCid = findRootComponentCid(directory[0]); //moved
      const splitCxtPath = directory[0].path!.split("/");
      splitCxtPath.pop();
      const cxtPath = splitCxtPath.join("/");

      const placeholders = placeholderInfo.map((p: any) => {
        const date = formatDbDate(Date.now());
        const uid = uuidv4();
        const placeholder: DriveObject = {
          name: p.name,
          componentType: ResearchObjectComponentType.DATA,
          size: 0,
          contains: p.isDirectory ? [] : undefined,
          lastModified: date,
          accessStatus: AccessStatus.UPLOADING,
          metadata: {}, //TO ADD METADATA
          cid: DEFAULT_CID_PENDING,
          parent: directory[0]?.parent,
          type: p.isDirectory ? FileType.Dir : FileType.File,
          path: cxtPath + p.path,
          uid: uid,
        };
        return placeholder;
      });
      const snapshotDirUid = directory[0].parent?.uid;
      setDirectory((dir) => {
        return [...dir, ...placeholders];
      });
      // debugger;

      console.log("[DRIVE UPDATE] placeholders: ", placeholders);
      const batchUid = Date.now().toString();
      const qItems = placeholders.map((ph) => {
        return {
          driveObj: ph,
          batchUid,
          nodeUuid: currentObjectId!,
          uploadQueueType: UploadQueuedItemType.UPDATE_DATASET,
        };
      });
      setBatchUploadProgress({ ...batchUploadProgress, [batchUid]: 0 });
      setUploadQueue([...uploadQueue, ...qItems]);
      setShowUploadPanel(true);
      const snapshotNodeUuid = currentObjectId!;
      try {
        const { manifest, rootDataCid, manifestCid, tree, date } =
          await updateDatasetComponent(
            currentObjectId!,
            files,
            manifestData!,
            updateContext.rootCid,
            updateContext.path,
            (e) => {
              const perc = Math.ceil((e.loaded / e.total) * 100);
              const passedPerc = perc < 90 ? perc : 90;
              updateProgress(batchUid, passedPerc);
            }
          );
        setUploadQueue(removeFromUploadQueue(uploadQueue, batchUid));
        if (rootDataCid) {
          setPrivCidMap({ ...privCidMap, [rootDataCid]: true });
          updateProgress(batchUid, 100);
        }

        // setDirectory((cwd) => {
        //   if (cwd[0]?.parent?.path === VirtualDrivePaths.DRIVE_DATA_PATH) {
        //     return dataDrive!.contains!;
        //   }
        //   return cwd;
        // });

        setDirectory((old) => {
          // debugger;
          console.log("dsRootCid: ", oldDatasetRootCid);
          const dataDriveIdx = nodeDrived?.contains?.findIndex(
            (d) => d.name === "Data"
          );
          const dataDrive =
            dataDriveIdx !== undefined
              ? nodeDrived?.contains![dataDriveIdx]
              : undefined;
          if (dataDrive) {
            const datasetIndex = dataDrive.contains?.findIndex(
              (ds) => ds.cid === oldDatasetRootCid
            );
            if (datasetIndex !== -1) {
              const dataComp = dataDrive.contains![datasetIndex!];
              const newPath = "Data/" + rootDataCid;

              //reattach parents
              tree.forEach((fd: FileDir) => (fd.parent = dataComp));
              // save already asigned UIDs
              if (!dataComp.contains) return old;
              const ltsDataCompContents = [
                ...dataComp.contains!,
                ...placeholders, //context doesn't matter here, gets flattened
              ];
              // debugger;
              gracefullyAssignTreeUids(tree, ltsDataCompContents);
              // debugger;
              dataComp.contains = tree;
              dataComp.cid = rootDataCid;
              dataComp.path = newPath;
              dataComp.contains?.forEach(
                (fd, idx) =>
                  (dataComp.contains![idx] = ipfsTreeToDriveTree(
                    fd,
                    formatDbDate(date),
                    manifest
                  ))
              );

              old.forEach((item) => {
                const splitPath = item.path!.split("/");
                splitPath[0] = rootDataCid;
                item.path = splitPath.join("/");
              });
              fillOuterSizes(dataDrive);
              // debugger;
              if (old[0].parent?.uid === snapshotDirUid) {
                const pathSplit = old[0].parent?.path?.split("/");
                if (pathSplit) {
                  const cidIndex = pathSplit?.findIndex((s) => strIsCid(s));
                  if (cidIndex !== -1) pathSplit[cidIndex] = rootDataCid;
                  const updatedPath = pathSplit?.join("/");
                  const updatedDir = findDriveByPath(dataDrive, updatedPath);

                  // if (updatedDir) newDirectory = updatedDir.contains!;
                  if (updatedDir) {
                    const newCrumbs = constructBreadCrumbs(updatedDir);
                    setBreadCrumbs(newCrumbs);
                    return updatedDir.contains!;
                  }
                }
              }
            }
          }
          placeholders.forEach(
            (ph) => (ph.accessStatus = AccessStatus.PRIVATE)
          );
          return old;
        });
        console.log(
          `snapshotUuid: ${snapshotNodeUuid} currentObjId: ${currentObjectId!}`
        );
        if (snapshotNodeUuid === currentObjectId!) {
          dispatch(setManifestData({ manifest, cid: manifestCid }));
        }
        resetAccessStatus(nodeDrived!);
      } catch (e: any) {
        console.log(e);
        setUploadQueue(removeFromUploadQueue(uploadQueue, batchUid));
        updateProgress(batchUid, -1);
        setDirectory((prev) => {
          placeholders.forEach((ph) => (ph.accessStatus = AccessStatus.FAILED));
          const newDir = [...prev];
          return newDir;
        });
        __log("PaneDrive::handleUpdate", files, updateContext, e);
        errorHandle(e);
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      directory,
      setDirectory,
      nodeDrived,
      setNodeDrived,
      currentObjectId,
      setManifestData,
      setManifestCid,
      manifestData,
      uploadQueue,
    ]
  );

  const directoryRef = useRef<DriveObject[]>(directory);
  useEffect(() => {
    directoryRef.current = directory;
  }, [directory]);

  // handle file drop
  useEffect(() => {
    const errorHandle = (err?: any) => {
      toast.error(err.message, {
        position: "top-center",
        duration: 3000,
        style: {
          marginTop: 55,
          borderRadius: "10px",
          background: "#111",
          color: "#fff",
          zIndex: 150,
        },
      });
    };

    const freshDir = directoryRef.current;
    if (!droppedFileList && !droppedTransferItemList) {
      return;
    }

    try {
      let isUpdate = false;
      // debugger;
      const updateContext: UpdateDataContext = { path: "", rootCid: "" };
      if ((droppedFileList || droppedTransferItemList) && !!freshDir[0]) {
        //setup path context
        if (freshDir.length && freshDir[0].parent) {
          const rootCid = findRootComponentCid(
            freshDir[0].parent as DriveObject
          );
          if (rootCid && manifestData) {
            const isData = isDataComponent(manifestData!, rootCid);
            if (isData) {
              isUpdate = true;
              const contextPath = freshDir[0].parent!.path!;
              updateContext.path = contextPath;
              updateContext.rootCid = rootCid;
            }
          }
        }
      }

      if (droppedFileList) {
        if (droppedFileList instanceof FileList) {
          if (isUpdate) {
            handleUpdate(droppedFileList, updateContext, errorHandle);
          } else {
            handleUpload(droppedFileList, errorHandle);
          }
        }
      }

      if (droppedTransferItemList) {
        if (isUpdate) {
          handleUpdate(droppedTransferItemList, updateContext, errorHandle);
        } else {
          handleUpload(droppedTransferItemList, errorHandle);
        }
      }
    } catch (err: any) {
      errorHandle(err);
    }
    setDroppedFileList(null);
    setDroppedTransferItemList(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    droppedFileList,
    setDroppedFileList,
    setDroppedTransferItemList,
    droppedTransferItemList,
    handleUpload,
    directoryRef,
  ]);

  const componentUnmounting = useRef<boolean>(false);
  useEffect(() => {
    return () => {
      componentUnmounting.current = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      //save pathUidMap
      if (componentUnmounting) {
        if (nodeDrived) {
          const pathUidMap = generateFlatPathUidMap(nodeDrived);
          sessionStorage.setItem(
            "Drive::pathUidMap",
            JSON.stringify(pathUidMap)
          );
        }
        if (currentObjectId) {
          sessionStorage.setItem(
            SessionStorageKeys.lastNodeId,
            JSON.stringify(currentObjectId!)
          );
        }
        if (directory?.length) {
          const dirUid = directory[0].parent?.uid;
          if (dirUid)
            sessionStorage.setItem(
              SessionStorageKeys.lastDirUid,
              JSON.stringify(dirUid)
            );
        }
        componentUnmounting.current = false;
      }
    };
  }, [nodeDrived, directory, currentObjectId]);

  const memoizedSetDirectory = useCallback(
    (args: any) => setDirectory(args),
    []
  );
  const memoizedSetRenameComponentId = useCallback(
    (args: any) => setRenameComponentId(args),
    []
  );
  return (
    <nodeDriveSetContext.Provider
      value={{
        setDirectory: memoizedSetDirectory,
        setRenameComponentId: memoizedSetRenameComponentId,
      }}
    >
      <ContextMenuProvider>
        <div className="flex flex-col relative">
          {loading ? (
            <div
              className={`flex justify-center items-center flex-col w-[calc(100%-320px)] h-full fixed bg-neutrals-black overflow-hidden top-0 z-[50] gap-3 ${
                loading ? "" : "hidden"
              }`}
            >
              <LoaderDrive />
            </div>
          ) : null}
          {isDraggingFiles ? <DropTargetFullScreen /> : null}
          <PerfectScrollbar className="w-full self-center flex flex-col gap-6 px-20 text-white h-full bg-neutrals-black pb-20 !pb-[300px]">
            <h1 className="text-[28px] font-bold text-white">Node Drive</h1>
            <SpacerHorizontal />
            <div id="tableWrapper" className="mt-5 h-full">
              <DriveTable
                setLoading={setLoading}
                setOldComponentMetadata={setOldComponentMetadata}
                directory={directory}
                setDirectory={setDirectory}
                nodeDrived={nodeDrived}
                setNodeDrived={setNodeDrived}
                setShowEditMetadata={setShowEditMetadata}
                datasetMetadataInfoRef={datasetMetadataInfoRef}
                setMetaStaging={setMetaStaging}
                showEditMetadata={showEditMetadata}
                breadCrumbs={breadCrumbs}
                setBreadCrumbs={setBreadCrumbs}
                renameComponentId={renameComponentId}
                setRenameComponentId={setRenameComponentId}
              />
            </div>
          </PerfectScrollbar>
          {showEditMetadata && (
            <DriveDatasetMetadataPopOver
              currentObjectId={currentObjectId!}
              manifestData={manifestData!}
              datasetMetadataInfoRef={datasetMetadataInfoRef}
              metaStaging={metaStaging}
              // componentId={component.id}
              isVisible={showEditMetadata}
              onClose={() => {
                delete datasetMetadataInfoRef.current.rootCid;
                delete datasetMetadataInfoRef.current.prepopulateFromName;
                datasetMetadataInfoRef.current = datasetMetadataInfoRefDefaults;
                setShowEditMetadata(false);
              }}
            />
          )}
          {!!OldComponentMetadata && (
            <ComponentMetadataPopover
              componentId={OldComponentMetadata?.componentId!}
              isVisible={!!OldComponentMetadata}
              onClose={() => {
                if (OldComponentMetadata) OldComponentMetadata.cb();
                setOldComponentMetadata(null);
              }}
            />
          )}
          <SidePanelStorage />
        </div>
      </ContextMenuProvider>
    </nodeDriveSetContext.Provider>
  );
};
export default PaneDrive;

export function useDriveUpdater() {
  const context = useContext(nodeDriveSetContext);
  if (!context)
    throw Error("Cannot access Drive Provider outside of <PaneDrive>");
  return context;
}
