import React from "react";
import { Box, Slider, Typography } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import { speedSeletor } from "../../app/selectors";

export const TimingsSlider = () => {
  const dispatch = useDispatch();
  const speed = useSelector(speedSeletor);

  return (
    <div>
      <Typography variant="subtitle1">
        How fast do you like to run your competitions?
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
        One group of 3x3 lasts {20 + speed} minutes.
      </Typography>
    </div>
  );
};
