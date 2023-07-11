import React from "react";
import { Grid, Checkbox, FormControlLabel } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import { stagesSelector } from "../../app/selectors";
import type { Stage } from "../../types";
import { STAGE_NAMES_AND_COLORS } from "../../constants";

export const Stages = () => {
  const dispatch = useDispatch();
  const stages = useSelector(stagesSelector);

  const onStageChecked = (stage: Stage) => {
    dispatch({
      type: "STAGE_CHECKED",
      stage,
      checked: true,
    });
  };

  const onStageUnchecked = (stage: Stage) => {
    dispatch({
      type: "STAGE_CHECKED",
      stage,
      checked: false,
    });
  };

  return (
    <>
      {STAGE_NAMES_AND_COLORS.map(({ stage, color }) => (
        <Grid item xs={12} key={stage}>
          <FormControlLabel
            control={
              <Checkbox
                checked={stages.includes(stage)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  e.target.checked
                    ? onStageChecked(stage)
                    : onStageUnchecked(stage)
                }
                sx={{
                  color,
                  "&.Mui-checked": {
                    color,
                  },
                }}
              />
            }
            label={stage}
          />
        </Grid>
      ))}
    </>
  );
};
