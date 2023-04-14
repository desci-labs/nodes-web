import DropTargetFullScreen from "@components/atoms/DropTargetFullScreen";
import SpacerHorizontal from "@components/atoms/SpacerHorizontal";
import {
  generateFlatPathUidMap,
  SessionStorageKeys,
} from "@components/driveUtils";
import SidePanelStorage from "@components/molecules/SidePanelStorage";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { __log } from "@components/utils";
import {
  DataComponentMetadata,
  ResearchObjectComponentType,
} from "@desci-labs/desci-models";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import DriveTable, { DriveObject, oldComponentMetadata } from "./Drive";
import toast from "react-hot-toast";
import ComponentMetadataPopover from "./PopOver/ComponentMetadataPopover";
import ContextMenuProvider from "./Drive/ContextMenu/provider";
import LoaderDrive from "../molecules/LoaderDrive";
import { useNodeReader } from "@src/state/nodes/hooks";
import { useSetter } from "@src/store/accessors";
import { useDrive } from "@src/state/drive/hooks";
import {
  addFilesToDrive,
  fetchTreeThunk,
  setFileMetadataBeingEdited,
} from "@src/state/drive/driveSlice";
import DriveDatasetMetadataPopOver, {
  DATASET_METADATA_FORM_DEFAULTS,
} from "../molecules/DriveDatasetMetadataPopOver";
import { BreadCrumb } from "@src/state/drive/types";

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
  } = useManuscriptController(["droppedFileList", "droppedTransferItemList"]);
  const dispatch = useSetter();
  const { isDraggingFiles, currentObjectId } = useNodeReader();

  const [showEditMetadata, setShowEditMetadata] = useState<boolean>(false);
  const [metaStaging, setMetaStaging] = useState<MetaStaging[]>([]);
  const datasetMetadataInfoRef = useRef<DatasetMetadataInfo>(
    datasetMetadataInfoRefDefaults
  );

  const [OldComponentMetadata, setOldComponentMetadata] =
    useState<oldComponentMetadata | null>(null); //temporary fallback for old metadata used for documents and code

  const { nodeTree, status, currentDrive, fileMetadataBeingEdited } =
    useDrive();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loading) setLoading(false);
  }, [loading]);

  useEffect(() => {
    if (!nodeTree && status === "idle") {
      dispatch(fetchTreeThunk());
    }
  }, [nodeTree]);

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
      if (droppedFileList || droppedTransferItemList) {
        if (droppedFileList) {
          if (droppedFileList instanceof FileList) {
            dispatch(addFilesToDrive({ files: droppedFileList }));
          }
        }
        if (droppedTransferItemList) {
          dispatch(addFilesToDrive({ files: droppedTransferItemList }));
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
    directoryRef,
  ]);

  const componentUnmounting = useRef<boolean>(false);
  useEffect(() => {
    return () => {
      componentUnmounting.current = true;
    };
  }, []);

  //Maybe neccessary for deprecated tree
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
              setShowEditMetadata={setShowEditMetadata}
              datasetMetadataInfoRef={datasetMetadataInfoRef}
              setOldComponentMetadata={setOldComponentMetadata}
              setMetaStaging={setMetaStaging}
              showEditMetadata={showEditMetadata}
              setLoading={setLoading}
            />
          </div>
        </PerfectScrollbar>
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
