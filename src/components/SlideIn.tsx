import React, { ReactElement, useEffect, useState } from "react";
import { AnimatePresence } from "./AnimatePresence";

import "./SlideIn.css";

export const SlideIn = ({ children }: { children: Array<ReactElement> }) => {
  const [numShowing, setNumShowing] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      if (numShowing < children.length) {
        setNumShowing((numShowing) => numShowing + 1);
      }
    }, 100);
  }, [children.length, numShowing]);

  return (
    <AnimatePresence duration={children.length * 100} className="slideIn">
      <div key={"yeet"}>
        {children.slice(0, numShowing).map((child, i) => (
          <div className="slideIn-child" key={i}>
            {child}
          </div>
        ))}
      </div>
    </AnimatePresence>
  );
};
