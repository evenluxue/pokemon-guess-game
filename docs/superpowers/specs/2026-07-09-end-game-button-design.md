# End Game Button — Design

**Date:** 2026-07-09
**Status:** Approved

## Goal

Let a player quit the current session at any point — mid-round, mid-reveal, or while a
round is still loading — and see how they did on whatever they've played so far.

## Behavior

- A "🏳 End Game" button is visible throughout an active session: on the main game
  screen (playing and revealed phases) and on the loading screen.
- If at least one round has been answered (`history.length > 0`), it flushes the
  session clock (same bookkeeping as `answer()`/`skip()`) and jumps straight to the
  `results` phase, using whatever's in `history` so far — same `ResultsScreen`,
  `GuessHistory`, and `TypeShowcase` as a normal finish.
- If nothing has been answered yet (e.g. quitting during the very first pool/round
  load), there's nothing to show results for, so it returns to the `rounds` screen
  instead.
- No confirmation dialog — matches the one-click immediacy of Skip/Next/Retry
  elsewhere in this app.

## Scoring fairness fix (needed for this to make sense)

`maxScore` is currently always `totalRounds * 10`, computed once per session. Ending
early after, say, 3 of 10 rounds would show "20 / 100" even after a perfect 3-for-3 —
misleadingly bad. Changing `maxScore` to `history.length * 10` (rounds actually
answered) fixes this, and is a no-op for normal completions since `history.length ===
totalRounds` by the time a session finishes normally.

This also fixes a latent bug: `ResultsScreen`'s `message(score)` thresholds (90/60/30)
assume a fixed 100-point max, so they were already wrong for 5/15/20-round sessions
(e.g. a perfect 5-round game scores 50, which reads as "Keep training!" instead of
"Pokémon Master!"). Switching `message` to take a percentage (`score / maxScore`)
instead of an absolute score fixes both the early-end case and this pre-existing bug
in one change.

## Modules

### `src/components/ResultsScreen.jsx`

`message(score, maxScore)` computes `pct = maxScore > 0 ? score / maxScore : 0` and
uses the same 0.9/0.6/0.3 thresholds against `pct` instead of raw `score`.

### `src/App.jsx`

- `maxScore` computed as `history.length * 10` instead of `totalRounds * 10`.
- New `endGame()`:
  - `history.length === 0` → `setPhase('rounds')`.
  - otherwise → flush the timer (same three lines as `answer()`), `setPhase('results')`.
- New inlined button (same convention as the existing Skip button), rendered on the
  game screen and the loading screen.

## Testing

- No new pure-function tests needed for `endGame()` itself (it's simple phase/state
  wiring, consistent with how `skip()`/`answer()` aren't unit-tested either).
- `ResultsScreen.jsx` has no existing test file; the `message()` percentage change is
  small enough to verify by hand alongside the rest of this feature (consistent with
  how this component has been treated so far).

## Out of scope

- A confirmation dialog before ending.
- Any distinct visual treatment for "ended early" vs. "finished normally" results.
