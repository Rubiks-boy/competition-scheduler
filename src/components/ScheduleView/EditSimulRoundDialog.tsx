import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import { EventTable } from "../EventsView/EventTable";
import { RoundRow } from "../EventsView/RoundRow";
import type { EventId } from "../../types";

export const EditSimulScheduleDialog = ({
  eventId,
  roundIndex,
}: {
  eventId: EventId;
  roundIndex: number;
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const dialog = (
    <Dialog open={isDialogOpen} onClose={closeDialog} maxWidth="md">
      <DialogTitle>Edit round</DialogTitle>
      <DialogContent>
        <EventTable>
          <RoundRow eventId={eventId} roundIndex={roundIndex} />
        </EventTable>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Done</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {dialog}
      <Button
        onClick={openDialog}
        sx={
          prefersDarkMode
            ? { color: "#fff", backgroundColor: "#0003" }
            : { color: "#000", backgroundColor: "#fff3" }
        }
      >
        <Settings />
      </Button>
    </>
  );
};
