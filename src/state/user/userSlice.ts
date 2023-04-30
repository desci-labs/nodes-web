import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, Wallet } from "../api/types";

interface IUserState {
  profile: UserProfile;
  wallets?: Wallet[];
}

const initialState: IUserState = {
  profile: {
    email: "",
    userId: 0,
    wallets: [],
    vscode: "",
    profile: { googleScholarUrl: "", name: "", orcid: "" },
  },
};

export const userSlice = createSlice({
  initialState,
  name: "user",
  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth");
      state.profile = initialState.profile;
    },
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
});

export default userSlice.reducer;

export const { logout, setUser } = userSlice.actions;
