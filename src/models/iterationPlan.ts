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
    lastDayOfCoding: number;
    endOfIteration: number;
    lastStoryCompleted: number;
  };
  readonly stories: readonly PlannedStory[];
};
