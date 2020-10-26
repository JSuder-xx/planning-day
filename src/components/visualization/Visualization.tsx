import React from "react";
import { useApplicationState } from "../application-state/useApplicationState";
import StoryOrdering from "../story-ordering/StoryOrdering";
import * as ParsedResult from "../application-state/parseResult";

const Visualization = () => {
  const { state } = useApplicationState();
  const { iterationParseResult } = state;

  return ParsedResult.isParseResultOK(iterationParseResult) ? (
    <div>
      <h3>Visualizing Iteration</h3>
      <StoryOrdering />
    </div>
  ) : (
    <></>
  );
};

export default Visualization;
