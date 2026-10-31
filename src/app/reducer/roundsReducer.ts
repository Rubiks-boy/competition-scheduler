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
  duplicateSimulRound,
  updateSimulRound,
  reorderSimulGroup,
  deleteSimulGroup,
  addGroup,
  removeGroup,
} from "../helpers";
import type { Reducer } from "../types";
import { getDualRoundsFromWcif, hasDualRounds } from "../../utils/dualRounds";
import { calcNumCompetitorsPerRound } from "../../utils/utils";

export const roundsReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "DUAL_ROUNDS_UPDATED": {
      const rounds = state.events[action.eventId];
      if (!rounds || rounds.length < 2) {
        return state;
      }
      const updatedRounds = [...rounds];
      const wasEnabled = !!state.dualRounds[action.eventId]?.enabled;
      const secondRound = rounds[1];
      if (secondRound.type === "aggregate" && wasEnabled !== action.enabled) {
        const pool = calcNumCompetitorsPerRound(rounds, state.events, wasEnabled)[0];
        const numGroups = calcNumGroups({
          eventId: action.eventId,
          numCompetitors: pool,
          numStations: numStationsSelector(state),
        });
        updatedRounds[1] = {
          ...secondRound,
          totalNumCompetitors: action.enabled ? "100%" : `${pool}`,
          ...(action.enabled && {
            numGroups: `${numGroups}`,
            scheduledTime: `${calcTimeForRound(action.eventId, numGroups, true, state.speedSlider)}`,
          }),
        };
      }
      return {
        ...state,
        events: { ...state.events, [action.eventId]: updatedRounds },
        dualRounds: {
          ...state.dualRounds,
          [action.eventId]: {
            enabled: action.enabled,
            sharedCumulativeTimeLimit: action.sharedCumulativeTimeLimit,
          },
        },
        isShowingDefaultInfo: false,
        isExported: false,
      };
    }

    case "ROUND_UPDATED":
      const oldRounds = state.events[action.eventId];

      if (!oldRounds) {
        return state;
      }

      const oldRound = oldRounds[action.roundNum];

      if (oldRound.type === "groups" || (
        hasDualRounds(oldRounds, state.dualRounds[action.eventId]?.enabled) &&
        action.roundNum === 1 && action.totalNumCompetitors != null
      )) {
        return state;
      }

      const updatedRound = {
        ...oldRound,
        totalNumCompetitors:
          action.totalNumCompetitors ?? oldRound.totalNumCompetitors,
        numGroups: action.numGroups ?? oldRound.numGroups,
        scheduledTime: action.scheduledTime ?? oldRound.scheduledTime,
      };

      if (action.numGroups && parseInt(action.numGroups) === 0) {
        updatedRound.totalNumCompetitors = "0";
      }

      if (!action.isEditingTime && !action.scheduledTime) {
        updatedRound.scheduledTime = calcTimeForRound(
          action.eventId,
          parseInt(updatedRound.numGroups || "0"),
          true,
          state.speedSlider
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

    case "ADD_GROUP":
      return addGroup(state, action);

    case "REMOVE_GROUP":
      return removeGroup(state, action);

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...(state.events[action.eventId] ?? [])];
      withoutRemovedRound.pop();

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: Object.fromEntries(Object.entries(state.events).map(([id, rounds]) => [
          id,
          (id === action.eventId ? withoutRemovedRound : rounds)?.map(round =>
            round.type === "groups" ? {
              ...round,
              groups: round.groups.map(group => ({
                ...group,
                secondaryEvent: group.secondaryEvent?.eventId === action.eventId &&
                  group.secondaryEvent.roundIndex === withoutRemovedRound.length
                  ? undefined : group.secondaryEvent,
              })),
            } : round
          ) ?? null,
        ])) as Events,
        dualRounds: {
          ...state.dualRounds,
          [action.eventId]: {
            enabled: hasDualRounds(withoutRemovedRound, state.dualRounds[action.eventId]?.enabled),
            sharedCumulativeTimeLimit: state.dualRounds[action.eventId]?.sharedCumulativeTimeLimit ?? false,
          },
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
          competitorLimitSelector(state)
        );
        const numGroups = calcNumGroups({
          eventId,
          numCompetitors,
          numStations: parseInt(state.numStations || "0"),
        });

        const newRound: Round = {
          type: "aggregate",
          eventId,
          totalNumCompetitors: numCompetitors.toString(),
          numGroups: numGroups.toString(),
          scheduledTime: calcTimeForRound(
            eventId,
            numGroups,
            true,
            state.speedSlider
          ).toString(),
        };

        return {
          [eventId]: [newRound],
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

    case "REMOVE_EVENT":
      return {
        ...state,
        events: {
          ...state.events,
          [action.eventId]: null,
        },
        dualRounds: {
          ...state.dualRounds,
          [action.eventId]: { enabled: false, sharedCumulativeTimeLimit: false },
        },
        schedule: state.schedule.filter(
          (v) => v.type !== "event" || v.eventId !== action.eventId
        ),
        isExported: false,
      };

    case "ADD_ROUND":
      const withAddedRound = [...(state.events[action.eventId] ?? [])];

      const numCompetitors = !withAddedRound.length
        ? calcExpectedNumCompetitors(
            action.eventId,
            competitorLimitSelector(state)
          )
        : 0;

      const numGroups = calcNumGroups({
        eventId: action.eventId,
        numCompetitors,
        numStations: parseInt(state.numStations || "0"),
      });

      const roundToAdd: Round = {
        type: "aggregate",
        eventId: action.eventId,
        totalNumCompetitors: numCompetitors.toString(),
        numGroups: numGroups.toString(),
        scheduledTime: calcTimeForRound(
          action.eventId,
          numGroups,
          true,
          state.speedSlider
        ).toString(),
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
        speedOffset: state.speedSlider,
      });

      return {
        ...state,
        events: resetEvents,
        dualRounds: getDualRoundsFromWcif(state.wcif.events),
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

        const numCompetitorsPerRound = calcNumCompetitorsPerRound(
          rounds,
          state.events,
          state.dualRounds[eventId]?.enabled
        );
        // Reset only the first round's number of competitors with the expected
        // number of competitors.
        // For subsequent rounds, we reuse whatever custom value they set,
        // since we don't have any way of coming up with a better estimate
        numCompetitorsPerRound[0] = calcExpectedNumCompetitors(
          eventId,
          competitorLimitSelector(state)
        );

        const dual = hasDualRounds(rounds, state.dualRounds[eventId]?.enabled);
        if (dual) {
          numCompetitorsPerRound[1] = numCompetitorsPerRound[0];
        }
        const resetRounds = numCompetitorsPerRound.map((numCompetitors, i) => {
          const oldRound = rounds[i];
          const percentage = oldRound.type === "aggregate" &&
            oldRound.totalNumCompetitors.endsWith("%") && i > 0;
          if (percentage) {
            const sourceIndex = dual && i === 2 ? 0 : i - 1;
            numCompetitors = Math.floor(
              numCompetitorsPerRound[sourceIndex] * parseInt(oldRound.totalNumCompetitors) / 100
            );
            numCompetitorsPerRound[i] = numCompetitors;
          }
          const defaultNumGroups = calcNumGroups({
            eventId,
            numCompetitors,
            numStations: numStationsSelector(state),
          });
          const defaultScheduledTime = calcTimeForRound(
            eventId,
            defaultNumGroups,
            true,
            state.speedSlider
          );
          return {
            type: "aggregate" as const,
            eventId,
            totalNumCompetitors: dual && i === 1 ? "100%" : percentage && oldRound.type === "aggregate"
              ? oldRound.totalNumCompetitors : `${numCompetitors}`,
            numGroups: `${defaultNumGroups}`,
            scheduledTime: `${defaultScheduledTime}`,
          };
        });

        eventsWithResetRounds[eventId as EventId] = resetRounds;
      });

      return {
        ...state,
        events: eventsWithResetRounds,
      };

    case "CREATE_SIMUL_GROUP":
      return createSimulRound(state, action);

    case "DUPLICATE_SIMUL_GROUP":
      return duplicateSimulRound(state, action);

    case "UPDATE_SIMUL_GROUP":
      return updateSimulRound(state, action);

    case "REORDER_SIMUL_GROUP":
      return reorderSimulGroup(state, action);

    case "DELETE_SIMUL_GROUP":
      return deleteSimulGroup(state, action);

    default:
      return state;
  }
};
