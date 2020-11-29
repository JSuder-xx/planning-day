import { css } from "goober";
import { FractionOfOne } from "../models/numbers";
export const columnWidthPixels = 32;

export const fractionToPixels = (fraction: FractionOfOne) =>
  `${Math.floor(columnWidthPixels * fraction)}px`;

export const iterationPlanClass = css`
  table {
    border-spacing: 0;
  }

  td {
    padding: 0;
    border-right: solid 1px #999;
  }
`;

export const evenRowClass = css`
  background-color: #333;
`;

export const rowIntroductionClass = css`
  td {
    border-top-style: double;
    border-top-color: #ccf;
  }
`;

export const titleCellClass = css`
  min-width: 100px;
`;

export const buttonClass = css`
  display: inline-block;
  margin: 5px;
  padding: 5px;
  min-width: 150px;
  color: #acf;
  background: transparent;
  font-size: 0.9rem;
  border: 1px solid #acf;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background: #444;
  }
`;
