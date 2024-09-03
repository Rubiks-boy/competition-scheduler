import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import CompetitionView from "./CompetitionView";
import { useDispatch, useSelector } from "../app/hooks";
import { SignIn } from "./Header/SignIn";
import {
  activeStepSelector,
  canAdvanceToNext,
  isSignedInSelector,
} from "../app/selectors";
import AddEventsView from "./AddEventsView";
import EventsView from "./EventsView";
import ScheduleView from "./ScheduleView";
import ExportView from "./ExportView";
import VenueView from "./VenueView";
import { NotSignedInView } from "./NotSignedInView";

const steps = [
  "Configure competition",
  "Events",
  "Rounds",
  "Schedule",
  "Venue",
  "Export",
];

const stepComponents = [
  CompetitionView,
  AddEventsView,
  EventsView,
  ScheduleView,
  VenueView,
  ExportView,
];

const StepContent = ({ activeStep }: { activeStep: number }) => {
  const Component = stepComponents[activeStep] ?? <div>tbd</div>;
  return <Component />;
};

export const ScheduleStepper = () => {
  const dispatch = useDispatch();
  const activeStep = useSelector(activeStepSelector);
  const isSignedIn = useSelector(isSignedInSelector);
  const isNextDisabled = !useSelector((state) =>
    canAdvanceToNext(state, activeStep)
  );

  const setActiveStep = (activeStep: number) => {
    dispatch({
      type: "SET_ACTIVE_STEP",
      activeStep,
    });
  };

  const handleNext = () => setActiveStep(activeStep + 1);

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleReset = () => {
    setActiveStep(0);
  };

  if (!isSignedIn) {
    return <NotSignedInView />;
  }

  const backButton = (
    <Button
      color="inherit"
      disabled={activeStep === 0}
      onClick={handleBack}
      sx={{ mr: 1 }}
    >
      Back
    </Button>
  );

  const nextButton =
    activeStep === steps.length - 1 ? (
      <Button onClick={handleReset}>Reset</Button>
    ) : (
      <Button onClick={handleNext} disabled={isNextDisabled}>
        Next
      </Button>
    );

  return (
    <Box sx={{ width: "100%", marginBottom: "1em" }}>
      <Box sx={{ display: "flex" }}>
        {backButton}
        <Stepper activeStep={activeStep} sx={{ flex: "1 1 auto" }}>
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
        {nextButton}
      </Box>
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
          <Box sx={{ mt: 4 }}>
            <StepContent activeStep={activeStep} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              mt: 3,
            }}
          >
            {backButton}
            <Box sx={{ flex: "1 1 auto" }} />
            {nextButton}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};
