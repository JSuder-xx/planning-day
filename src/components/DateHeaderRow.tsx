import React from "react";
import { range } from "../helpers/numbers";
import { addDays } from "../helpers/date";
import { columnWidthPixels } from "./styles";

const DateHeaderRow: React.FC<{
  lastDayNumber: number;
  startDate: Date;
}> = ({ lastDayNumber, startDate }) => (
  <tr>
    <td></td>
    {range(0, lastDayNumber).map((dayNumber) => {
      const day = addDays(startDate, dayNumber);
      return (
        <td
          style={{
            textAlign: "center",
            width: `${columnWidthPixels}px`,
          }}
        >
          {`${day.getMonth() + 1}/${day.getDate()}`}
        </td>
      );
    })}
  </tr>
);

export default DateHeaderRow;
