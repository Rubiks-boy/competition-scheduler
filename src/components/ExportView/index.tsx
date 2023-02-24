import { Button } from "@mui/material";
import React from "react";
import { useSelector } from "../../app/hooks";
import {
  eventsSelector,
  wcifSelector,
  wcifEventsSelector,
  accessTokenSelector,
  scheduleSelector,
  startTimeSelector,
  wcifScheduleSelector,
  otherActivitiesSelector,
} from "../../app/selectors";
import { saveWcifChanges } from "../../utils/wcaApi";
import { createWcifEvents, createWcifSchedule } from "../../utils/wcif";

const ExportView = () => {
  const events = useSelector(eventsSelector);
  const schedule = useSelector(scheduleSelector);
  const otherActivities = useSelector(otherActivitiesSelector);
  const startTime = useSelector(startTimeSelector);
  const originalWcifEvents = useSelector(wcifEventsSelector);
  const originalWcifSchedule = useSelector(wcifScheduleSelector);
  const originalWcif = useSelector(wcifSelector);
  const wcaAccessToken = useSelector(accessTokenSelector);

  const handleClick = async () => {
    if (!originalWcif || !originalWcifSchedule || !wcaAccessToken) {
      return;
    }

    const newWcifEvents = createWcifEvents(events, originalWcifEvents);
    const newWcifSchedule = createWcifSchedule({
      schedule,
      startTime,
      originalWcifSchedule,
      events,
      otherActivities,
    });

    const newWcif = {
      ...originalWcif,
      events: newWcifEvents,
      schedule: newWcifSchedule,
    };
    const resp = await saveWcifChanges(originalWcif, newWcif, wcaAccessToken);
    console.log("resp back", resp);
  };

  return (
    <div>
      <Button onClick={handleClick}>Save wcif</Button>
    </div>
  );
};

export default ExportView;
