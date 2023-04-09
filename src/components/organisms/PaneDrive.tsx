import { addDatasetComponent } from "@api/index";
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
import { BreadCrumb } from "../molecules/DriveBreadCrumbs";

import { v4 as uuidv4 } from "uuid";
import ComponentMetadataPopover from "./PopOver/ComponentMetadataPopover";
import ContextMenuProvider from "./Drive/ContextMenu/provider";
import LoaderDrive from "../molecules/LoaderDrive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { setManifestCid, setManifestData } from "@src/state/nodes/viewer";
import { useDrive } from "@src/state/drive/hooks";
import {
  addFilesToDrive,
  addItemsToUploadQueue,
  fetchTreeThunk,
  removeBatchFromUploadQueue,
  setShowUploadPanel,
  updateBatchUploadProgress,
} from "@src/state/drive/driveSlice";
import { formatDbDate } from "@src/state/drive/utils";

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
  setDirectory: () => {},
  setRenameComponentId: () => {},
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
    privCidMap,
    setPrivCidMap,
  } = useManuscriptController([
    "privCidMap",
    "droppedFileList",
    "droppedTransferItemList",
  ]);
  const dispatch = useSetter();
  const {
    manifest: manifestData,
    isDraggingFiles,
    currentObjectId,
    mode,
  } = useNodeReader();

  const { nodeTree, status, currentDrive, uploadQueue } = useDrive();

  // const [directory, setDirectory] = useState<Array<DriveObject>>([]);
  // const [renameComponentId, setRenameComponentId] = useState<string | null>(
  //   null
  // );
  // const [showEditMetadata, setShowEditMetadata] = useState<boolean>(false);
  // const [metaStaging, setMetaStaging] = useState<MetaStaging[]>([]);
  const [breadCrumbs, setBreadCrumbs] = useState<BreadCrumb[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [OldComponentMetadata, setOldComponentMetadata] =
  //   useState<oldComponentMetadata | null>(null); //temporary fallback for old metadata used for documents and code

  // const datasetMetadataInfoRef = useRef<DatasetMetadataInfo>(
  //   datasetMetadataInfoRefDefaults
  // );

  useEffect(() => {
    if (loading) setLoading(false);
  }, [loading]);

  useEffect(() => {
    if (!nodeTree && status === "idle") {
      dispatch(fetchTreeThunk());
    }
  }, [nodeTree]);

  const handleUpload = useCallback(
    async (
      files: FileList | FileSystemEntry[],
      errorHandle: (err: any) => void
    ) => {
      if (!nodeTree) return;
      console.log("files passed in");
      const snapshotNodeUuid = currentObjectId!;
      const dataDriveIdx = nodeTree?.contains?.findIndex(
        (d) => d.path === DRIVE_DATA_PATH
      );
      const dataDrive =
        dataDriveIdx !== undefined
          ? nodeTree?.contains![dataDriveIdx]
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
        dispatch(updateBatchUploadProgress({ batchUid, progress: 0 }));

        dispatch(
          addItemsToUploadQueue({
            items: [
              {
                nodeUuid: currentObjectId!,
                path: placeHolder.path!,
                batchUid,
              },
            ],
          })
        );
        dispatch(setShowUploadPanel(true));
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
              dispatch(
                updateBatchUploadProgress({ batchUid, progress: passedPerc })
              );
            }
          );
        if (rootDataCid) {
          setPrivCidMap({ ...privCidMap, [rootDataCid]: true });
          dispatch(updateBatchUploadProgress({ batchUid, progress: 100 }));
        }
        dispatch(removeBatchFromUploadQueue({ batchUid }));
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
        //handle case of node switched mid upload

        resetAccessStatus(nodeTree!);
      } catch (e: any) {
        console.log(e);
        dispatch(updateBatchUploadProgress({ batchUid, progress: -1 }));
        dispatch(removeBatchFromUploadQueue({ batchUid }));

        if (placeHolder) placeHolder.accessStatus = AccessStatus.FAILED;

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
    [nodeTree, currentObjectId, manifestData]
  );

  const handleUpdate = useCallback(
    async (
      files: FileList | FileSystemEntry[],
      updateContext: UpdateDataContext,
      errorHandle: (err: any) => void
    ) => {
      if (!nodeTree) return;
      const updateQueued = uploadQueue.some(
        (queuedItem) =>
          // queuedItem.uploadQueueType &&
          // queuedItem.uploadQueueType === UploadQueuedItemType.UPDATE_DATASET &&
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
      const oldDatasetRootCid = findRootComponentCid(currentDrive!); //moved
      const splitCxtPath = currentDrive!.path!.split("/");
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
          type: p.isDirectory ? FileType.DIR : FileType.FILE,
          path: cxtPath + p.path,
          uid: uid,
        };
        return placeholder;
      });
      const snapshotDirUid = currentDrive!.uid;

      console.log("[DRIVE UPDATE] placeholders: ", placeholders);
      const batchUid = Date.now().toString();
      const qItems = placeholders.map((ph) => {
        return {
          path: ph.path!,
          batchUid,
          nodeUuid: currentObjectId!,
        };
      });
      dispatch(updateBatchUploadProgress({ batchUid, progress: 0 }));
      dispatch(addItemsToUploadQueue({ items: qItems }));
      dispatch(setShowUploadPanel(true));
      const snapshotNodeUuid = currentObjectId!;
      try {
        // const { manifest, rootDataCid, manifestCid, tree, date } =
        //   await updateDatasetComponent(
        //     currentObjectId!,
        //     files,
        //     manifestData!,
        //     updateContext.path,
        //     (e) => {
        //       const perc = Math.ceil((e.loaded / e.total) * 100);
        //       const passedPerc = perc < 90 ? perc : 90;
        //       dispatch(
        //         updateBatchUploadProgress({ batchUid, progress: passedPerc })
        //       );
        //     }
        //   );
        const rootDataCid = "delete";
        const manifest = {} as any;
        const tree = [] as any;
        const date = "delete";
        const manifestCid = "delete";
        dispatch(removeBatchFromUploadQueue({ batchUid }));
        if (rootDataCid) {
          setPrivCidMap({ ...privCidMap, [rootDataCid]: true });
          dispatch(updateBatchUploadProgress({ batchUid, progress: 100 }));
        }

        const dataDriveIdx = nodeTree?.contains?.findIndex(
          (d) => d.name === "Data"
        );
        const dataDrive =
          dataDriveIdx !== undefined
            ? nodeTree?.contains![dataDriveIdx]
            : undefined;
        if (dataDrive) {
          const datasetIndex = dataDrive.contains?.findIndex(
            (ds) => ds.cid === oldDatasetRootCid
          );
          if (datasetIndex !== -1) {
            const dataComp = dataDrive.contains![datasetIndex!];
            const newPath = DRIVE_DATA_PATH + "/" + rootDataCid;

            // save already asigned UIDs
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

            currentDrive!.contains!.forEach((item) => {
              const splitPath = item.path!.split("/");
              splitPath[0] = rootDataCid;
              item.path = splitPath.join("/");
            });
            fillOuterSizes(dataDrive);
            // debugger;
            if (currentDrive!.uid === snapshotDirUid) {
              const pathSplit = currentDrive!.path?.split("/");
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
        placeholders.forEach((ph) => (ph.accessStatus = AccessStatus.PRIVATE));

        console.log(
          `snapshotUuid: ${snapshotNodeUuid} currentObjId: ${currentObjectId!}`
        );
        if (snapshotNodeUuid === currentObjectId!) {
          dispatch(setManifestData({ manifest, cid: manifestCid }));
        }
        resetAccessStatus(nodeTree!);
      } catch (e: any) {
        console.log(e);
        dispatch(removeBatchFromUploadQueue({ batchUid }));
        dispatch(updateBatchUploadProgress({ batchUid, progress: -1 }));

        placeholders.forEach((ph) => (ph.accessStatus = AccessStatus.FAILED));

        __log("PaneDrive::handleUpdate", files, updateContext, e);
        errorHandle(e);
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      nodeTree,
      currentObjectId,
      setManifestData,
      setManifestCid,
      manifestData,
      uploadQueue,
    ]
  );

  const directoryRef = useRef<DriveObject[]>();
  useEffect(() => {
    directoryRef.current = currentDrive?.contains;
  }, [currentDrive?.contains]);

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

    try {
      let isUpdate = false;
      // debugger;
      const updateContext: UpdateDataContext = { path: "", rootCid: "" };
      if (droppedFileList || droppedTransferItemList) {
        if (droppedFileList) {
          if (droppedFileList instanceof FileList) {
            //   if (isUpdate) {
            //     handleUpdate(droppedFileList, updateContext, errorHandle);
            //   } else {
            //     handleUpload(droppedFileList, errorHandle);
            //   }
            dispatch(addFilesToDrive({ files: droppedFileList }));
          }
        }

        if (droppedTransferItemList) {
          dispatch(addFilesToDrive({ files: droppedTransferItemList }));

          // if (isUpdate) {
          //   handleUpdate(droppedTransferItemList, updateContext, errorHandle);
          // } else {
          //   handleUpload(droppedTransferItemList, errorHandle);
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
        if (nodeTree) {
          const pathUidMap = generateFlatPathUidMap(nodeTree);
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
        if (currentDrive?.contains?.length) {
          const dirUid = currentDrive.uid;
          if (dirUid)
            sessionStorage.setItem(
              SessionStorageKeys.lastDirUid,
              JSON.stringify(dirUid)
            );
        }
        componentUnmounting.current = false;
      }
    };
  }, [nodeTree, currentObjectId]);

  return (
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
              // setOldComponentMetadata={setOldComponentMetadata}
              // directory={directory}
              // setDirectory={setDirectory}
              // setShowEditMetadata={setShowEditMetadata}
              // datasetMetadataInfoRef={datasetMetadataInfoRef}
              // setMetaStaging={setMetaStaging}
              // showEditMetadata={showEditMetadata}
              breadCrumbs={breadCrumbs}
              setBreadCrumbs={setBreadCrumbs}
              // renameComponentId={renameComponentId}
              // setRenameComponentId={setRenameComponentId}
            />
          </div>
        </PerfectScrollbar>

        {/* <DriveDatasetMetadataPopOver
            currentObjectId={currentObjectId!}
            manifestData={manifestData!}
            mode={mode}
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
          /> */}
        {/* <ComponentMetadataPopover
            currentObjectId={currentObjectId!}
            manifestData={manifestData!}
            mode={mode}
            componentId={OldComponentMetadata?.componentId!}
            isVisible={!!OldComponentMetadata}
            onClose={() => {
              if (OldComponentMetadata) OldComponentMetadata.cb();
              setOldComponentMetadata(null);
            }}
          /> */}
        <SidePanelStorage />
      </div>
    </ContextMenuProvider>
  );
};
export default PaneDrive;

export function useDriveUpdater() {
  const context = useContext(nodeDriveSetContext);
  if (!context)
    throw Error("Cannot access Drive Provider outside of <PaneDrive>");
  return context;
}
