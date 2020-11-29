import React from "react";
import { css } from "goober";

export const unorderedListClass = css`
  ul li {
    margin-bottom: 0 !important;
  }
`;

const List = ({ items }: { items: readonly string[] }) => (
  <div className={unorderedListClass}>
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

export default List;
