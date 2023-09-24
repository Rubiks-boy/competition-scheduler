import React, { useState } from "react";
import { Buffer } from "buffer";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
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
  shareableAppStateSelector,
  competitorLimitSelector,
  numStationsSelector,
  stagesInUseSelector,
  numberOfDaysSelector,
} from "../../app/selectors";
import { saveWcifChanges } from "../../utils/wcaApi";
import { createWcifEvents, createWcifSchedule } from "../../utils/wcif";
import type { ShareableState } from "../../app/types";
import { ContentCopy } from "@mui/icons-material";

const getShareableUrl = (state: ShareableState) => {
  const stateStr = JSON.stringify(state);
  const encodedState = Buffer.from(stateStr).toString("base64");

  const { origin } = window.location;

  const shareableUrl = `${origin}/?appState=${encodedState}`;

  return shareableUrl;
};

const ExportView = () => {
  const dispatch = useDispatch();
  const shareableState = useSelector(shareableAppStateSelector);
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

  const shareableUrl = getShareableUrl(shareableState);

  const [errorMessage, setErrorMessage] = useState<String | null>(null);
  const [successMessage, setSuccessMessage] = useState<String | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSavePending, setIsSavePending] = useState<boolean>(false);
  const openDialog = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDialogOpen(true);
  };
  const closeDialog = () => setIsDialogOpen(false);

  const handleSaveClick = async () => {
    closeDialog();

    if (
      !originalWcif ||
      !originalWcifSchedule ||
      !wcaAccessToken ||
      !competition
    ) {
      setErrorMessage(
        "Unexpected error: Missing original WCIF schedule, comp info, or access token. Please refresh the page and try again."
      );
      return;
    }

    setIsSavePending(true);

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
      competitorLimit: parseInt(competitorLimit),
      events: newWcifEvents,
      schedule: newWcifSchedule,
    };

    const resp = await saveWcifChanges(originalWcif, newWcif, wcaAccessToken);

    setIsSavePending(false);

    if (resp.error) {
      setErrorMessage(
        `Error while saving the WCIF to the WCA website: ${resp.error}`
      );
      return;
    }

    dispatch({ type: "EXPORTED" });
    setSuccessMessage("Successfully saved your updated events and schedule");
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(shareableUrl);
  };

  const dialog = (
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      <DialogTitle>Woah there! Are you sure?</DialogTitle>
      <DialogContent>
        Continuing will overwrite all event and schedule info on the WCA website
        for {competition?.name || "your competition"}. This can't be undone. Are
        you sure you want to continue?
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>No</Button>
        <Button onClick={handleSaveClick}>Yes</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div>
      <Typography sx={{ mb: 3 }} variant="h6">
        Export
      </Typography>
      {dialog}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Button onClick={openDialog} disabled={isDialogOpen || isSavePending}>
        Export to competition website
      </Button>
      <br />
      <Button onClick={handleCopyClick}>
        <ContentCopy sx={{ mr: 1 }} />
        Copy shareable URL
      </Button>
    </div>
  );
};

export default ExportView;
