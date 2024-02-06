import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "../../utils/calculators";
import { getDefaultEventsData, getDefaultSchedule } from "../../utils/wcif";
import type { EventId, Events, Round } from "../../types";
import {
  competitorLimitSelector,
  eventsSelector,
  numberOfDaysSelector,
  numOtherActivitiesSelector,
  numStationsSelector,
} from "../selectors";
import {
  createSimulRound,
  updateSimulRound,
  reorderSimulGroup,
} from "../helpers";
import type { Reducer } from "../types";

export const roundsReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "ROUND_UPDATED":
      const oldRounds = state.events[action.eventId];

      if (!oldRounds) {
        return state;
      }

      const oldRound = oldRounds[action.roundNum];

      const updatedRound = {
        ...oldRound,
        totalNumCompetitors:
          action.totalNumCompetitors ?? oldRound.totalNumCompetitors,
        numGroups: action.numGroups ?? oldRound.numGroups,
        scheduledTime: action.scheduledTime ?? oldRound.scheduledTime,
      };

      if (!action.isEditingTime && !action.scheduledTime) {
        updatedRound.scheduledTime = calcTimeForRound(
          action.eventId,
          parseInt(updatedRound.numGroups || "0")
        ).toString();
      }

      const updatedRounds = [...(oldRounds ?? [])];
      updatedRounds[action.roundNum] = updatedRound;

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: updatedRounds,
        },
        isExported: false,
      };

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...(state.events[action.eventId] ?? [])];
      withoutRemovedRound.pop();

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: withoutRemovedRound,
        },
        schedule: [
          ...state.schedule.filter(
            (scheduleEntry) =>
              scheduleEntry.type !== "event" ||
              scheduleEntry.eventId !== action.eventId ||
              scheduleEntry.roundNum !== withoutRemovedRound.length
          ),
        ],
        isExported: false,
      };

    case "ADD_EVENTS":
      const eventsToAdd = action.eventIds.map((eventId) => {
        const numCompetitors = calcExpectedNumCompetitors(
          eventId,
          state.wcif?.competitorLimit || 0
        );
        const numGroups = calcNumGroups({
          eventId,
          numCompetitors,
          numStations: parseInt(state.numStations || "0"),
        });

        return {
          [eventId]: [
            {
              eventId,
              totalNumCompetitors: numCompetitors.toString(),
              numGroups: numGroups.toString(),
              scheduledTime: calcTimeForRound(eventId, numGroups).toString(),
            },
          ],
        };
      });

      return {
        ...state,
        events: {
          ...state.events,
          ...Object.assign({}, ...eventsToAdd),
        },
        schedule: [
          ...state.schedule,
          ...action.eventIds.map((eventId) => ({
            type: "event" as const,
            eventId,
            roundNum: 0,
          })),
        ],
        isExported: false,
      };

    case "ADD_ROUND":
      const withAddedRound = [...(state.events[action.eventId] ?? [])];

      const numCompetitors = !withAddedRound.length
        ? calcExpectedNumCompetitors(
            action.eventId,
            state.wcif?.competitorLimit || 0
          )
        : 0;

      const numGroups = calcNumGroups({
        eventId: action.eventId,
        numCompetitors,
        numStations: parseInt(state.numStations || "0"),
      });

      const roundToAdd: Round = {
        eventId: action.eventId,
        totalNumCompetitors: numCompetitors.toString(),
        numGroups: numGroups.toString(),
        scheduledTime: calcTimeForRound(action.eventId, numGroups).toString(),
        simulGroups: [],
      };

      withAddedRound.push(roundToAdd);

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: withAddedRound,
        },
        schedule: [
          ...state.schedule,
          {
            type: "event",
            eventId: action.eventId,
            roundNum: withAddedRound.length - 1,
          },
        ],
        isExported: false,
      };

    case "RESET_ESTIMATES_TO_WCIF":
      if (!state.wcif) {
        return { ...state };
      }

      const resetEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: numStationsSelector(state),
        competitorLimit: competitorLimitSelector(state),
      });

      return {
        ...state,
        events: resetEvents,
        schedule: getDefaultSchedule(
          resetEvents,
          numberOfDaysSelector(state),
          numOtherActivitiesSelector(state)
        ),
        isExported: false,
      };

    case "RESET_ROUNDS":
      const eventsWithResetRounds = {} as Events;
      Object.entries(eventsSelector(state)).forEach(([e, rounds]) => {
        const eventId = e as EventId;

        if (!rounds) {
          return null;
        }

        const resetRounds = rounds.map((round) => {
          const { totalNumCompetitors } = round;
          const defaultNumGroups = calcNumGroups({
            eventId,
            numCompetitors: parseInt(totalNumCompetitors),
            numStations: numStationsSelector(state),
          });
          const defaultScheduledTime = calcTimeForRound(
            eventId,
            defaultNumGroups
          );
          return {
            eventId,
            totalNumCompetitors,
            numGroups: `${defaultNumGroups}`,
            scheduledTime: `${defaultScheduledTime}`,
            simulGroups: [],
          };
        });

        eventsWithResetRounds[eventId as EventId] = resetRounds;
      });

      return {
        ...state,
        events: eventsWithResetRounds,
      };

    case "CREATE_SIMUL_ROUND":
      return createSimulRound(state, action);

    case "UPDATE_SIMUL_ROUND":
      return updateSimulRound(state, action);

    case "REORDER_SIMUL_GROUP":
      return reorderSimulGroup(state, action);

    default:
      return state;
  }
};
