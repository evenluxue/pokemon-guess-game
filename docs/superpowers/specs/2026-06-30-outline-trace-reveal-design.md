# Self-Drawing Outline Reveal — Design

**Date:** 2026-06-30
**Status:** Approved

## Goal

Replace the current instant black-silhouette + fade in the "Who's That Pokémon" reveal
with a three-stage animated reveal:

1. **Trace** — the Pokémon's outline draws itself, like a pen tracing the shape.
2. **Silhouette** — the completed outline settles into a solid black silhouette.
3. **Reveal** — on answer, the black silhouette cross-fades to the full-color sprite.

The trace takes **5–10 seconds**, and its speed depends on the Pokémon's shape:
a spiky/complex outline (longer contour) draws more slowly than a round blob.

## Interaction

Options are clickable the entire time. The trace is non-gating: answering early
(before the trace finishes) immediately jumps to the color reveal.

## Approach

Runtime contour tracing of the raster sprite. Sprites are PNG official artwork served
from `raw.githubusercontent.com`, which permits cross-origin pixel reads, so we can read
the alpha channel from a canvas and trace the silhouette outline into an SVG path, then
animate `stroke-dashoffset` so the line draws itself.

## Modules

### 1. `src/outline/contourTrace.js` (pure, unit-tested)

`traceContours(alpha, width, height, threshold) → Array<Array<{x, y}>>`

Moore-neighbor boundary tracing over an alpha grid. Returns ordered, closed contour
loops (one per connected component's outer boundary). An ordered loop is exactly what the
`stroke-dashoffset` animation needs. No DOM dependency — this is the testable core.

### 2. `src/outline/extractOutline.js` (DOM glue, thin)

`extractOutline(img, { maxSize = 160 }) → { d, viewBox, length }`

- Draws the sprite to an offscreen canvas downscaled to ~160px on its longest side
  (keeps the path smooth and the tracing cheap).
- Reads the alpha channel via `getImageData`.
- Calls `traceContours`, keeps the significant loop(s), scales points to a viewBox.
- Builds and returns an SVG path `d` string plus its viewBox.
- **Throws** if the canvas is tainted (CORS failure) or no contour is found. The caller
  treats a throw as "fall back to plain silhouette."

`length` is measured from the mounted path via `path.getTotalLength()` (see component),
not computed here, since it needs the real SVG DOM.

### 3. `src/components/PokemonSilhouette.jsx` (rewritten)

Public props unchanged: `src`, `revealed`, `correct`, `wrong`, `alt`. All new logic is
internal, so `App.jsx` does not change.

Internal state machine: `preparing → tracing → silhouette → revealed`.

Layers, absolutely positioned inside the existing `.silhouette-wrap`:

- Color sprite `<img>` — the real reveal.
- Black silhouette — same sprite with `filter: brightness(0)`.
- An `<svg>` whose `<path>` is the animated trace stroke, layered on top.

Flow:

- On new `src`: load the sprite with `crossOrigin="anonymous"`; on load, call
  `extractOutline`.
- Enter `tracing`: render the path with `stroke-dasharray = length`,
  `stroke-dashoffset = length`, then transition offset to `0` over the computed duration.
- `transitionend` → enter `silhouette` (fade in the black silhouette, retire the line).
- If `revealed` becomes true at any point → jump straight to the color cross-fade
  (`revealed` state), cancelling any in-progress trace.

### Shape-dependent duration

`traceDuration(length) → seconds`, pure helper: `clamp(length / SPEED, 5, 10)`.
`length` is the real contour length from `path.getTotalLength()`. One tunable constant
(`SPEED`, viewBox units per second).

## Error handling & accessibility

- Tainted canvas / no contour / image `onError` → graceful fallback to today's behavior:
  black silhouette shown immediately, plain fade to color on reveal. Nothing breaks.
- `prefers-reduced-motion` → skip the trace entirely; show the black silhouette
  immediately.

## Testing

- Unit-test `traceContours` with synthetic alpha grids: solid square → one closed loop of
  the border pixels, empty grid → no contour, a single stray pixel → filtered out.
- Unit-test `traceDuration(length)` clamp behavior at, below, and above the 5–10s bounds.
- Component: jsdom cannot rasterize images, so canvas pixel reads are unavailable there.
  Test the **fallback branch** — when extraction is unavailable, the component renders the
  black silhouette and reveals the color sprite. The trace animation itself is verified
  manually in the browser.

## Out of scope

- Edge/interior "sketch" detail (Approach B) — outer contour only.
- Changing the guessing/scoring logic, options, hints, or results screens.
- Caching extracted outlines across rounds.
