import type { AnyExcalidrawElement } from "./types";

// Monospace character aspect ratio: chars are ~2x taller than wide
const CHAR_ASPECT_RATIO = 0.5;

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ScaleInfo {
  scale: number;
  offsetX: number;
  offsetY: number;
  gridWidth: number;
  gridHeight: number;
}

export function computeBoundingBox(elements: AnyExcalidrawElement[]): BoundingBox {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    // For arrows/lines, consider all points
    if ((el.type === "arrow" || el.type === "line") && "points" in el && Array.isArray(el.points)) {
      for (const pt of el.points as [number, number][]) {
        const px = el.x + pt[0];
        const py = el.y + pt[1];
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      }
    } else {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function computeScale(bbox: BoundingBox, targetWidth: number): ScaleInfo {
  if (bbox.width === 0 && bbox.height === 0) {
    return { scale: 1, offsetX: 0, offsetY: 0, gridWidth: 1, gridHeight: 1 };
  }

  // Scale so that the pixel width maps to targetWidth chars
  const scaleX = targetWidth / Math.max(bbox.width, 1);
  // Account for character aspect ratio: each char row = 2x pixel height vs width
  const scaleY = scaleX * CHAR_ASPECT_RATIO;

  const scale = scaleX;
  const gridWidth = Math.max(1, Math.ceil(bbox.width * scaleX) + 2); // +2 for padding
  const gridHeight = Math.max(1, Math.ceil(bbox.height * scaleY) + 2);

  return {
    scale,
    offsetX: bbox.minX,
    offsetY: bbox.minY,
    gridWidth,
    gridHeight,
  };
}

export function createGrid(width: number, height: number): string[][] {
  const grid: string[][] = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(" "));
  }
  return grid;
}

export function pixelToChar(
  px: number,
  py: number,
  scaleInfo: ScaleInfo,
): { cx: number; cy: number } {
  const cx = Math.round((px - scaleInfo.offsetX) * scaleInfo.scale) + 1; // +1 for padding
  const cy = Math.round((py - scaleInfo.offsetY) * scaleInfo.scale * CHAR_ASPECT_RATIO) + 1;
  return { cx, cy };
}

export function setChar(grid: string[][], x: number, y: number, char: string): void {
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
    grid[y][x] = char;
  }
}

export function gridToString(grid: string[][]): string {
  return grid.map((row) => row.join("").trimEnd()).join("\n");
}
