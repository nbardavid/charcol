import { ARROW_HEAD, BOX, LINE_CHAR, PLACEHOLDER, ROUNDED, SMALL } from "./characters";
import {
  computeBoundingBox,
  computeScale,
  createGrid,
  gridToString,
  pixelToChar,
  type ScaleInfo,
  setChar,
} from "./grid";
import type {
  AnyExcalidrawElement,
  Binding,
  ConversionResult,
  ExcalidrawArrow,
  ExcalidrawDiamond,
  ExcalidrawEllipse,
  ExcalidrawLine,
  ExcalidrawRectangle,
  ExcalidrawText,
  Warning,
} from "./types";

export function convert(elements: AnyExcalidrawElement[], targetWidth: number): ConversionResult {
  const warnings: Warning[] = [];

  if (elements.length === 0) {
    return { ascii: "", warnings: [], width: 0, height: 0 };
  }

  const bbox = computeBoundingBox(elements);
  const scaleInfo = computeScale(bbox, targetWidth);
  const grid = createGrid(scaleInfo.gridWidth, scaleInfo.gridHeight);

  // Separate elements by type for ordered rendering
  const shapes: AnyExcalidrawElement[] = [];
  const texts: ExcalidrawText[] = [];

  for (const el of elements) {
    if (el.angle && el.angle !== 0) {
      warnings.push({
        type: "rotation",
        elementId: el.id,
        elementType: el.type,
        message: `Rotation ignored on ${el.type} element`,
      });
    }

    if (el.type === "text") {
      texts.push(el as ExcalidrawText);
    } else {
      shapes.push(el);
    }
  }

  // Render shapes in z-order (array order = z-order in Excalidraw)
  for (const el of shapes) {
    switch (el.type) {
      case "rectangle":
        renderRectangle(grid, el as ExcalidrawRectangle, scaleInfo, warnings);
        break;
      case "ellipse":
        renderEllipse(grid, el as ExcalidrawEllipse, scaleInfo, warnings);
        break;
      case "diamond":
        renderDiamond(grid, el as ExcalidrawDiamond, scaleInfo, warnings);
        break;
      case "arrow":
        renderArrow(grid, el as ExcalidrawArrow, scaleInfo, warnings, elements);
        break;
      case "line":
        renderLine(grid, el as ExcalidrawLine, scaleInfo, warnings);
        break;
      case "freedraw":
        renderFreedraw(grid, el, scaleInfo, warnings);
        break;
      case "image":
        renderImage(grid, el, scaleInfo, warnings);
        break;
      default:
        warnings.push({
          type: "unsupported",
          elementId: el.id,
          elementType: el.type,
          message: `Unsupported element type: ${el.type}`,
        });
    }
  }

  // Render text last (on top)
  for (const text of texts) {
    renderText(grid, text, scaleInfo, elements);
  }

  const ascii = gridToString(grid);
  return {
    ascii,
    warnings,
    width: scaleInfo.gridWidth,
    height: scaleInfo.gridHeight,
  };
}

function renderRectangle(
  grid: string[][],
  el: ExcalidrawRectangle,
  scale: ScaleInfo,
  warnings: Warning[],
): void {
  const topLeft = pixelToChar(el.x, el.y, scale);
  const bottomRight = pixelToChar(el.x + el.width, el.y + el.height, scale);
  const w = bottomRight.cx - topLeft.cx;
  const h = bottomRight.cy - topLeft.cy;

  if (w < 3 || h < 3) {
    // Too small: render a single character
    setChar(grid, topLeft.cx, topLeft.cy, SMALL.rectangle);
    if (w >= 3 || h >= 3) {
      // Not a warning if it's just barely below threshold
    } else {
      warnings.push({
        type: "too_small",
        elementId: el.id,
        elementType: "rectangle",
        message: "Rectangle too small, rendered as □",
      });
    }
    return;
  }

  // Top edge
  setChar(grid, topLeft.cx, topLeft.cy, BOX.topLeft);
  for (let x = topLeft.cx + 1; x < bottomRight.cx; x++) {
    setChar(grid, x, topLeft.cy, BOX.horizontal);
  }
  setChar(grid, bottomRight.cx, topLeft.cy, BOX.topRight);

  // Side edges
  for (let y = topLeft.cy + 1; y < bottomRight.cy; y++) {
    setChar(grid, topLeft.cx, y, BOX.vertical);
    setChar(grid, bottomRight.cx, y, BOX.vertical);
  }

  // Bottom edge
  setChar(grid, topLeft.cx, bottomRight.cy, BOX.bottomLeft);
  for (let x = topLeft.cx + 1; x < bottomRight.cx; x++) {
    setChar(grid, x, bottomRight.cy, BOX.horizontal);
  }
  setChar(grid, bottomRight.cx, bottomRight.cy, BOX.bottomRight);
}

