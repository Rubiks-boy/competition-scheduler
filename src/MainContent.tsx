import { ScheduleStepper } from "./components/ScheduleStepper";
import { useLookupAccessToken } from "./hooks/useLookupAccessToken";
import { useFetchCompetitions } from "./hooks/useFetchCompetitions";
import { useFetchWcif } from "./hooks/useFetchWcif";
import { useImportAppState } from "./hooks/useImportAppState";
import { useSaveToLocalStorage } from "./hooks/useSaveToLocalStorage";
import { Container } from "@mui/material";
import {
  UrlImportBanner,
  LocalStorageImportBanner,
} from "./components/importBanners";

export const MainContent = () => {
  useLookupAccessToken();
  useFetchCompetitions();
  useFetchWcif();
  useImportAppState();
  useSaveToLocalStorage();

  return (
    <Container maxWidth={"md"}>
      <UrlImportBanner />
      <LocalStorageImportBanner />
      <ScheduleStepper />
    </Container>
  );
};
