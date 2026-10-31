import React from "react";
import { Box, Slider, Typography, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import { calcTimeForRound } from "../../utils/calculators";
import { competitionStyleSelector, speedSeletor } from "../../app/selectors";
import { Info } from "@mui/icons-material";

export const TimingsSlider = () => {
  const dispatch = useDispatch();
  const competitionStyle = useSelector(competitionStyleSelector);
  const speed = useSelector(speedSeletor);

  return (
    <div>
      <Typography
        variant="subtitle1"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <span>How fast do you like to run your competitions?</span>
        <Tooltip
          title={
            "Default group times for all events are scaled proportionally based on this value. In later steps, you can update how long specific rounds last."
          }
        >
          <Info fontSize="small" />
        </Tooltip>
      </Typography>
      <Box sx={{ maxWidth: "500px" }}>
        <Slider
          min={-10}
          max={10}
          value={speed}
          onChange={(_, v) =>
            dispatch({ type: "SET_SPEED", value: v as number })
          }
        />
      </Box>
      <Typography variant="body2">
        One group of 3x3 lasts {calcTimeForRound("333", 1, false, speed, competitionStyle)} minutes.
      </Typography>
    </div>
  );
};
