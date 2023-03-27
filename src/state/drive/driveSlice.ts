import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getDatasetTree } from "@src/api";
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
interface DriveState {
  nodeTree: DriveObject | null;
  status: RequestStatus;
  error: null | undefined | string;
  currentDrive: DriveObject | null;
}

const initialState: DriveState = {
  nodeTree: null,
  status: "idle",
  error: null,
  currentDrive: null,
};

export const driveSlice = createSlice({
  name: "drive",
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
    navigateToDriveByPath: (state, action) => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTreeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        // debugger;
        const { tree } = action.payload;
        debugger;
        if (action.payload.deprecated) {
          state.nodeTree = tree as DriveObject;
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
      })
      .addCase(fetchTreeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch data";
      });
  },
});

export const { reset, navigateToDriveByPath } = driveSlice.actions;

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

export default driveSlice.reducer;
