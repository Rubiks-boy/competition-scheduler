import { roundsReducer } from "./roundsReducer";
import { scheduleReducer } from "./scheduleReducer";
import { fetchReducer } from "./fetchReducer";
import { manageCompReducer } from "./manageCompReducer";
import { appReducer } from "./appReducer";
import { otherActivityReducer } from "./otherActivityReducer";
import { stageReducer } from "./stageReducer";
import { withAutoScheduleReordering } from "./withAutoScheduleReordering";
import type { Reducer } from "../types";

const combineReducers = (reducers: Array<Reducer>): Reducer => {
  return (prevState, action) =>
    reducers.reduce((state, reducer) => reducer(state, action), prevState);
};

const reducer = combineReducers([
  appReducer,
  roundsReducer,
  scheduleReducer,
  fetchReducer,
  manageCompReducer,
  otherActivityReducer,
  stageReducer,
]);

export default withAutoScheduleReordering(reducer);
