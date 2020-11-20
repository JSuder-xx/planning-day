/**
 * - When the arguments are valid, returns a new array with the item at the fromIndex moved to the toIndex
 * - Otherwise returns an Error.
 **/
export const moveItem = <T>({
  values,
  fromIndex,
  toIndex,
}: {
  values: readonly T[];
  fromIndex: number;
  toIndex: number;
}): T[] | Error => {
  const lastIndex = values.length - 1;
  if (fromIndex < 0 || fromIndex > lastIndex)
    return new Error(`Expected fromIndex to be in the range 0..${lastIndex}`);
  if (toIndex < 0 || toIndex > lastIndex)
    return new Error(`Expected toIndex to be in the range 0..${lastIndex}`);

  const newValues = values.slice(0);

  const element = newValues[fromIndex];
  newValues.splice(fromIndex, 1);
  newValues.splice(toIndex, 0, element);
  return newValues;
};

export const flatten = <T>(it: readonly (readonly T[])[]): readonly T[] =>
  ([] as T[]).concat(...it);

export const flatMap = <TIn, TOut>(
  it: readonly TIn[],
  map: (v: TIn) => readonly TOut[]
): readonly TOut[] => flatten(it.map(map));

export const lastItemThrow = <T>(arr: T[]): T => {
  const len = arr.length;
  if (len < 0) throw new Error(`Cannot fetch last item of empty array.`);
  return arr[len - 1];
};

export const partition = <T>(
  arr: readonly T[],
  predicate: (val: T) => boolean
): [T[], T[]] => {
  const trueList: T[] = [];
  const falseList: T[] = [];
  arr.forEach((item) => {
    (predicate(item) ? trueList : falseList).push(item);
  });

  return [trueList, falseList];
};