function renderEllipse(
  grid: string[][],
  el: ExcalidrawEllipse,
  scale: ScaleInfo,
  warnings: Warning[],
): void {
  const topLeft = pixelToChar(el.x, el.y, scale);
  const bottomRight = pixelToChar(el.x + el.width, el.y + el.height, scale);
  const w = bottomRight.cx - topLeft.cx;
  const h = bottomRight.cy - topLeft.cy;

  if (w < 3 || h < 3) {
    setChar(grid, topLeft.cx, topLeft.cy, SMALL.ellipse);
    warnings.push({
      type: "too_small",
      elementId: el.id,
      elementType: "ellipse",
      message: "Ellipse too small, rendered as ○",
    });
    return;
  }

  // Render as rounded rectangle (simplified ellipse)
  setChar(grid, topLeft.cx, topLeft.cy, ROUNDED.topLeft);
  for (let x = topLeft.cx + 1; x < bottomRight.cx; x++) {
    setChar(grid, x, topLeft.cy, ROUNDED.horizontal);
  }
  setChar(grid, bottomRight.cx, topLeft.cy, ROUNDED.topRight);

  for (let y = topLeft.cy + 1; y < bottomRight.cy; y++) {
    setChar(grid, topLeft.cx, y, ROUNDED.vertical);
    setChar(grid, bottomRight.cx, y, ROUNDED.vertical);
  }

  setChar(grid, topLeft.cx, bottomRight.cy, ROUNDED.bottomLeft);
  for (let x = topLeft.cx + 1; x < bottomRight.cx; x++) {
    setChar(grid, x, bottomRight.cy, ROUNDED.horizontal);
  }
  setChar(grid, bottomRight.cx, bottomRight.cy, ROUNDED.bottomRight);
}

function renderDiamond(
  grid: string[][],
  el: ExcalidrawDiamond,
  scale: ScaleInfo,
  warnings: Warning[],
): void {
  const topLeft = pixelToChar(el.x, el.y, scale);
  const bottomRight = pixelToChar(el.x + el.width, el.y + el.height, scale);
  const w = bottomRight.cx - topLeft.cx;
  const h = bottomRight.cy - topLeft.cy;

  if (w < 3 || h < 3) {
    setChar(grid, topLeft.cx, topLeft.cy, SMALL.diamond);
    warnings.push({
      type: "too_small",
      elementId: el.id,
      elementType: "diamond",
      message: "Diamond too small, rendered as ◊",
    });
    return;
  }

  const midX = Math.round((topLeft.cx + bottomRight.cx) / 2);
  const midY = Math.round((topLeft.cy + bottomRight.cy) / 2);

  // Top half: / going up-right, \ going up-left from middle
  for (let y = midY; y >= topLeft.cy; y--) {
    const progress = midY === topLeft.cy ? 0 : (midY - y) / (midY - topLeft.cy);
    const halfWidth = Math.round(progress * (midX - topLeft.cx));
    if (halfWidth === 0) {
      setChar(grid, midX, y, ".");
    } else {
      setChar(grid, midX - halfWidth, y, "/");
      setChar(grid, midX + halfWidth, y, "\\");
    }
  }

  // Bottom half
  for (let y = midY + 1; y <= bottomRight.cy; y++) {
    const progress = bottomRight.cy === midY ? 0 : (y - midY) / (bottomRight.cy - midY);
    const halfWidth = Math.round((1 - progress) * (midX - topLeft.cx));
    if (halfWidth === 0) {
      setChar(grid, midX, y, "'");
    } else {
      setChar(grid, midX - halfWidth, y, "\\");
      setChar(grid, midX + halfWidth, y, "/");
    }
  }
}

