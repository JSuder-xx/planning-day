export const getValue = <T>(v: T | Error): T => {
  if (v instanceof Error) throw v;
  else return v;
};

export const mapError = <T>(
  v: T | Error,
  map: (err: Error) => Error
): T | Error => (v instanceof Error ? map(v) : v);

export const mapErrorMessage = <T>(
  v: T | Error,
  map: (err: string) => string
): T | Error => (v instanceof Error ? new Error(map(v.message)) : v);

export const map = <TIn, TOut>(
  v: TIn | Error,
  map: (v: TIn) => TOut
): TOut | Error => (v instanceof Error ? v : map(v));
