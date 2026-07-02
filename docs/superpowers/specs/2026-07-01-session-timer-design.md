# Session Timer — Design

**Date:** 2026-07-01
**Status:** Approved

## Goal

Add a stopwatch to the guess session so teams playing in turn (on the same device) can
compare both score and time. There is no in-app team concept — a team's score and final
time are read off the screen by whoever runs the game.

## Behavior

- **Type:** Stopwatch (counts up), no time limit.
- **Start:** The instant "Play" is clicked (start of `startRound`'s first load).
- **Stop:** The moment the last round is answered and the game transitions to the
  `results` phase. The clock is *not* paused per-round — it runs continuously through
  loading, playing, and reveal/hint screens, since the whole session is what's being
  timed.
- **Live display:** Elapsed time ticks every second in the `ScoreBar`, alongside Round
  and Score, formatted `M:SS`.
- **Final display:** The frozen total time is shown on `ResultsScreen` next to the final
  score, formatted `M:SS`.
- **Reset:** Starting a new session (`play()`) resets the clock to `0:00`.

## Modules

### 1. `src/formatElapsed.js` (pure, unit-tested)

`formatElapsed(ms) → "M:SS"`

Converts milliseconds to a `minutes:seconds` string, seconds zero-padded, minutes not
(e.g. `4:05`, `12:00`). Follows this codebase's existing pattern of small, pure,
independently-tested helper modules (see `src/outline/traceDuration.js`).

### 2. `src/App.jsx` (state + timing)

New state:
- `startedAt` — `number | null`, the `Date.now()` timestamp when the session started.
- `elapsedMs` — `number`, updated once per second while the session is active.

New `useEffect`: while `phase` is anything other than `'start'` or `'results'`, run a
`setInterval` (1000ms) that sets `elapsedMs = Date.now() - startedAt`. Cleared on
unmount/phase change. Once `phase` becomes `'results'`, the interval is cleared and
`elapsedMs` holds the final value.

`play()` sets `startedAt = Date.now()` and `elapsedMs = 0` alongside its existing resets.

`ScoreBar` and `ResultsScreen` receive `elapsed={formatElapsed(elapsedMs)}` as a new prop.

### 3. `src/components/ScoreBar.jsx`

Add an `elapsed` prop, rendered as a third `<span>` alongside Round and Score.

### 4. `src/components/ResultsScreen.jsx`

Add an `elapsed` prop, rendered under the final score (e.g. "Time: 3:42").

## Testing

- Unit-test `formatElapsed`: `0 → "0:00"`, `65000 → "1:05"`, `605000 → "10:05"`.
- Manual verification in the browser: timer starts on Play, ticks live during a session,
  freezes on Results, and resets on Play Again.

## Out of scope

- Any in-app team concept, naming, or persisted leaderboard.
- Countdown/time-limit mode.
- Pausing the clock during hints or the reveal screen.
