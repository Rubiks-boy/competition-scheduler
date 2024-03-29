import { useState } from "react";
import { Alert, Box, Link } from "@mui/material";
import { useSelector } from "../../app/hooks";
import {
  isImportedFromUrlSelector,
  competitionNameSelector,
} from "../../app/selectors";

export const UrlImportBanner = () => {
  const isFromUrl = useSelector(isImportedFromUrlSelector);
  const competitionName = useSelector(competitionNameSelector);

  const [showBanner, setShowBanner] = useState(true);

  const hideBanner = () => setShowBanner(false);

  if (!isFromUrl || !showBanner) {
    return null;
  }

  const resetState = () => {
    localStorage.removeItem("ScheduleGenerator.savedAppState");
    // Refresh without query params
    window.location.replace(window.location.pathname);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={"success"} onClose={hideBanner}>
        {competitionName
          ? `You are viewing someone else's schedule draft for ${competitionName}.`
          : "You are viewing someone else's schedule draft."}
        <br />
        Want to start from scratch instead?{" "}
        <Link href="#" variant="body2" onClick={resetState}>
          Create a new schedule.
        </Link>
      </Alert>
    </Box>
  );
};