interface ClipRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function getClipRect(
  binding: Binding | null,
  allElements: AnyExcalidrawElement[],
  scale: ScaleInfo,
): ClipRect | null {
  if (!binding) return null;
  const shape = allElements.find((e) => e.id === binding.elementId);
  if (!shape) return null;
  const tl = pixelToChar(shape.x, shape.y, scale);
  const br = pixelToChar(shape.x + shape.width, shape.y + shape.height, scale);
  return { left: tl.cx, top: tl.cy, right: br.cx, bottom: br.cy };
}

function isInsideClip(x: number, y: number, clip: ClipRect): boolean {
  return x >= clip.left && x <= clip.right && y >= clip.top && y <= clip.bottom;
}

/** Walk Bresenham from (fromX,fromY) toward (toX,toY) and return the last
 *  point that is NOT inside the clip rect — i.e. the edge point just outside
 *  the bound shape, where the arrowhead should go. */
function findEdgePoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  clip: ClipRect,
): { x: number; y: number } | null {
  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);
  const sx = fromX < toX ? 1 : -1;
  const sy = fromY < toY ? 1 : -1;
  let err = dx - dy;
  let x = fromX;
  let y = fromY;
  let lastOutside: { x: number; y: number } | null = null;

  while (true) {
    if (!isInsideClip(x, y, clip)) {
      lastOutside = { x, y };
    } else if (lastOutside) {
      // We just entered the clip — the previous point was the edge
      return lastOutside;
    }
    if (x === toX && y === toY) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return lastOutside;
}

function renderArrow(
  grid: string[][],
  el: ExcalidrawArrow,
  scale: ScaleInfo,
  _warnings: Warning[],
  allElements: AnyExcalidrawElement[],
): void {
  if (!el.points || el.points.length < 2) return;

  const startClip = getClipRect(el.startBinding, allElements, scale);
  const endClip = getClipRect(el.endBinding, allElements, scale);
  const clips = [startClip, endClip].filter((c): c is ClipRect => c !== null);

  // Convert relative points to absolute coordinates
  const absPoints = el.points.map((pt) => ({
    px: el.x + pt[0],
    py: el.y + pt[1],
  }));

  // Draw line segments between consecutive points, clipping inside bound shapes
  for (let i = 0; i < absPoints.length - 1; i++) {
    const from = pixelToChar(absPoints[i].px, absPoints[i].py, scale);
    const to = pixelToChar(absPoints[i + 1].px, absPoints[i + 1].py, scale);
    bresenhamLine(grid, from.cx, from.cy, to.cx, to.cy, clips);
  }

  // Arrow head at the end
  if (el.endArrowhead !== null && el.endArrowhead !== "none") {
    const lastIdx = absPoints.length - 1;
    const last = pixelToChar(absPoints[lastIdx].px, absPoints[lastIdx].py, scale);
    const prev = pixelToChar(absPoints[lastIdx - 1].px, absPoints[lastIdx - 1].py, scale);

    // If bound, place arrowhead at the edge of the shape instead of inside it
    let headPos = last;
    if (endClip && isInsideClip(last.cx, last.cy, endClip)) {
      const edge = findEdgePoint(prev.cx, prev.cy, last.cx, last.cy, endClip);
      if (edge) headPos = { cx: edge.x, cy: edge.y };
    }

    const dx = headPos.cx - prev.cx;
    const dy = headPos.cy - prev.cy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      setChar(grid, headPos.cx, headPos.cy, dx >= 0 ? ARROW_HEAD.right : ARROW_HEAD.left);
    } else {
      setChar(grid, headPos.cx, headPos.cy, dy >= 0 ? ARROW_HEAD.down : ARROW_HEAD.up);
    }
  }

  // Arrow head at the start (if startArrowhead is set)
  if (el.startArrowhead && el.startArrowhead !== "none") {
    const first = pixelToChar(absPoints[0].px, absPoints[0].py, scale);
    const next = pixelToChar(absPoints[1].px, absPoints[1].py, scale);

    let headPos = first;
    if (startClip && isInsideClip(first.cx, first.cy, startClip)) {
      const edge = findEdgePoint(next.cx, next.cy, first.cx, first.cy, startClip);
      if (edge) headPos = { cx: edge.x, cy: edge.y };
    }

    const dx = headPos.cx - next.cx;
    const dy = headPos.cy - next.cy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      setChar(grid, headPos.cx, headPos.cy, dx >= 0 ? ARROW_HEAD.right : ARROW_HEAD.left);
    } else {
      setChar(grid, headPos.cx, headPos.cy, dy >= 0 ? ARROW_HEAD.down : ARROW_HEAD.up);
    }
  }
}

