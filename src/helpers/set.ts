export type Set = { [value: string]: boolean | undefined };

export const createSet = (values: readonly string[]): Set =>
  values.reduce<Set>((set, value) => {
    set[value] = true;
    return set;
  }, {});
