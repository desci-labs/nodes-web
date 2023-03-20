import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ResearchObjectV1History } from "@src/../../nodes/desci-models/dist";
import { HistoryEntryProps, HistoryMap, PublishedMap } from "./types";

interface HistoryState {
  publishMap: PublishedMap;
  histories: HistoryMap;
  pendingCommits: HistoryMap;
  selectedHistoryId: string;
  selectedHistory: HistoryEntryProps | null;
}

const initialState: HistoryState = {
  publishMap: {},
  histories: {},
  pendingCommits: {},
  selectedHistoryId: "",
  selectedHistory: null,
};

export const historySlice = createSlice({
  initialState,
  name: "nodeHistorySlice",
  reducers: {
    resetHistory: () => initialState,
    setPublishedNodes: (state, { payload }: PayloadAction<PublishedMap>) => {
      state.publishMap = { ...state.publishMap, ...payload };
    },
    selectHistory: (
      state,
      { payload }: PayloadAction<{ id: string; history: HistoryEntryProps }>
    ) => {
      state.selectedHistory = payload.history;
      state.selectedHistoryId = payload.id.toString();
    },
    setVersionHistories: (state, { payload }: PayloadAction<HistoryMap>) => {
      state.histories = { ...state.histories, ...payload };
    },
    setNodeHistory: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; history: ResearchObjectV1History[] }>
    ) => {
      state.histories[payload.id] = payload.history;
    },
    setPendingCommits: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; commits: ResearchObjectV1History[] }>
    ) => {
      if (state.pendingCommits[payload.id]) {
        state.pendingCommits[payload.id] = [];
      }

      state.pendingCommits[payload.id] = payload.commits;
    },
  },
});

export const historyReducer = historySlice.reducer;

export const {
  setPublishedNodes,
  // setVersionHistories,
  setNodeHistory,
  resetHistory,
  setPendingCommits,
  selectHistory,
} = historySlice.actions;
