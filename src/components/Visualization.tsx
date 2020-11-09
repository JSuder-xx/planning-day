import React from "react";
import { useApplicationState } from "./ApplicationStateContext";
import StoryOrdering from "./StoryOrdering";
import IterationPlan from "./IterationPlan";

const Visualization = () => {
  const { state } = useApplicationState();
  const { iterationParseResult } = state;

  return iterationParseResult instanceof Error ? (
    <div>{iterationParseResult.message}</div>
  ) : iterationParseResult === null ? (
    <></>
  ) : (
    <div>
      <div>
        <h3>Iteration Parameters</h3>
        <p>
          Modify the iteration parameters in the TypeScript playground window on
          the left.
        </p>
      </div>
      <StoryOrdering />
      <IterationPlan />
    </div>
  );
};

export default Visualization;
