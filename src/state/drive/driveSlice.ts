import {
  ActionCreatorWithPayload,
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getDatasetTree, updateDag } from "@src/api";
import {
  DriveNonComponentTypes,
  DriveObject,
  FileType,
} from "@src/components/organisms/Drive";
import { RequestStatus, RootState } from "@src/store";
import {
  CommonComponentPayload,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import {
  createVirtualDrive,
  DEFAULT_CID_PENDING,
  DRIVE_NODE_ROOT_PATH,
  getAllTrees,
  ipfsTreeToDriveTree,
  manifestToVirtualDrives,
  SessionStorageKeys,
} from "@src/components/driveUtils";
import {
  convertIpfsTreeToDriveObjectTree,
  deleteAllParents,
  driveBfsByPath,
  DRIVE_EXTERNAL_LINKS_PATH,
  generatePathCompMap,
  urlOrCid,
  findDriveByPath,
  generateFlatPathDriveMap,
  generatePathSizeMap,
  constructBreadCrumbs,
} from "./utils";
import {
  AddFilesToDrivePayload,
  AddItemsToUploadQueueAction,
  AssignTypeThunkPayload,
  DrivePath,
  NavigateToDriveByPathAction,
  removeBatchFromUploadQueueAction,
  StarComponentThunkPayload,
  UpdateBatchUploadProgressAction,
  UploadQueueItem,
} from "./types";
import { __log } from "@src/components/utils";
import {
  addComponent,
  addRecentlyAddedComponent,
  saveManifestDraft,
  setManifest,
  setManifestCid,
  updateComponent,
} from "../nodes/viewer";
import { BreadCrumb } from "@src/components/molecules/DriveBreadCrumbs";
import { dispatch } from "react-hot-toast/dist/core/store";
interface DriveState {
  status: RequestStatus;
  error: null | undefined | string;
  nodeTree: DriveObject | null;
  currentDrive: DriveObject | null;
  uploadStatus: RequestStatus;
  uploadQueue: UploadQueueItem[];
  batchUploadProgress: Record<string, number>;
  showUploadPanel: boolean;
  deprecated: boolean | undefined;
  componentTypeBeingAssignedTo: DrivePath | null;
  fileMetadataBeingEdited: DriveObject | null;
  breadCrumbs: BreadCrumb[];
}

const initialState: DriveState = {
  status: "idle",
  error: null,
  nodeTree: null,
  currentDrive: null,
  deprecated: undefined,
  uploadStatus: "idle", //remove
  uploadQueue: [],
  batchUploadProgress: {},
  showUploadPanel: false,
  componentTypeBeingAssignedTo: null,
  fileMetadataBeingEdited: null,
  breadCrumbs: [],
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

      let driveFound = state.deprecated
        ? driveBfsByPath(state.nodeTree!, path)
        : findDriveByPath(state.nodeTree!, path);
      if (driveFound && driveFound.type === FileType.FILE) {
        const pathSplit = path.split("/");
        pathSplit.pop();
        const parentPath = pathSplit.join("/");
        let driveFound = state.deprecated
          ? driveBfsByPath(state.nodeTree!, parentPath)
          : findDriveByPath(state.nodeTree!, parentPath);
      }
      if (!driveFound) {
        console.error(
          `[DRIVE NAVIGATE] Error: Target Path: ${path} not found in drive tree: ${state.nodeTree}`
        );
        return;
      }
      state.breadCrumbs = constructBreadCrumbs(driveFound.path!);
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
    starComponent: (state, { payload }: PayloadAction<{ path: DrivePath }>) => {
      if (!state.currentDrive) return;
      const drive = state.currentDrive.contains!.find(
        (fd: DriveObject) => fd.path === payload.path
      );
      if (!drive) return;
      drive.starred = !drive.starred;
    },
    assignComponentType: (
      state,
      {
        payload,
      }: PayloadAction<{ path: DrivePath; type: ResearchObjectComponentType }>
    ) => {
      if (!state.currentDrive) return;
      const drive = state.currentDrive.contains!.find(
        (fd: DriveObject) => fd.path === payload.path
      );
      if (!drive) return;
      drive.componentType = payload.type;
    },
    setComponentTypeBeingAssignedTo: (
      state,
      { payload }: PayloadAction<DrivePath | null>
    ) => {
      state.componentTypeBeingAssignedTo = payload;
    },
    setFileMetadataBeingEditted: (
      state,
      { payload }: PayloadAction<DriveObject | null>
    ) => {
      state.fileMetadataBeingEdited = payload;
    },
    addBreadCrumb: (state, { payload }: PayloadAction<BreadCrumb>) => {
      state.breadCrumbs.push(payload);
    },
    removeBreadCrumbs: (
      state,
      { payload }: PayloadAction<{ index: number }>
    ) => {
      state.breadCrumbs.splice(0, payload.index + 1);
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
          console.log(
            "[DRIVE]Deprecated node detected. Using old drive format."
          );
          state.deprecated = true;
          state.nodeTree = tree as DriveObject;
          state.currentDrive = tree as DriveObject;
          state.breadCrumbs = [
            { name: "Research Node", drive: state.nodeTree! },
          ];
          return;
        }
        state.deprecated = false;

        const manifest = action.payload.manifest!;
        //Process the IPFS tree into a DriveObject tree
        const root = createVirtualDrive({
          name: "Node Root",
          componentType: ResearchObjectComponentType.DATA_BUCKET,
          path: DRIVE_NODE_ROOT_PATH,
          contains: [],
        });

        //Generate a map of existing components
        const pathToCompMap = generatePathCompMap(manifest);
        const pathToDriveMap = generateFlatPathDriveMap(tree);
        const pathToSizeMap = generatePathSizeMap(pathToDriveMap); //Sources dir sizes

        //Convert IPFS tree to DriveObject tree
        const driveObjectTree = convertIpfsTreeToDriveObjectTree(
          tree as DriveObject[],
          pathToCompMap,
          pathToSizeMap
        );
        root.contains = driveObjectTree;

        //Add links
        const externalLinks = createVirtualDrive({
          name: "External Links",
          componentType: ResearchObjectComponentType.LINK,
          path: DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH,
          contains: [],
        });
        manifest.components.forEach((c: ResearchObjectV1Component) => {
          if (c.type === ResearchObjectComponentType.LINK) {
            externalLinks.contains!.push(
              createVirtualDrive({
                name: c.name,
                componentType: ResearchObjectComponentType.LINK,
                cid: c.payload.url,
                type: FileType.FILE,
                path:
                  DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH + c.id,
                parent: externalLinks,
              })
            );
          }
        });
        if (externalLinks.contains?.length) root.contains?.push(externalLinks);
        state.nodeTree = root;
        state.breadCrumbs = [{ name: "Research Node", drive: state.nodeTree }];

        const driveFound = state.deprecated
          ? driveBfsByPath(state.nodeTree!, state.currentDrive?.path!)
          : findDriveByPath(state.nodeTree!, state.currentDrive?.path!);
        if (driveFound) {
          state.currentDrive = driveFound;
        }
        if (!state.currentDrive) {
          state.currentDrive = root;
        }
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
  starComponent,
  assignComponentType,
  setComponentTypeBeingAssignedTo,
  setFileMetadataBeingEditted,
  removeBreadCrumbs,
  addBreadCrumb,
} = driveSlice.actions;

export interface FetchTreeThunkParams {
  manifest: ResearchObjectV1;
  nodeUuid: string;
}

export const fetchTreeThunk = createAsyncThunk(
  "drive/fetchTree",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId, manifestCid, publicView, shareId } =
      state.nodes.nodeReader;

    //determines if it's a old or new manifest
    // debugger;
    const hasDataBucket =
      manifest?.components[0].type === ResearchObjectComponentType.DATA_BUCKET
        ? manifest.components[0]
        : manifest?.components.find(
            (c: ResearchObjectV1Component) =>
              c.type === ResearchObjectComponentType.DATA_BUCKET
          );

    if (hasDataBucket) {
      const rootCid = hasDataBucket.payload.cid;
      const { tree } = await getDatasetTree(
        rootCid,
        currentObjectId!,
        publicView,
        shareId
      );
      return { tree, manifest };
    } else {
      //fallback to construct deprecated tree
      const rootDrive = manifestToVirtualDrives(manifest!, manifestCid);

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
      await getAllTrees(
        rootDrive,
        currentObjectId!,
        manifest!,
        {
          pathUidMap: provideMap,
          public: publicView,
        },
        shareId
      );
      return { tree: deleteAllParents(rootDrive), deprecated: true };
    }
  }
);

