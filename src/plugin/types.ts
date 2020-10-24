import * as MonacoEditor from "monaco-editor";

type ModelMarker = MonacoEditor.editor.IMarker;

export type ContainerObject = {
  ref: HTMLDivElement;
  width: number;
  height: number;
};

export type Marker = ModelMarker & { key: string };

export type FlashInfo = (message: string) => void;

export type ShowModal = {
  (code: string, subtitle?: string, links?: string[]): void;
};
