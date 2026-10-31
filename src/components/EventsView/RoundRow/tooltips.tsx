import { useSelector } from "../../../app/hooks";
import { competitionStyleSelector } from "../../../app/selectors";
import { InputAdornment, Tooltip } from "@mui/material";
import { Info, CheckCircle, Warning, Error } from "@mui/icons-material";

export const TimeDiffTooltip = ({
  scheduledTime,
  calculatedTime,
  roundingMinutes = 5,
}: {
  scheduledTime: number;
  calculatedTime: number;
  roundingMinutes?: number;
}) => {
  const timeDiff = Math.abs(calculatedTime - scheduledTime);

  if (scheduledTime % roundingMinutes) {
    return (
      <InputAdornment position="end">
        <Tooltip title={`Must be in increments of ${roundingMinutes} minutes`}>
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
      ) : regDiffPercent > 0.05 ? (
        <Info color="info" fontSize="small" />
      ) : (
        <CheckCircle color="success" fontSize="small" />
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
    ? `We predict ${numPredicted} competitors will register, and you've scheduled for ${totalInRound} competitors`
    : `We predict ${numPredicted} competitors will register`;

  return (
    <Tooltip title={title}>
      {diffPercent > 0.2 ? (
        <Warning color="warning" fontSize="small" />
      ) : diffPercent > 0.05 ? (
        <Info color="info" fontSize="small" />
      ) : (
        <CheckCircle color="success" fontSize="small" />
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

export const GroupCapacityWarning = ({
  numCompetitors,
  numGroups,
  numStations,
  hasOverfullGroup = false,
}: {
  numCompetitors: number;
  numGroups: number;
  numStations: number;
  hasOverfullGroup?: boolean;
}) => {
  const competitionStyle = useSelector(competitionStyleSelector);
  if (competitionStyle !== "runningJudges" || numStations <= 0 || (
    !hasOverfullGroup && !(numCompetitors > numGroups * numStations)
  )) {
    return null;
  }
  const minimumGroups = Math.ceil(numCompetitors / numStations);
  const message = hasOverfullGroup && numGroups >= minimumGroups
    ? "Redistribute competitors between groups to ensure every competitor has a place to sit."
    : `At least ${minimumGroups} groups are needed to ensure every competitor has a place to sit.`;
  return (
    <InputAdornment position="end">
      <Tooltip title={message}>
        <Warning color="warning" fontSize="small" aria-label="Group capacity exceeded" />
      </Tooltip>
    </InputAdornment>
  );
};
