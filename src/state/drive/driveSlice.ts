import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  current,
} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  getDatasetTree,
  moveData,
  updateDag,
  updateDagExternalCid,
} from "@src/api";
import {
  AccessStatus,
  DriveObject,
  FileType,
} from "@src/components/organisms/Drive";
import { RequestStatus, RootState } from "@src/store";
import {
  ExternalLinkComponent,
  ResearchObjectComponentLinkSubtype,
  ResearchObjectComponentSubtypes,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";
import {
  createStubTreeNode,
  createVirtualDrive,
  DRIVE_NODE_ROOT_PATH,
  getAllTrees,
  manifestToVirtualDrives,
  navigateWithStubs,
  SessionStorageKeys,
} from "@src/components/driveUtils";
import {
  driveBfsByPath,
  DRIVE_EXTERNAL_LINKS_PATH,
  urlOrCid,
  findDriveByPath,
  constructBreadCrumbs,
  bfsDriveSearch,
  getComponentCid,
  findUniqueName,
  GENERIC_NEW_FOLDER_NAME,
  CID_PENDING,
  defaultSort,
  GENERIC_NEW_LINK_NAME,
  DRIVE_FULL_EXTERNAL_LINKS_PATH,
  transformTree,
} from "./utils";
import {
  AddFilesToDrivePayload,
  AddItemsToUploadQueueAction,
  AssignTypeThunkPayload,
  BreadCrumb,
  DrivePath,
  MoveFilesThunkPayload,
  NavigateFetchThunkPayload,
  NavigateToDriveByPathAction,
  removeBatchFromUploadQueueAction,
  StarComponentThunkPayload,
  UpdateBatchUploadProgressAction,
  UploadQueueItem,
  UploadTypes,
} from "./types";
import { __log, arrayXor } from "@src/components/utils";
import {
  addComponent,
  addRecentlyAddedComponent,
  saveManifestDraft,
  setManifest,
  setManifestCid,
  updateComponent,
} from "../nodes/nodeReader";
import toast from "react-hot-toast";

export interface DriveState {
  status: RequestStatus;
  error: null | undefined | string;
  nodeTree: DriveObject | null;
  currentDrive: DriveObject | null;
  uploadStatus: RequestStatus;
  uploadQueue: UploadQueueItem[];
  batchUploadProgress: Record<string, number>;
  showUploadPanel: boolean;
  driveLoading: boolean;
  deprecated: boolean | undefined;
  componentTypeBeingAssignedTo: DrivePath | null;
  fileMetadataBeingEdited: DriveObject | null;
  fileBeingUsed: DriveObject | null;
  fileBeingCited: DriveObject | null;
  fileBeingRenamed: DriveObject | null;
  breadCrumbs: BreadCrumb[];
  sortingFunction: (a: DriveObject, b: DriveObject) => number;
  selected: Record<DrivePath, ResearchObjectComponentType>;

  // drive picker state
  currentDrivePicker: DriveObject | null;
  breadCrumbsPicker: BreadCrumb[];
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
  driveLoading: true,
  componentTypeBeingAssignedTo: null,
  fileMetadataBeingEdited: null,
  fileBeingRenamed: null,
  fileBeingUsed: null,
  fileBeingCited: null,
  breadCrumbs: [],
  breadCrumbsPicker: [],
  currentDrivePicker: null,
  sortingFunction: defaultSort,
  selected: {},
};

export type DriveKey = "" | "Picker";

const navigateToDriveGeneric =
  (key: DriveKey) =>
  (state: DriveState, action: NavigateToDriveByPathAction) => {
    const keyBreadcrumbs:
      | "breadCrumbs"
      | "breadCrumbsPicker" = `breadCrumbs${key}`;
    const keyCurrentDrive:
      | "currentDrive"
      | "currentDrivePicker" = `currentDrive${key}`;
    if (state.status !== "succeeded" || !state.nodeTree!) return;
    // // prep for jump
    // navigateWithStubs(createStubTreeNode(action.payload.path), state.nodeTree!);
    const { path, selectPath } = action.payload;
    let fileSelectionType: ResearchObjectComponentType | undefined;
    let driveFound = state.deprecated
      ? driveBfsByPath(state.nodeTree!, path)
      : findDriveByPath(state.nodeTree!!, path);
    if (driveFound)
      fileSelectionType =
        driveFound.componentType as ResearchObjectComponentType;
    if (driveFound && driveFound.type === FileType.FILE) {
      const pathSplit = path.split("/");
      pathSplit.pop();
      const parentPath = pathSplit.join("/");
      driveFound = state.deprecated
        ? driveBfsByPath(state.nodeTree!!, parentPath)
        : findDriveByPath(state.nodeTree!!, parentPath);
    }
    if (!driveFound) {
      console.error(
        `[DRIVE NAVIGATE] Error: Target Path: ${path} not found in drive tree: ${state.nodeTree!}`
      );
      return;
    }

    state.selected =
      selectPath && fileSelectionType ? { [path]: fileSelectionType } : {};

    state[keyBreadcrumbs] = constructBreadCrumbs(driveFound.path!);
    driveFound.contains?.sort(state.sortingFunction);
    state[keyCurrentDrive] = driveFound;
  };

export const driveSlice = createSlice({
  name: "drive",
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
    navigateToDriveByPath: navigateToDriveGeneric(""),
    navigateToDrivePickerByPath: navigateToDriveGeneric("Picker"),
    setDriveLoading: (state, action: { payload: boolean }) => {
      state.driveLoading = action.payload;
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
    setFileMetadataBeingEdited: (
      state,
      { payload }: PayloadAction<DriveObject | null>
    ) => {
      state.fileMetadataBeingEdited = payload;
    },
    setFileBeingUsed: (
      state,
      { payload }: PayloadAction<DriveObject | null>
    ) => {
      state.fileBeingUsed = payload;
    },
    setFileBeingRenamed: (
      state,
      { payload }: PayloadAction<DriveObject | null>
    ) => {
      state.fileBeingRenamed = payload;
    },
    setFileBeingCited: (
      state,
      { payload }: PayloadAction<DriveObject | null>
    ) => {
      state.fileBeingCited = payload;
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
    /*Only use this if you don't have direct access to the DriveObject but have access to the component, otherwise favor setFileMetadataBeingEdited */
    showMetadataForComponent: (
      state,
      { payload }: PayloadAction<ResearchObjectV1Component>
    ) => {
      const component = payload;
      let driveFound;
      if (!state.deprecated) {
        driveFound = findDriveByPath(state.nodeTree!, component.payload.path);
      } else {
        driveFound = bfsDriveSearch(state.nodeTree!, {
          cid: getComponentCid(component),
          componentType: component.type,
        });
      }
      if (!driveFound) {
        console.error(
          `[DRIVE SHOW METADATA] Error: Component: ${component} not found in drive tree: ${state.nodeTree}`
        );
        return;
      }
      state.fileMetadataBeingEdited = driveFound;
    },
    removeFileFromCurrentDrive: (
      state,
      { payload }: PayloadAction<{ where: Partial<DriveObject> }>
    ) => {
      if (!state.currentDrive) return;
      state.currentDrive.contains = state.currentDrive.contains?.filter(
        (fd: DriveObject) =>
          Object.entries(payload.where).every(
            ([key, value]) => fd[key as keyof DriveObject] !== value
          )
      );
    },
    renameFileInCurrentDrive: (
      state,
      { payload }: PayloadAction<{ filePath: string; newName: string }>
    ) => {
      const file = state.currentDrive?.contains?.find(
        (f) => f.path === payload.filePath
      );
      if (file) {
        file.name = payload.newName;
        const oldPathSplit = file.path?.split("/");
        oldPathSplit?.pop();
        oldPathSplit?.push(payload.newName);
        file.path = oldPathSplit?.join("/");
      }
    },
    optimisticAddFileToCurrentDrive: (
      state,
      { payload }: PayloadAction<DriveObject>
    ) => {
      state.currentDrive?.contains?.push(payload);
      state.currentDrive?.contains?.sort(state.sortingFunction);
    },
    toggleSelectFileInCurrentDrive: (
      state,
      {
        payload,
      }: PayloadAction<{
        path: string;
        componentType: ResearchObjectComponentType;
      }>
    ) => {
      if (payload.path in state.selected) delete state.selected[payload.path];
      else state.selected[payload.path] = payload.componentType;
    },
    resetSelected: (state) => {
      state.selected = {};
    },
    mutateTreeForNavigation: (
      state,
      { payload }: PayloadAction<DriveObject>
    ) => {
      const tree = payload;
      // const newNodeTree = navigateWithStubs(tree, state.nodeTree!);
      const splitPath = tree.path!.split("/");
      let curPath = "";

      let curObject = state.nodeTree!;
      if (splitPath!.length <= 1) {
        return;
      } else {
        // add this subtree to the tree
        let curFolder = splitPath?.shift();
        curPath += curFolder;
        while (splitPath!.length) {
          curFolder = splitPath?.shift();
          curPath += "/" + curFolder;

          const nextFolder = curObject!.contains!.find(
            (d) => d.name === curFolder
          );
          let newObject: DriveObject = createStubTreeNode(curPath);

          if (!nextFolder) {
            // create stub folder for this path
            if (splitPath!.length === 0) {
              newObject = tree;
            }
            if (newObject.type === FileType.FILE) {
              curObject.contains = newObject.contains;
            } else {
              curObject.contains = [newObject];
            }

            curObject = newObject;
          } else {
            if (splitPath!.length === 0) {
              newObject = tree;
              nextFolder.contains = newObject.contains;
            }
            curObject = nextFolder;
            console.log("nextFolder", JSON.stringify(nextFolder));
          }
        }
      }
    },
    clearCachedTree: (state, { payload }: PayloadAction<{ path: string }>) => {
      let node = findDriveByPath(state.nodeTree!, payload.path);
      console.log("nodeTree:", current(state.nodeTree));
      // make sure node being cleared is always a dir
      if (node?.type === FileType.FILE)
        node = findDriveByPath(
          state.nodeTree!,
          payload.path.substring(0, payload.path.lastIndexOf("/"))
        );

      if (!node) {
        console.warn("Failed to clear cache tree", payload.path);
        return;
      }

      node.contains = [];
      node.cid = "stub";

      console.log("cleared cache for path", payload.path);
      console.log("nodeTree after:", current(state.nodeTree));
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
        if (action.payload.deprecated) {
          console.log(
            "[DRIVE]Deprecated node detected. Using old drive format."
          );
          state.deprecated = true;
          tree.sort(state.sortingFunction) as DriveObject;
          state.nodeTree = tree as DriveObject;
          state.currentDrive = tree as DriveObject;

          state.currentDrivePicker = tree as DriveObject;

          if (!state.breadCrumbsPicker.length) {
            state.breadCrumbsPicker = [
              { name: "Research Node", path: state.nodeTree.path! },
            ];
          }

          if (!state.breadCrumbs.length) {
            state.breadCrumbs = [
              { name: "Research Node", path: state.nodeTree.path! },
            ];
          }
          return;
        }

        const manifest: ResearchObjectV1 = action.payload.manifest!;
        //Process the IPFS tree into a DriveObject tree
        const root = transformTree(tree)[0] as DriveObject;

        //Add links
        const externalLinks = createVirtualDrive({
          name: "External Links",
          componentType: ResearchObjectComponentType.LINK,
          componentId: "external-links",
          path: DRIVE_NODE_ROOT_PATH + "/" + DRIVE_EXTERNAL_LINKS_PATH,
          contains: [],
        });
        manifest.components.forEach((c: ResearchObjectV1Component) => {
          if (c.type === ResearchObjectComponentType.LINK) {
            const subtype =
              "subtype" in c
                ? (c["subtype"] as ResearchObjectComponentSubtypes)
                : undefined;
            externalLinks.contains!.push(
              createVirtualDrive({
                name: c.name,
                componentId: c.id,
                componentType: ResearchObjectComponentType.LINK,
                componentSubtype: subtype,
                cid: c.payload.url || c.payload.cid,
                type: FileType.FILE,
                contains: undefined,
                starred: c.starred,
                path: [
                  DRIVE_NODE_ROOT_PATH,
                  DRIVE_EXTERNAL_LINKS_PATH,
                  c.name,
                ].join("/"),
              })
            );
          }
        });
        if (externalLinks.contains?.length) root.contains?.push(externalLinks);
        if (root.path!.split("/").length <= 1) {
          state.nodeTree = root;
        } else {
          state.nodeTree = navigateWithStubs(root, state.nodeTree!);
        }

        if (!state.nodeTree) {
          throw new Error("Node tree not set!");
        }

        if (!state.breadCrumbsPicker.length) {
          state.breadCrumbsPicker = [
            { name: "Research Node", path: state.nodeTree.path! },
          ];
        }

        if (!state.breadCrumbs.length) {
          state.breadCrumbs = [
            { name: "Research Node", path: state.nodeTree.path! },
          ];
        }

        //Reset current non stale drive
        const driveFound = state.deprecated
          ? driveBfsByPath(state.nodeTree!, state.currentDrive?.path!)
          : findDriveByPath(state.nodeTree!, state.currentDrive?.path!);
        if (driveFound) {
          driveFound.contains?.sort(state.sortingFunction);
          state.currentDrive = driveFound;
        }

        root.contains?.sort(state.sortingFunction);
        if (!state.currentDrive) {
          state.currentDrive = root;
        }

        if (!state.currentDrivePicker) {
          state.currentDrivePicker = root;
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
      })
      .addCase(addFilesToDrive.rejected, (state) => {
        state.uploadStatus = "failed";
      });
  },
});

export const {
  clearCachedTree,
  reset,
  navigateToDriveByPath,
  mutateTreeForNavigation,
  navigateToDrivePickerByPath,
  addItemsToUploadQueue,
  updateBatchUploadProgress,
  cleanupUploadProgressMap,
  setDriveLoading,
  setShowUploadPanel,
  removeBatchFromUploadQueue,
  starComponent,
  assignComponentType,
  setComponentTypeBeingAssignedTo,
  setFileMetadataBeingEdited,
  removeBreadCrumbs,
  addBreadCrumb,
  showMetadataForComponent,
  setFileBeingUsed,
  setFileBeingCited,
  removeFileFromCurrentDrive,
  setFileBeingRenamed,
  renameFileInCurrentDrive,
  optimisticAddFileToCurrentDrive,
  toggleSelectFileInCurrentDrive,
  resetSelected,
} = driveSlice.actions;

export interface FetchTreeThunkParams {
  manifest: ResearchObjectV1;
  nodeUuid: string;
}

export const addExternalLinkThunk = createAsyncThunk(
  "drive/addExternalLink",
  async (
    payload: {
      name: string;
      url: string;
      subtype: ResearchObjectComponentLinkSubtype;
    },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;

    const { name, url, subtype } = payload;
    const externalLinksDrive = findDriveByPath(
      state.drive.nodeTree!,
      DRIVE_FULL_EXTERNAL_LINKS_PATH
    );
    const collisionArray =
      externalLinksDrive?.contains?.map((f) => f.name) || [];

    const uniqueName = name
      ? findUniqueName(name, collisionArray)
      : findUniqueName(GENERIC_NEW_LINK_NAME, collisionArray);
    const newComponent: ExternalLinkComponent = {
      id: uuidv4(),
      name: uniqueName,
      type: ResearchObjectComponentType.LINK,
      subtype,
      payload: {
        url,
        path: DRIVE_FULL_EXTERNAL_LINKS_PATH + "/" + uniqueName,
      },
      starred: true,
    };
    dispatch(addComponent({ component: newComponent }));
    dispatch(
      saveManifestDraft({
        onSucess: () => dispatch(fetchTreeThunk()),
      })
    );
  }
);

export const fetchTreeThunk = createAsyncThunk(
  "drive/fetchTree",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId, manifestCid, publicView, shareId } =
      state.nodes.nodeReader;
    //determines if it's a old or new manifest
    const hasDataBucket =
      manifest?.components[0].type === ResearchObjectComponentType.DATA_BUCKET
        ? manifest.components[0]
        : manifest?.components.find(
            (c: ResearchObjectV1Component) =>
              c.type === ResearchObjectComponentType.DATA_BUCKET
          );
    if (hasDataBucket) {
      try {
        dispatch(setDriveLoading(true));
        const { tree } = await getDatasetTree({
          manifestCid,
          nodeUuid: currentObjectId!,
          pub: publicView, //  state.nodes.nodeReader.mode === "reader", this would be inferred from the node access control guard
          shareId,
          dataPath: state.drive.currentDrive?.path!,
          depth: 1,
        });
        return { tree, manifest };
      } catch (e) {
        throw e;
      } finally {
        dispatch(setDriveLoading(false));
      }
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
        manifestCid,
        {
          pathUidMap: provideMap,
          public: publicView,
        },
        shareId
      );
      return { tree: rootDrive, deprecated: true };
    }
  }
);

