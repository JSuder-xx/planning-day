import * as ParseResult from "./parseResult";
import { checkFields } from "../helpers/typeGuards";
import { convertToDate, getDaysOffset } from "../helpers/date";
import { range } from "../helpers/numbers";
import { mapMap, mapToArray } from "../helpers/map.json";
import { flatten } from "../helpers/array";
import * as TryM from "../helpers/tryM";

export type Activity = {
  assigned: string;
  hourEstimate: number;
};

export type HourEstimates = { [assignee: string]: number };

export type Story = {
  id: string;
  description: string;
  devHourEstimates: HourEstimates;
  qaHourEstimates: HourEstimates;
  dependsOn?: string[];
};

export type TeamSchedule<dateType> = {
  [teamMember: string]: {
    ptoDays: dateType[];
    hoursPerDay: number;
  };
};

export type Stories = {
  [storyName: string]: Story;
};

export type Dates<dateType> = {
  start: dateType;
  lastDayOfCoding: dateType;
  end: dateType;
};

type IterationJSON = {
  dates: Dates<string>;
  teamSchedule: TeamSchedule<string>;
  stories: Stories;
};

export type Iteration = {
  dates: Dates<number>;
  weekendDays: number[];
  teamSchedule: TeamSchedule<number>;
  stories: Stories;
};

const isIteration = (json: any): json is IterationJSON =>
  checkFields<Iteration>(json, ["dates", "teamSchedule", "stories"]) &&
  checkFields<Dates<string>>(json.dates, ["start", "end", "lastDayOfCoding"]);

const convertObjectToDate = <T extends { [prop: string]: string }, TDate>(
  obj: T,
  convert: (val: string) => TDate | Error
): { [property in keyof T]: TDate } => {
  const result: { [property in keyof T]: TDate } = {} as any;
  for (const fieldName in obj) {
    result[fieldName] = TryM.getValue(
      TryM.mapErrorMessage(
        convert(obj[fieldName]),
        (msg) => `Error converting ${fieldName}: ${msg}`
      )
    );
  }
  return result;
};

export const checkIteration = (json: any): ParseResult.T<Iteration> => {
  if (isIteration(json)) {
    try {
      const startDate = TryM.getValue(convertToDate(json.dates.start));
      const startDateDayOfWeek = startDate.getDay();
      const dayOffset = getDaysOffset(startDate);
      const dates: Dates<number> = convertObjectToDate(json.dates, (str) =>
        TryM.map(convertToDate(str), dayOffset)
      );

      if (dates.end < dates.start)
        return new Error(`End date must be before the start date.`);
      if (dates.lastDayOfCoding > dates.end)
        return new Error(
          `Last day of coding must be on or prior to last day of iteration.`
        );
      const result = {
        teamSchedule: mapMap(
          json.teamSchedule,
          (_teamMember, { hoursPerDay, ptoDays }) => {
            return {
              hoursPerDay,
              ptoDays: ptoDays.map((day) =>
                dayOffset(TryM.getValue(convertToDate(day)))
              ),
            };
          }
        ),
        stories: json.stories,
        dates,
        weekendDays: range(0, dates.end).filter((it) => {
          const adjustedDay = (it + startDateDayOfWeek) % 7;
          return adjustedDay === 0 || adjustedDay === 6;
        }),
      };

      const storyErrors = flatten(
        mapToArray(result.stories, (_, story) => {
          if (!!story.dependsOn) {
            const badReferences = story.dependsOn.filter(
              (otherStoryReference) => !result.stories[otherStoryReference]
            );
            if (badReferences.length > 0)
              return [
                `Story ${story.id} depends on the following story identifiers which don't exist ${badReferences}`,
              ];
          }
          return [];
        })
      );

      return storyErrors.length > 0
        ? new Error(storyErrors.join(", "))
        : result;
    } catch (ex) {
      return ex instanceof Error ? ex : new Error(ex + "");
    }
  } else return null;
};
