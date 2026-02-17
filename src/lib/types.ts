export interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  seed: number;
  version: number;
  isDeleted: boolean;
  boundElements: BoundElement[] | null;
  link: string | null;
  locked: boolean;
}

interface BoundElement {
  id: string;
  type: string;
}

export interface ExcalidrawRectangle extends ExcalidrawElement {
  type: "rectangle";
  roundness: { type: number; value?: number } | null;
}

export interface ExcalidrawEllipse extends ExcalidrawElement {
  type: "ellipse";
}

export interface ExcalidrawDiamond extends ExcalidrawElement {
  type: "diamond";
}

export interface ExcalidrawText extends ExcalidrawElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: number;
  textAlign: string;
  verticalAlign: string;
  containerId: string | null;
  originalText: string;
}

export interface ExcalidrawArrow extends ExcalidrawElement {
  type: "arrow";
  points: [number, number][];
  startBinding: Binding | null;
  endBinding: Binding | null;
  startArrowhead: string | null;
  endArrowhead: string | null;
}

export interface ExcalidrawLine extends ExcalidrawElement {
  type: "line";
  points: [number, number][];
}

export interface ExcalidrawFreedraw extends ExcalidrawElement {
  type: "freedraw";
}

export interface ExcalidrawImage extends ExcalidrawElement {
  type: "image";
}

export interface Binding {
  elementId: string;
  focus: number;
  gap: number;
}

export type SupportedElement =
  | ExcalidrawRectangle
  | ExcalidrawEllipse
  | ExcalidrawDiamond
  | ExcalidrawText
  | ExcalidrawArrow
  | ExcalidrawLine;

export type AnyExcalidrawElement =
  | SupportedElement
  | ExcalidrawFreedraw
  | ExcalidrawImage
  | ExcalidrawElement;

export interface ExcalidrawFile {
  type: "excalidraw";
  version: number;
  source: string;
  elements: AnyExcalidrawElement[];
  appState?: Record<string, unknown>;
}

export interface Warning {
  type: "unsupported" | "too_small" | "rotation";
  elementId: string;
  elementType: string;
  message: string;
}

export interface ConversionResult {
  ascii: string;
  warnings: Warning[];
  width: number;
  height: number;
}
