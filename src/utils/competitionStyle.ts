import { EXTENSIONS_SPEC_URL } from "../constants";
import type { CompetitionStyle, Wcif } from "../types";

const CONFIG_ID = "competitionScheduler.CompetitionConfig";

export const getCompetitionStyle = (
  wcif: Pick<Wcif, "extensions">
): CompetitionStyle => {
  const extension = wcif.extensions.find(({ id }) => id === CONFIG_ID);
  const style = (extension?.data as { style?: unknown } | undefined)?.style;
  return style === "runningJudges" ? "runningJudges" : "standard";
};

export const createCompetitionExtensions = (
  extensions: Wcif["extensions"],
  style: CompetitionStyle
): Wcif["extensions"] => {
  const existing = extensions.find(({ id }) => id === CONFIG_ID);
  return [
    ...extensions.filter(({ id }) => id !== CONFIG_ID),
    {
      id: CONFIG_ID,
      specUrl: EXTENSIONS_SPEC_URL,
      data: { ...existing?.data, style },
    },
  ];
};
