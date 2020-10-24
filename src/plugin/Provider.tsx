import React from "react";
import useResizeAware from "react-resize-aware";
import { Sandbox } from "./vendor/playground";
import { PluginUtils } from "./vendor/pluginUtils";
import * as MonacoEditor from "monaco-editor";
import { CustomEventArgs, bindCustomListener } from "./customEvents";
import { ContainerObject, FlashInfo, Marker, ShowModal } from "./types";

const { useState, useEffect, createContext, useCallback } = React;
type Model = MonacoEditor.editor.ITextModel;

export const PluginContext = createContext<PluginContextProps>({} as any);

export type PluginContextProps = {
  code: string;
  container: ContainerObject;
  sandbox: Sandbox;
  model: Model | undefined;
  flashInfo: FlashInfo;
  showModal: ShowModal;
  markers: Marker[];
  setCode(value: string, options?: { format: boolean }): void;
  formatCode(): void;
  setDebounce(debounce: boolean): void;
  utils: PluginUtils;
};

type ProviderProps = Pick<
  PluginContextProps,
  "sandbox" | "container" | "utils"
>;

export const Provider: React.FC<ProviderProps> = ({
  sandbox,
  container,
  utils,
  children,
}) => {
  const [model, setModel] = useState<Model>();
  const [code, _setCode] = useState(sandbox.getText());
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [debounce, setDebounce] = useState(false);
  const [resizeListener, sizes] = useResizeAware();

  const listenerFn = useCallback(
    (evt: CustomEventArgs): void => {
      setModel({ ...evt.detail.model });
      _setCode(sandbox.getText());
    },
    [sandbox]
  );

  useEffect(() => {
    const disposable = sandbox.editor.onDidChangeModelDecorations(() => {
      const allMarkers = sandbox.monaco.editor
        .getModelMarkers({})
        .map((marker, index) => {
          return {
            ...marker,
            key: index.toString(),
          };
        });
      setMarkers(allMarkers);
    });
    return () => disposable.dispose();
  }, [sandbox]);

  useEffect(() => bindCustomListener({ debounce, listenerFn }), [
    debounce,
    listenerFn,
  ]);

  const setCode = useCallback(
    (value: string, options?: { format: true }) => {
      if (options && options.format) {
        sandbox.setText(value);
        sandbox.editor.getAction("editor.action.formatDocument").run();
      } else {
        sandbox.setText(value);
      }
    },
    [sandbox]
  );

  const formatCode = useCallback(() => {
    return sandbox.editor.getAction("editor.action.formatDocument").run();
  }, [sandbox.editor]);

  const { showModal, flashInfo } = window.playground.ui;

  return (
    <PluginContext.Provider
      value={{
        model,
        code,
        container: {
          ref: container,
          ...sizes,
        },
        flashInfo,
        formatCode,
        markers,
        sandbox,
        setCode,
        setDebounce,
        showModal,
        utils,
      }}
    >
      {resizeListener}
      {children}
    </PluginContext.Provider>
  );
};
