import { IterationPlan, PlannedStory, PlannedTask } from "./iterationPlan";
import { Iteration, Story, TeamSchedule } from "./iteration";
import { zeroBasedNumber } from "./numbers";
import {
  aggregate,
  createMap,
  getCreateEntry,
  forEach,
  mapToArray,
  mapMap,
} from "../helpers/map.json";
import { lastItemThrow, flatMap } from "../helpers/array";

type TaskIdentifier = string & { __marker: "TaskIdentifier" };

type StoryWithId = Story & { id: string };

type Task = {
  story: string;
  kind: "dev" | "qa";
  assigned: string;
  durationInDays: number;
  dependsOn: readonly TaskIdentifier[];
};

type DayWorked = {
  startOfDay: number;
  partOfDay: number;
};

type ScheduledTask = Task & {
  daysWorked: DayWorked[];
};

const taskId = ({
  story,
  kind,
  assigned,
}: Pick<Task, "story" | "kind" | "assigned">): TaskIdentifier =>
  `${story}::${kind}::${assigned}` as TaskIdentifier;

type UnscheduledResource = {
  readonly name: string;
  readonly tasks: readonly Task[];
  readonly capacityAvailableOnDay: Map<number, number>;
};

type MutableScheduledResource = {
  readonly name: string;
  readonly remainingTasks: Task[];
  readonly scheduledTasks: ScheduledTask[];
};

type ScheduledResource = {
  readonly name: string;
  readonly remainingTasks: readonly Task[];
  readonly scheduledTasks: readonly ScheduledTask[];
};

const createResources = (
  stories: StoryWithId[],
  teamSchedule: TeamSchedule<number>,
  teamPTODays: readonly number[]
): UnscheduledResource[] => {
  const storyMap = createMap(stories, (story) => story.id);
  const resourceMap: { [resourceName: string]: Task[] } = {};
  stories.forEach((story) => {
    const dependsOnStories = story.dependsOn ?? [];

    const dependsOnDevTasks: readonly TaskIdentifier[] = flatMap(
      dependsOnStories,
      (story) => {
        const dependsOnStory = storyMap[story];
        if (!dependsOnStory)
          throw new Error(`Unable to find ${story} in story map`);
        return Object.keys(
          dependsOnStory.devHourEstimates
        ).map((devOnOtherStory) =>
          taskId({ story, kind: "dev", assigned: devOnOtherStory })
        );
      }
    );

    const devTasks: readonly Task[] = mapToArray(
      story.devHourEstimates,
      (assigned, hoursEstimate) => {
        const schedule = teamSchedule[assigned];
        if (!schedule)
          throw new Error(`Unable to find schedule for ${assigned}`);
        return {
          story: story.id,
          assigned,
          dependsOn: dependsOnDevTasks,
          durationInDays: hoursEstimate / schedule.hoursPerDay,
          kind: "dev",
        };
      }
    );

    devTasks.forEach((it) => {
      const tasks = getCreateEntry(resourceMap, it.assigned, () => []);
      tasks.push(it);
    });

    forEach(story.qaHourEstimates, (assigned, hoursEstimate) => {
      const tasks = getCreateEntry(resourceMap, assigned, () => []);
      const schedule = teamSchedule[assigned];
      if (!schedule) throw new Error(`Unable to find schedule for ${assigned}`);
      tasks.push({
        story: story.id,
        assigned,
        dependsOn: devTasks.map(taskId),
        durationInDays: hoursEstimate / schedule.hoursPerDay,
        kind: "qa",
      });
    });
  });

  return mapToArray(resourceMap, (name, tasks) => {
    const capacityAvailableOnDay = new Map<number, number>();
    const teamMemberSchedule = teamSchedule[name];
    for (let dayNumber = 0; dayNumber < 60; dayNumber++) {
      capacityAvailableOnDay.set(dayNumber, 1);
    }
    teamMemberSchedule.ptoDays.forEach((day) =>
      capacityAvailableOnDay.set(day, 0)
    );
    teamPTODays.forEach((day) => capacityAvailableOnDay.set(day, 0));
    return {
      name,
      tasks,
      capacityAvailableOnDay,
    };
  });
};

