import * as MonacoEditor from "monaco-editor";

export type CustomEventName = "modelChanged" | "modelChangedDebounce";

export type CustomEventArgs = {
  detail: {
    model: MonacoEditor.editor.ITextModel;
  };
};

export function dispatchCustomEvent(
  name: CustomEventName,
  model: MonacoEditor.editor.ITextModel
) {
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: {
        model,
      },
    } as CustomEventArgs)
  );
}

export function bindCustomListener({
  debounce,
  listenerFn,
}: {
  debounce: boolean;
  listenerFn: (evt: CustomEventArgs) => void;
}) {
  const eventName: CustomEventName = debounce
    ? "modelChangedDebounce"
    : "modelChanged";
  window.addEventListener(eventName as any, listenerFn);
  const otherEventName: CustomEventName = debounce
    ? "modelChanged"
    : "modelChangedDebounce";
  window.removeEventListener(otherEventName as any, listenerFn, false);
  return () => window.removeEventListener(eventName as any, listenerFn, false);
}
