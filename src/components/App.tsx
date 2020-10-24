import React from "react";
import { css } from "goober";
import { usePlugin } from "../plugin";
import Markers from "./Markers";
const { useEffect } = React;

const CSSClasses = (() => {
  const colors = {
    darkgray: "#224",
    gray: "hsla(0, 0%, 21%, 1)",
    blue: "hsla(193, 95%, 68%, 1)",
  };

  return {
    wrapper: css`
      background: ${colors.darkgray};
      text-align: center;
      min-height: 100vh;
      padding: 10px;
      color: white;

      h1,
      h3 {
        font-weight: 300;
        line-height: 1;
      }
    `,
    button: css`
      display: inline-block;
      margin: 5px;
      padding: 5px;
      min-width: 150px;
      color: ${colors.blue};
      background: transparent;
      font-size: 0.9rem;
      border: 1px solid ${colors.blue};
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background: ${colors.gray};
      }
    `,
  };
})();

const App = () => {
  const {
    //code,
    setCode,
    formatCode,
    markers,
    setDebounce,
    flashInfo,
    // container,
    // utils,
    // sandbox,
    // model,
  } = usePlugin();

  setDebounce(true);

  useEffect(() => {
    setCode("");
  }, [setCode]);

  function handleClear() {
    setCode("");
    flashInfo("Cleared!");
  }

  function handleFormatCode() {
    formatCode();
  }

  function handleShowFlash() {
    flashInfo("Flash!");
  }

  return (
    <div className={CSSClasses.wrapper}>
      <header>
        <h3>Planning Day</h3>
      </header>
      <button className={CSSClasses.button} onClick={handleFormatCode}>
        Format Code
      </button>

      <button className={CSSClasses.button} onClick={handleShowFlash}>
        Show Flash
      </button>

      <button className={CSSClasses.button} onClick={handleClear}>
        Clear the Editor
      </button>

      <div
        className={css`
          margin-top: 2em;
        `}
      >
        {!!markers.length && <Markers markers={markers} />}
      </div>
    </div>
  );
};

export default App;