const fractionOf = (num: number): number => num - Math.floor(num);

const scheduleResources = (
  unscheduledResources: UnscheduledResource[],
  pastEndOfIterationBuffer: number
): ScheduledResource[] => {
  const resourceNameToCapacityAvailable = mapMap(
    createMap(unscheduledResources, (it) => it.name),
    (_, val) => val.capacityAvailableOnDay
  );
  const resources: MutableScheduledResource[] = unscheduledResources.map(
    ({ name, tasks }): MutableScheduledResource => ({
      name,
      remainingTasks: tasks.slice(),
      scheduledTasks: [],
    })
  );
  let missedCycleCount = 0;
  const scheduledMap: {
    [taskId: string]: ScheduledTask | undefined;
  } = {};

  while (
    resources.some((resource) => resource.remainingTasks.length > 0) &&
    missedCycleCount < 2
  ) {
    let scheduled = false;
    resources
      .filter((resource) => resource.remainingTasks.length > 0)
      .forEach((resource) => {
        while (didScheduleResource(resource)) {
          scheduled = true;
        }
      });
    missedCycleCount = scheduled ? 0 : missedCycleCount + 1;
  }

  return resources;

  function didScheduleResource(resource: MutableScheduledResource): boolean {
    const pendingTask = resource.remainingTasks[0];
    if (!pendingTask) return false;
    const dependenciesTry = getScheduledDependencies(pendingTask.dependsOn);
    if (dependenciesTry instanceof Error) return false;

    resource.remainingTasks.shift();
    resource.scheduledTasks.push(
      scheduleTask(
        resourceNameToCapacityAvailable[resource.name],
        pendingTask,
        dependenciesTry,
        pastEndOfIterationBuffer
      )
    );
    return true;
  }

  function getScheduledDependencies(
    taskIdentifiers: readonly TaskIdentifier[]
  ): ScheduledTask[] | Error {
    const scheduledTasks: ScheduledTask[] = [];
    for (const identifier of taskIdentifiers) {
      const scheduledTask = scheduledMap[identifier];
      if (scheduledTask === undefined)
        return new Error(`Unable to find identifier ${identifier}`);
      else scheduledTasks.push(scheduledTask);
    }
    return scheduledTasks;
  }

  function scheduleTask(
    capacityAvailableOnDayMap: Map<number, number>,
    task: Task,
    dependencies: ScheduledTask[],
    pastEndOfIterationBuffer: number
  ): ScheduledTask {
    let startOn = dependencies.reduce<number>((maxDay, scheduledTask) => {
      const lastDayWorked = lastItemThrow(scheduledTask.daysWorked);
      return Math.max(
        lastDayWorked.startOfDay + lastDayWorked.partOfDay,
        maxDay
      );
    }, 0);

    const daysWorked: DayWorked[] = [];
    let remainingDays: number = task.durationInDays;
    const capacityAvailableOnDay = capacityAvailableOnDayMap.get(
      Math.floor(startOn)
    );
    if (capacityAvailableOnDay !== undefined && capacityAvailableOnDay > 0) {
      startOn = startOn + (1 - capacityAvailableOnDay);
      const partOfDay = Math.min(remainingDays, 1 - fractionOf(startOn));
      remainingDays -= partOfDay;
      capacityAvailableOnDayMap.set(
        Math.floor(startOn),
        capacityAvailableOnDay - partOfDay
      );
      daysWorked.push({
        startOfDay: startOn,
        partOfDay,
      });
    }
    let currentDay = Math.floor(startOn) + 1;

    while (remainingDays > 0 && currentDay < pastEndOfIterationBuffer) {
      const capacityAvailableOnDay = capacityAvailableOnDayMap.get(
        Math.floor(currentDay)
      );
      if (capacityAvailableOnDay !== undefined && capacityAvailableOnDay > 0) {
        const partOfDay = Math.min(remainingDays, capacityAvailableOnDay);
        remainingDays -= partOfDay;
        capacityAvailableOnDayMap.set(
          Math.floor(currentDay),
          capacityAvailableOnDay - partOfDay
        );

        daysWorked.push({
          startOfDay: currentDay + (1 - capacityAvailableOnDay),
          partOfDay,
        });
      }
      currentDay++;
    }

    const scheduledTask: ScheduledTask = {
      ...task,
      daysWorked,
    };
    scheduledMap[taskId(task)] = scheduledTask;

    return scheduledTask;
  }
};

