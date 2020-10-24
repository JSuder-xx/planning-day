import App from "./components/App";
import { Provider } from "./plugin";
import { PluginUtils } from "./plugin/vendor/pluginUtils";
import { dispatchCustomEvent } from "./plugin/customEvents";
import { PlaygroundPlugin } from "./plugin/vendor/playground";
import React from "react";

const ReactDOM = window.reactDOM;

// Default export of a plugin factory function.
export default (utils: PluginUtils): PlaygroundPlugin => ({
  id: "planning-day",
  displayName: "Planning Day",
  didMount(sandbox, container) {
    ReactDOM.render(
      <Provider
        sandbox={sandbox}
        container={{
          ref: container,
          width: container.clientWidth,
          height: container.clientHeight,
        }}
        utils={utils}
      >
        <App />
      </Provider>,
      container
    );
  },
  modelChanged(_sandbox, model) {
    dispatchCustomEvent("modelChanged", model);
  },
  modelChangedDebounce(_sandbox, model) {
    dispatchCustomEvent("modelChangedDebounce", model);
  },
  willUnmount(_sandbox, container) {
    ReactDOM.unmountComponentAtNode(container);
  },
});
