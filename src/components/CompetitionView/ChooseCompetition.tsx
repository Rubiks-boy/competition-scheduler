import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  isImportedFromUrlSelector,
  manageableCompsSelector,
  selectedCompIdSelector,
  selectedCompSelector,
} from "../../app/selectors";

export const ChooseCompetition = () => {
  const manageableComps = useSelector(manageableCompsSelector);
  const selectedCompId = useSelector(selectedCompIdSelector);
  const selectedComp = useSelector(selectedCompSelector);
  const dispatch = useDispatch();

  const importedFromUrl = useSelector(isImportedFromUrlSelector);

  if (!selectedCompId) {
    return null;
  }

  const handleChooseComp = (e: SelectChangeEvent<string | null>) => {
    const newId = e.target.value;

    if (!newId) {
      return;
    }

    dispatch({ type: "COMP_SELECTED", newId });
  };

  return (
    <Grid container item xs={12}>
      <Grid item xs={12} md={8}>
        <FormControl fullWidth>
          <InputLabel id="choose-competition-label">Competition</InputLabel>
          <Select
            labelId="choose-competition-label"
            label="Competition"
            value={selectedCompId}
            onChange={handleChooseComp}
            disabled={importedFromUrl}
          >
            {importedFromUrl ? (
              <MenuItem value={selectedCompId}>
                {/* TODO: Fetch the comp's name when importing someone else's schedule */}
                {selectedComp?.name ?? selectedCompId}
              </MenuItem>
            ) : (
              manageableComps.map(({ id, name }) => (
                <MenuItem value={id} key={id}>
                  {name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
