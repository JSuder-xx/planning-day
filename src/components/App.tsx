import React from "react";
import { css } from "goober";
import { Provider as ApplicationStateProvider } from "./application-state/Provider";
import Configuration from "./configuration/Configuration";
import Visualization from "./visualization/Visualization";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const wrapperClass = css`
  background: #222;
  min-height: 100vh;
  padding: 10px;
  color: white;
`;

export default () => (
  <DndProvider backend={HTML5Backend}>
    <ApplicationStateProvider>
      <div className={wrapperClass}>
        <h3
          style={{
            margin: "4px",
            textAlign: "center",
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          Planning Day
        </h3>
        <Configuration />
        <Visualization />
      </div>
    </ApplicationStateProvider>
  </DndProvider>
);