export const addFilesToDrive = createAsyncThunk(
  "drive/addFiles",
  async (payload: AddFilesToDrivePayload, { getState, dispatch }) => {
    // debugger;
    const state = getState() as RootState;
    const { manifest, currentObjectId } = state.nodes.nodeReader;
    const { nodeTree } = state.drive;
    const {
      files,
      overwritePathContext,
      externalCids,
      componentType,
      componentSubType,
      onSuccess,
    } = payload;
    if (!nodeTree || !manifest) return;

    //Transform files to usable data for displaying state (upload panel items, optimistic drives)
    const dirs: Record<string, string> = {};
    const fileInfo = Array.prototype.filter
      .call(files, (f) => {
        if (!("fullPath" in f)) f.fullPath = "/" + f.name;
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

    const contextPath = overwritePathContext || state.drive.currentDrive!.path!;
    const snapshotNodeUuid = currentObjectId!;
    try {
      const {
        manifest: updatedManifest,
        rootDataCid,
        manifestCid,
        tree,
        date,
      } = await updateDag({
        uuid: currentObjectId!,
        files,
        manifest,
        contextPath,
        externalCids,
        componentType,
        componentSubType,
        onProgress: (e) => {
          const perc = Math.ceil((e.loaded / e.total) * 100);
          const passedPerc = perc < 90 ? perc : 90;
          dispatch(
            updateBatchUploadProgress({ batchUid, progress: passedPerc })
          );
        },
      });
      if (onSuccess) onSuccess(updatedManifest);
      dispatch(removeBatchFromUploadQueue({ batchUid }));
      if (rootDataCid && updatedManifest && manifestCid) {
        const latestState = getState() as RootState;
        if (snapshotNodeUuid === latestState.nodes.nodeReader.currentObjectId) {
          dispatch(updateBatchUploadProgress({ batchUid, progress: 100 }));
          dispatch(setManifest(updatedManifest));
          dispatch(setManifestCid(manifestCid));
          dispatch(fetchTreeThunk());
        }
      }
    } catch (e) {
      dispatch(removeBatchFromUploadQueue({ batchUid }));
      dispatch(updateBatchUploadProgress({ batchUid, progress: -1 }));
      __log("PaneDrive::handleUpdate", files, e);
    }
    // debugger;
  }
);

export const starComponentThunk = createAsyncThunk(
  `drive/starComponent`,
  async (payload: StarComponentThunkPayload, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { manifest } = state.nodes.nodeReader;
    const { deprecated } = state.drive;
    const { item } = payload;

    //Deprecated starring unhandled, temporarily disabled to prevent errors
    if (!manifest || deprecated) return;

    dispatch(starComponent({ path: item.path! }));
    dispatch(addRecentlyAddedComponent(item.path!));

    const starCompIdx = manifest.components.findIndex(
      (c: ResearchObjectV1Component) => c.payload.path === item.path
    );

    // debugger;
    if (starCompIdx !== -1) {
      dispatch(
        updateComponent({
          index: starCompIdx,
          update: { starred: !item.starred },
        })
      );
    } else {
      const newComponent: ResearchObjectV1Component = {
        id: uuidv4(),
        name: item.name,
        type: ResearchObjectComponentType.UNKNOWN,
        payload: {
          path: item.path,
          cid: item.cid,
        },
        starred: true,
      };
      dispatch(addComponent({ component: newComponent }));
    }
    dispatch(saveManifestDraft({ onSucess: () => dispatch(fetchTreeThunk()) }));
  }
);

export const assignTypeThunk = createAsyncThunk(
  `drive/assignType`,
  async (payload: AssignTypeThunkPayload, { getState, dispatch }) => {
    dispatch(setComponentTypeBeingAssignedTo(null));
    const state = getState() as RootState;
    const { manifest } = state.nodes.nodeReader;
    const { deprecated } = state.drive;
    const { item, type, subType } = payload;

    //Deprecated type assignment unhandled, temporarily disabled to prevent errors
    if (!manifest || deprecated) return;

    dispatch(assignComponentType({ path: item.path!, type: type }));

    const existingCompIdx = manifest.components.findIndex(
      (c: ResearchObjectV1Component) => c.payload.path === item.path!
    );

    const urlOrCidProps = urlOrCid(item.cid, type);
    if (existingCompIdx !== -1) {
      dispatch(
        updateComponent({
          index: existingCompIdx,
          update: {
            type,
            ...(subType ? { subType } : {}),
            payload: { ...urlOrCidProps },
          },
        })
      );
    } else {
      const newComponent: ResearchObjectV1Component = {
        id: uuidv4(),
        name: item.name,
        type: type,
        ...(subType ? { subType } : {}),
        payload: {
          path: item.path,
          ...urlOrCidProps,
        },
        starred: false,
      };
      dispatch(addComponent({ component: newComponent }));
    }
    dispatch(saveManifestDraft({ onSucess: () => dispatch(fetchTreeThunk()) }));
  }
);

export default driveSlice.reducer;
