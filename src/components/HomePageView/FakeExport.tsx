import React, { useState, useEffect } from "react";
import { Alert, Button, Typography } from "@mui/material";
import { Autorenew, ContentCopy } from "@mui/icons-material";
import cn from "classnames";

export const FakeExport = () => {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        setExported(true);
      }, 3000);
    }, 2000);
  }, []);

  return (
    <div
      className={cn("FakeExport", {
        "FakeExport--loading": loading,
        "FakeExport--exported": exported,
      })}
    >
      <Typography variant="h6">Export</Typography>
      <div className="FakeExport-alert">
        <Alert sx={{ mt: 2 }} severity="success">
          Exported to WCA
        </Alert>
      </div>

      <div className="FakeExport-button">
        <Button>Export to competition website</Button>
        <Autorenew />
      </div>
      <Button sx={{ mt: 1 }} endIcon={<ContentCopy />}>
        Copy shareable URL
      </Button>
    </div>
  );
};
