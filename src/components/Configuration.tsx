import React from "react";
import { css } from "goober";
import { useApplicationState } from "./ApplicationStateContext";
import ParsedField from "./ParsedField";
import * as ParsedResult from "../models/result";

const colors = {
  gray: "hsla(0, 0%, 21%, 1)",
  blue: "hsla(193, 95%, 68%, 1)",
};

const wrapperClass = css`
  color: white;
`;

const buttonClass = css`
  display: inline-block;
  margin: 5px;
  padding: 5px;
  min-width: 150px;
  color: ${colors.blue};
  background: transparent;
  font-size: 0.9rem;
  border: 1px solid ${colors.blue};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background: ${colors.gray};
  }
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
