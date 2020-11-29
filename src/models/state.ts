import { ParsedField, initialParseState } from "./parsedField";
import * as Result from "./result";
import * as Configuration from "./configuration";
import { Iteration } from "./iteration";
import { IterationPlan } from "./iterationPlan";

export type PlanView = "GanttChart" | "Resource";

export type State = {
  readonly teamMembers: ParsedField<Configuration.TeamMembers>;
  readonly stories: ParsedField<Configuration.Stories>;
  readonly generateTypeScriptCodeResult: Result.T<() => string>;
  readonly typeScriptCode?: string;
  /** story ordering set by user */
  readonly storyOrdering: readonly string[];
  /** iteration parsed from the TypeScript playground */
  readonly iterationResult: Result.T<Iteration>;
  /** The plan is generated from the iteration. */
  readonly iterationPlanResult: Result.T<IterationPlan>;
  readonly planView: PlanView;
};

export const initial: State = {
  teamMembers: {
    name: "Team Members",
    value: initialParseState,
    parser: Configuration.teamParser,
    instructions: "Enter team members in a comma delimited list",
  },
  stories: {
    name: "Stories",
    value: initialParseState,
    parser: Configuration.storiesParser,
    instructions: `Enter one story per line. If you want to provide a description enter the identifier comma description ex. "S123, Build the the thing"`,
  },
  typeScriptCode: "",
  generateTypeScriptCodeResult: null,
  iterationResult: null,
  iterationPlanResult: null,
  planView: "GanttChart",
  storyOrdering: [],
};