function renderLine(
  grid: string[][],
  el: ExcalidrawLine,
  scale: ScaleInfo,
  _warnings: Warning[],
): void {
  if (!el.points || el.points.length < 2) return;

  const absPoints = el.points.map((pt) => ({
    px: el.x + pt[0],
    py: el.y + pt[1],
  }));

  for (let i = 0; i < absPoints.length - 1; i++) {
    const from = pixelToChar(absPoints[i].px, absPoints[i].py, scale);
    const to = pixelToChar(absPoints[i + 1].px, absPoints[i + 1].py, scale);
    bresenhamLine(grid, from.cx, from.cy, to.cx, to.cy);
  }
}

function renderText(
  grid: string[][],
  el: ExcalidrawText,
  scale: ScaleInfo,
  allElements: AnyExcalidrawElement[],
): void {
  const lines = (el.originalText || el.text || "").split("\n");

  if (el.containerId) {
    // Text is bound to a container shape — center it inside
    const container = allElements.find((e) => e.id === el.containerId);
    if (container) {
      const topLeft = pixelToChar(container.x, container.y, scale);
      const bottomRight = pixelToChar(
        container.x + container.width,
        container.y + container.height,
        scale,
      );
      const containerW = bottomRight.cx - topLeft.cx;
      const containerH = bottomRight.cy - topLeft.cy;
      const startY = topLeft.cy + Math.max(0, Math.floor((containerH - lines.length) / 2));

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const startX = topLeft.cx + Math.max(0, Math.floor((containerW - line.length) / 2));
        for (let j = 0; j < line.length; j++) {
          setChar(grid, startX + j, startY + i, line[j]);
        }
      }
      return;
    }
  }

  // Absolute positioning
  const pos = pixelToChar(el.x, el.y, scale);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      setChar(grid, pos.cx + j, pos.cy + i, line[j]);
    }
  }
}

function renderFreedraw(
  grid: string[][],
  el: AnyExcalidrawElement,
  scale: ScaleInfo,
  warnings: Warning[],
): void {
  warnings.push({
    type: "unsupported",
    elementId: el.id,
    elementType: "freedraw",
    message: "Freedraw elements are shown as ~ placeholder",
  });

  const topLeft = pixelToChar(el.x, el.y, scale);
  const bottomRight = pixelToChar(el.x + el.width, el.y + el.height, scale);

  for (let x = topLeft.cx; x <= Math.min(bottomRight.cx, topLeft.cx + 10); x++) {
    setChar(grid, x, topLeft.cy, PLACEHOLDER.freedraw);
  }
}

function renderImage(
  grid: string[][],
  el: AnyExcalidrawElement,
  scale: ScaleInfo,
  warnings: Warning[],
): void {
  warnings.push({
    type: "unsupported",
    elementId: el.id,
    elementType: "image",
    message: "Images are shown as [IMG] placeholder",
  });

  const pos = pixelToChar(el.x, el.y, scale);
  const tag = PLACEHOLDER.image;
  for (let i = 0; i < tag.length; i++) {
    setChar(grid, pos.cx + i, pos.cy, tag[i]);
  }
}

// Bresenham's line algorithm with direction-aware character selection
function bresenhamLine(
  grid: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  clips?: ClipRect[],
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  // Choose character based on overall direction
  const isHorizontal = dx >= dy;
  const isDiagonal = dx > 0 && dy > 0 && Math.abs(dx - dy) < Math.max(dx, dy) * 0.5;

  let x = x0;
  let y = y0;

  while (true) {
    let char: string;
    if (isDiagonal) {
      // Determine diagonal direction
      const goingDown = sy > 0;
      const goingRight = sx > 0;
      char =
        (goingDown && goingRight) || (!goingDown && !goingRight)
          ? LINE_CHAR.diagonal_down
          : LINE_CHAR.diagonal_up;
    } else {
      char = isHorizontal ? LINE_CHAR.horizontal : LINE_CHAR.vertical;
    }

    const clipped = clips?.some((c) => isInsideClip(x, y, c));
    if (!clipped) {
      setChar(grid, x, y, char);
    }

    if (x === x1 && y === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}
