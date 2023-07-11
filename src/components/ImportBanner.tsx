import { useState } from "react";
import { Alert, Box, Link } from "@mui/material";
import { useDispatch, useSelector } from "../app/hooks";
import { importSourceSelector } from "../app/selectors";

export const ImportBanner = () => {
  const importSource = useSelector(importSourceSelector);
  const dispatch = useDispatch();
  const [showBanner, setShowBanner] = useState(true);

  const hideBanner = () => setShowBanner(false);

  if (!importSource || !showBanner) {
    return null;
  }

  const resetState = () => {
    dispatch({
      type: "RESET_STATE",
    });
  };

  const severity = importSource === "local_storage" ? "info" : "success";
  const alertBody =
    importSource === "local_storage"
      ? "It looks like you previously worked on a schedule, and your progress was imported automatically."
      : "You are viewing someone else's saved schedule.";

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={severity} onClose={hideBanner}>
        {alertBody}
        <br />
        Want to start from scratch instead?{" "}
        <Link href="#" variant="body2" onClick={resetState}>
          Click here to reset.
        </Link>
      </Alert>
    </Box>
  );
};
