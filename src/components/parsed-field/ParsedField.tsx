import React from "react";
import * as State from "../application-state/parsedField";
import { css } from "goober";

const errorMessageClass = css({
  color: "#f00",
  border: "solid 1px #400",
});

const errorClass = css({
  border: "solid 1px #400",
  outline: "",
});

const ParsedField = <T extends unknown>({
  updateRawValue,
  parsedField: {
    name,
    instructions,
    value: { rawInput, result },
  },
  isMultiline,
}: {
  parsedField: State.ParsedField<T>;
  updateRawValue: (newValue: string) => void;
  isMultiline?: boolean;
}) => (
  <div>
    <label style={{ display: "block" }}>{name}</label>
    <textarea
      placeholder={instructions}
      className={result instanceof Error ? errorClass : ""}
      value={rawInput}
      style={{ minHeight: isMultiline ? 100 : 32, width: "100%" }}
      onChange={(evt) => updateRawValue(evt.currentTarget.value)}
    />
    {result instanceof Error && (
      <div className={errorMessageClass}>{result.message}</div>
    )}
  </div>
);

export default ParsedField;
