import { InputAdornment, Tooltip } from "@mui/material";
import { Info, Warning, Error } from "@mui/icons-material";

export const TimeDiffTooltip = ({
  scheduledTime,
  calculatedTime,
}: {
  scheduledTime: number;
  calculatedTime: number;
}) => {
  const timeDiff = Math.abs(calculatedTime - scheduledTime);

  if (scheduledTime % 5) {
    return (
      <InputAdornment position="end">
        <Tooltip title="Must be in increments of 5 minutes">
          <Error color="error" fontSize="small" />
        </Tooltip>
      </InputAdornment>
    );
  }

  if (timeDiff < 5) {
    // show a dummy hidden icon
    // this makes sure the up/down arrows on the text field don't jump around.
    return (
      <InputAdornment position="end" sx={{ visibility: "hidden" }}>
        <Info color="info" fontSize="small" />
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

export const PredictedRegDiffTooltip = ({
  numPredicted,
  totalInRound,
  diffPercent,
}: {
  numPredicted: number;
  totalInRound?: number;
  diffPercent: number;
}) => {
  const title = totalInRound
    ? `We predict ${numPredicted} competitors will register, but you've scheduled for ${totalInRound} competitors`
    : `We predict ${numPredicted} competitors will register`;

  return (
    <Tooltip title={title}>
      {diffPercent > 0.2 ? (
        <Warning color="warning" fontSize="small" />
      ) : (
        <Info color="info" fontSize="small" />
      )}
    </Tooltip>
  );
};

export const SimulRatioTooltip = ({
  roundName,
  numCompetitors,
}: {
  roundName: string;
  numCompetitors: number;
}) => {
  return (
    <Tooltip
      title={`Competitors per station, including ${numCompetitors} competitors in ${roundName}.`}
      sx={{ position: "absolute", left: "4.5ch", opacity: 0.6 }}
    >
      <Info fontSize="small" />
    </Tooltip>
  );
};
