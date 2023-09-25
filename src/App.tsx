import React from "react";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { Header } from "./components/Header";
import { StateProvider } from "./app/StateProvider";
import { MainContent } from "./MainContent";

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

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StateProvider>
          <Header />
          <MainContent />
        </StateProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
