import { range } from "../../utils/utils";
import {
  getDefaultEventsData,
  getDefaultNumStations,
  getDefaultSchedule,
  getNumberOfActivities,
  getNumStationsFromWcif,
  getOtherActivityLengths,
  getWcifStartTimes,
  reorderFromWcif,
} from "../../utils/wcif";
import { numberOfDaysSelector } from "../selectors";
import type { Reducer } from "../types";

export const fetchReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "SIGNIN_COMPLETE":
      const { accessToken } = action;
      return { ...state, accessToken };

    case "MANAGEABLE_COMPS_PENDING":
      return { ...state, manageableCompsPending: true };
    case "MANAGEABLE_COMPS_SUCCESS":
      const { manageableComps } = action;
      return {
        ...state,
        manageableCompsPending: false,
        manageableComps,
        selectedCompId: state.importSource
          ? state.selectedCompId
          : manageableComps[0].id,
      };
    case "MANAGEABLE_COMPS_ERROR":
      return {
        ...state,
        manageableCompsPending: false,
        manageableComps: [],
        selectedCompId: null,
      };

    case "FETCH_WCIF_PENDING":
      return { ...state, wcifPending: true };
    case "FETCH_WCIF_SUCCESS":
      const { wcif } = action;
      const defaultCompetitorLimit = wcif.competitorLimit || 120;
      const defaultNumStations =
        getNumStationsFromWcif(wcif) ||
        getDefaultNumStations(defaultCompetitorLimit);
      const defaultNumOtherActivities = getNumberOfActivities(wcif.schedule);
      const events = getDefaultEventsData({
        wcif,
        numStations: defaultNumStations,
        competitorLimit: defaultCompetitorLimit,
      });

      const startTimes = getWcifStartTimes(wcif);

      if (state.importSource) {
        const numDaysDiff =
          wcif.schedule.numberOfDays - numberOfDaysSelector(state);
        let schedule = state.schedule;
        if (numDaysDiff > 0) {
          // Add day dividers
          schedule = [
            ...state.schedule,
            ...range(
              numberOfDaysSelector(state),
              wcif.schedule.numberOfDays
            ).map((i) => ({ type: "day-divider" as const, dayIndex: i })),
          ];
        } else {
          // Remove day dividers
          schedule = state.schedule.filter(
            (e) =>
              e.type !== "day-divider" ||
              e.dayIndex < wcif.schedule.numberOfDays
          );
        }

        return {
          ...state,
          wcifPending: false,
          wcif,
          startTimes: startTimes,
          // Fields below this point were added after import functionality was implemented
          // For backwards compatibility they also have to be able to fill in a default value if it doesn't exist.
          competitorLimit: state.competitorLimit || `${defaultCompetitorLimit}`,
          numberOfDays: `${wcif.schedule.numberOfDays}`,
          schedule,
          hasReorderedEvents:
            state.hasReorderedEvents || wcif.schedule.venues.length > 0,
        };
      }

      return {
        ...state,
        // Use the number of venues as a proxy for whether there's a schedule
        // (i.e. we've most likely exported a schedule before)
        isShowingDefaultInfo: wcif.schedule.venues.length === 0,
        hasReorderedEvents: wcif.schedule.venues.length > 0,
        wcifPending: false,
        wcif,
        competitorLimit: `${defaultCompetitorLimit}`,
        isNumStationsTouched: false,
        numStations: `${defaultNumStations}`,
        numberOfDays: `${wcif.schedule.numberOfDays}`,
        events,
        schedule: reorderFromWcif({
          schedule: getDefaultSchedule(
            events,
            wcif.schedule.numberOfDays,
            defaultNumOtherActivities
          ),
          wcifSchedule: wcif.schedule,
          firstStartTime: startTimes[0],
        }),
        otherActivities: getOtherActivityLengths(
          state.otherActivities,
          wcif.schedule
        ),
        numOtherActivities: defaultNumOtherActivities,
        startTimes,
      };

    case "FETCH_WCIF_ERROR":
      return {
        ...state,
        wcifPending: false,
        wcif: null,
      };

    default:
      return state;
  }
};
