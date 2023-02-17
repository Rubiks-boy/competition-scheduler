import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ManageableCompetition } from "../types";
import { fetchUpcomingManageableCompetitions } from "../utils/wcaApi";
import type { RootState } from "./store";

export interface CompetitionsState {
  isCompRequestPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  currentCompId: string | null;
}

const initialState: CompetitionsState = {
  isCompRequestPending: false,
  manageableComps: [],
  currentCompId: null,
};

export const fetchManageableComps = createAsyncThunk(
  "competitions/fetchManageableComps",
  async (accessToken: string) => {
    return fetchUpcomingManageableCompetitions(accessToken);
  }
);

export const competitionsSlice = createSlice({
  name: "competitions",
  initialState,
  reducers: {
    competitionSelected: (state, action) => {
      const newCompId = action.payload;
      state.currentCompId = newCompId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManageableComps.pending, (state) => {
        state.isCompRequestPending = true;
      })
      .addCase(fetchManageableComps.fulfilled, (state, action) => {
        const manageableCompetitions = action.payload;

        state.isCompRequestPending = false;
        state.manageableComps = manageableCompetitions;
        state.currentCompId = manageableCompetitions[0].id;
      })
      .addCase(fetchManageableComps.rejected, (state) => {
        state.isCompRequestPending = false;
        state.manageableComps = [];
        state.currentCompId = null;
      });
  },
});

export const { competitionSelected } = competitionsSlice.actions;

export const manageableCompsSelector = (state: RootState) =>
  state.competitions.manageableComps;

export const currentCompSelector = (state: RootState) => {
  const { currentCompId, manageableComps } = state.competitions;
  return manageableComps.find(({ id }) => id === currentCompId);
};

export const isCompRequestPendingSelector = (state: RootState) =>
  state.competitions.isCompRequestPending;

export default competitionsSlice.reducer;
