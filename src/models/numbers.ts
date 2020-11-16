export type ZeroBasedNumber = number & { readonly marker: "ZeroBasedNumber" };

export const zeroBasedNumber = (num: number): ZeroBasedNumber =>
  num as ZeroBasedNumber;
