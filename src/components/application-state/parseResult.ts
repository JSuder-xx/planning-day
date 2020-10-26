export type T<result> = result | Error | null;

export const isParseResultOK = <result>(value: T<result>): value is result =>
  !(value instanceof Error) && value !== null && value !== undefined;

export const map = <resultIn, resultOut>(
  value: T<resultIn>,
  map: (original: resultIn) => resultOut
): T<resultOut> => (isParseResultOK(value) ? map(value) : value);

export const flatMap = <resultIn, resultOut>(
  value: T<resultIn>,
  map: (original: resultIn) => T<resultOut>
): T<resultOut> => (isParseResultOK(value) ? map(value) : value);

export const map2 = <resultIn1, resultIn2, resultOut>(
  in1: T<resultIn1>,
  in2: T<resultIn2>,
  map: (in1: resultIn1, in2: resultIn2) => resultOut
): T<resultOut> =>
  isParseResultOK(in1) && isParseResultOK(in2)
    ? map(in1, in2)
    : in1 instanceof Error
    ? in1
    : in2 instanceof Error
    ? in2
    : null;

export const aggregateResultCases = <result>(
  parseResults: T<result>[]
): { results: result[]; errors: Error[]; numberOfNull: number } => {
  const errors: Error[] = [];
  const results: result[] = [];
  let numberOfNull = 0;
  parseResults.forEach((parseResult) => {
    if (parseResult instanceof Error) errors.push(parseResult);
    else if (parseResult === null) numberOfNull++;
    else results.push(parseResult);
  });
  return {
    errors,
    numberOfNull,
    results,
  };
};

export const aggregateResults = <result>(
  parseResults: T<result>[]
): T<result[]> => {
  const cases = aggregateResultCases(parseResults);
  return cases.errors.length > 0
    ? cases.errors[0] // TODO: actually aggregate rather than just taking first
    : cases.numberOfNull > 0
    ? null
    : cases.results;
};
