import { updateParsedField } from "./parsedField";
import * as ParseResult from "./parseResult";
import { Iteration } from "./iteration";
import { createCode } from "./configuration";
import { State } from "./state";
import { createSet } from "../helpers/set";
import { moveItem } from "../helpers/array";
import { createIterationPlan } from "./iterationPlanFactory";
export type UpdateTeamMembers = {
  kind: "UpdateTeamMembers";
  value: string;
};

export type UpdateStories = {
  kind: "UpdateStories";
  value: string;
};

export type Generate = {
  kind: "Generate";
  generateCode: () => string;
};

export type UpdateIterationParseResult = {
  kind: "UpdateIterationParseResult";
  readonly iterationParseResult: ParseResult.T<Iteration>;
};

export type MoveStory = {
  kind: "MoveStory";
  fromIndex: number;
  toIndex: number;
};

export type Action =
  | UpdateTeamMembers
  | UpdateStories
  | Generate
  | UpdateIterationParseResult
  | MoveStory;

const createGenerateCode = ({
  stories,
  teamMembers,
}: Pick<State, "stories" | "teamMembers">) =>
  ParseResult.map2(
    stories.value.result,
    teamMembers.value.result,
    (stories, teamMembers) => () => createCode(stories, teamMembers)
  );

export const reducer = (state: State, action: Action): State => {
  switch (action.kind) {
    case "UpdateStories":
      const stories = updateParsedField(state.stories, action.value);
      return {
        ...state,
        stories,
        generateCode: createGenerateCode({
          stories,
          teamMembers: state.teamMembers,
        }),
      };

    case "UpdateTeamMembers":
      const teamMembers = updateParsedField(state.teamMembers, action.value);
      return {
        ...state,
        teamMembers,
        generateCode: createGenerateCode({
          teamMembers,
          stories: state.stories,
        }),
      };

    case "Generate":
      return {
        ...state,
        code: action.generateCode(),
      };

    case "UpdateIterationParseResult":
      const existingStorySet = createSet(state.storyOrdering);
      const storiesFromIteration = ParseResult.isParseResultOK(
        action.iterationParseResult
      )
        ? Object.keys(action.iterationParseResult.stories)
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
        iterationParseResult: action.iterationParseResult,
        iterationPlan: ParseResult.isParseResultOK(action.iterationParseResult)
          ? createIterationPlan({
              iteration: action.iterationParseResult,
              storyOrdering,
            })
          : null,
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
          iterationPlan: ParseResult.isParseResultOK(state.iterationParseResult)
            ? createIterationPlan({
                iteration: state.iterationParseResult,
                storyOrdering: storyOrderingTry,
              })
            : null,
        };
  }
};
