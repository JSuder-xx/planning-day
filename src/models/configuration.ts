import * as ParseResult from "./parseResult";
import { formatDate, addDays } from "../helpers/date";
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

const quote = (str: string) => `"${str}"`;

const teamMemberCode = (teamMember: string) => `
        "${teamMember}": {
            ptoDays: [],
            hoursPerDay: 6
        },`;

const storyCode = (story: Story) => `
        "${story.name}": { 
            id: "${story.name}",
            description: "${story.description ?? story.name}",
            devHourEstimates: {},
            qaHourEstimates: {},
            // dependsOn: []
        },`;

export const createCode = (
  stories: Stories,
  { teamMembers }: TeamMembers
): string =>
  `type HoursPerDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type HourEstimates<teamMembers extends string> = { [teamMember in teamMembers]?: number; };

type Story<storyNames extends string, storyName extends string, teamMembers extends string> = {
    id: storyName;
    description: string;
    devHourEstimates: HourEstimates<teamMembers>;
    qaHourEstimates: HourEstimates<teamMembers>;
    dependsOn?: Exclude<storyNames, storyName>[];
};

type TeamSchedule<teamMembers extends string> = { [teamMember in teamMembers]: TeamMemberSchedule; };

type TeamMemberSchedule = { ptoDays: string[]; hoursPerDay: HoursPerDay; };

type Stories<storyNames extends string, teamMembers extends string> = {
  [storyName in storyNames]: Story<storyNames, storyName, teamMembers>;
};

type Iteration<teamMembers extends string, storyNames extends string> = {
  dates: {
    start: string;
    lastDayOfCoding: string;
    end: string;
  };
  teamSchedule: TeamSchedule<teamMembers>;
  stories: Stories<storyNames, teamMembers>;
};

type TeamMembers = ${teamMembers.map(quote).join("|")};
type StoryNames = ${stories.map((it) => quote(it.name)).join("|")};
const defineIteration = (iteration: Iteration<TeamMembers, StoryNames>) => iteration;

defineIteration({
    dates: {
        start: "${formatDate(new Date())}",
        end: "${formatDate(addDays(new Date(), 13))}",
        lastDayOfCoding: "${formatDate(addDays(new Date(), 10))}"
    },
    teamSchedule: {${teamMembers.map(teamMemberCode).join("")}
    },
    stories: {${stories.map(storyCode).join("")}
    }
});
`;
