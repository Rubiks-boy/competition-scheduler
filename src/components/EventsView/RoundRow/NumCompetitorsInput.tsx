import { InputAdornment, TextField } from "@mui/material";
import classNames from "classnames";
import { PredictedRegDiffTooltip, RegDiffTooltip } from "./tooltips";
import { Error } from "@mui/icons-material";

export const NumCompetitorsInput = ({
  numCompetitors,
  roundIndex,
  onChange,
  numRegistered,
  regDiffPercent,
  estimatedCompetitors,
  totalInRoundWithSimul,
}: {
  numCompetitors: string;
  roundIndex: number;
  onChange: (value: string) => void;
  numRegistered?: number;
  regDiffPercent?: number;
  estimatedCompetitors?: number;
  totalInRoundWithSimul?: number;
}) => {
  let endAdornment = null;
  if (!parseInt(numCompetitors)) {
    endAdornment = (
      <InputAdornment position="end">
        <Error color="error" fontSize="small" />
      </InputAdornment>
    );
  } else if (
    !!regDiffPercent &&
    !!numRegistered &&
    roundIndex === 0 &&
    numRegistered > 0
  ) {
    endAdornment = (
      <InputAdornment position="end">
        <RegDiffTooltip
          regDiffPercent={regDiffPercent}
          numRegistered={numRegistered}
        />
      </InputAdornment>
    );
  } else if (
    roundIndex === 0 &&
    estimatedCompetitors &&
    totalInRoundWithSimul
  ) {
    const predictedDiffPerc =
      (estimatedCompetitors - totalInRoundWithSimul) / estimatedCompetitors;

    endAdornment = (
      <InputAdornment position="end">
        <PredictedRegDiffTooltip
          numPredicted={estimatedCompetitors}
          diffPercent={predictedDiffPerc}
          totalInRound={totalInRoundWithSimul}
        />
      </InputAdornment>
    );
  }

  return (
    <div
      className={classNames("events-fieldWithTooltip", {
        "events-fieldWithTooltip--showTooltip":
          numRegistered && numRegistered > 0,
      })}
    >
      <TextField
        hiddenLabel
        size="small"
        value={numCompetitors}
        onChange={(e) => {
          const isPercent = roundIndex > 0 && e.target.value.endsWith("%");
          const numCompetitors = `${parseInt(e.target.value) || ""}`;
          const value = `${numCompetitors}${isPercent ? "%" : ""}`;
          onChange(value);
        }}
        InputProps={{
          endAdornment,
        }}
      />
    </div>
  );
};
