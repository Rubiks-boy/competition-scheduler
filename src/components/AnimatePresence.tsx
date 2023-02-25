import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";

import "./AnimatePresence.css";

const usePrevious = (val: any) => {
  const prev = useRef(val);
  useEffect(() => {
    prev.current = val;
  }, [val]);
  return prev.current;
};

export const AnimatePresence = ({
  children,
  duration = 300,
}: {
  children: React.ReactElement;
  duration?: number;
}) => {
  const previousChildren = useRef<React.ReactElement | null>(null);
  const previousKey = usePrevious(children?.key);
  const [isAnimating, setIsAnimating] = useState(false);

  const newChild = children?.key !== previousKey;
  const rerenderWhileAnimating = newChild && isAnimating;

  useEffect(() => {
    setIsAnimating(true);

    const resetAfterAnimating = () => {
      previousChildren.current = children;
      setIsAnimating(false);
    };

    const timeout = setTimeout(() => {
      resetAfterAnimating();
    }, duration);

    return () => {
      resetAfterAnimating();
      clearTimeout(timeout);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children?.key, duration]);

  return (
    <div className="animatePresence-container">
      {previousChildren.current &&
        !rerenderWhileAnimating &&
        (newChild || isAnimating) && (
          <div
            className={classNames("animatePresence animatePresence--exiting", {
              "animatePresence--exitingActive": isAnimating,
            })}
            key={previousChildren.current?.key}
          >
            {previousChildren.current}
          </div>
        )}
      <div
        className={classNames("animatePresence", {
          "animatePresence--entering": newChild || isAnimating,
          "animatePresence--enteringActive": isAnimating,
        })}
        key={children?.key}
      >
        {children}
      </div>
    </div>
  );
};
