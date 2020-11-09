export const formatDate = (date: Date) => date.toLocaleDateString();

export const convertToDate = (str: string): Date | Error => {
  const today = removeTime(new Date());

  const parts = str.split("/");
  const date =
    parts.length === 1
      ? new Date(today.getFullYear(), today.getMonth(), Number(parts[0]))
      : parts.length === 2
      ? new Date(today.getFullYear(), Number(parts[0]) - 1, Number(parts[1]))
      : new Date(str);
  return isNaN(date.getTime())
    ? new Error(`Error converting '${str}' to date`)
    : removeTime(date);
};

const secInMs = 1000;
const minInMs = 60 * secInMs;
const hourInMs = 60 * minInMs;
const dayInMs = 24 * hourInMs;

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * dayInMs);

export const getDaysOffset = (startDate: Date) => (date: Date) =>
  Math.round((date.getTime() - startDate.getTime()) / dayInMs);

/** Return just the date portion of the date without any time */
export const removeTime = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
