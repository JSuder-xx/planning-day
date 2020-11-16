import React from "react";
import { useApplicationState } from "./ApplicationStateContext";
import StoryOrdering from "./StoryOrdering";
import GanttChart from "./GanttChart";

const Visualization = () => {
  const { state } = useApplicationState();
  const { iterationResult } = state;

  return iterationResult instanceof Error ? (
    <div>
      <h3>Configuration Error</h3>
      <p>
        There was an error parsing and validating the Iteration configuration on
        the left. Please correct
        <ul>
          <li>Any errors indicated by TypeScript (red squiggles)</li>
          <li>Any validation messages indicated below.</li>
        </ul>
      </p>
      <p>
        <label>Errors</label>
        <div style={{ color: "red" }}>{iterationResult.message}</div>
      </p>
    </div>
  ) : iterationResult === null ? (
    <></>
  ) : (
    <div>
      <div>
        <h3>Iteration Parameters</h3>
        <p>
          Modify the iteration parameters in the TypeScript playground window on
          the left. For example,
          <ul>
            <li>
              For each team member, assign average capacity in hours per day and
              also indicate days of PTO.
            </li>
            <li>
              For each story, assign team members to perform Dev or QA
              activities.
            </li>
          </ul>
        </p>
      </div>
      <StoryOrdering />
      <GanttChart />
    </div>
  );
};

export default Visualization;