/**
 * Create the iteration plan from the iteration (parsed from the TypeScript Playground) and the story ordering.
 *
 * **⛔ATTENTION:** Do **NOT** look to this file for algorithm elegance!!! This was thrown together brute force.
 * I will clean it up in the future. For now I am concentrating on proving the concept of using the
 * TypeScript Playground and type-checker as a _complement_ to a classic GUI.
 */
export const createIterationPlan = ({
  iteration,
  storyOrdering,
}: {
  iteration: Iteration;
  storyOrdering: readonly string[];
}): IterationPlan => {
  const storyMap = iteration.stories;

  const stories: StoryWithId[] = storyOrdering.map((id) => ({
    id,
    ...storyMap[id],
  }));
  const resources = createResources(
    stories,
    iteration.teamSchedule,
    iteration.userDates.teamPTODays
  );
  const scheduledResources = scheduleResources(
    resources,
    iteration.lastDayToConsider
  );
  const scheduledTasksByStory = aggregate(
    flatMap(scheduledResources, (resource) => resource.scheduledTasks),
    (task) => task.story
  );
  const remainingTasksByStory = aggregate(
    flatMap(scheduledResources, (resource) => resource.remainingTasks),
    (task) => task.story
  );

  const plannedStories = storyOrdering.map(createPlannedStory);

  return {
    dates: {
      lastDayOfCoding: zeroBasedNumber(iteration.userDates.lastDayOfCoding),
      endOfIteration: zeroBasedNumber(iteration.userDates.lastDayOfIteration),
      lastStoryCompleted: zeroBasedNumber(
        plannedStories.reduce<number>(
          (lastDay, current) =>
            current.completedDayNumberMaybe === null
              ? lastDay
              : Math.max(lastDay, current.completedDayNumberMaybe),
          0
        )
      ),
      startDayOfWeek: iteration.startDayOfWeek,
    },
    stories: plannedStories,
  };

  function createPlannedStory(storyName: string): PlannedStory {
    const story = storyMap[storyName];
    const scheduledTasks = scheduledTasksByStory[storyName] || [];
    const remainingTasks = remainingTasksByStory[storyName] || [];
    return {
      story: storyName,
      description: story.description,
      tasks: [
        ...scheduledTasks.map(
          (scheduledTask): PlannedTask => ({
            assigned: scheduledTask.assigned,
            kind: scheduledTask.kind,
            daysWorkedTry: scheduledTask.daysWorked,
          })
        ),
        ...remainingTasks.map(
          (remainingTask): PlannedTask => ({
            assigned: remainingTask.assigned,
            kind: remainingTask.kind,
            daysWorkedTry: new Error(
              `Unable to schedule task of ${remainingTask.durationInDays} days`
            ),
          })
        ),
      ],
      completedDayNumberMaybe:
        remainingTasks.length > 0 || scheduledTasks.length < 1
          ? null
          : scheduledTasks.reduce<number>(
              (max, current) =>
                current.daysWorked.length === 0
                  ? max
                  : Math.max(
                      max,
                      current.daysWorked[current.daysWorked.length - 1]
                        .startOfDay
                    ),
              0
            ),
    };
  }
};
