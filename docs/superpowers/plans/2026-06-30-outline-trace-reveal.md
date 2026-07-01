# Self-Drawing Outline Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the instant black-silhouette reveal with a three-stage animation — an outline that draws itself (5–10s, speed scaled to the Pokémon's shape), settling into a black silhouette, then cross-fading to the color sprite on answer.

**Architecture:** A pure Moore-neighbor contour tracer turns the sprite's alpha channel into ordered outline loops. A thin DOM helper rasterizes the sprite to a downscaled canvas and produces an SVG path. `PokemonSilhouette` runs a `preparing → tracing → silhouette → revealed` state machine, animating the path via `stroke-dashoffset`. The component's public props are unchanged, so `App.jsx` is untouched.

**Tech Stack:** React 19, Vite, Vitest + @testing-library/react, jsdom. SVG stroke-dash animation. Canvas 2D for alpha extraction.

---

## File Structure

- Create: `src/outline/contourTrace.js` — pure Moore-neighbor contour tracer.
- Create: `src/outline/contourTrace.test.js` — unit tests for the tracer.
- Create: `src/outline/traceDuration.js` — pure duration clamp helper.
- Create: `src/outline/traceDuration.test.js` — unit tests for the helper.
- Create: `src/outline/extractOutline.js` — DOM glue: sprite → canvas → alpha → SVG path.
- Modify: `src/components/PokemonSilhouette.jsx` — rewrite as the reveal state machine.
- Create: `src/components/PokemonSilhouette.test.jsx` — render-level tests.
- Modify: `src/App.css` — silhouette layer + trace stroke styles.

`App.jsx` is intentionally not modified — the component contract is preserved.

---

## Task 1: Pure contour tracer

**Files:**
- Create: `src/outline/contourTrace.js`
- Test: `src/outline/contourTrace.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/outline/contourTrace.test.js
import { describe, it, expect } from 'vitest'
import { traceContours } from './contourTrace'

// helper: build an alpha grid from a string map (# = opaque, . = transparent)
function grid(rows) {
  const height = rows.length
  const width = rows[0].length
  const alpha = new Uint8ClampedArray(width * height)
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      alpha[y * width + x] = ch === '#' ? 255 : 0
    })
  })
  return { alpha, width, height }
}

describe('traceContours', () => {
  it('returns no contours for a fully transparent grid', () => {
    const { alpha, width, height } = grid(['...', '...', '...'])
    expect(traceContours(alpha, width, height, 128)).toEqual([])
  })

  it('traces the 8 border pixels of a solid 3x3 block', () => {
    const { alpha, width, height } = grid(['###', '###', '###'])
    const contours = traceContours(alpha, width, height, 128)
    expect(contours).toHaveLength(1)
    // 8 boundary pixels, center (1,1) excluded
    expect(contours[0]).toHaveLength(8)
    const hasCenter = contours[0].some((p) => p.x === 1 && p.y === 1)
    expect(hasCenter).toBe(false)
    // starts at the top-left opaque pixel
    expect(contours[0][0]).toEqual({ x: 0, y: 0 })
  })

  it('traces the perimeter of a solid 4x3 rectangle (10 pixels)', () => {
    const { alpha, width, height } = grid(['####', '####', '####'])
    const contours = traceContours(alpha, width, height, 128)
    expect(contours).toHaveLength(1)
    expect(contours[0]).toHaveLength(10) // 2*4 + 2*3 - 4
  })

  it('filters out a single stray pixel (loop too short)', () => {
    const { alpha, width, height } = grid(['...', '.#.', '...'])
    expect(traceContours(alpha, width, height, 128)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/outline/contourTrace.test.js`
Expected: FAIL — `traceContours` is not exported / file missing.

- [ ] **Step 3: Write minimal implementation**

