import { combineReducers, configureStore } from "@reduxjs/toolkit";
import adminAnalyticsReducer from "@src/state/analytics/analyticsSlice";
import { api } from "@src/state/api";
import driveReducer from "@src/state/drive/driveSlice";
import { nodesReducer } from "@src/state/nodes/root";
import preferenceSlice from "@src/state/preferences/preferencesSlice";
import userSlice from "@src/state/user/userSlice";

const rootReducer = combineReducers({
  user: userSlice,
  preferences: preferenceSlice,
  adminAnalytics: adminAnalyticsReducer,
  [api.reducerPath]: api.reducer,
  nodes: nodesReducer,
  drive: driveReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([api.middleware]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
