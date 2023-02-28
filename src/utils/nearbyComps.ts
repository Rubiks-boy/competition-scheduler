import { getDistance } from "geolib";
import { fetchCompetitionsWithin, fetchResults, fetchWcif } from "./wcaApi";

const DAYS_180 = 180 * 24 * 60 * 60 * 1000;

const DIST_500KM = 500000;

type ReturnedComp = {
  id: string;
  registration_close: string;
  latitude_degrees: number;
  longitude_degrees: number;
  competitor_limit: number;
};

const testLocation = { latitude: "47.762441", longitude: "-122.218318" };

const calcNumCompetitors = (results: any) => {
  return [...new Set(results.map(({ wca_id }: any) => wca_id))].length;
};

export const attendanceStats = async (
  wcaAccessToken: string,
  maxDistKm: number = 500
) => {
  const rawComps: Array<ReturnedComp> = await fetchCompetitionsWithin(
    new Date(Date.now() - DAYS_180),
    new Date(Date.now()),
    wcaAccessToken
  );

  const withRegClosed = rawComps.filter(
    ({ registration_close }) =>
      new Date(registration_close) < new Date(Date.now())
  );

  const withinDistance = withRegClosed.filter(
    ({ latitude_degrees, longitude_degrees }) =>
      getDistance(testLocation, {
        latitude: latitude_degrees,
        longitude: longitude_degrees,
      }) <
      maxDistKm * 1000
  );

  const allResults = await Promise.all(
    withinDistance.map(async (comp) => {
      const results = await fetchResults(comp.id, wcaAccessToken);
      return { ...comp, results };
    })
  );

  console.log(allResults[0]);

  const attendanceData = allResults.map((comp) => ({
    ...comp,
    numCompetitors: calcNumCompetitors(comp.results),
  }));

  return attendanceData;
};
