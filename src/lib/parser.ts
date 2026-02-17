import type { AnyExcalidrawElement, ExcalidrawFile } from "./types";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export function parseExcalidrawFile(content: string): ExcalidrawFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ParseError("Invalid JSON: the file is not valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ParseError("Invalid format: expected a JSON object.");
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.type !== "excalidraw") {
    throw new ParseError(
      'Invalid Excalidraw file: missing or incorrect "type" field. Expected "excalidraw".',
    );
  }

  if (!Array.isArray(obj.elements)) {
    throw new ParseError('Invalid Excalidraw file: missing "elements" array.');
  }

  // Filter out deleted elements
  const elements = (obj.elements as AnyExcalidrawElement[]).filter((el) => !el.isDeleted);

  return {
    type: "excalidraw",
    version: typeof obj.version === "number" ? obj.version : 2,
    source: typeof obj.source === "string" ? obj.source : "",
    elements,
    appState:
      typeof obj.appState === "object" ? (obj.appState as Record<string, unknown>) : undefined,
  };
}
