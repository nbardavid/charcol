# Charcol

**CHAR** + coal — characters that draw, like charcoal sketches.

## What it does

Web tool that converts `.excalidraw` files into Unicode box-drawing ASCII art, ready to copy-paste into Claude or any monospace context.

User drops an `.excalidraw` (or `.json`) file, picks an output width (80/120/160 chars), and gets rendered ASCII they can copy with one click.

## Tech stack

React 19 + Vite 7 + TypeScript + Tailwind CSS v4 + shadcn/ui. 100% frontend — no backend, no API calls.

## Project structure

```
src/
├── App.tsx                    # Root component: file load → convert → display
├── main.tsx                   # Entry point
├── index.css                  # Tailwind imports + theme tokens
├── components/
│   ├── DropZone.tsx           # Drag-and-drop / file picker for .excalidraw files
│   ├── Controls.tsx           # Output width selector (80/120/160)
│   ├── AsciiOutput.tsx        # Rendered ASCII display + copy button + warnings
│   └── ui/                    # shadcn/ui primitives (card, button, select, alert)
└── lib/
    ├── types.ts               # Excalidraw element type definitions + ConversionResult
    ├── parser.ts              # JSON → ExcalidrawFile (validates, filters deleted elements)
    ├── grid.ts                # BBox, scaling, 2D char grid creation, coordinate mapping
    ├── renderer.ts            # Main conversion: iterates elements, draws on grid
    └── characters.ts          # Unicode character sets (BOX, ROUNDED, ARROW_HEAD, etc.)
```

## Conversion pipeline

```
.excalidraw JSON → parseExcalidrawFile() → computeBoundingBox() → computeScale()
  → createGrid(w, h) → render each element onto grid → gridToString() → output
```

Key detail: monospace chars are ~2x taller than wide, so `CHAR_ASPECT_RATIO = 0.5` compresses the Y axis during scaling.

## Supported elements

| Element   | Rendering                                          |
|-----------|----------------------------------------------------|
| Rectangle | `┌─┐ │ └─┘` (BOX drawing chars)                   |
| Ellipse   | `╭─╮ │ ╰─╯` (rounded corners)                     |
| Diamond   | `/\ \/` diagonal lines from center                 |
| Arrow     | Bresenham line + directional head (`→ ← ↑ ↓`)     |
| Line      | Bresenham with direction-aware chars (`─ │ / \`)   |
| Text      | Placed directly; centered inside containers        |
| Freedraw  | `~` placeholder + warning                          |
| Image     | `[IMG]` placeholder + warning                      |

Elements that are too small (< 3 chars wide/tall) collapse to single-char placeholders: `□ ○ ◊`.

## Design System — "Atelier Fusain"

Single fixed theme (no dark mode). Hero + integrated tool layout. Warm cream paper, serif typography, copper accents, ASCII output rendered as charcoal on paper.

### Typography (Google Fonts — loaded in index.html)
| Token | Font | Weight | Usage |
|-------|------|--------|-------|
| `--font-display` | Cormorant Garamond | 300, 400, 600 | Title, headings, labels |
| `--font-body` | Source Serif 4 | 400, 600 | Body text, UI text (base font) |
| `--font-mono` | JetBrains Mono | 400 | ASCII output |

Usage in Tailwind: `font-[family-name:var(--font-display)]`

### Color Palette (all defined as CSS custom properties in `src/index.css`)
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#F5F0E8` | Warm cream page background |
| `--foreground` | `#2A2420` | Primary text (warm charcoal) |
| `--card` | `#FAF6F0` | Elevated surfaces, paper, output bg |
| `--primary` | `#B87333` | Copper accent (CTA, focus rings, active states) |
| `--muted-foreground` | `#6B6360` | Secondary text |
| `--border` | `#D9D0C4` | Warm gray borders |
| `--destructive` | `#A0522D` | Sienna for errors |
| `--copper` | `#B87333` | Accent highlights (alias of primary) |
| `--sepia` | `#8B7355` | Subtle UI elements |

### Layout
- **Hero section**: Full viewport, staggered `animate-fade-in-up` animations, vignette overlay, bouncing scroll indicator
- **Tool section** (`#tool`): Max-w 5xl centered, DropZone → Controls row → Output → Footer

### CSS Utility Classes (defined in `src/index.css`)
| Class | Effect |
|-------|--------|
| `.paper-surface` | Card bg + warm border + shadow + inner highlight |
| `.deckled-edge` | Irregular clip-path polygon (torn paper edges) |
| `.output-frame` | Card bg + double border picture-frame for ASCII |
| `.vignette` | `::after` radial gradient on edges |
| `.animate-fade-in-up` | Slide up + fade in (0.8s) |
| `.animate-fade-in` | Fade in (0.6s) |
| `.animate-gentle-bounce` | Subtle vertical bounce (infinite) |
| `.stagger-1` to `.stagger-4` | Animation delays (0.1s → 0.6s) |

### Design Rules
- No dark mode — single warm theme only
- ASCII output = charcoal on warm paper (foreground text on card background)
- Warnings/notes are not displayed to the user
- DropZone uses paper-surface + deckled-edge, copper highlight on drag
- Select/controls use font-display with copper focus accents
- Paper grain texture at 3% opacity via SVG feTurbulence on `body::before`

## Known issues

- Vertical scaling can be too aggressive — tall diagrams get crushed
- Small elements may collapse to placeholder chars instead of rendering structure
- Rotation is ignored (warning emitted)
- No support for groups or frames

## Commands

```sh
pnpm dev      # Start dev server
pnpm build    # Type-check + production build
pnpm lint     # Biome check (lint + format)
pnpm knip     # Dead code detection
pnpm preview  # Preview production build
```
