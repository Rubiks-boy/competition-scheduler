import { useState } from "react";
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
  competitionSelector,
  shareableAppStateSelector,
} from "../../app/selectors";
import type { ShareableState } from "../../app/types";
import { ContentCopy } from "@mui/icons-material";
import { useSaveToWcif } from "./useSaveToWcif";

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
  const competition = useSelector(competitionSelector);
  const saveToWcif = useSaveToWcif();

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
    setIsSavePending(true);

    const { error } = await saveToWcif();

    setIsSavePending(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage("Successfully saved your updated events and schedule");
      dispatch({ type: "EXPORTED" });
    }
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
