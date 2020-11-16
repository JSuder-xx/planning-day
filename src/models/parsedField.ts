import * as Result from "./result";

export type Parser<T> = (value: string) => Result.T<T>;

export type ParseState<T> = {
  readonly rawInput: string;
  readonly result: Result.T<T>;
};

export const initialParseState: ParseState<any> = {
  rawInput: "",
  result: null,
};

export type ParsedField<T> = {
  readonly name: string;
  readonly instructions: string;
  readonly value: ParseState<T>;
  readonly parser: Parser<T>;
};

export const updateParsedField = <T>(
  current: ParsedField<T>,
  rawInput: string
): ParsedField<T> => ({
  ...current,
  value: {
    rawInput,
    result: current.parser(rawInput),
  },
});
