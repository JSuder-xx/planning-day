import React from "react";
import { css } from "goober";
import { useApplicationState } from "./ApplicationStateContext";
import ParsedField from "./ParsedField";
import { buttonClass } from "./styles";
import * as ParsedResult from "../models/result";

const wrapperClass = css`
  color: white;
`;

const Configuration = () => {
  const { state, dispatch } = useApplicationState();
  const { generateTypeScriptCodeResult, iterationResult } = state;

  return ParsedResult.isOK(iterationResult) ||
    iterationResult instanceof Error ? (
    <></>
  ) : (
    <div className={wrapperClass}>
      <h3>Initial Configuration</h3>
      <p>
        Enumerate team members and stories below. When satisfied click Generate
        Code to produce TypeScript code in the Playground to the left which
        defines your Sprint Iteration.
      </p>
      <ParsedField
        key="team-members"
        parsedField={state.teamMembers}
        updateRawValue={(value) =>
          dispatch({ kind: "UpdateTeamMembers", value })
        }
      />
      <ParsedField
        key="stories"
        parsedField={state.stories}
        isMultiline={true}
        updateRawValue={(value) => dispatch({ kind: "UpdateStories", value })}
      />
      {ParsedResult.isOK(generateTypeScriptCodeResult) && (
        <button
          className={buttonClass}
          onClick={() =>
            dispatch({
              kind: "GenerateTypeScriptCode",
              generateCode: generateTypeScriptCodeResult,
            })
          }
        >
          Generate Code
        </button>
      )}
    </div>
  );
};

export default Configuration;
