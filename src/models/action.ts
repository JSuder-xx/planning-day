import { updateParsedField } from "./parsedField";
import * as Result from "./result";
import { Iteration } from "./iteration";
import { createCode } from "./configuration";
import { State, PlanView } from "./state";
import { createSet } from "../helpers/set";
import { moveItem } from "../helpers/array";
import { createIterationPlan } from "./iterationPlanFactory";
import compare from "react-fast-compare";

export type UpdateTeamMembers = {
  readonly kind: "UpdateTeamMembers";
  readonly value: string;
};

export type UpdateStories = {
  readonly kind: "UpdateStories";
  readonly value: string;
};

export type GenerateTypeScriptCode = {
  readonly kind: "GenerateTypeScriptCode";
  generateCode: () => string;
};

export type UpdateIterationResult = {
  readonly kind: "UpdateIterationResult";
  readonly iterationResult: Result.T<Iteration>;
};

export type MoveStory = {
  readonly kind: "MoveStory";
  readonly fromIndex: number;
  readonly toIndex: number;
};

export type ChangePlanView = {
  readonly kind: "ChangePlanView";
  readonly planView: PlanView;
};

export type Action =
  | ChangePlanView
  | GenerateTypeScriptCode
  | MoveStory
  | UpdateIterationResult
  | UpdateStories
  | UpdateTeamMembers;

const createGenerateCode = ({
  stories,
  teamMembers,
}: Pick<State, "stories" | "teamMembers">) =>
  Result.map2(
    stories.value.result,
    teamMembers.value.result,
    (stories, teamMembers) => () => createCode(stories, teamMembers)
  );

export const reducer = (state: State, action: Action): State => {
  switch (action.kind) {
    case "ChangePlanView":
      return {
        ...state,
        planView: action.planView,
      };

    case "GenerateTypeScriptCode":
      return {
        ...state,
        typeScriptCode: action.generateCode(),
      };

    case "MoveStory":
      const storyOrderingTry = moveItem({
        values: state.storyOrdering,
        ...action,
      });
      if (storyOrderingTry instanceof Error) {
        console.error(storyOrderingTry);
        return state;
      } else
        return {
          ...state,
          storyOrdering: storyOrderingTry,
          iterationPlanResult: Result.isOK(state.iterationResult)
            ? createIterationPlan({
                iteration: state.iterationResult,
                storyOrdering: storyOrderingTry,
              })
            : null,
        };

    case "UpdateIterationResult":
      const existingStorySet = createSet(state.storyOrdering);
      const storiesFromIteration = Result.isOK(action.iterationResult)
        ? Object.keys(action.iterationResult.stories)
        : [];
      const storiesFromIterationSet = createSet(storiesFromIteration);
      const storyOrdering = [
        // only keep the existing stories that are also found in the latest iteration parse
        ...state.storyOrdering.filter((it) => storiesFromIterationSet[it]),
        // any stories from parse that were not already present get tacked onto the end
        ...storiesFromIteration.filter((it) => !existingStorySet[it]),
      ];

      return {
        ...state,
        storyOrdering,
        iterationResult: action.iterationResult,
        iterationPlanResult: Result.isOK(action.iterationResult)
          ? compare(action.iterationResult, state.iterationResult)
            ? state.iterationPlanResult
            : createIterationPlan({
                iteration: action.iterationResult,
                storyOrdering,
              })
          : null,
      };

    case "UpdateStories":
      const stories = updateParsedField(state.stories, action.value);
      return {
        ...state,
        stories,
        generateTypeScriptCodeResult: createGenerateCode({
          stories,
          teamMembers: state.teamMembers,
        }),
      };

    case "UpdateTeamMembers":
      const teamMembers = updateParsedField(state.teamMembers, action.value);
      return {
        ...state,
        teamMembers,
        generateTypeScriptCodeResult: createGenerateCode({
          teamMembers,
          stories: state.stories,
        }),
      };
  }
};
