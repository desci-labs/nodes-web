import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { getDatasetTree } from "@src/api";
import {
  AccessStatus,
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
import { deprecate } from "util";
import { cidString, generateCidTypeMap } from "./utils";
interface DriveState {
  nodeTree: DriveObject | null;
  status: RequestStatus;
  error: null | undefined | string;
  directory: DriveObject[];
}

const initialState: DriveState = {
  nodeTree: null,
  status: "idle",
  error: null,
  directory: [],
};

export const driveSlice = createSlice({
  name: "drive",
  initialState,
  reducers: {
    reset: () => {
      return initialState;
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

        if (action.payload.deprecated) {
          state.nodeTree = action.payload.tree;
          return;
        }

        const manifest = action.payload.manifest!;
        //Process the IPFS tree into a DriveObject tree
        const root = createVirtualDrive({
          name: "Node Root",
          componentType: ResearchObjectComponentType.DATA_BUCKET,
          path: DRIVE_NODE_ROOT_PATH,
        });
        const contents = [];

        //Generate a map of existing components
        const cidToTypeMap = generateCidTypeMap(manifest);

        //Add links
        manifest.components.forEach((c) => {
          if (c.type === ResearchObjectComponentType.LINK)
            contents.push(
              createVirtualDrive({
                name: c.name,
                componentType: ResearchObjectComponentType.LINK,
              })
            );
        });
      })
      .addCase(fetchTreeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch data";
      });
  },
});

export const { reset } = driveSlice.actions;

export interface FetchTreeThunkParams {
  manifest: ResearchObjectV1;
  nodeUuid: string;
}

export const fetchTreeThunk = createAsyncThunk(
  "drive/fetchTree",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { manifest, currentObjectId, manifestCid } = state.nodes.nodeReader;

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
      return { tree: {} as DriveObject, manifest: manifest }; //remove
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
      });
      return { tree: root, deprecated: true };
    }
  }
);

export default driveSlice.reducer;
