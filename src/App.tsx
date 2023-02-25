import React from "react";
import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { Header } from "./components/Header";
import { ScheduleStepper } from "./components/ScheduleStepper";
import { useLookupAccessToken } from "./hooks/useLookupAccessToken";
import { useFetchCompetitions } from "./hooks/useFetchCompetitions";
import { useFetchWcif } from "./hooks/useFetchWcif";

import "./App.css";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  useLookupAccessToken();
  useFetchCompetitions();
  useFetchWcif();

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Container maxWidth={"md"}>
          <ScheduleStepper />
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
