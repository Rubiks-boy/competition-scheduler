import { Container } from "@mui/material";
import { useEffect } from "react";
import { setAccessToken } from "./app/authSlice";
import { useAppDispatch } from "./app/hooks";
import { Header } from "./components/Header";
import { ScheduleStepper } from "./components/ScheduleStepper";

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setAccessToken());
  }, [dispatch]);

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
