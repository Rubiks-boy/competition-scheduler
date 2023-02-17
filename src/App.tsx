import { Container } from "@mui/material";
import { Header } from "./components/Header";
import { ScheduleStepper } from "./components/ScheduleStepper";
import { useLookupAccessToken } from "./hooks/useLookupAccessToken";
import { useFetchCompetitions } from "./hooks/useFetchCompetitions";

function App() {
  useLookupAccessToken();
  useFetchCompetitions();

  return (
    <div className="App">
      <Header />
      <Container maxWidth={"md"}>
        <ScheduleStepper />
      </Container>
    </div>
  );
}

export default App;
