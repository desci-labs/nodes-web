import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ResearchObjectV1 } from "@src/../../nodes/desci-models/dist";
import { DriveObject } from "@src/components/organisms/Drive";
import { RequestStatus } from "@src/store";

interface DriveState {
  nodeTree: DriveObject | null;
  status: RequestStatus;
  error: null | undefined | string;
}

const initialState: DriveState = {
  nodeTree: null,
  status: "idle",
  error: null,
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
  async (params: FetchTreeThunkParams) => {
    const { manifest, nodeUuid } = params;
    const { data } = await getDatasetTree(rootCid, nodeUuid);

    return data;
  }
);

export default driveSlice.reducer;
