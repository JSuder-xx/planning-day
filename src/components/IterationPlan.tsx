import React from "react";
import { useApplicationState } from "./ApplicationStateContext";
import { createMap } from "../helpers/map.json";
import { range } from "../helpers/numbers";
import {
  IterationPlan,
  PlannedStory,
  DayWorked,
} from "../models/iterationPlan";
import { css } from "goober";

const iterationPlanClass = css`
  table {
    border-spacing: 0;
  }

  td {
    padding: 0;
    border-right: solid 1px #999;
  }
`;

const columnWidthPixels = 32;

const daysWorkedColumnFactory = (daysWorked: readonly DayWorked[]) => {
  const dayWorkedMap = createMap(daysWorked, (it) =>
    (Math.floor(it.startOfDay) + 1).toString()
  );
  return (dayNumberOneBased: number) => {
    const dayWorked = dayWorkedMap[dayNumberOneBased];
    return !dayWorked ? (
      <td />
    ) : (
      <td>
        <div
          style={{
            backgroundColor: "#46f",
            marginLeft: `${
              columnWidthPixels *
              (dayWorked.startOfDay - Math.floor(dayWorked.startOfDay))
            }px`,
            width: `${columnWidthPixels * dayWorked.partOfDay}px`,
            height: `16px`,
          }}
        ></div>
      </td>
    );
  };
};

const storyRows = (lastDay: number) => (plannedStory: PlannedStory) => [
  <tr>
    <td>{plannedStory.description}</td>
  </tr>,
  ...plannedStory.tasks.map((task) => (
    <tr>
      <td>
        {task.kind}: {task.assigned}
      </td>
      {task.daysWorkedTry instanceof Error ? (
        <td>X</td>
      ) : (
        range(1, lastDay).map(daysWorkedColumnFactory(task.daysWorkedTry))
      )}
    </tr>
  )),
];

const IterationPlanComponent = () => {
  const { state } = useApplicationState();
  const { iterationPlan } = state;

  return iterationPlan === null ? (
    <></>
  ) : iterationPlan instanceof Error ? (
    <div>{iterationPlan.message}</div>
  ) : (
    iterationPlanView(iterationPlan)
  );

  function iterationPlanView(iterationPlan: IterationPlan) {
    const lastDay =
      Math.min(
        iterationPlan.dates.endOfIteration,
        iterationPlan.dates.lastStoryCompleted
      ) + 1;
    return (
      <div className={iterationPlanClass}>
        <h3>Gantt Chart</h3>
        <table>
          <tr>
            {range(0, lastDay).map((dayNumber) =>
              dayNumber === 0 ? (
                <td></td>
              ) : (
                <td
                  style={{
                    textAlign: "center",
                    width: `${columnWidthPixels}px`,
                  }}
                >
                  {dayNumber}
                </td>
              )
            )}
          </tr>
          {iterationPlan.stories.map(storyRows(lastDay))}
        </table>
      </div>
    );
  }
};

export default IterationPlanComponent;
