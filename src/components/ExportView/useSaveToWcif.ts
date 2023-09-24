import { useSelector } from "../../app/hooks";
import {
  eventsSelector,
  wcifSelector,
  wcifEventsSelector,
  accessTokenSelector,
  scheduleSelector,
  startTimesSelector,
  wcifScheduleSelector,
  otherActivitiesSelector,
  competitionSelector,
  venueNameSelector,
  competitorLimitSelector,
  numStationsSelector,
  stagesInUseSelector,
  numberOfDaysSelector,
} from "../../app/selectors";
import { saveWcifChanges } from "../../utils/wcaApi";
import { createWcifEvents, createWcifSchedule } from "../../utils/wcif";

export const useSaveToWcif = () => {
  const competitorLimit = useSelector(competitorLimitSelector);
  const events = useSelector(eventsSelector);
  const schedule = useSelector(scheduleSelector);
  const otherActivities = useSelector(otherActivitiesSelector);
  const startTimes = useSelector(startTimesSelector);
  const originalWcifEvents = useSelector(wcifEventsSelector);
  const originalWcifSchedule = useSelector(wcifScheduleSelector);
  const originalWcif = useSelector(wcifSelector);
  const wcaAccessToken = useSelector(accessTokenSelector);
  const competition = useSelector(competitionSelector);
  const venueName = useSelector(venueNameSelector);
  const stagesInUse = useSelector(stagesInUseSelector);
  const numStations = useSelector(numStationsSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);

  return async () => {
    if (
      !originalWcif ||
      !originalWcifSchedule ||
      !wcaAccessToken ||
      !competition
    ) {
      return {
        error:
          "Unexpected error: Missing original WCIF schedule, comp info, or access token. Please refresh the page and try again.",
      };
    }

    const newWcifEvents = createWcifEvents(events, originalWcifEvents);
    const newWcifSchedule = createWcifSchedule({
      schedule,
      startTimes,
      originalWcifSchedule,
      events,
      otherActivities,
      originalCompetition: competition,
      venueName,
      stagesInUse,
      numStations,
      numberOfDays,
    });

    const newWcif = {
      ...originalWcif,
      competitorLimit: competitorLimit,
      events: newWcifEvents,
      schedule: newWcifSchedule,
    };

    const resp = await saveWcifChanges(originalWcif, newWcif, wcaAccessToken);

    if (resp.error) {
      return {
        error: `Error while saving the WCIF to the WCA website: ${resp.error}`,
      };
    }

    // Succeeded!
    return {
      error: null,
    };
  };
};
