import { Button } from "@mui/material";
import React from "react";
import { useSelector } from "../../app/hooks";
import {
  eventsSelector,
  wcifSelector,
  wcifEventsSelector,
  accessTokenSelector,
} from "../../app/selectors";
import { saveWcifChanges } from "../../utils/wcaApi";
import { roundsToWcifEvents } from "../../utils/wcif";

const ExportView = () => {
  const events = useSelector(eventsSelector);
  const originalWcifEvents = useSelector(wcifEventsSelector);
  const originalWcif = useSelector(wcifSelector);
  const wcaAccessToken = useSelector(accessTokenSelector);

  const handleClick = async () => {
    // if (!originalWcif || !wcaAccessToken) {
    //   return;
    // }
    // const newWcifEvents = roundsToWcifEvents(rounds, originalWcifEvents);
    // const newWcif = {
    //   ...originalWcif,
    //   events: newWcifEvents,
    // };
    // const resp = await saveWcifChanges(originalWcif, newWcif, wcaAccessToken);
    // console.log("resp back", resp);
  };

  return (
    <div>
      <Button onClick={handleClick}>Save wcif</Button>
    </div>
  );
};

export default ExportView;
