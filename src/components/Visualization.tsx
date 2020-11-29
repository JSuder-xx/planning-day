import React from "react";
import { useApplicationState } from "./ApplicationStateContext";
import List from "./List";
import StoryOrdering from "./StoryOrdering";
import GanttChart from "./GanttChart";
import ScheduledResources from "./ScheduledResources";

const Visualization = () => {
  const { dispatch, state } = useApplicationState();
  const { iterationResult, planView, iterationPlanResult } = state;

  return iterationResult instanceof Error ? (
    <div>
      <h3>Configuration Error</h3>
      <p>
        There was an error parsing and validating the Iteration configuration on
        the left. Please correct
        <List
          items={[
            `Any errors indicated by TypeScript (red squiggles).`,
            `Any validation messages indicated below.`,
          ]}
        />
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
          <List
            items={[
              `For each team member, assign average capacity in hours per day and also indicate days of PTO.`,
              `For each story, assign team members to perform Dev or QA activities.`,
            ]}
          />
        </p>
      </div>
      <StoryOrdering />
      {iterationPlanResult === null ? (
        <></>
      ) : iterationPlanResult instanceof Error ? (
        <div>{iterationPlanResult.message}</div>
      ) : (
        <div>
          {planView === "GanttChart" ? (
            <GanttChart
              storiesPlan={iterationPlanResult.getStoriesPlan()}
              changeToResourceView={() =>
                dispatch({ kind: "ChangePlanView", planView: "Resource" })
              }
            />
          ) : (
            <ScheduledResources
              resourcesView={iterationPlanResult.getResourcesView()}
              changeToGanttView={() =>
                dispatch({ kind: "ChangePlanView", planView: "GanttChart" })
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Visualization;
