# Difficulty Levels — Design

**Date:** 2026-07-08
**Status:** Approved

## Goal

Players have different levels of Pokémon knowledge. Add a difficulty selection step
before a session starts, so the silhouette pool is drawn from a generation range that
matches the player's familiarity:

- **Beginner Trainer** — Gen 1 only (National Dex 1–151), the most widely-known mons.
- **Advanced Trainer** — Gen 1–3 (1–386), adds Johto and Hoenn.
- **Master Trainer** — Gen 4–9 (387–1025), Sinnoh through Paldea — the least familiar,
  newest mons, no Gen 1–3 overlap.

## Behavior

- **New first screen:** `DifficultyScreen` shows three cards — Beginner Trainer,
  Advanced Trainer, Master Trainer — each with a one-line subtitle naming its
  generation range (e.g. "Gen 1–3 · Kanto to Hoenn"). Tapping a card:
  1. Stores the chosen difficulty key in `App` state.
  2. Kicks off the pool fetch for that difficulty in the background.
  3. Advances the phase to the existing round-count screen.
- **Round-count screen** (current `StartScreen`): unchanged round-count picker (5/10/15/20),
  plus a small subtitle showing the chosen difficulty (e.g. "Advanced Trainer · Gen 1–3")
  and a "‹ Change level" link that returns to `DifficultyScreen`.
- **Play:** if the background pool fetch for the selected difficulty has already resolved,
  the first round starts immediately (no visible loading step, same as today's flow once
  a pool exists). If it's still in flight, the existing `loading` phase covers the wait.
- **Fetch failure:** reuses the existing full-screen error/retry UI; retry re-fetches the
  pool for the *currently selected* difficulty.
- **Chinese name subtitles** (`NAMES_ZH`, currently Gen-1-only): left as-is. The existing
  `NAMES_ZH[name] &&` guards in `OptionButtons` and `ReviewModal` already degrade
  gracefully — Pokémon without a translation simply show no Chinese subtitle. Extending
  `NAMES_ZH` to cover Gen 2–9 is a separate, future task.

## Data

New config, colocated with the other Pokémon-list helpers in `src/pokeapi.js`:

```js
export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner Trainer', subtitle: 'Gen 1 · Kanto',            offset: 0,   limit: 151 },
  advanced: { label: 'Advanced Trainer', subtitle: 'Gen 1–3 · Kanto to Hoenn', offset: 0,   limit: 386 },
  master:   { label: 'Master Trainer',   subtitle: 'Gen 4–9 · Sinnoh onward',  offset: 386, limit: 639 },
}
```

`offset`/`limit` map directly onto the PokeAPI `/pokemon?limit=&offset=` pagination used
today by `fetchGen1List`.

## Modules

### 1. `src/pokeapi.js`

- Replace `fetchGen1List()` with a generalized `fetchPokemonRange(offset, limit)` that
  does the same `{id, name}` shaping, parameterized instead of hardcoded to 151/0.
- Add `DIFFICULTY_LEVELS` (above).
- `fetchGen1List` is removed; its one existing test is replaced with a
  `fetchPokemonRange` equivalent (see Testing).

### 2. `src/components/DifficultyScreen.jsx` (new)

- Props: `onSelect(difficultyKey)`.
- Renders `DIFFICULTY_LEVELS` as three cards/buttons (label + subtitle), styled
  consistently with the existing `round-btn` treatment in `StartScreen`.
- Calling `onSelect` is the component's only side effect — it doesn't know about
  fetching; `App` owns that.

### 3. `src/components/StartScreen.jsx`

- New props: `difficulty` (key), `onChangeDifficulty()` (goes back a step).
- Renders the difficulty's `label`/`subtitle` under the existing intro text, and a
  "‹ Change level" button that calls `onChangeDifficulty`.
- Round-count picker and `onStart(rounds)` behavior unchanged.

### 4. `src/App.jsx`

- New state: `difficulty` (defaults to `'beginner'`), `pool` becomes difficulty-scoped
  (still a single `pool` field — re-fetched whenever difficulty changes, no need to cache
  multiple pools since a player picks one difficulty per session).
- Phase order becomes: `difficulty → rounds → loading → playing → revealed → results`.
  Initial phase is `'difficulty'` instead of `'start'`.
- Remove the mount-time `useEffect` that eagerly calls `loadPool()` for Gen 1.
- `selectDifficulty(key)`: sets `difficulty`, calls `loadPool(key)` (fire-and-backgrounded,
  not awaited), sets `phase = 'rounds'`.
- `loadPool(difficultyKey)`: looks up `DIFFICULTY_LEVELS[difficultyKey]`, calls
  `fetchPokemonRange(offset, limit)`, sets `pool` on success or `loadError` on failure.
  Same shape as today's `loadPool`, just parameterized.
- `play(rounds)`: if `pool` is already loaded for the current difficulty, calls
  `startRound()` directly as today. If not yet loaded (fetch still in flight), sets
  `phase = 'loading'` and waits for the in-flight promise before starting the round.
  (Simplest implementation: `loadPool` stores its in-flight promise; `play` awaits it if
  present.)
- Error screen's `Retry` button calls `loadPool(difficulty)` instead of the old
  no-arg `loadPool()`.

## Testing

- `pokeapi.test.js`: replace the `fetchGen1List` test with one for `fetchPokemonRange`
  covering a non-zero offset (e.g. offset=386, confirming `id` starts at 387) in addition
  to the existing offset=0 case.
- New `DifficultyScreen.test.jsx`: renders three cards with the expected labels; clicking
  each calls `onSelect` with the correct key (`beginner`/`advanced`/`master`).
- `StartScreen.jsx` existing behavior (round selection, `onStart`) is unchanged, but add
  a small test/assertion that the difficulty subtitle renders and "Change level" fires
  `onChangeDifficulty`.
- Manual verification in the browser: full flow for each of the three difficulties —
  difficulty screen → rounds screen (shows correct subtitle, back button works) → play →
  confirm silhouettes/answers come from the expected generation range → error/retry path
  (e.g. via offline/devtools network throttling) still works.

## Out of scope

- Extending `NAMES_ZH` Chinese translations beyond Gen 1.
- Per-generation weighting/mixing within a difficulty tier (e.g. favoring earlier gens
  within Advanced) — each tier is a flat uniform pool over its ID range.
- Persisting the player's last-chosen difficulty across sessions.
- Caching/prefetching more than one difficulty's pool at a time.
