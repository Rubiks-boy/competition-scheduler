import React, { useState, useEffect } from "react";
import cn from "classnames";
import { FakeReorderView } from "./FakeReorderView";
import { FakeExport } from "./FakeExport";
import { FakeAddEvents } from "./FakeAddEvents";

export const Preview = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const int = setInterval(() => {
      // 1 = add events
      // 2 = reorder
      // 3 = export
      setActiveStep((a) => (a + 1 > 3 ? 1 : a + 1));
    }, 8000);

    return () => {
      clearInterval(int);
    };
  }, []);

  return (
    <div className="Preview">
      <div className="Preview-steps">
        <span
          className={cn("Preview-step", {
            "Preview-step--active": activeStep === 1,
          })}
        >
          Add events
        </span>
        <span
          className={cn("Preview-step", {
            "Preview-step--active": activeStep === 2,
          })}
        >
          Reorder rounds
        </span>
        <span
          className={cn("Preview-step", {
            "Preview-step--active": activeStep === 3,
          })}
        >
          Export schedule
        </span>
      </div>
      <div className="Preview-animation">
        {activeStep === 1 && <FakeAddEvents />}
        {activeStep === 2 && <FakeReorderView />}
        {activeStep === 3 && <FakeExport />}
      </div>
    </div>
  );
};
