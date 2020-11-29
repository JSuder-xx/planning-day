import { FractionOfOne, fractionOfOne } from "../models/numbers";

export const range = (start: number, stop: number): number[] => {
  const result: number[] = [];
  let current = start;
  while (current <= stop) {
    result.push(current);
    current++;
  }
  return result;
};

export const fractionOfNumber = (num: number): FractionOfOne =>
  fractionOfOne(num - Math.floor(num));
