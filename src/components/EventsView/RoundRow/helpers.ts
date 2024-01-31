import { EventId } from "@wca/helpers";
import { EVENT_NAMES } from "../../../constants";

export const getRoundName = (
  eventId: EventId,
  roundNum: number,
  isFinal: boolean
) => `${EVENT_NAMES[eventId]} ${isFinal ? "Final" : `Round ${roundNum + 1}`}`;
