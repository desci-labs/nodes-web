import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getDatasetTree, updateDatasetComponent } from "@src/api";
import {
  AccessStatus,
  DriveNonComponentTypes,
  DriveObject,
  FileType,
} from "@src/components/organisms/Drive";
import { RequestStatus, RootState } from "@src/store";
import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import {
  createVirtualDrive,
  DEFAULT_CID_PENDING,
  DRIVE_NODE_ROOT_PATH,
  formatDbDate,
  getAllTrees,
  ipfsTreeToDriveTree,
  manifestToVirtualDrives,
  SessionStorageKeys,
} from "@src/components/driveUtils";
import {
  cidString,
  convertIpfsTreeToDriveObjectTree,
  deleteAllParents,
  driveBfsByPath,
  DRIVE_EXTERNAL_LINKS_PATH,
  extractComponentMetadata,
  generateCidCompMap,
} from "./utils";
import {
  AddFilesToDrivePayload,
  AddItemsToUploadQueueAction,
  NavigateToDriveByPathAction,
  removeBatchFromUploadQueueAction,
  UpdateBatchUploadProgressAction,
  UploadQueueItem,
} from "./types";
import { reactRouterV6Instrumentation } from "@sentry/react";
import { __log } from "@src/components/utils";
interface DriveState {
  nodeTree: DriveObject | null;
  status: RequestStatus;
  error: null | undefined | string;
  currentDrive: DriveObject | null;
  uploadStatus: RequestStatus;
  uploadQueue: UploadQueueItem[];
  batchUploadProgress: Record<string, number>;
  showUploadPanel: boolean;
}

const initialState: DriveState = {
  nodeTree: null,
  status: "idle",
  error: null,
  currentDrive: null,
  uploadStatus: "idle", //remove
  uploadQueue: [],
  batchUploadProgress: {},
  showUploadPanel: false,
};

export const driveSlice = createSlice({
  name: "drive",
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
    navigateToDriveByPath: (state, action: NavigateToDriveByPathAction) => {
      if (state.status !== "succeeded" || !state.nodeTree) return;
      const { path } = action.payload;

      let driveFound = driveBfsByPath(state.nodeTree!, path);
      if (driveFound && driveFound.type === FileType.File) {
        const pathSplit = path.split("/");
        pathSplit.pop();
        const parentPath = pathSplit.join("/");
        driveFound = driveBfsByPath(state.nodeTree!, parentPath);
      }
      if (!driveFound) {
        console.error(
          `[DRIVE NAVIGATE] Error: Target Path: ${path} not found in drive tree: ${state.nodeTree}`
        );
        return;
      }
      state.currentDrive = driveFound;
    },
    setShowUploadPanel: (state, action: { payload: boolean }) => {
      state.showUploadPanel = action.payload;
    },
    addItemsToUploadQueue: (state, action: AddItemsToUploadQueueAction) => {
      const { items } = action.payload;
      state.uploadQueue = [...state.uploadQueue, ...items];
    },
    updateBatchUploadProgress: (
      state,
      action: UpdateBatchUploadProgressAction
    ) => {
      const { batchUid, progress } = action.payload;
      state.batchUploadProgress[batchUid] = progress;
    },
    cleanupUploadProgressMap: (state) => {
      const incomplete = Object.entries(state.batchUploadProgress).filter(
        (k, v) => v !== 100
      );
      state.batchUploadProgress = Object.fromEntries(incomplete);
    },
    removeBatchFromUploadQueue: (
      state,
      action: removeBatchFromUploadQueueAction
    ) => {
      const { batchUid } = action.payload;
      state.uploadQueue = state.uploadQueue.filter(
        (item) => item.batchUid !== batchUid
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTreeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        const { tree } = action.payload;
        // debugger;
        if (action.payload.deprecated) {
          state.nodeTree = tree as DriveObject;
          state.currentDrive = tree as DriveObject;
          return;
        }
        const manifest = action.payload.manifest!;
        //Process the IPFS tree into a DriveObject tree
        const root = createVirtualDrive({
          name: "Node Root",
          componentType: ResearchObjectComponentType.DATA_BUCKET,
          path: DRIVE_NODE_ROOT_PATH,
          contains: [],
        });

        //Generate a map of existing components
        const cidToCompMap = generateCidCompMap(manifest);

        //Convert IPFS tree to DriveObject tree
        const driveObjectTree = convertIpfsTreeToDriveObjectTree(
          tree as DriveObject[],
          cidToCompMap
        );
        //Reassign parent to top level
        driveObjectTree.forEach((branch) => (branch.parent = root));
        root.contains = driveObjectTree;

        //Add links
        const externalLinks = createVirtualDrive({
          name: "External Links",
          componentType: ResearchObjectComponentType.LINK,
          path: DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH,
          contains: [],
        });
        manifest.components.forEach((c) => {
          if (c.type === ResearchObjectComponentType.LINK) {
            externalLinks.contains!.push(
              createVirtualDrive({
                name: c.name,
                componentType: ResearchObjectComponentType.LINK,
                cid: c.payload.url,
                type: FileType.File,
                path:
                  DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH + c.id,
                parent: externalLinks,
              })
            );
          }
        });
        if (externalLinks.contains?.length) root.contains?.push(externalLinks);
        state.currentDrive = root;
      })
      .addCase(fetchTreeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch data";
      })
      .addCase(addFilesToDrive.pending, (state) => {
        state.uploadStatus = "loading";
      })
      .addCase(addFilesToDrive.fulfilled, (state) => {
        state.uploadStatus = "succeeded";
        //reset cwd
      })
      .addCase(addFilesToDrive.rejected, (state) => {
        state.uploadStatus = "failed";
      });
  },
});

