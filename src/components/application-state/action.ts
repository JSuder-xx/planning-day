import { updateParsedField } from "./parsedField";
import * as ParseResult from "./parseResult";
import { Iteration } from "./iteration";
import { createCode } from "./codeGenerators";
import { State } from "./state";

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

const moveItem = <T>({
  values,
  fromIndex,
  toIndex,
}: {
  values: readonly T[];
  fromIndex: number;
  toIndex: number;
}): T[] => {
  const newValues = values.slice(0);

  const element = newValues[fromIndex];
  newValues.splice(fromIndex, 1);
  newValues.splice(toIndex, 0, element);
  return newValues;
};

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
      const existingStoryMap = state.storyOrdering.reduce<{
        [story: string]: boolean;
      }>((map, story) => {
        map[story] = true;
        return map;
      }, {});
      const newStories = ParseResult.isParseResultOK(
        action.iterationParseResult
      )
        ? Object.keys(action.iterationParseResult.stories)
        : [];
      return {
        ...state,
        storyOrdering: [
          ...state.storyOrdering,
          ...newStories.filter((it) => !existingStoryMap[it]),
        ],
        iterationParseResult: action.iterationParseResult,
      };

    case "MoveStory":
      const maxStoryIndex = state.storyOrdering.length - 1;
      const { fromIndex, toIndex } = action;
      return fromIndex < 0 ||
        fromIndex > maxStoryIndex ||
        toIndex < 0 ||
        toIndex > maxStoryIndex ||
        fromIndex === toIndex
        ? state
        : {
            ...state,
            storyOrdering: moveItem({
              values: state.storyOrdering,
              fromIndex,
              toIndex,
            }),
          };
  }
};
