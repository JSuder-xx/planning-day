import { ZeroBasedIndex, FractionOfOne } from "./numbers";

export type TaskIdentifier = string & { __marker: "TaskIdentifier" };

export type Task = {
  story: string;
  kind: "dev" | "qa";
  assigned: string;
  durationInDays: number;
  dependsOn: readonly TaskIdentifier[];
};

export type ScheduledTask = Task & {
  daysWorked: DayWorked[];
};

export type DayWorked = {
  startOfDay: number;
  fractionOfDay: FractionOfOne;
};

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

export type DayUsage = {
  fractionWorking: FractionOfOne;
  fractionIdle: FractionOfOne;
};

export type ResourceView = {
  readonly name: string;
  readonly dayUsageMap: Map<number, DayUsage>;
};

export type StoriesPlan = {
  readonly dates: {
    lastDayOfCoding: ZeroBasedIndex;
    endOfIteration: ZeroBasedIndex;
    lastStoryCompleted: ZeroBasedIndex;
    /** The day of the week for day number 0. */
    startDayOfWeek: number;
  };
  readonly stories: readonly PlannedStory[];
};

export type ResourcesView = {
  readonly dates: {
    lastDayOfCoding: ZeroBasedIndex;
    endOfIteration: ZeroBasedIndex;
    startDayOfWeek: number;
  };
  resources: readonly ResourceView[];
};

export type IterationPlan = {
  readonly getStoriesPlan: () => StoriesPlan;
  readonly getResourcesView: () => ResourcesView;
};