export const {
  reset,
  navigateToDriveByPath,
  addItemsToUploadQueue,
  updateBatchUploadProgress,
  cleanupUploadProgressMap,
  setShowUploadPanel,
  removeBatchFromUploadQueue,
} = driveSlice.actions;

export interface FetchTreeThunkParams {
  manifest: ResearchObjectV1;
  nodeUuid: string;
}

export const fetchTreeThunk = createAsyncThunk(
  "drive/fetchTree",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId, manifestCid } = state.nodes.nodeReader;
    // debugger;
    //determines if it's a old or new manifest
    const hasDataBucket =
      manifest?.components[0].type === ResearchObjectComponentType.DATA_BUCKET
        ? true
        : manifest?.components.find(
            (c) => c.type === ResearchObjectComponentType.DATA_BUCKET
          );

    if (hasDataBucket) {
      //WIP
      // const { data } = await getDatasetTree(rootCid, currentObjectId!);
      // return data;
      return { tree: {} as DriveObject[], manifest: manifest }; //remove
    } else {
      //fallback to construct deprecated tree
      const root = manifestToVirtualDrives(manifest!, manifestCid, {});

      const lastPathUidMap = JSON.parse(
        sessionStorage.getItem(SessionStorageKeys.pathUidMap)!
      );
      const lastNodeId = JSON.parse(
        sessionStorage.getItem(SessionStorageKeys.lastNodeId)!
      );
      const provideMap =
        lastNodeId === currentObjectId! && lastPathUidMap
          ? lastPathUidMap
          : undefined;

      //options also takes in a public view boolean
      await getAllTrees(root, currentObjectId!, manifest!, {
        pathUidMap: provideMap,
        public: false, //FIXME, HARDCODED
      });

      return { tree: deleteAllParents(root), deprecated: true };
    }
  }
);

export const addFilesToDrive = createAsyncThunk(
  "drive/addFiles",
  async (payload: AddFilesToDrivePayload, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId, manifestCid } = state.nodes.nodeReader;
    const { nodeTree } = state.drive;
    const { files, overwritePathContext } = payload;
    if (!nodeTree || !manifest) return;

    //Transform files to usable data for displaying state (upload panel items, optimistic drives)
    const dirs: Record<string, string> = {};
    const fileInfo = Array.prototype.filter
      .call(files, (f) => {
        const split = f.fullPath.split("/");
        if (split.length === 2) return split;
        if (split.length === 3) {
          dirs[split[1]] = "/" + split[1];
        }
        return false;
      })
      .map((f) => {
        const path = overwritePathContext
          ? overwritePathContext + f.fullPath
          : state.drive.currentDrive!.path + f.fullPath;
        return {
          isDirectory: f.isDirectory,
          name: f.name,
          path: path,
        };
      });
    Object.keys(dirs).forEach((key) =>
      fileInfo.push({ isDirectory: true, name: key, path: dirs[key] })
    );

    const batchUid = Date.now().toString();
    const uploadQueueItems = fileInfo.map((f) => ({
      nodeUuid: currentObjectId!,
      path: f.path,
      batchUid: batchUid,
    }));
    dispatch(setShowUploadPanel(true));
    dispatch(addItemsToUploadQueue({ items: uploadQueueItems }));
    dispatch(updateBatchUploadProgress({ batchUid: batchUid, progress: 0 }));

    const contextPath = overwritePathContext || state.drive.currentDrive!.path;
    const snapshotNodeUuid = currentObjectId!;
    try {
      const { manifest: updatedManifest, rootDataCid, manifestCid, tree, date } =
        await updateDatasetComponent(
          currentObjectId!,
          files,
          manifest
          updateContext.rootCid,
          contextPath,
          (e) => {
            const perc = Math.ceil((e.loaded / e.total) * 100);
            const passedPerc = perc < 90 ? perc : 90;
            dispatch(
              updateBatchUploadProgress({ batchUid, progress: passedPerc })
            );
          }
        );
      dispatch(removeBatchFromUploadQueue({ batchUid }));
      if (rootDataCid) {
        // setPrivCidMap({ ...privCidMap, [rootDataCid]: true }); //later when privCidMap available
        dispatch(updateBatchUploadProgress({ batchUid, progress: 100 }));
      }
    } catch (e) {
      dispatch(removeBatchFromUploadQueue({ batchUid }));
      dispatch(updateBatchUploadProgress({ batchUid, progress: -1 }));
      __log("PaneDrive::handleUpdate", files, e);
    }
    debugger;
  }
);

export default driveSlice.reducer;
