import React, { useReducer, createContext, useEffect, useContext } from "react";
import { usePlugin } from "../plugin";
import { checkIteration } from "../models/iteration";
import { State, initial } from "../models/state";
import { Action, reducer } from "../models/action";

export type ApplicationStateProps = {
  state: State;
  dispatch: (action: Action) => void;
};

export const ApplicationStateContext = createContext<ApplicationStateProps>(
  {} as any
);

const myEval = (window as any).eval;

export const Provider: React.FC<{}> = ({ children }) => {
  const { setCode, code, markers, sandbox, setDebounce } = usePlugin();

  const [state, dispatch] = useReducer(reducer, initial);

  setDebounce(true);

  useEffect(() => {
    setCode(state.code);
  }, [setCode, state.code]);

  useEffect(() => {
    if (markers.length > 0) return;
    if ((code || "").trim().length === 0) return;

    sandbox.getRunnableJS().then((js) => {
      try {
        dispatch({
          kind: "UpdateIterationParseResult",
          iterationParseResult: checkIteration(myEval(js)),
        });
      } catch (_) {}
    });
  }, [code, markers, sandbox]);

  return (
    <ApplicationStateContext.Provider value={{ state, dispatch }}>
      {children}
    </ApplicationStateContext.Provider>
  );
};

export function useApplicationState() {
  return useContext(ApplicationStateContext) as ApplicationStateProps;
}