```js
// src/outline/contourTrace.js

// Moore-neighbor offsets in clockwise order starting from West.
const DIRS = [
  [-1, 0], // 0 W
  [-1, -1], // 1 NW
  [0, -1], // 2 N
  [1, -1], // 3 NE
  [1, 0], // 4 E
  [1, 1], // 5 SE
  [0, 1], // 6 S
  [-1, 1], // 7 SW
]

/**
 * Trace the outer boundary of every connected opaque region using
 * Moore-neighbor tracing. Returns an array of ordered, closed contour loops.
 * Loops shorter than 3 points (stray pixels) are dropped.
 */
export function traceContours(alpha, width, height, threshold = 128) {
  const inside = (x, y) =>
    x >= 0 && y >= 0 && x < width && y < height && alpha[y * width + x] >= threshold
  const key = (x, y) => y * width + x

  const traced = new Set()
  const contours = []
  const maxSteps = width * height * 4

  for (let sy = 0; sy < height; sy++) {
    for (let sx = 0; sx < width; sx++) {
      if (!inside(sx, sy)) continue
      if (inside(sx - 1, sy)) continue // not a left-edge boundary pixel
      if (traced.has(key(sx, sy))) continue

      const contour = []
      let cx = sx
      let cy = sy
      let backtrackDir = 0 // came from the West (outside)
      let steps = 0

      do {
        contour.push({ x: cx, y: cy })
        traced.add(key(cx, cy))

        let found = false
        for (let i = 1; i <= 8; i++) {
          const dir = (backtrackDir + i) % 8
          const nx = cx + DIRS[dir][0]
          const ny = cy + DIRS[dir][1]
          if (inside(nx, ny)) {
            backtrackDir = (dir + 4) % 8 // direction from new pixel back to current
            cx = nx
            cy = ny
            found = true
            break
          }
        }
        if (!found) break // isolated pixel
        steps++
      } while ((cx !== sx || cy !== sy) && steps < maxSteps)

      if (contour.length >= 3) contours.push(contour)
    }
  }

  return contours
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/outline/contourTrace.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/outline/contourTrace.js src/outline/contourTrace.test.js
git commit -m "feat: add Moore-neighbor contour tracer"
```

---

## Task 2: Duration helper

**Files:**
- Create: `src/outline/traceDuration.js`
- Test: `src/outline/traceDuration.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/outline/traceDuration.test.js
import { describe, it, expect } from 'vitest'
import { traceDuration } from './traceDuration'

describe('traceDuration', () => {
  it('clamps very short outlines up to the 5s minimum', () => {
    expect(traceDuration(0)).toBe(5)
    expect(traceDuration(10)).toBe(5)
  })

  it('clamps very long outlines down to the 10s maximum', () => {
    expect(traceDuration(100000)).toBe(10)
  })

  it('scales linearly between the bounds', () => {
    // default speed 350 units/s -> length 2450 => 7s
    expect(traceDuration(2450)).toBeCloseTo(7, 5)
  })

  it('honors an overridden speed', () => {
    expect(traceDuration(700, { speed: 100 })).toBe(7)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/outline/traceDuration.test.js`
Expected: FAIL — `traceDuration` not defined.

- [ ] **Step 3: Write minimal implementation**

```js
// src/outline/traceDuration.js

/**
 * Map an outline's total length (in viewBox units) to a draw duration in
 * seconds, so complex shapes draw slower than simple ones, clamped to [min, max].
 */
export function traceDuration(length, { speed = 350, min = 5, max = 10 } = {}) {
  const raw = length / speed
  return Math.min(max, Math.max(min, raw))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/outline/traceDuration.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/outline/traceDuration.js src/outline/traceDuration.test.js
git commit -m "feat: add shape-dependent trace duration helper"
```

---

## Task 3: Outline extraction (DOM glue)

**Files:**
- Create: `src/outline/extractOutline.js`

No unit test: this is thin DOM/canvas glue that jsdom cannot rasterize (image pixels
never populate). Its pure dependency (`traceContours`) is already covered in Task 1, and
its behavior is verified end-to-end via manual browser check in Task 6. The path-string
builder is kept trivial so there is nothing to test in isolation.

- [ ] **Step 1: Write the implementation**

