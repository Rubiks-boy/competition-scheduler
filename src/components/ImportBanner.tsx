import { useEffect, useState } from "react";
import { Alert, Box, Link } from "@mui/material";
import { useDispatch, useSelector } from "../app/hooks";
import { activeStepSelector, importSourceSelector } from "../app/selectors";

export const ImportBanner = () => {
  const importSource = useSelector(importSourceSelector);
  const dispatch = useDispatch();
  const [showBanner, setShowBanner] = useState(true);
  const activeStep = useSelector(activeStepSelector);

  const hideBanner = () => setShowBanner(false);

  useEffect(() => {
    if (activeStep > 0) {
      setShowBanner(false);
    }
  }, [activeStep]);

  if (!importSource || !showBanner) {
    return null;
  }

  const resetState = () => {
    localStorage.removeItem("ScheduleGenerator.savedAppState");
    dispatch({
      type: "RESET_STATE",
    });
  };

  const severity = importSource === "local_storage" ? "info" : "success";
  const alertBody =
    importSource === "local_storage"
      ? "It looks like you previously worked on a schedule, and your progress was imported automatically."
      : "You are viewing someone else's saved schedule.";
  const resetBody =
    importSource === "local_storage"
      ? "Click to delete this schedule."
      : "Create a new schedule instead.";

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={severity} onClose={hideBanner}>
        {alertBody}
        <br />
        Want to start from scratch instead?{" "}
        <Link href="#" variant="body2" onClick={resetState}>
          {resetBody}
        </Link>
      </Alert>
    </Box>
  );
};
