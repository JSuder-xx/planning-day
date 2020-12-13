import React from "react";
import { DayUsage, ResourcesView, ResourceView } from "../models/iterationPlan";
import {
  buttonClass,
  fractionToPixels,
  iterationPlanClass,
  titleCellClass,
} from "./styles";
import List from "./List";
import DayOfWeekHeaderRow from "./DayOfWeekHeaderRow";
import DayNumberHeaderRow from "./DayNumberHeaderRow";
import DateHeaderRow from "./DateHeaderRow";
import { range } from "../helpers/numbers";

const barHeight = `16px`;

const DayUsageCell: React.FC<{ dayUsage: DayUsage }> = ({
  dayUsage: { fractionIdle, fractionWorking },
}) => (
  <td>
    <div
      style={{
        display: "inline-block",
        height: barHeight,
        backgroundColor: `#00f`,
        width: fractionToPixels(fractionIdle),
      }}
    />
    <div
      style={{
        display: "inline-block",
        height: barHeight,
        backgroundColor: `white`,
        width: fractionToPixels(fractionWorking),
      }}
    />
  </td>
);

const ScheduledResourceRow: React.FC<{
  resource: ResourceView;
  lastDay: number;
}> = ({ resource, lastDay }) => (
  <tr>
    <td className={titleCellClass}>{resource.name}</td>
    {range(0, lastDay).map((dayNumber) => {
      const dayUsage = resource.dayUsageMap.get(dayNumber);
      return dayUsage === undefined ? (
        <td key={dayNumber} />
      ) : (
        <DayUsageCell key={dayNumber} dayUsage={dayUsage} />
      );
    })}
  </tr>
);

const ScheduledResources: React.FC<{
  resourcesView: ResourcesView;
  changeToGanttView: () => void;
}> = ({ changeToGanttView, resourcesView }) => {
  const { endOfIteration, lastDayOfCoding, startDate } = resourcesView.dates;
  return (
    <div className={iterationPlanClass}>
      <h3>Team Member View</h3>
      <button className={buttonClass} onClick={changeToGanttView}>
        Change to Gantt View
      </button>
      <hr />
      <p>
        A portion of each day is shaded
        <List
          items={[
            `Black - PTO time`,
            `White - Time spent working on a story`,
            `Blue - Time idle`,
          ]}
        />
      </p>
      <p>
        NOTE: Team members will not show in this view until they have been
        assigned at least one task.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <DateHeaderRow lastDayNumber={endOfIteration} startDate={startDate} />
          <DayOfWeekHeaderRow
            lastDay={endOfIteration}
            startDayOfWeek={startDate.getDay()}
          />
          <DayNumberHeaderRow
            lastDay={endOfIteration}
            lastDayOfCoding={lastDayOfCoding}
            endOfIteration={endOfIteration}
          />
          {resourcesView.resources.map((resource) => (
            <ScheduledResourceRow
              key={resource.name}
              resource={resource}
              lastDay={endOfIteration}
            />
          ))}
        </table>
      </div>
    </div>
  );
};

export default ScheduledResources;
