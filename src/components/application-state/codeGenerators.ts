import { Stories, Story, TeamMembers } from "./configuration";
const quote = (str: string) => `"${str}"`;

const formatDate = (date: Date) => date.toLocaleDateString();

const secInMs = 1000;
const minInMs = 60 * secInMs;
const hourInMs = 60 * minInMs;
const dayInMs = 24 * hourInMs;
const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * dayInMs);

const teamMemberCode = (teamMember: string) => `
        "${teamMember}": {
            ptoDays: [],
            hoursPerDay: 6
        },`;

const storyCode = (story: Story) => `
        "${story.name}": { 
            description: "${story.description ?? story.name}",
            dev: [],
            qa: [],
            // dependsOn: []
        },`;

export const createCode = (
  stories: Stories,
  { teamMembers }: TeamMembers
): string =>
  `type HoursPerDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type Activity<teamMembers> = { assigned: teamMembers; hourEstimate: number; };

type Story<storyNames extends string, storyName extends string, teamMembers> = {
    description: string;
    dev: Activity<teamMembers>[];
    qa: Activity<teamMembers>[];
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
