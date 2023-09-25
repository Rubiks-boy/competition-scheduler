import { useState } from "react";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  isEventsSameAsWcifSelector,
  isUsingDefaultRoundsSelector,
} from "../../app/selectors";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { usePrevious } from "../../utils/hooks";

export const ResetEventsButton = () => {
  const dispatch = useDispatch();
  const isUsingDefaultRounds = useSelector(isUsingDefaultRoundsSelector);
  const isEventsSameAsWcif = useSelector(isEventsSameAsWcifSelector);

  // usePrevious is a mega cursed way to prevent the dialog from flashing while animating closed
  // It relies on the fact that we'll always render twice (once with dialog closed, and then again to open the dialog)
  // prior to the state of these being used for the dialog
  const prevDefaultRounds = usePrevious(isUsingDefaultRounds);
  const prevSameAsWcif = usePrevious(isEventsSameAsWcif);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const resetRounds = () => {
    closeDialog();
    setTimeout(() => {
      dispatch({
        type: "RESET_ROUNDS",
      });
    });
  };
  const resetToWcif = () => {
    closeDialog();
    setTimeout(() => {
      dispatch({
        type: "RESET_ESTIMATES_TO_WCIF",
      });
    });
  };

  if (isUsingDefaultRounds && isEventsSameAsWcif) {
    return null;
  }

  let dialogTitle = "Reset events?";
  let dialogBody = null;
  if (prevDefaultRounds) {
    dialogTitle = "Reimport events?";
    dialogBody =
      "This will reimport the events and schedule exactly as they appear on the WCA website.";
  } else if (prevSameAsWcif) {
    dialogBody =
      "This will reset the estimated number of groups and scheduled time for each round to our default calculations.";
  } else {
    dialogBody =
      "Reset the estimated number of groups and scheduled time for each round to our default calculations. Alternatively, choose to reimport the events and schedule exactly as they appear on the WCA website.";
  }

  const dialog = (
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>{dialogBody}</DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        {!prevDefaultRounds && (
          <Button onClick={resetRounds}>Reset round estimates</Button>
        )}
        {!prevSameAsWcif && (
          <Button onClick={resetToWcif}>Reimport from WCA site</Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {dialog}
      <Button onClick={openDialog}>
        {!isEventsSameAsWcif && isUsingDefaultRounds ? "Reimport" : "Reset"}
      </Button>
    </>
  );
};
