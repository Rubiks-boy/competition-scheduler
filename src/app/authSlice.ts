import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface AuthState {
  isSignedIn: boolean;
}

const initialState: AuthState = {
  isSignedIn: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state) => {
      state.isSignedIn = true;
    },
    signOut: (state) => {
      state.isSignedIn = false;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;

export const isSignedInSelector = (state: RootState) => state.auth.isSignedIn;

export default authSlice.reducer;
