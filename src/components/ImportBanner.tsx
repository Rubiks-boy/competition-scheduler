import { useEffect, useState } from "react";
import { Alert, Box, Link } from "@mui/material";
import { useSelector } from "../app/hooks";
import { activeStepSelector, importSourceSelector } from "../app/selectors";

export const LocalStorageBanner = () => {
  const importSource = useSelector(importSourceSelector);
  const activeStep = useSelector(activeStepSelector);

  const [showBanner, setShowBanner] = useState(true);

  const isFromLocalStorage = importSource === "local_storage";

  const hideBanner = () => setShowBanner(false);

  useEffect(() => {
    if (isFromLocalStorage && activeStep > 0) {
      setShowBanner(false);
    }
  }, [activeStep, isFromLocalStorage]);

  if (!isFromLocalStorage || !showBanner) {
    return null;
  }

  const resetState = () => {
    localStorage.removeItem("ScheduleGenerator.savedAppState");
    window.location.reload();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={"info"} onClose={hideBanner}>
        It looks like you previously worked on a schedule, and your progress was
        imported automatically.
        <br />
        Want to start from scratch instead?{" "}
        <Link href="#" variant="body2" onClick={resetState}>
          Click to delete this schedule.
        </Link>
      </Alert>
    </Box>
  );
};

export const UrlImportBanner = () => {
  const importSource = useSelector(importSourceSelector);

  const [showBanner, setShowBanner] = useState(true);

  const isFromUrl = importSource === "url";

  const hideBanner = () => setShowBanner(false);

  if (!isFromUrl || !showBanner) {
    return null;
  }

  const resetState = () => {
    localStorage.removeItem("ScheduleGenerator.savedAppState");
    window.location.reload();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={"success"} onClose={hideBanner}>
        You are viewing someone else's saved schedule.
        <br />
        Want to start from scratch instead?{" "}
        <Link href="#" variant="body2" onClick={resetState}>
          Create a new schedule.
        </Link>
      </Alert>
    </Box>
  );
};
export const ImportBanner = () => {
  return (
    <>
      <LocalStorageBanner />
      <UrlImportBanner />
    </>
  );
};
