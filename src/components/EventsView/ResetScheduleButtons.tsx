import { useState } from "react";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  hasReorderedEventsSelector,
  isScheduleSameAsWcifSelector,
  isNumRoundsPerEventSameAsWcifSelector,
} from "../../app/selectors";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const ButtonWithDialogConfirmation = ({
  dialogTitle,
  dialogBody,
  buttonText,
  confirmText,
  onConfirm,
  disabled,
}: {
  dialogTitle: string;
  dialogBody: string;
  buttonText: string;
  confirmText: string;
  onConfirm: () => void;
  disabled: boolean;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const onClick = () => {
    closeDialog();
    onConfirm();
  };

  const dialog = (
    <Dialog open={isDialogOpen && !disabled} onClose={closeDialog}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>{dialogBody}</DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={onClick}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {dialog}
      <Button disabled={disabled} onClick={openDialog}>
        {buttonText}
      </Button>
    </>
  );
};

const ResetButton = () => {
  const dispatch = useDispatch();
  const hasReorderedEvents = useSelector(hasReorderedEventsSelector);

  const resetSchedule = () => {
    dispatch({
      type: "RESET_SCHEDULE",
    });
  };

  return (
    <ButtonWithDialogConfirmation
      dialogTitle="Reset schedule?"
      dialogBody="This will reset the event ordering to our default calculations."
      confirmText="Reset schedule"
      buttonText="Reset"
      onConfirm={resetSchedule}
      disabled={!hasReorderedEvents}
    />
  );
};

const ReimportButton = () => {
  const dispatch = useDispatch();
  const isScheduleSameAsWcif = useSelector(isScheduleSameAsWcifSelector);

  const reimportScheduleFromWcif = () => {
    dispatch({
      type: "REIMPORT_SCHEDULE_FROM_WCIF",
    });
  };

  return (
    <ButtonWithDialogConfirmation
      dialogTitle="Reimport schedule?"
      dialogBody="This will reimport the schedule ordering from what's currently on the WCA website."
      confirmText="Reimport from WCA site"
      buttonText="Reimport"
      onConfirm={reimportScheduleFromWcif}
      disabled={isScheduleSameAsWcif}
    />
  );
};

export const ResetScheduleButtons = () => {
  const isNumRoundsPerEventSameAsWcif = useSelector(
    isNumRoundsPerEventSameAsWcifSelector
  );

  return isNumRoundsPerEventSameAsWcif ? <ReimportButton /> : <ResetButton />;
};
