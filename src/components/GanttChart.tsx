import React from "react";
import { createMap } from "../helpers/map.json";
import { fractionOfNumber, range } from "../helpers/numbers";
import { StoriesPlan, PlannedStory, DayWorked } from "../models/iterationPlan";
import {
  buttonClass,
  fractionToPixels,
  evenRowClass,
  iterationPlanClass,
  rowIntroductionClass,
  titleCellClass,
} from "./styles";
import DayOfWeekHeaderRow from "./DayOfWeekHeaderRow";
import DayNumberHeaderRow from "./DayNumberHeaderRow";

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
            marginLeft: fractionToPixels(
              fractionOfNumber(dayWorked.startOfDay)
            ),
            width: fractionToPixels(dayWorked.fractionOfDay),
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
      <td className={titleCellClass}>
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

const GanttChart: React.FC<{
  storiesPlan: StoriesPlan;
  changeToResourceView: () => void;
}> = ({ changeToResourceView, storiesPlan }) => {
  const {
    endOfIteration,
    lastDayOfCoding,
    lastStoryCompleted,
    startDayOfWeek,
  } = storiesPlan.dates;
  const lastDay = Math.max(endOfIteration, lastStoryCompleted);
  return (
    <div className={iterationPlanClass}>
      <h3>Gantt Chart</h3>
      <button className={buttonClass} onClick={changeToResourceView}>
        Change to Team Member View
      </button>
      <hr />
      <div style={{ overflowX: "auto" }}>
        <table>
          <DayOfWeekHeaderRow
            lastDay={lastDay}
            startDayOfWeek={startDayOfWeek}
          />
          <DayNumberHeaderRow
            lastDay={lastDay}
            lastDayOfCoding={lastDayOfCoding}
            endOfIteration={endOfIteration}
          />
          {storiesPlan.stories.map(storyRows(range(1, lastDay + 1)))}
        </table>
      </div>
    </div>
  );
};

export default GanttChart;
