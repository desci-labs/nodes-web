import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TOOLBAR_ENTRY } from "@src/components/organisms/Toolbar";
import { AppPreferences, Orcid } from "./types";

const initialState: AppPreferences = {
  theme: "dark",
  orcid: {
    orcidData: null,
    orcidJwt: "",
    loading: false,
    checking: false,
  },
  torusKey: {},
  hideHeader: false,
  hideFooter: false,
  checkingCode: false,
  activeToolbar: TOOLBAR_ENTRY.collection,
  isToolbarVisible: false,
};

const slice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    resetPreference: (state) => {
      state = initialState;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setOrcid: (state, { payload }: PayloadAction<Partial<Orcid>>) => {
      state.orcid = { ...state.orcid, ...payload };
    },
    setTorusKey: (state, { payload }: PayloadAction<any>) => {
      state.torusKey = payload;
    },
    setHeaderHidden: (state, { payload }: PayloadAction<boolean>) => {
      state.hideHeader = payload;
    },
    setFooterHidden: (state, { payload }: PayloadAction<boolean>) => {
      state.hideFooter = payload;
    },
    setCheckingCode: (state, { payload }: PayloadAction<boolean>) => {
      state.checkingCode = payload;
    },
    toggleToolbar: (state, { payload }: PayloadAction<boolean>) => {
      state.isToolbarVisible = payload;
    },
    setActiveToolbar: (state, { payload }: PayloadAction<TOOLBAR_ENTRY>) => {
      state.activeToolbar = payload;
    },
    setPreferences: (
      state,
      { payload }: PayloadAction<Partial<AppPreferences>>
    ) => {
      const fields = Object.keys(payload) as (keyof AppPreferences)[];
      for (const field of fields) {
        state[field] = payload[field];
      }
    },
  },
});

export default slice.reducer;
export const {
  resetPreference,
  toggleTheme,
  setCheckingCode,
  setFooterHidden,
  setHeaderHidden,
  setOrcid,
  setTorusKey,
  toggleToolbar,
  setActiveToolbar,
  setPreferences,
} = slice.actions;
