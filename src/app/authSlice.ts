import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { wcaAccessToken } from "../utils/auth";
import type { RootState } from "./store";

export interface AuthState {
  isSignInPending: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  isSignInPending: true,
  accessToken: null,
};

export const setAccessToken = createAsyncThunk("auth/signIn", async () =>
  wcaAccessToken()
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut: (state) => {
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAccessToken.pending, (state) => {
        state.isSignInPending = true;
      })
      .addCase(setAccessToken.fulfilled, (state, action) => {
        const accessToken = action.payload;

        state.isSignInPending = false;
        state.accessToken = accessToken;
      })
      .addCase(setAccessToken.rejected, (state) => {
        state.isSignInPending = false;
        state.accessToken = null;
      });
  },
});

export const { signOut } = authSlice.actions;

export const isSignedInSelector = (state: RootState) =>
  !!state.auth.accessToken;

export const isSignInPendingSelector = (state: RootState) =>
  state.auth.isSignInPending;

export default authSlice.reducer;
