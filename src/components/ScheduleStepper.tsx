import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CompetitionView from "./CompetitionView";
import { useSelector } from "../app/hooks";
import { SignIn } from "./Header/SignIn";
import { isSignedInSelector } from "../app/selectors";
import EventsView from "./EventsView";
import ScheduleView from "./ScheduleView";
import ExportView from "./ExportView";

const steps = ["Configure competition", "Events", "Schedule"];

const StepContent = ({ activeStep }: { activeStep: number }) => {
  switch (activeStep) {
    case 0:
      return <CompetitionView />;
    case 1:
      return <EventsView />;
    case 2:
      return <ScheduleView />;
    default:
      return <div>tbd</div>;
  }
};

export const ScheduleStepper = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const isSignedIn = useSelector(isSignedInSelector);

  const handleNext = () =>
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

  const handleBack = () =>
    setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const handleReset = () => {
    setActiveStep(0);
  };

  if (!isSignedIn) {
    return <SignIn />;
  }

  return (
    <Box sx={{ width: "100%", marginBottom: "1em" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <ExportView />
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>{steps[activeStep]}</Typography>
          <StepContent activeStep={activeStep} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              pt: 2,
            }}
          >
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};
