import { InputAdornment, TextField } from "@mui/material";
import classNames from "classnames";
import { RegDiffTooltip } from "./tooltips";

export const NumCompetitorsInput = ({
  numCompetitors,
  roundNum,
  onChange,
  numRegistered,
  regDiffPercent,
}: {
  numCompetitors: string;
  roundNum: number;
  onChange: (value: string) => void;
  numRegistered: number;
  regDiffPercent: number;
}) => {
  return (
    <div
      className={classNames("events-fieldWithTooltip", {
        "events-fieldWithTooltip--showTooltip": numRegistered > 0,
      })}
    >
      <TextField
        hiddenLabel
        size="small"
        value={numCompetitors}
        onChange={(e) => {
          const isPercent = roundNum > 0 && e.target.value.endsWith("%");
          const numCompetitors = `${parseInt(e.target.value) || ""}`;
          const value = `${numCompetitors}${isPercent ? "%" : ""}`;
          onChange(value);
        }}
        InputProps={{
          endAdornment: roundNum === 0 && numRegistered > 0 && (
            <InputAdornment position="end">
              <RegDiffTooltip
                regDiffPercent={regDiffPercent}
                numRegistered={numRegistered}
              />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};
