import { initialState } from "../app/initialState";
import reducer from "../app/reducer";
import { OtherActivity, Schedule } from "../types";
import { autoReorder } from "./autoReorder";

it("keeps both tutorials when the occurrence count is increased", () => {
  const state = {
    ...initialState,
    schedule: [
      { type: "day-divider", dayIndex: 0 },
      { type: "other", eventId: "tutorial", index: 0 },
    ] as Schedule,
  };

  const updatedState = reducer(state, {
    type: "OTHER_ACTIVITY_NUMBER_CHANGED",
    activity: "tutorial",
    numberOfActivity: "2",
  });

  expect(updatedState.numOtherActivities.tutorial).toBe("2");
  expect(updatedState.schedule).toEqual([
    { type: "day-divider", dayIndex: 0 },
    { type: "other", eventId: "tutorial", index: 0 },
    { type: "other", eventId: "tutorial", index: 1 },
  ]);

  const reorderedState = reducer(updatedState, { type: "RESET_SCHEDULE" });
  expect(reorderedState.schedule).toEqual(updatedState.schedule);
});

it.each<OtherActivity>([
  "doorsOpen",
  "registration",
  "checkin",
  "tutorial",
  "awards",
  "doorsClose",
])("preserves every occurrence of %s during automatic ordering", (eventId) => {
  const activities: Schedule = [
    { type: "other", eventId, index: 0 },
    { type: "other", eventId, index: 1 },
    { type: "other", eventId, index: 2 },
  ];
  const schedule: Schedule = [
    { type: "day-divider", dayIndex: 0 },
    { type: "event", eventId: "333", roundNum: 0 },
    { type: "day-divider", dayIndex: 1 },
    ...activities,
  ];

  const reorderedSchedule = autoReorder(schedule);

  expect(reorderedSchedule.filter(({ type }) => type === "other")).toEqual(
    activities
  );
  expect(reorderedSchedule).toHaveLength(schedule.length);
});

it("matches lunch occurrences by index, including index zero", () => {
  const schedule: Schedule = [
    { type: "day-divider", dayIndex: 0 },
    { type: "day-divider", dayIndex: 1 },
    { type: "other", eventId: "lunch", index: 1 },
    { type: "other", eventId: "lunch", index: 0 },
  ];

  expect(autoReorder(schedule)).toEqual([
    { type: "day-divider", dayIndex: 0 },
    { type: "other", eventId: "lunch", index: 0 },
    { type: "day-divider", dayIndex: 1 },
    { type: "other", eventId: "lunch", index: 1 },
  ]);
});
