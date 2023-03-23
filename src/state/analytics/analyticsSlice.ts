import axios from "axios";
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

import { SCIWEAVE_URL, config } from "@src/api";

import type { RootState, RequestStatus } from "@src/store/index";

interface AdminAnalyticsApiResp {
  newUsersToday: number;
  newUsersInLast7Days: number;
  newUsersInLast30Days: number;
  newNodesToday: number;
  newNodesInLast7Days: number;
  newNodesInLast30Days: number;
  activeUsersToday: number;
  activeUsersInLast7Days: number;
  activeUsersInLast30Days: number;
  nodeViewsToday: number;
  nodeViewsInLast7Days: number;
  nodeViewsInLast30Days: number;
  bytesToday: number;
  bytesInLast7Days: number;
  bytesInLast30Days: number;
}
interface AdminAnalyticsState extends AdminAnalyticsApiResp {
  status: RequestStatus;
  error: string | null | undefined;
}

const initialState: AdminAnalyticsState = {
  newUsersToday: 0,
  newUsersInLast7Days: 0,
  newUsersInLast30Days: 0,
  newNodesToday: 0,
  newNodesInLast7Days: 0,
  newNodesInLast30Days: 0,
  activeUsersToday: 0,
  activeUsersInLast7Days: 0,
  activeUsersInLast30Days: 0,
  nodeViewsToday: 0,
  nodeViewsInLast7Days: 0,
  nodeViewsInLast30Days: 0,
  bytesToday: 0,
  bytesInLast7Days: 0,
  bytesInLast30Days: 0,
  status: "idle",
  error: null,
};

export const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      /**
       * We get these from `createAsyncThunk`
       * We get `pending`, `fulfilled` and `rejected` fo' free
       * They will automatically dispatch from the thunk
       * https://redux-toolkit.js.org/api/createAsyncThunk#type
       */
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        /**
         * We are able to set state directly.
         * This is because we are using `createSlice` which uses `immer` under the hood
         * So we are able to "mutate state directly" without actually mutating it
         * https://redux-toolkit.js.org/usage/immer-reducers#immutability-and-redux
         */
        state.status = "succeeded";
        state.newUsersToday = action.payload.newUsersToday;
        state.newUsersInLast7Days = action.payload.newUsersInLast7Days;
        state.newUsersInLast30Days = action.payload.newUsersInLast30Days;
        state.newNodesToday = action.payload.newNodesToday;
        state.newNodesInLast7Days = action.payload.newNodesInLast7Days;
        state.newNodesInLast30Days = action.payload.newNodesInLast30Days;
        state.activeUsersToday = action.payload.activeUsersToday;
        state.activeUsersInLast7Days = action.payload.activeUsersInLast7Days;
        state.activeUsersInLast30Days = action.payload.activeUsersInLast30Days;
        state.nodeViewsToday = action.payload.nodeViewsToday;
        state.nodeViewsInLast7Days = action.payload.nodeViewsInLast7Days;
        state.nodeViewsInLast30Days = action.payload.nodeViewsInLast30Days;
        state.bytesToday = action.payload.bytesToday;
        state.bytesInLast7Days = action.payload.bytesInLast7Days;
        state.bytesInLast30Days = action.payload.bytesInLast30Days;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset } = adminAnalyticsSlice.actions;

export const fetchAdminAnalytics = createAsyncThunk(
  "adminAnalytics/fetchAnalytics",
  async () => {
    const { data } = await axios.get<AdminAnalyticsApiResp>(
      `${SCIWEAVE_URL}/v1/admin/analytics`,
      config()
    );

    return data;
  }
);

const selectRootAdminAnalyticsSlice = (state: RootState) =>
  state.adminAnalytics;

/**
 * Uses a memoized selector to get exactly what we need from state, nothing more, nothing less
 * https://react-redux.js.org/api/hooks#using-memoizing-selectors
 *
 */
export const selectAdminAnalyticsStatus = createSelector(
  [selectRootAdminAnalyticsSlice],
  (root) => root.status
);
export const selectAdminAnalytics = createSelector(
  [selectRootAdminAnalyticsSlice],
  (root) => {
    return {
      newUsersToday: root.newUsersToday,
      newUsersInLast7Days: root.newUsersInLast7Days,
      newUsersInLast30Days: root.newUsersInLast30Days,
      newNodesToday: root.newNodesToday,
      newNodesInLast7Days: root.newNodesInLast7Days,
      newNodesInLast30Days: root.newNodesInLast30Days,
      activeUsersToday: root.activeUsersToday,
      activeUsersInLast7Days: root.activeUsersInLast7Days,
      activeUsersInLast30Days: root.activeUsersInLast30Days,
      nodeViewsToday: root.nodeViewsToday,
      nodeViewsInLast7Days: root.nodeViewsInLast7Days,
      nodeViewsInLast30Days: root.nodeViewsInLast30Days,
      bytesToday: root.bytesToday,
      bytesInLast7Days: root.bytesInLast7Days,
      bytesInLast30Days: root.bytesInLast30Days,
    };
  }
);

export default adminAnalyticsSlice.reducer;
