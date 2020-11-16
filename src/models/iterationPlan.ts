import { ZeroBasedNumber } from "./numbers";

export type DayWorked = {
  startOfDay: number;
  partOfDay: number;
};

export type TaskSchedule = {};

export type PlannedTask = {
  readonly kind: "dev" | "qa";
  readonly assigned: string;
  readonly daysWorkedTry: readonly DayWorked[] | Error;
};

export type PlannedStory = {
  readonly story: string;
  readonly description: string;
  readonly tasks: readonly PlannedTask[];
  readonly completedDayNumberMaybe: number | null;
};

export type IterationPlan = {
  readonly dates: {
    lastDayOfCoding: ZeroBasedNumber;
    endOfIteration: ZeroBasedNumber;
    lastStoryCompleted: ZeroBasedNumber;
    /** The day of the week for day number 0. */
    startDayOfWeek: number;
  };
  readonly stories: readonly PlannedStory[];
};
