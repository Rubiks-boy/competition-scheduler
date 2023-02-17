import { Container } from "@mui/material";
import { Header } from "./components/Header";
import { ScheduleStepper } from "./components/ScheduleStepper";

function App() {
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
