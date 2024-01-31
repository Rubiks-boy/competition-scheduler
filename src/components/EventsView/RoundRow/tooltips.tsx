import { InputAdornment, Tooltip } from "@mui/material";
import { Info, Warning, Error } from "@mui/icons-material";

export const TimeDiffTooltip = ({
  timeDiff,
  calculatedTime,
}: {
  timeDiff: number;
  calculatedTime: number;
}) => {
  if (timeDiff === 0) {
    // show a dummy hidden icon
    // this makes sure the up/down arrows on the text field don't jump around.
    return (
      <InputAdornment position="end" sx={{ visibility: "hidden" }}>
        <Info color="info" fontSize="small" />
      </InputAdornment>
    );
  }

  if (timeDiff % 5) {
    return (
      <InputAdornment position="end">
        <Tooltip title="Must be in increments of 5 minutes">
          <Error color="error" fontSize="small" />
        </Tooltip>
      </InputAdornment>
    );
  }

  return (
    <InputAdornment position="end">
      <Tooltip title={`Recommended time: ${calculatedTime}`}>
        {timeDiff >= 20 ? (
          <Warning color="warning" fontSize="small" />
        ) : (
          <Info color="info" fontSize="small" />
        )}
      </Tooltip>
    </InputAdornment>
  );
};

export const RegDiffTooltip = ({
  numRegistered,
  regDiffPercent,
}: {
  numRegistered: number;
  regDiffPercent: number;
}) => {
  return (
    <Tooltip title={`Number of competitors registered: ${numRegistered}`}>
      {regDiffPercent > 0.2 ? (
        <Warning color="warning" fontSize="small" />
      ) : (
        <Info color="info" fontSize="small" />
      )}
    </Tooltip>
  );
};
