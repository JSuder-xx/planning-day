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

const evenRowClass = css`
  background-color: #333;
`;

const rowIntroductionClass = css`
  td {
    border-top-style: double;
    border-top-color: #ccf;
  }
`;

const storyTitleClass = css`
  min-width: 80px;
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

const storyRows = (dayNumbersOneBased: number[]) => (
  plannedStory: PlannedStory,
  index: number
) => {
  const rowClass = index % 2 === 1 ? evenRowClass : "";
  return [
    <tr className={`${rowIntroductionClass} ${rowClass}`}>
      <td className={storyTitleClass}>
        {plannedStory.story === plannedStory.description
          ? plannedStory.story
          : `${plannedStory.story}. ${plannedStory.description}`}
      </td>
      {dayNumbersOneBased.map((_) => (
        <td></td>
      ))}
    </tr>,
    ...plannedStory.tasks.map((task) => (
      <tr className={rowClass}>
        <td>
          {task.assigned} ({task.kind})
        </td>
        {task.daysWorkedTry instanceof Error ? (
          <td>X</td>
        ) : (
          dayNumbersOneBased.map(daysWorkedColumnFactory(task.daysWorkedTry))
        )}
      </tr>
    )),
  ];
};

const dayOfWeekAbbreviation = (day: number): string =>
  day === 0
    ? "Sun"
    : day === 1
    ? "Mon"
    : day === 2
    ? "Tue"
    : day === 3
    ? "Wed"
    : day === 4
    ? "Thu"
    : day === 5
    ? "Fri"
    : day === 6
    ? "Sat"
    : "?";

const GanttChart = () => {
  const { state } = useApplicationState();
  const { iterationPlanResult } = state;

  return iterationPlanResult === null ? (
    <></>
  ) : iterationPlanResult instanceof Error ? (
    <div>{iterationPlanResult.message}</div>
  ) : (
    iterationPlanView(iterationPlanResult)
  );

  function iterationPlanView(iterationPlan: IterationPlan) {
    const {
      endOfIteration,
      lastDayOfCoding,
      lastStoryCompleted,
      startDayOfWeek,
    } = iterationPlan.dates;
    const lastDay = Math.max(endOfIteration, lastStoryCompleted);
    return (
      <div className={iterationPlanClass}>
        <h3>Gantt Chart</h3>
        <table>
          {dayOfWeekHeaderRow()}
          {dayNumberHeaderRow()}
          {iterationPlan.stories.map(storyRows(range(1, lastDay + 1)))}
        </table>
      </div>
    );

    function dayOfWeekHeaderRow() {
      return (
        <tr>
          <td></td>
          {range(0, lastDay).map((dayNumber) => {
            const dayOfWeek = (dayNumber + startDayOfWeek) % 7;
            return (
              <td
                style={{
                  textAlign: "center",
                  width: `${columnWidthPixels}px`,
                  backgroundColor:
                    dayOfWeek === 0 || dayOfWeek === 6 ? "#00a" : "#000",
                }}
              >
                {dayOfWeekAbbreviation(dayOfWeek)}
              </td>
            );
          })}
        </tr>
      );
    }

    function dayNumberHeaderRow() {
      return (
        <tr>
          <td></td>
          {range(0, lastDay).map((dayNumber) => (
            <td
              style={{
                textAlign: "center",
                width: `${columnWidthPixels}px`,
                backgroundColor:
                  dayNumber <= lastDayOfCoding
                    ? "black"
                    : dayNumber <= endOfIteration
                    ? "#660"
                    : "#800",
              }}
            >
              {dayNumber + 1}
            </td>
          ))}
        </tr>
      );
    }
  }
};

export default GanttChart;
