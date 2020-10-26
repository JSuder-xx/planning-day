import * as ParseResult from "./parseResult";

export type TeamMembers = { teamMembers: readonly string[] };

export type Story = {
  readonly name: string;
  readonly description: string | null;
};
export type Stories = readonly Story[];

export const teamParser = (str: string) =>
  (str || "").trim().length === 0
    ? null
    : {
        teamMembers: (str || "")
          .trim()
          .split(",")
          .map((it) => it.trim())
          .filter((it) => it.length > 0),
      };

export const storiesParser = (str: string) => {
  const cleaned = (str || "").trim();
  if (cleaned.length === 0) return null;

  return ParseResult.flatMap(
    ParseResult.aggregateResults(
      cleaned
        .split("\n")
        .map((it) => it.trim())
        .filter((it) => it.length > 0)
        .map((it, index) => {
          const storyColumns = it
            .split(",")
            .map((it) => it.trim())
            .filter((it) => it.length > 0);
          return storyColumns.length === 1
            ? [storyColumns[0]]
            : storyColumns.length === 2
            ? [storyColumns[0], storyColumns[1]]
            : new Error(
                `Story # ${
                  index + 1
                }: "${it}": Expected to have one or two fields separated by commas but found ${
                  storyColumns.length
                } fields.`
              );
        })
    ),
    (stories) => {
      return stories.every((it) => it.length === 2)
        ? stories.map(
            ([name, description]): Story => ({
              name,
              description,
            })
          )
        : stories.every((it) => it.length === 1)
        ? stories.map(
            ([name]): Story => ({
              name,
              description: null,
            })
          )
        : new Error(
            `Expected every story to either have a single column or two columns.`
          );
    }
  );
};
