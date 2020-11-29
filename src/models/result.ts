/**
 * A tri-state computation result which can be
 * - null means never attempted
 * - Error indicates an error producing the result
 * - result
 **/
export type T<result> = result | Error | null;

export const isOK = <result>(value: T<result>): value is result =>
  !(value instanceof Error) && value !== null && value !== undefined;

export const map = <resultIn, resultOut>(
  value: T<resultIn>,
  map: (original: resultIn) => resultOut
): T<resultOut> => (isOK(value) ? map(value) : value);

export const flatMap = <resultIn, resultOut>(
  value: T<resultIn>,
  map: (original: resultIn) => T<resultOut>
): T<resultOut> => (isOK(value) ? map(value) : value);

export const map2 = <resultIn1, resultIn2, resultOut>(
  in1: T<resultIn1>,
  in2: T<resultIn2>,
  map: (in1: resultIn1, in2: resultIn2) => resultOut
): T<resultOut> =>
  isOK(in1) && isOK(in2)
    ? map(in1, in2)
    : in1 instanceof Error
    ? in1
    : in2 instanceof Error
    ? in2
    : null;

export const aggregateResultCases = <result>(
  givenResults: T<result>[]
): { results: result[]; errors: Error[]; numberOfNull: number } => {
  const errors: Error[] = [];
  const results: result[] = [];
  let numberOfNull = 0;
  givenResults.forEach((result) => {
    if (result instanceof Error) errors.push(result);
    else if (result === null) numberOfNull++;
    else results.push(result);
  });
  return {
    errors,
    numberOfNull,
    results,
  };
};

export const aggregateResults = <result>(results: T<result>[]): T<result[]> => {
  const cases = aggregateResultCases(results);
  return cases.errors.length > 0
    ? new Error(cases.errors.map((err) => err.message).join(", "))
    : cases.numberOfNull > 0
    ? null
    : cases.results;
};
