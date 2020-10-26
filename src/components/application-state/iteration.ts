import * as ParseResult from "./parseResult";
import { checkFields } from "../../helpers/typeGuards";

export type Activity = {
  assigned: string;
  hourEstimate: number;
};

export type Story = {
  description: string;
  dev: Activity[];
  qa: Activity[];
  dependsOn?: string[];
};

export type TeamSchedule = {
  [teamMember: string]: {
    ptoDays: string[];
    hoursPerDay: number;
  };
};

export type Stories = {
  [storyName: string]: Story;
};

export type Dates = {
  start: string;
  lastDayOfCoding: string;
  end: string;
};

export type Iteration = {
  dates: Dates;
  teamSchedule: TeamSchedule;
  stories: Stories;
};

export const isIteration = (json: any): json is Iteration =>
  checkFields<Iteration>(json, ["dates", "teamSchedule", "stories"]) &&
  checkFields<Dates>(json.dates, ["start", "end", "lastDayOfCoding"]);

export const checkIteration = (json: any): ParseResult.T<Iteration> => {
  if (isIteration(json)) {
    return json;
  } else return null;
};
