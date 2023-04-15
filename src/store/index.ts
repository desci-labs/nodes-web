import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { __log } from "@src/components/utils";
import adminAnalyticsReducer from "@src/state/analytics/analyticsSlice";
import { api } from "@src/state/api";
import driveReducer from "@src/state/drive/driveSlice";
import { nodeReaderMiddleware } from "@src/state/nodes/middleware";
import { nodesReducer } from "@src/state/nodes/root";
import preferenceSlice from "@src/state/preferences/preferencesSlice";
import userSlice from "@src/state/user/userSlice";
import {
  persistReducer,
  persistStore,
  createMigrate,
  PersistedState,
  createTransform,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  user: userSlice,
  preferences: preferenceSlice,
  adminAnalytics: adminAnalyticsReducer,
  [api.reducerPath]: api.reducer,
  nodes: nodesReducer,
  drive: driveReducer,
});

const migrations = {
  1: (state: PersistedState) => {
    console.log("migrate, ", state);
    return {} as PersistedState; // reset all state, except version
  },
};

const nestedBlacklist = createTransform(
  null,
  (state: PersistedState, key) => {
    const newState = { ...state };
    (newState as any).nodes.loadState = {};

    return newState;
  },
  {}
);

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  migrate: createMigrate(migrations),
  blacklist: [
    "user",
    "preferences",
    "pdfViewer",
    "nodeViewer",
    "adminAnalytics",
    api.reducerPath,
  ],
  transforms: [nestedBlacklist],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
) as typeof rootReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .prepend(nodeReaderMiddleware.middleware)
      .concat([api.middleware]),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

const next = store.dispatch;
store.dispatch = function dispatchAndLog(action: any) {
  __log("dispatching", action);
  let result = next(action);
  __log("next state", store.getState());
  return result;
};
