import React from "react";
import { Grid, TextField, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import type { CustomStage } from "../../types";
import { ColorPicker, ColorValue } from "mui-color";
import {
  customStagesSelector,
  isUsingCustomStagesSelector,
} from "../../app/selectors";
import DeleteIcon from "@mui/icons-material/Delete";

import "./CustomStages.css";

export const CustomStages = () => {
  const dispatch = useDispatch();
  const customStages = useSelector(customStagesSelector);
  const isUsingCustomStages = useSelector(isUsingCustomStagesSelector);

  const onStageChange = (index: number, customStage: CustomStage) => {
    dispatch({
      type: "CUSTOM_STAGE_CHANGED",
      index,
      customStage,
    });
  };

  const onStageNameChange = (index: number, stage: string) => {
    const { color } = customStages[index];
    onStageChange(index, {
      stage,
      color,
    });
  };

  const onStageColorChange = (index: number, color: ColorValue) => {
    const { stage } = customStages[index];

    // Only allow hex values in the color picker
    if (typeof color !== "object" || !("hex" in color)) {
      return;
    }

    // Only allow 3 or 6 digit hex values (i.e. not transparent)
    if (/^([0-9a-fA-f]){3}(([0-9a-fA-f]){3})?$/.test(color.hex)) {
      onStageChange(index, {
        stage,
        color: `#${color.hex}`,
      });
    }
  };

  const removeStage = (index: number) => {
    dispatch({
      type: "REMOVE_CUSTOM_STAGE",
      index,
    });
  };

  const addCustomStage = () => {
    dispatch({
      type: "ADD_CUSTOM_STAGE",
    });
  };

  return (
    <>
      <Grid item xs={12}>
        {isUsingCustomStages && (
          <Button
            variant="outlined"
            onClick={addCustomStage}
            disabled={customStages.length >= 6}
            sx={{ mr: 3 }}
          >
            Add stage
          </Button>
        )}
      </Grid>
      {customStages.map(({ stage, color }, index) => (
        <Grid container item xs={12} key={index} spacing={3}>
          <Grid item xs={5} sm={4}>
            <TextField
              fullWidth
              label="Stage name"
              type="string"
              value={stage}
              onChange={(e) => onStageNameChange(index, e.target.value)}
            />
          </Grid>
          <Grid item xs={5} sm={4} className={"CustomStages-PickerContainer"}>
            <ColorPicker
              value={color}
              onChange={(color) => {
                onStageColorChange(index, color);
              }}
            />
          </Grid>
          <Grid item xs={2} sx={{ alignItems: "center", display: "flex" }}>
            <IconButton onClick={() => removeStage(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </>
  );
};
