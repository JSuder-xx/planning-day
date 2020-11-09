export type Map<T> = { [key: string]: T };

export const createMap = <T>(
  values: readonly T[],
  keyFn: (val: T, index: number) => string
): Map<T> =>
  values.reduce<Map<T>>((map, value, index) => {
    map[keyFn(value, index)] = value;
    return map;
  }, {});

export const aggregate = <T>(
  values: readonly T[],
  keyFn: (val: T, index: number) => string
): Map<T[]> =>
  values.reduce<Map<T[]>>((map, value, index) => {
    const key = keyFn(value, index);
    const entries = getCreateEntry(map, key, () => []);
    entries.push(value);
    return map;
  }, {});

export const getCreateEntry = <T>(
  map: Map<T | undefined>,
  id: string,
  create: () => T
): T => {
  const existing = map[id];
  if (!existing) {
    const newEntry = create();
    map[id] = newEntry;
    return newEntry;
  } else return existing;
};

export const forEach = <T>(map: Map<T>, fn: (key: string, val: T) => void) => {
  Object.keys(map).forEach((key) => {
    fn(key, map[key]);
  });
};

export const mapToArray = <T, TOut>(
  map: Map<T | undefined>,
  fn: (key: string, val: T) => TOut
) => {
  const result: TOut[] = [];
  for (const key of Object.keys(map)) {
    result.push(fn(key, map[key]!));
  }
  return result;
};

export const mapMap = <T, TOut>(
  map: Map<T>,
  fn: (key: string, val: T) => TOut
) => {
  const outMap: Map<TOut> = {};
  for (const key of Object.keys(map)) {
    outMap[key] = fn(key, map[key]);
  }
  return outMap;
};
