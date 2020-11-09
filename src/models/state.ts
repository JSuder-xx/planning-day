import { ParsedField, initialParseState } from "./parsedField";
import * as ParseResult from "./parseResult";
import * as Configuration from "./configuration";
import { Iteration } from "./iteration";
import { IterationPlan } from "./iterationPlan";

export type State = {
  readonly teamMembers: ParsedField<Configuration.TeamMembers>;
  readonly stories: ParsedField<Configuration.Stories>;
  readonly code: string;
  readonly generateCode: ParseResult.T<() => string>;
  /** story ordering set by user */
  readonly storyOrdering: readonly string[];
  /** iteration parsed from the TypeScript playground */
  readonly iterationParseResult: ParseResult.T<Iteration>;
  readonly iterationPlan: IterationPlan | null | Error;
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
  code: "",
  generateCode: null,
  iterationParseResult: null,
  iterationPlan: null,
  storyOrdering: [],
};
