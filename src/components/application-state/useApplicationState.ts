import React from "react";
import { ApplicationStateContext, ApplicationStateProps } from "./Provider";
const { useContext } = React;

export function useApplicationState() {
  return useContext(ApplicationStateContext) as ApplicationStateProps;
}
