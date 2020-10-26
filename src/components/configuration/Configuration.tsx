import React from "react";
import { css } from "goober";
import { useApplicationState } from "../application-state/useApplicationState";
import ParsedField from "../parsed-field/ParsedField";
import * as ParsedResult from "../application-state/parseResult";

const colors = {
  gray: "hsla(0, 0%, 21%, 1)",
  blue: "hsla(193, 95%, 68%, 1)",
};

const wrapperClass = css`
  min-height: 100vh;
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
  const { generateCode, iterationParseResult } = state;

  return ParsedResult.isParseResultOK(iterationParseResult) ? (
    <></>
  ) : (
    <div className={wrapperClass}>
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
      {ParsedResult.isParseResultOK(generateCode) && (
        <button
          className={buttonClass}
          onClick={() => dispatch({ kind: "Generate", generateCode })}
        >
          Generate Code
        </button>
      )}
    </div>
  );
};

export default Configuration;
