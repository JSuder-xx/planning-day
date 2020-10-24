import React from "react";
import { css } from "goober";
import { Marker } from "../plugin/types";

const CSSClasses = (() => {
  return {
    marker: css`
      margin: 5px;
      padding: 0px;
      font-size: 0.9rem;
    `,
  };
})();

const Markers = ({ markers }: { markers: Marker[] }) => (
  <div>
    <h3>Issues</h3>
    {markers
      .sort((a, b) => (a.startLineNumber >= b.startLineNumber ? 1 : -1))
      .map((marker) => {
        return (
          <div key={marker.key}>
            <p className={CSSClasses.marker}>
              Line # {marker.startLineNumber}:&nbsp;
              {marker.message}
            </p>
          </div>
        );
      })}
  </div>
);

export default Markers;
