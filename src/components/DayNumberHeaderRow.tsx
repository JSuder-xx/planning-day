import React from "react";
import { range } from "../helpers/numbers";
import { columnWidthPixels } from "./styles";

const DayNumberHeaderRow: React.FC<{
  lastDay: number;
  lastDayOfCoding: number;
  endOfIteration: number;
}> = ({ lastDay, lastDayOfCoding, endOfIteration }) => (
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

export default DayNumberHeaderRow;
