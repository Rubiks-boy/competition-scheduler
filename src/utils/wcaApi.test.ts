import "whatwg-fetch";
import { Wcif } from "../types";
import { saveWcifChanges } from "./wcaApi";

const previousWcif: Wcif = {
  formatVersion: "2.2",
  id: "Example2027",
  name: "Example 2027",
  shortName: "Example 2027",
  persons: [],
  events: [],
  schedule: { startDate: "2027-01-02", numberOfDays: 1, venues: [] },
  series: null,
  competitorLimit: 100,
  extensions: [],
  registrationInfo: {
    openTime: "2026-11-01T00:00:00Z",
    closeTime: "2027-01-01T00:00:00Z",
    baseEntryFee: 1000,
    currencyCode: "USD",
    onTheSpotRegistration: false,
    useWcaRegistration: true,
  },
};

afterEach(() => {
  jest.restoreAllMocks();
});

it("includes the unchanged competition ID and format version in WCIF patches", async () => {
  const response = { status: "Successfully saved WCIF" };
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(response)));
  const newWcif = {
    ...previousWcif,
    events: [...previousWcif.events],
    schedule: { ...previousWcif.schedule, numberOfDays: 2 },
  };

  await expect(
    saveWcifChanges(previousWcif, newWcif, "test-token")
  ).resolves.toEqual(response);

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    "https://www.worldcubeassociation.org/api/v0/competitions/Example2027/wcif",
    expect.objectContaining({ method: "PATCH" })
  );
  const requestOptions = fetchMock.mock.calls[0][1];
  expect(JSON.parse(requestOptions?.body as string)).toEqual({
    id: previousWcif.id,
    formatVersion: "2.2",
    events: newWcif.events,
    schedule: newWcif.schedule,
  });
});

it("does not send a request when the WCIF has not changed", async () => {
  const fetchMock = jest.spyOn(global, "fetch");

  await saveWcifChanges(previousWcif, previousWcif, "test-token");

  expect(fetchMock).not.toHaveBeenCalled();
});