export const addFilesToDrive = createAsyncThunk(
  "drive/addFiles",
  async (payload: AddFilesToDrivePayload, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId } = state.nodes.nodeReader;
    const { nodeTree } = state.drive;
    const {
      files,
      overwritePathContext,
      externalCids,
      externalUrl,
      componentType,
      componentSubtype,
      newFolder,
      onSuccess,
    } = payload;
    if (!nodeTree || !manifest) return;
    if (
      !arrayXor([files?.length, externalCids?.length, externalUrl, newFolder])
    ) {
      console.error(
        "[addFilesToDrive] Error: More than one upload method was used",
        files,
        externalCids,
        externalUrl,
        newFolder
      );
    }

    if (state.drive?.currentDrive?.external) {
      console.error(
        "[addFilesToDrive] Error: Cannot expand external directory",
        files,
        externalCids,
        externalUrl
      );
      return;
    }

    //Transform files to usable data for displaying state (upload panel items, optimistic drives)
    let fileInfo;
    if (files) {
      const dirs: Record<string, string> = {};
      fileInfo = Array.prototype.filter
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
            uploadType: f.isDirectory ? UploadTypes.DIR : UploadTypes.FILE,
            name: f.name,
            path: path,
          };
        });
      Object.keys(dirs).forEach((key) =>
        fileInfo.push({
          uploadType: UploadTypes.DIR,
          name: key,
          path: dirs[key],
        })
      );
    }
    if (externalUrl?.path && externalUrl?.url) {
      //IMPORTANT: Paths can't start with a '/'
      let isDirectory = false;
      const name = externalUrl.path.split("/").pop();
      if (componentType === ResearchObjectComponentType.CODE) {
        isDirectory = true;
      }

      fileInfo = [
        {
          uploadType: isDirectory ? UploadTypes.DIR : UploadTypes.FILE,
          name: name,
          path: overwritePathContext
            ? overwritePathContext + "/" + externalUrl.path
            : state.drive.currentDrive!.path + "/" + externalUrl.path,
        },
      ];
    }

    if (externalCids?.length) {
      //IMPORTANT: Paths can't start with a '/'
      fileInfo = externalCids.map((extCid) => {
        return {
          uploadType: UploadTypes.CID,
          name: extCid.name,
          path: overwritePathContext
            ? overwritePathContext + "/" + extCid.name
            : state.drive.currentDrive!.path + "/" + extCid.name,
        };
      });
    }

    let newFolderName;
    if (newFolder) {
      const existingNames =
        state.drive.currentDrive?.contains?.map((f) => f.name) || [];
      newFolderName = findUniqueName(GENERIC_NEW_FOLDER_NAME, existingNames);
      fileInfo = [
        {
          uploadType: UploadTypes.DIR,
          name: newFolderName,
          path: overwritePathContext
            ? overwritePathContext + "/" + newFolderName
            : state.drive.currentDrive!.path + "/" + newFolderName,
        },
      ];
    }

    if (newFolderName && newFolder) {
      const optimisticNewFolder = createVirtualDrive({
        name: newFolderName!,
        cid: CID_PENDING,
        type: FileType.DIR,
        contains: undefined,
        accessStatus: AccessStatus.UPLOADING,
        path: [state.drive.currentDrive!.path!, newFolderName].join("/"),
      });
      dispatch(optimisticAddFileToCurrentDrive(optimisticNewFolder));
    }

    if (!fileInfo) return console.error("[AddFilesToDrive] fileInfo undefined");

    let batchUid: string | undefined;
    if (!newFolder) {
      batchUid = Date.now().toString();
      const uploadQueueItems = fileInfo.map((f) => ({
        nodeUuid: currentObjectId!,
        path: f.path,
        batchUid: batchUid!,
        uploadType: f.uploadType,
      }));
      dispatch(setShowUploadPanel(true));
      dispatch(addItemsToUploadQueue({ items: uploadQueueItems }));
      dispatch(updateBatchUploadProgress({ batchUid: batchUid, progress: 0 }));
    }

    const contextPath = overwritePathContext || state.drive.currentDrive!.path!;
    const snapshotNodeUuid = currentObjectId!;
    try {
      const {
        manifest: updatedManifest,
        error,
        rootDataCid,
        manifestCid,
        // tree,
        // date,
      } = !externalCids
        ? await updateDag({
            uuid: currentObjectId!,
            files,
            manifest,
            contextPath,
            externalCids,
            externalUrl,
            componentType,
            componentSubtype,
            newFolderName,
            onProgress: (e) => {
              if (batchUid === undefined) return;
              const perc = Math.ceil((e.loaded / e.total) * 100);
              const passedPerc = perc < 90 ? perc : 90;
              dispatch(
                updateBatchUploadProgress({
                  batchUid,
                  progress: passedPerc,
                })
              );
            },
          })
        : await updateDagExternalCid({
            uuid: currentObjectId!,
            contextPath,
            externalCids,
            componentType,
            componentSubtype,
          });
      if (error) console.error(`[addFilesToDrive] Error: ${error}`);
      if (onSuccess) onSuccess(updatedManifest);
      if (batchUid !== undefined) {
        dispatch(removeBatchFromUploadQueue({ batchUid }));
      }
      if (rootDataCid && updatedManifest && manifestCid) {
        const latestState = getState() as RootState;
        if (snapshotNodeUuid === latestState.nodes.nodeReader.currentObjectId) {
          if (batchUid! !== undefined)
            dispatch(updateBatchUploadProgress({ batchUid, progress: 100 }));
          dispatch(setManifest(updatedManifest));
          dispatch(setManifestCid(manifestCid));
          dispatch(fetchTreeThunk());
        }
      }
    } catch (e) {
      if (batchUid !== undefined) {
        dispatch(removeBatchFromUploadQueue({ batchUid }));
        dispatch(updateBatchUploadProgress({ batchUid, progress: -1 }));
      }
      __log("PaneDrive::handleUpdate", files, e);
    }
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
        type: item.componentType as ResearchObjectComponentType,
        ...(item.componentSubtype ? { subtype: item.componentSubtype } : {}),
        payload: {
          path: item.path,
          cid: item.cid,
        },
        starred: true,
      };
      dispatch(addComponent({ component: newComponent }));
    }
    dispatch(
      saveManifestDraft({
        onSucess: () =>
          dispatch(
            navigateFetchThunk({
              driveKey: "",
              path: item.path!.substring(0, item.path!.lastIndexOf("/")),
            })
          ),
      })
    );
  }
);

