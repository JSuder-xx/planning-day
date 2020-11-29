import React from "react";
import { range } from "../helpers/numbers";
import { columnWidthPixels } from "./styles";

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

const DayOfWeekHeaderRow: React.FC<{
  lastDay: number;
  startDayOfWeek: number;
}> = ({ lastDay, startDayOfWeek }) => (
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

export default DayOfWeekHeaderRow;
