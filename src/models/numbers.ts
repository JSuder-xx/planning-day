export type FractionOfOne = number & { readonly marker: "FractionOfOne" };

export const fractionOfOne = (num: number): FractionOfOne => {
  // This should return a Try for type safety but this is just a tinker project and I'm being incredibly lazy.
  if (num > 1.0) console.warn(`Number not expected to exceed one`);
  return num as FractionOfOne;
};

export type ZeroBasedIndex = number & { readonly marker: "ZeroBasedIndex" };

export const zeroBasedIndex = (num: number): ZeroBasedIndex =>
  num as ZeroBasedIndex;
