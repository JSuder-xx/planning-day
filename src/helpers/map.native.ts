export const createMap = <T>(
  values: readonly T[],
  keyFn: (val: T, index: number) => string
): Map<string, T> =>
  values.reduce<Map<string, T>>((map, value, index) => {
    map.set(keyFn(value, index), value);
    return map;
  }, new Map());

export const getCreateEntry = <T>(
  map: Map<string, T>,
  id: string,
  create: () => T
): T => {
  const existing = map.get(id);
  if (!existing) {
    const newEntry = create();
    map.set(id, newEntry);
    return newEntry;
  } else return existing;
};

export const mapToArray = <T, TOut>(
  map: Map<string, T>,
  fn: (key: string, val: T) => TOut
) => {
  const result: TOut[] = [];
  for (const [key, value] of map.entries()) {
    result.push(fn(key, value));
  }
  return result;
};

export const mapMap = <T, TOut>(
  map: Map<string, T>,
  fn: (key: string, val: T) => TOut
) => {
  const outMap = new Map<string, TOut>();
  for (const [key, value] of map.entries()) {
    outMap.set(key, fn(key, value));
  }
  return outMap;
};