export const assignTypeThunk = createAsyncThunk(
  `drive/assignType`,
  async (payload: AssignTypeThunkPayload, { getState, dispatch }) => {
    dispatch(setComponentTypeBeingAssignedTo(null));
    const state = getState() as RootState;
    const { manifest } = state.nodes.nodeReader;
    const { deprecated, currentDrive } = state.drive;
    const { item, type, subtype } = payload;

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
            ...(subtype ? { subtype } : {}),
            payload: { ...urlOrCidProps },
          },
        })
      );
    } else {
      const newComponent: ResearchObjectV1Component = {
        id: uuidv4(),
        name: item.name,
        type: type,
        ...(subtype ? { subtype } : {}),
        payload: {
          path: item.path,
          ...urlOrCidProps,
        },
        starred: false,
      };
      dispatch(addComponent({ component: newComponent }));
    }
    const cb = () => {
      dispatch(clearCachedTree({ path: currentDrive!.path! }));
      dispatch(navigateFetchThunk({ path: currentDrive!.path!, driveKey: "" }));
    };

    dispatch(saveManifestDraft({ onSucess: cb }));
  }
);

export const moveFilesThunk = createAsyncThunk(
  "drive/moveFiles",
  async (payload: MoveFilesThunkPayload, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { item, newDirectory } = payload;
    const { currentObjectId: nodeUuid } = state.nodes.nodeReader;

    const oldPath = item.path;
    const newPath = newDirectory.path + "/" + item.name;

    const { manifest: updatedManifest, manifestCid } = await moveData(
      nodeUuid!,
      oldPath!,
      newPath!
    );

    if (updatedManifest) {
      dispatch(clearCachedTree({ path: newDirectory.path! }));
      dispatch(setManifest(updatedManifest));
      dispatch(setManifestCid(manifestCid));
      dispatch(fetchTreeThunk());
    }
  }
);

