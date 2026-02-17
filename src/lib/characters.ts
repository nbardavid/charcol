// Unicode box-drawing characters for rectangle rendering
export const BOX = {
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  horizontal: "─",
  vertical: "│",
} as const;

// Rounded corners for ellipses
export const ROUNDED = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
} as const;

// Arrow heads
export const ARROW_HEAD = {
  right: "→",
  left: "←",
  up: "↑",
  down: "↓",
} as const;

// Line characters based on direction
export const LINE_CHAR = {
  horizontal: "─",
  vertical: "│",
  diagonal_down: "\\",
  diagonal_up: "/",
} as const;

// Placeholder characters for small elements
export const SMALL = {
  rectangle: "□",
  ellipse: "○",
  diamond: "◊",
} as const;

// Placeholder for unsupported elements
export const PLACEHOLDER = {
  freedraw: "~",
  image: "[IMG]",
} as const;
