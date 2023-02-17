import { useContext } from "react";
import { StateContext } from "./StateProvider";
import { State, Action } from "./types";

export const useState = (): State => useContext(StateContext).state;

export const useSelector = <T>(selector: (state: State) => T): T => {
  const state = useState();
  return selector(state);
};

export const useDispatch = (): React.Dispatch<Action> =>
  useContext(StateContext).dispatch;
