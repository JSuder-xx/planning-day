import * as ParseResult from "./parseResult";

export type Parser<T> = (value: string) => ParseResult.T<T>;

export type ParseState<T> = {
  readonly rawInput: string;
  readonly result: ParseResult.T<T>;
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
