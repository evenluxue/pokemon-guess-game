# Skip Button — Design

**Date:** 2026-07-08
**Status:** Approved

## Goal

Sometimes a Pokémon's sprite doesn't show (broken/failed image load, or now the
"Image unavailable" placeholder from the retry fix). Give the player a way to bail out
of the current round without penalty and immediately try a different Pokémon.

## Behavior

- A **"⏭ Skip this one"** button is shown only during the `playing` phase (before the
  player answers). It's hidden once `revealed`, since "Next" already covers moving on
  from an answered round.
- Skipping does **not** count as an attempt: `round`, `score`, and `history` are all
  left untouched — as if the round never happened.
- The session clock keeps running (it's a whole-session stopwatch, not per-round), so
  skipping flushes the elapsed time since the round started into the accumulated total,
  the same bookkeeping `answer()` already does.
- A new random Pokémon is immediately loaded into the *same* round slot — the round
  number doesn't advance and the session's total round count is unchanged. The just-
  skipped Pokémon is excluded from that reroll so it can't immediately reappear.

## Modules

### 1. `src/gameLogic.js`

Add a pure, testable helper — extracted from logic currently inlined in `App.jsx`'s
`startRound`:

```js
export function pickAnswerEntry(pool, excludeName) {
  const candidates = excludeName ? pool.filter((p) => p.name !== excludeName) : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}
```

### 2. `src/App.jsx`

- `startRound(activePool, excludeName)` gains an optional second parameter, passed
  through to `pickAnswerEntry` instead of picking directly from `activePool`.
- New `skip()`:
  1. Flushes the current active timer segment into `accumulatedMs`/`elapsedMs` (same
     three lines `answer()` uses for this).
  2. Calls `startRound(pool, current.details.name)`.
- New inline button (same convention as the existing inlined "Next" button — not a
  separate component), rendered only when `!answered`, placed directly under
  `HintPanel` and above `OptionButtons`.

## Testing

- `gameLogic.test.js`: unit tests for `pickAnswerEntry` — returns a pool member, and
  never returns the excluded entry (test with a 2-entry pool and confirm it always
  returns the other one across repeated calls).
- `App.jsx` wiring has no dedicated test file today, consistent with the rest of the
  codebase (verified by hand, same as other `App.jsx` changes).

## Out of scope

- Any limit on how many times a player can skip in a session.
- Auto-skip when an image fails to load (this is a manual, player-initiated escape
  hatch, not automatic).
