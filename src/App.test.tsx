import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the app title", () => {
    const { getByText } = render(<App />);
    expect(getByText("Competition Scheduler")).toBeTruthy();
  });
});
