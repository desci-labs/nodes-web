import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ResearchObjectV1History } from "@src/../../nodes/desci-models/dist";
import { PublishedMap } from "./types";

interface HistoryState {
  publishMap: PublishedMap;
  pendingCommits: { [uuid: string]: ResearchObjectV1History[] };
}

const initialState: HistoryState = {
  pendingCommits: {},
  publishMap: {},
};

export const historySlice = createSlice({
  initialState,
  name: "nodeHistorySlice",
  reducers: {
    setPublishedNodes: (state, { payload }: PayloadAction<PublishedMap>) => {
      state.publishMap = { ...state.publishMap, ...payload };
    },
  },
});

export const historyReducer = historySlice.reducer;

export const { setPublishedNodes } = historySlice.actions;
