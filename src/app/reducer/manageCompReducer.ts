import { ONE_DAY_MS } from "../../constants";
import { range } from "../../utils/utils";
import {
  getDefaultEventsData,
  getDefaultNumStations,
  getDefaultSchedule,
} from "../../utils/wcif";
import {
  competitorLimitSelector,
  numberOfDaysSelector,
  numOtherActivitiesSelector,
} from "../selectors";
import type { Reducer } from "../types";

export const manageCompReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "COMP_SELECTED":
      const { newId } = action;
      return {
        ...state,
        selectedCompId: newId,
        isExported: false,
        importSource: null,
      };

    case "COMPETITOR_LIMIT_CHANGED":
      const { competitorLimit } = action;

      if (state.isNumStationsTouched || !state.wcif) {
        return { ...state, competitorLimit };
      }

      const newNumStations = state.isStationaryCompetition
        ? Math.ceil(parseInt(competitorLimit || "0") * 0.2)
        : getDefaultNumStations(parseInt(competitorLimit));

      if (!state.isShowingDefaultInfo) {
        return {
          ...state,
          competitorLimit,
          numStations: `${newNumStations}`,
        };
      }

      const newDefaultEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: newNumStations,
        competitorLimit: parseInt(competitorLimit),
        speedOffset: state.speedSlider,
        isStationaryCompetition: state.isStationaryCompetition,
      });

      return {
        ...state,
        competitorLimit,
        numStations: `${newNumStations}`,
        events: newDefaultEvents,
        schedule: getDefaultSchedule(
          newDefaultEvents,
          numberOfDaysSelector(state),
          numOtherActivitiesSelector(state)
        ),
        isExported: false,
      };

    case "NUM_STATIONS_CHANGED":
      const { numStations } = action;

      if (!state.isShowingDefaultInfo || !state.wcif) {
        return {
          ...state,
          numStations,
          isNumStationsTouched: true,
        };
      }

      const updatedDefaultEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: parseInt(numStations || "0"),
        competitorLimit: competitorLimitSelector(state),
        speedOffset: state.speedSlider,
        isStationaryCompetition: state.isStationaryCompetition,
      });

      return {
        ...state,
        numStations,
        isNumStationsTouched: true,
        events: updatedDefaultEvents,
        schedule: getDefaultSchedule(
          updatedDefaultEvents,
          numberOfDaysSelector(state),
          state.numOtherActivities
        ),
        isExported: false,
      };

    case "STATIONARY_COMPETITION_CHANGED":
      const { isStationaryCompetition } = action;

      // When changing to stationary mode, update stations based on competitor limit
      if (
        isStationaryCompetition &&
        !state.isNumStationsTouched &&
        state.competitorLimit
      ) {
        const stationaryNumStations = Math.ceil(
          parseInt(state.competitorLimit) * 0.2
        );

        if (!state.isShowingDefaultInfo || !state.wcif) {
          return {
            ...state,
            isStationaryCompetition,
            numStations: `${stationaryNumStations}`,
          };
        }

        const updatedEvents = getDefaultEventsData({
          wcif: state.wcif,
          numStations: stationaryNumStations,
          competitorLimit: competitorLimitSelector(state),
          speedOffset: state.speedSlider,
          isStationaryCompetition: true,
        });

        return {
          ...state,
          isStationaryCompetition,
          numStations: `${stationaryNumStations}`,
          events: updatedEvents,
          schedule: getDefaultSchedule(
            updatedEvents,
            numberOfDaysSelector(state),
            state.numOtherActivities
          ),
          isExported: false,
        };
      }

      return {
        ...state,
        isStationaryCompetition,
        isExported: false,
      };

    case "NUMBER_OF_DAYS_CHANGED":
      const { numberOfDays } = action;

      const currentNumberOfDays = numberOfDaysSelector(state);
      const newNumberOfDays = parseInt(numberOfDays || "1");

      if (currentNumberOfDays >= newNumberOfDays) {
        // Remove day dividers
        return {
          ...state,
          isShowingDefaultInfo: false,
          numberOfDays,
          schedule: state.schedule.filter(
            (scheduleEntry) =>
              scheduleEntry.type !== "day-divider" ||
              scheduleEntry.dayIndex < newNumberOfDays
          ),
          startTimes: state.startTimes.slice(0, newNumberOfDays),
        };
      } else {
        const newDayDividers = range(currentNumberOfDays, newNumberOfDays).map(
          (dayIndex) => ({
            type: "day-divider" as const,
            dayIndex,
          })
        );

        return {
          ...state,
          isShowingDefaultInfo: false,
          numberOfDays,
          schedule: [...state.schedule, ...newDayDividers],
          startTimes: [
            ...state.startTimes,
            ...range(currentNumberOfDays, newNumberOfDays).map(
              (i) => new Date(state.startTimes[0].getTime() + i * ONE_DAY_MS)
            ),
          ],
        };
      }

    default:
      return state;
  }
};