export const navigateFetchThunk = createAsyncThunk(
  "drive/navigateFetchThunk",
  async (payload: NavigateFetchThunkPayload, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { path, driveKey, selectPath, dontNavigate, onSuccess } = payload;
    const { currentObjectId, manifestCid, publicView, shareId } =
      state.nodes.nodeReader;

    const notBrowsingExternalLinks = !path.startsWith(
      DRIVE_FULL_EXTERNAL_LINKS_PATH
    );
    if (notBrowsingExternalLinks) {
      const targetTreeNode = findDriveByPath(state.drive.nodeTree!, path);
      if (
        !targetTreeNode ||
        targetTreeNode.cid === "stub" ||
        !targetTreeNode.contains?.length
      ) {
        dispatch(setDriveLoading(true));
        try {
          const { tree: treeRes } = await getDatasetTree({
            manifestCid,
            nodeUuid: currentObjectId!,
            pub: publicView, //  state.nodes.nodeReader.mode === "reader", this would be inferred from the node access control guard
            shareId,
            dataPath: path,
            depth: 1,
          });
          if (!state.drive.nodeTree) {
            throw new Error(
              "Attempt to fetch a node tree when there is no node tree in the store"
            );
          }
          const formattedTree = transformTree(treeRes);
          const tree = formattedTree[0];
          dispatch(mutateTreeForNavigation(tree));
        } catch (e) {
          toast.error(`Error fetching drive`);
          console.error(e);
        } finally {
          dispatch(setDriveLoading(false));
        }
      }
    }
    onSuccess?.();
    if (dontNavigate) return;
    if (driveKey === "") {
      dispatch(navigateToDriveByPath({ path, selectPath }));
    } else {
      dispatch(navigateToDrivePickerByPath({ path, selectPath }));
    }
  }
);

export default driveSlice.reducer;