```js
// src/outline/extractOutline.js
import { traceContours } from './contourTrace'

function contourToPath(points) {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  const move = `M ${first.x} ${first.y}`
  const lines = rest.map((p) => `L ${p.x} ${p.y}`).join(' ')
  return `${move} ${lines} Z`
}

/**
 * Rasterize a loaded sprite to a downscaled canvas, read its alpha channel, and
 * build an SVG path string for the silhouette outline.
 *
 * @param {HTMLImageElement} img  a fully loaded, CORS-clean image
 * @returns {{ d: string, viewBox: string, width: number, height: number }}
 * @throws if the image is not loaded, the canvas is tainted, or no contour is found
 */
export function extractOutline(img, { maxSize = 160, threshold = 128 } = {}) {
  const natW = img.naturalWidth || img.width
  const natH = img.naturalHeight || img.height
  if (!natW || !natH) throw new Error('image not loaded')

  const scale = Math.min(1, maxSize / Math.max(natW, natH))
  const w = Math.max(1, Math.round(natW * scale))
  const h = Math.max(1, Math.round(natH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  let data
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    throw new Error('canvas tainted (CORS)')
  }

  const alpha = new Uint8ClampedArray(w * h)
  for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3]

  const contours = traceContours(alpha, w, h, threshold)
  const significant = contours
    .filter((c) => c.length >= 8)
    .sort((a, b) => b.length - a.length)
  const chosen = significant.length ? significant : contours
  if (chosen.length === 0) throw new Error('no contour found')

  const d = chosen.map(contourToPath).join(' ')
  return { d, viewBox: `0 0 ${w} ${h}`, width: w, height: h }
}
```

- [ ] **Step 2: Verify it imports and lints**

Run: `npx eslint src/outline/extractOutline.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/outline/extractOutline.js
git commit -m "feat: add sprite-to-SVG outline extraction"
```

---

## Task 4: Rewrite PokemonSilhouette as the reveal state machine

**Files:**
- Modify (full rewrite): `src/components/PokemonSilhouette.jsx`
- Test: `src/components/PokemonSilhouette.test.jsx`

- [ ] **Step 1: Write the failing render tests**

These tests exercise the render logic that does not depend on real image
rasterization (unavailable in jsdom): the default mystery state, the revealed
state, and the result stamps.

```jsx
// src/components/PokemonSilhouette.test.jsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import PokemonSilhouette from './PokemonSilhouette'

afterEach(cleanup)

describe('PokemonSilhouette', () => {
  it('shows a mystery black silhouette before the answer', () => {
    render(<PokemonSilhouette src="/x.png" revealed={false} alt="Pikachu" />)
    const img = screen.getByAltText('Mystery Pokémon')
    expect(img).toBeTruthy()
    expect(img.className).toContain('silhouette')
    expect(img.className).not.toContain('revealed')
  })

  it('reveals the named color sprite once answered', async () => {
    render(<PokemonSilhouette src="/x.png" revealed alt="Pikachu" />)
    const img = await screen.findByAltText('Pikachu')
    expect(img.className).toContain('revealed')
  })

  it('renders the correct stamp when correct', () => {
    render(<PokemonSilhouette src="/x.png" revealed correct alt="Pikachu" />)
    expect(screen.getByText('Correct!')).toBeTruthy()
  })

  it('renders the oops stamp when wrong', () => {
    render(<PokemonSilhouette src="/x.png" revealed wrong alt="Pikachu" />)
    expect(screen.getByText('Oops!')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/PokemonSilhouette.test.jsx`
Expected: FAIL — the current component renders but the `revealed`-class assertion
and state transitions differ; confirm red before rewriting.

- [ ] **Step 3: Rewrite the component**

