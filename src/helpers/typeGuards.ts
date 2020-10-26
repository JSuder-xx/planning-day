export const checkFields = <state extends {}>(
  obj: any,
  fields: (keyof state)[]
) =>
  typeof obj === "object" &&
  fields.every((field) => typeof (obj as any)[field] !== "undefined");
