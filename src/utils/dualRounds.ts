import type { DualRounds, EventId, Round, WcifEvent } from "../types";

export const hasDualRounds = (rounds: Round[] | null | undefined, enabled?: boolean) =>
  !!enabled && (rounds?.length ?? 0) >= 2;

export const getDualRoundsFromWcif = (events: WcifEvent[]): DualRounds => {
  const dualRounds: DualRounds = {};
  events.forEach(({ id, rounds }) => {
    const roundIds = [`${id}-r1`, `${id}-r2`];
    const pair = roundIds.map(roundId => rounds.find(round => round.id === roundId));
    if (pair.every(round => roundIds.every(roundId => round?.linkedRounds?.includes(roundId)))) {
      dualRounds[id] = {
        enabled: true,
        sharedCumulativeTimeLimit: roundIds.every(roundId =>
          pair[0]?.timeLimit?.cumulativeRoundIds.includes(roundId)
        ),
      };
    }
  });
  return dualRounds;
};

export const getRoundLabel = (
  eventId: EventId,
  roundIndex: number,
  numberOfRounds: number,
  dualRounds: DualRounds = {},
  short: boolean = false
) => {
  if (dualRounds[eventId]?.enabled && numberOfRounds >= 2 && roundIndex < 2) {
    if (short) {
      return `${numberOfRounds === 2 ? "Dual F" : "Dual R"}${roundIndex + 1}`;
    }
    return `${numberOfRounds === 2 ? "Dual Final" : "Dual Round"} ${roundIndex + 1}`;
  }
  return roundIndex === numberOfRounds - 1
    ? "Final" : short ? `R${roundIndex + 1}` : `Round ${roundIndex + 1}`;
};