```jsx
// src/components/PokemonSilhouette.jsx
import { useEffect, useRef, useState } from 'react'
import { extractOutline } from '../outline/extractOutline'
import { traceDuration } from '../outline/traceDuration'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// mode: preparing | tracing | silhouette | revealed | fallback
export default function PokemonSilhouette({ src, revealed, correct, wrong, alt }) {
  const [mode, setMode] = useState('preparing')
  const [outline, setOutline] = useState(null) // { d, viewBox }
  const pathRef = useRef(null)

  // Load the sprite CORS-clean and extract its outline whenever src changes.
  useEffect(() => {
    let cancelled = false
    setMode('preparing')
    setOutline(null)

    if (prefersReducedMotion()) {
      setMode('fallback')
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const result = extractOutline(img)
        if (cancelled) return
        setOutline(result)
        setMode('tracing')
      } catch {
        if (!cancelled) setMode('fallback')
      }
    }
    img.onerror = () => {
      if (!cancelled) setMode('fallback')
    }
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  // Answering always wins — jump straight to the color reveal.
  useEffect(() => {
    if (revealed) setMode('revealed')
  }, [revealed])

  // Kick off the self-drawing animation once the path is mounted.
  useEffect(() => {
    if (mode !== 'tracing' || !pathRef.current) return
    const path = pathRef.current
    const length = path.getTotalLength()
    const duration = traceDuration(length)

    path.style.transition = 'none'
    path.style.strokeDasharray = String(length)
    path.style.strokeDashoffset = String(length)
    void path.getBoundingClientRect() // force reflow so the start offset registers

    const raf = requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${duration}s linear`
      path.style.strokeDashoffset = '0'
    })
    return () => cancelAnimationFrame(raf)
  }, [mode, outline])

  function handleTraceEnd() {
    setMode((m) => (m === 'tracing' ? 'silhouette' : m))
  }

  const imgClass =
    mode === 'revealed'
      ? 'silhouette revealed'
      : mode === 'tracing'
        ? 'silhouette tracing'
        : 'silhouette'

  return (
    <div className="silhouette-wrap">
      <img
        className={imgClass}
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon'}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
      />
      {mode === 'tracing' && outline && (
        <svg
          className="trace-svg"
          viewBox={outline.viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}
            className="trace-path"
            d={outline.d}
            onTransitionEnd={handleTraceEnd}
          />
        </svg>
      )}
      {correct && <div className="stamp correct-stamp">Correct!</div>}
      {wrong && <div className="stamp wrong-stamp">Oops!</div>}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/PokemonSilhouette.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/PokemonSilhouette.jsx src/components/PokemonSilhouette.test.jsx
git commit -m "feat: rewrite silhouette as self-drawing outline reveal"
```

---

## Task 5: Styles for the trace and silhouette layers

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Update the `.silhouette` rule and add trace styles**

Replace the existing block (currently around lines 207–215):

```css
.silhouette {
  width: 400px;
  height: 400px;
  object-fit: contain;
  filter: brightness(0);
  transition: filter 0.5s ease;
}

.silhouette.revealed { filter: none; }
```

with:

```css
.silhouette {
  width: 400px;
  height: 400px;
  object-fit: contain;
  filter: brightness(0);
  transition: filter 0.5s ease, opacity 0.4s ease;
}

.silhouette.revealed { filter: none; }

/* While the outline is drawing, the silhouette is hidden and only the line shows. */
.silhouette.tracing { opacity: 0; }

.trace-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  overflow: visible;
  pointer-events: none;
}

.trace-path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px rgba(255, 203, 5, 0.6));
}
```

- [ ] **Step 2: Verify styles load and existing tests still pass**

Run: `npx vitest run`
Expected: PASS — all suites green (CSS import does not break tests).

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "style: add self-drawing outline trace styles"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `npx vitest run`
Expected: PASS — all suites (gameLogic, pokeapi, contourTrace, traceDuration,
PokemonSilhouette).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual browser check**

Run: `npm run dev`, open the app, start a game. Confirm:
- The outline draws itself over ~5–10s (a spiky Pokémon visibly slower than a round one).
- When the line finishes, it settles into the solid black silhouette.
- Answering mid-trace jumps straight to the color sprite.
- The Correct!/Oops! stamp still animates over the revealed sprite.
- Reloading with DevTools "Emulate prefers-reduced-motion: reduce" skips the trace and
  shows the black silhouette immediately.

- [ ] **Step 4: Final commit (if any manual tweaks were needed)**

```bash
git add -A
git commit -m "chore: outline trace reveal verification tweaks"
```

---

## Self-Review Notes

- **Spec coverage:** three-stage reveal (Tasks 4–5), shape-dependent duration (Task 2 +
  Task 4 animation effect), contour trace core (Task 1), DOM extraction with CORS/no-contour
  throws (Task 3), fallback + reduced-motion (Task 4), tests (Tasks 1, 2, 4). App.jsx
  unchanged, as specified.
- **Type consistency:** `traceContours(alpha, width, height, threshold)` and
  `{ d, viewBox, width, height }` from `extractOutline` are used identically across tasks;
  `traceDuration(length, opts)` signature matches its test and its caller.
- **Fallback path** covers tainted canvas, no contour, image error, and reduced motion —
  all resolve to `mode: 'fallback'`, which renders today's black-silhouette behavior.
