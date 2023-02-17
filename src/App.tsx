import { Container } from "@mui/material";
import { Header } from "./components/Header";
import { ScheduleStepper } from "./components/ScheduleStepper";
import { useLookupAccessToken } from "./hooks/useLookupAccessToken";

function App() {
  useLookupAccessToken();

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
