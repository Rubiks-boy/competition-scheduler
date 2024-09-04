import React, { useEffect, useState } from "react";
import { Box, ListItem, Typography, useMediaQuery } from "@mui/material";
import { EVENT_COLORS } from "../../constants";
import cn from "classnames";

const FakeDraggableEvent = ({
  backgroundColor,
  label,
  time,
}: {
  backgroundColor: string;
  label: string;
  time: string;
}) => {
  return (
    <ListItem
      sx={{
        backgroundColor,
        borderRadius: "1em",
        marginBlock: "1em",
        height: `${3.5}em`,
        justifyContent: "right",
        position: "relative",
        p: 0,
        display: "flex",
        overflow: "clip",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="body1">{label}</Typography>
        <Typography variant="body2">{time}</Typography>
      </Box>
    </ListItem>
  );
};

export const FakeReorderView = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [event1, setEvent1] = useState(0);
  const [event1Big, setEvent1Big] = useState(false);
  const [event2, setEvent2] = useState(4.5);
  const [event3, setEvent3] = useState(9);
  const [isUpdatedTimes, setUpdatedTimes] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setEvent1(4.5);
      setEvent1Big(true);

      setTimeout(() => {
        setEvent2(0);
      }, 250);
    }, 2000);

    setTimeout(() => {
      setEvent1(9);

      setTimeout(() => {
        setEvent3(4.5);
      }, 250);
    }, 3500);

    setTimeout(() => {
      setEvent1(4.5);

      setTimeout(() => {
        setEvent3(9);
      }, 250);

      setTimeout(() => {
        setEvent1Big(false);
        setUpdatedTimes(true);
      }, 1500);
    }, 5000);
  }, []);

  return (
    <Box>
      <Typography variant="h6">Reorder rounds</Typography>
      <div className="FakeReorderView-events">
        <div
          className="FakeReorderView-event"
          style={{ transform: `translateY(${event2}em)` }}
        >
          <FakeDraggableEvent
            label="4x4 Final"
            time={isUpdatedTimes ? "10:00-11:00" : "11:00-12:00"}
            backgroundColor={EVENT_COLORS[1][prefersDarkMode ? 800 : 300]}
          />
        </div>
        <div
          className="FakeReorderView-event"
          style={{ transform: `translateY(${event3}em)` }}
        >
          <FakeDraggableEvent
            label="2x2 Final"
            time={isUpdatedTimes ? "11:00-12:00" : "12:00-1:00"}
            backgroundColor={EVENT_COLORS[2][prefersDarkMode ? 800 : 300]}
          />
        </div>
        <div
          className={cn("FakeReorderView-event FakeReorderView-event--1", {
            "FakeReorderView-event--big": event1Big,
          })}
          style={{ transform: `translateY(${event1}em)` }}
        >
          <FakeDraggableEvent
            label="3x3 Final"
            time={isUpdatedTimes ? "11:00-12:00" : "10:00-11:00"}
            backgroundColor={EVENT_COLORS[0][prefersDarkMode ? 800 : 300]}
          />
        </div>
      </div>
    </Box>
  );
};
