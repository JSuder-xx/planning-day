import * as Result from "./result";
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
  firstDayOfIteration: dateType;
  lastDayOfCoding: dateType;
  lastDayOfIteration: dateType;
};

type IterationJSON = {
  dates: Dates<string>;
  teamSchedule: TeamSchedule<string>;
  stories: Stories;
};

export type Iteration = {
  startDayOfWeek: number;
  userDates: Dates<number>;
  lastDayToConsider: number;
  weekendDays: number[];
  teamSchedule: TeamSchedule<number>;
  stories: Stories;
};

const isIteration = (json: any): json is IterationJSON =>
  checkFields<IterationJSON>(json, ["dates", "teamSchedule", "stories"]) &&
  checkFields<Dates<string>>(json.dates, [
    "firstDayOfIteration",
    "lastDayOfIteration",
    "lastDayOfCoding",
  ]);

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

/** The number of days past the end of the iteration that we will continue to calculate weekend days. */
const pastIterationEndBuffer = 14;

export const parseIterationJson = (json: any): Result.T<Iteration> => {
  if (isIteration(json)) {
    try {
      const startDate = TryM.getValue(
        convertToDate(json.dates.firstDayOfIteration)
      );
      const startDayOfWeek = startDate.getDay();
      const dayOffset = getDaysOffset(startDate);
      const userDates: Dates<number> = convertObjectToDate(json.dates, (str) =>
        TryM.map(convertToDate(str), dayOffset)
      );

      if (userDates.lastDayOfIteration < userDates.firstDayOfIteration)
        return new Error(`End date must be before the start date.`);
      if (userDates.lastDayOfCoding > userDates.lastDayOfIteration)
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
        userDates,
        weekendDays: range(
          0,
          userDates.lastDayOfIteration + pastIterationEndBuffer
        ).filter((it) => {
          const adjustedDay = (it + startDayOfWeek) % 7;
          return adjustedDay === 0 || adjustedDay === 6;
        }),
      };

      const errors = [
        ...flatten(
          mapToArray(result.teamSchedule, (teamMember, teamMemberSchedule) => {
            const daysBeforeIteration = teamMemberSchedule.ptoDays.filter(
              (day) => day < 0
            );
            const daysAfterIteration = teamMemberSchedule.ptoDays.filter(
              (day) => day > result.userDates.lastDayOfIteration
            );
            return [
              ...(daysBeforeIteration.length > 0
                ? [
                    `${teamMember} has PTO days listed which are prior to the start of the iteration.`,
                  ]
                : []),
              ...(daysAfterIteration.length > 0
                ? [
                    `${teamMember} has PTO days listed which follow the last day of the iteration.`,
                  ]
                : []),
            ];
          })
        ),
        ...flatten(
          mapToArray(result.stories, (storyId, story) => {
            if (!!story.dependsOn) {
              const badReferences = story.dependsOn.filter(
                (otherStoryReference) => !result.stories[otherStoryReference]
              );
              if (badReferences.length > 0)
                return [
                  `Story ${storyId} depends on the following story identifiers which don't exist ${badReferences}`,
                ];
            }
            return [];
          })
        ),
      ];

      return errors.length > 0
        ? new Error(errors.join(", "))
        : {
            ...result,
            startDayOfWeek,
            lastDayToConsider:
              result.userDates.lastDayOfIteration + pastIterationEndBuffer,
          };
    } catch (ex) {
      return ex instanceof Error ? ex : new Error(ex + "");
    }
  } else return null;
};
