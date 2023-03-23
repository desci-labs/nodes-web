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
  DEFAULT_CID_PENDING,
  formatDbDate,
  getAllTrees,
  ipfsTreeToDriveTree,
  manifestToVirtualDrives,
  SessionStorageKeys,
} from "@src/components/driveUtils";
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
        state.nodeTree = action.payload;
        state.error = null;
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
      return {} as DriveObject; //remove
    } else {
      //construct old tree
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
      return root;
    }
    return {} as DriveObject; //remove
  }
);

export default driveSlice.reducer;
