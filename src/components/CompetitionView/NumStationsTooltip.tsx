import { Info, Warning } from "@mui/icons-material";
import { InputAdornment, Tooltip } from "@mui/material";
import {
  MAX_LIMIT_STATIONS_RATIO,
  MIN_LIMIT_STATIONS_RATIO,
} from "../../constants";

export const NumStationsTooltip = ({
  competitorsPerStation,
  useStationary,
}: {
  competitorsPerStation: number;
  useStationary: boolean;
}) => {
  if (useStationary) {
    console.log(Math.round(competitorsPerStation));
    if (Math.round(competitorsPerStation) < 5) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Using a large number of stations could result in small group sizes and may make recruiting staff like judges and runners difficult.">
            {competitorsPerStation > 6 ? (
              <Warning color="warning" fontSize="small" />
            ) : (
              <Info color="info" fontSize="small" />
            )}
          </Tooltip>
        </InputAdornment>
      );
    } else if (Math.round(competitorsPerStation) > 5) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Using a small number of stations could result in large group sizes and extended round times.">
            {competitorsPerStation < 4 ? (
              <Warning color="warning" fontSize="small" />
            ) : (
              <Info color="info" fontSize="small" />
            )}
          </Tooltip>
        </InputAdornment>
      );
    }
  } else {
    if (competitorsPerStation > MAX_LIMIT_STATIONS_RATIO) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Using a small number of stations extends how long certain rounds last.">
            {competitorsPerStation > MAX_LIMIT_STATIONS_RATIO * 1.2 ? (
              <Warning color="warning" fontSize="small" />
            ) : (
              <Info color="info" fontSize="small" />
            )}
          </Tooltip>
        </InputAdornment>
      );
    } else if (competitorsPerStation < MIN_LIMIT_STATIONS_RATIO) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Using this many stations may make recruiting staff like judges and runners difficult.">
            {competitorsPerStation * 1.2 < MIN_LIMIT_STATIONS_RATIO ? (
              <Warning color="warning" fontSize="small" />
            ) : (
              <Info color="info" fontSize="small" />
            )}
          </Tooltip>
        </InputAdornment>
      );
    }
  }

  return null;
};
