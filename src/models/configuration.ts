import * as Result from "./result";
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

  return Result.flatMap(
    Result.aggregateResults(
      cleaned
        .split("\n")
        .map((it) => it.trim())
        .filter((it) => it.length > 0)
        .map((it, index) => {
          const storyColumns = it
            .split(",")
            .map((it) => it.trim())
            .filter((it) => it.length > 0);
          return storyColumns.length === 1 || storyColumns.length === 2
            ? storyColumns
            : new Error(
                `Story # ${
                  index + 1
                }: "${it}": Expected to have one or two fields separated by commas but found ${
                  storyColumns.length
                } fields.`
              );
        })
    ),
    (stories) =>
      stories.map(
        (storyParts): Story =>
          storyParts.length === 1
            ? {
                name: storyParts[0],
                description: storyParts[0],
              }
            : {
                name: storyParts[0],
                description: storyParts[1],
              }
      )
  );
};

const quote = (str: string) => `"${str}"`;

const teamMemberCode = (teamMember: string) => `
        "${teamMember}": {
            ptoDays: [],
            hoursPerDay: 6
        },`;

const exampleTeamMemberHour = (teamMember: string, index: number) =>
  `                // ${index > 0 ? ", " : ""}"${teamMember}": 0`;

const exampleTeamMembersHours = (
  teamMembers: readonly string[],
  index: number
) => (index === 0 ? teamMembers.map(exampleTeamMemberHour).join("\n") : "");

const storyCode = (teamMembers: readonly string[]) => (
  story: Story,
  index: number
) => `
        "${story.name}": { 
            description: "${story.description ?? story.name}",
            devHourEstimates: {                
${exampleTeamMembersHours(teamMembers, index)}
            },
            qaHourEstimates: {
${exampleTeamMembersHours(teamMembers, index)}
            },
            // Uncomment "dependsOn" below and provide story identifiers of other stories this story depends upon.            
            // dependsOn: [] 
        },`;

export const createCode = (
  stories: Stories,
  { teamMembers }: TeamMembers
): string =>
  `type HoursPerDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type HourEstimates<teamMembers extends string> = { [teamMember in teamMembers]?: number; };
type Story<storyNames extends string, storyName extends string, teamMembers extends string> = {
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
    firstDayOfIteration: string;
    lastDayOfCoding: string;
    lastDayOfIteration: string;
  };
  teamSchedule: TeamSchedule<teamMembers>;
  stories: Stories<storyNames, teamMembers>;
};
//------------------ Disregard Everything Above This Line --------------------

/** 💥 Modify team members by first changing this type and then updating the iteration specification below. */
type TeamMembers = ${teamMembers.map(quote).join(" | ")};
/** 💥 Modify the list of stories by first changing this type and then updating the iteration specification below. */
type StoryNames = ${stories.map((it) => quote(it.name)).join(" | ")};
const defineIteration = (iteration: Iteration<TeamMembers, StoryNames>) => iteration;

/**
 * # Iteration Parameters.
 * Configure your iteration below
 * - Meaningful dates of the iteration
 * - Individual team member PTO days and average work capacity
 * - Individual story task assignment and estimation.
 * 
 * When the configuration passes a minimum of validation then a planning visualization
 * will display on the right.
 */
defineIteration({
    dates: {
        firstDayOfIteration: "${formatDate(new Date())}",
        lastDayOfIteration: "${formatDate(addDays(new Date(), 13))}",
        lastDayOfCoding: "${formatDate(addDays(new Date(), 10))}"
    },
    teamSchedule: {${teamMembers.map(teamMemberCode).join("")}
    },
    stories: {${stories.map(storyCode(teamMembers)).join("")}
    }
});
`;
