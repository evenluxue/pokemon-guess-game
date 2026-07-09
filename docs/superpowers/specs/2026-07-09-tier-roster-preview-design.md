# Tier Roster Preview — Design

**Date:** 2026-07-09
**Status:** Approved

## Goal

Let a player see every Pokémon in a difficulty tier — grouped by type, with sprite and
name — before committing to that level. Reachable from the difficulty-picker screen,
one link per tier card.

## Entry point

Each card on `DifficultyScreen` gets a second, smaller link below the main selection
button: "👀 See all Pokémon in this level". Tapping it opens the roster for that tier
without selecting it as the active difficulty. A "‹ Back" on the roster returns to the
difficulty screen. This requires restructuring each tier's card from a single `<button>`
into a wrapper containing two separate click targets (buttons can't nest).

## Roster contents per tier

- **Beginner:** all 47 `BEGINNER_IDS`.
- **Advanced:** all 201 `ADVANCED_IDS`.
- **Master:** capped at a new curated `MASTER_PREVIEW_IDS` (120 IDs) — the most
  recognizable Pokémon *among* the ~777 not already claimed by Beginner/Advanced. This
  is a **preview-only** cap: actual Master-difficulty gameplay is unchanged and still
  draws from the full remaining pool via the existing `poolForDifficulty` "everything
  else" branch. Uncapped, Master's roster would mean ~777 sprite loads on one page.
  Like the other two lists, this is hand-picked, best-effort curation — not a verified
  ranking.

## Efficient type lookup

Grouping by type needs each roster Pokémon's type(s), which our curated lists don't
carry (they're just IDs) and which `poolForDifficulty` doesn't provide either. Fetching
per-Pokémon details (`fetchPokemonDetails`) for up to 201 entries would mean hundreds of
requests. Instead: PokeAPI exposes `/type/{name}` for each of the 18 real types, each
returning *every* Pokémon of that type in one response. Fetching all 18 once (fixed
cost, independent of roster size) builds a `name → types[]` map; grouping the roster
against that map is then a pure client-side operation.

## Modules

### `src/pokemonFame.js`

Add `MASTER_PREVIEW_IDS` (120 IDs), same style/comments as the existing two lists.

### `src/pokeapi.js`

New `fetchTypeMap()`: fetches the 18 `/type/{name}` endpoints in parallel, returns
`{ [capitalizedPokemonName]: capitalizedTypeName[] }`.

### `src/gameLogic.js`

Two new pure, testable functions:
- `rosterPool(allPokemon, idList)` — filters `allPokemon` down to the given ID list
  (a plain membership filter; unlike `poolForDifficulty`, there's no "everything else"
  branch here, since every roster tier — including the capped Master preview — now has
  an explicit ID list).
- `groupByType(pool, typeMap)` — groups pool entries under each of their type(s)
  (dual-type Pokémon appear in both groups), returns an object keyed by type name,
  sorted alphabetically by type, entries within each type sorted by name.

### `src/components/RosterScreen.jsx` (new)

Props: `difficultyKey`, `onBack`. On mount (and when `difficultyKey` changes), fetches
`fetchPokemonRange(0, TOTAL_POKEMON)` and `fetchTypeMap()` in parallel, picks the right
ID list for the tier (`BEGINNER_IDS` / `ADVANCED_IDS` / `MASTER_PREVIEW_IDS`), and
renders `groupByType(rosterPool(...), typeMap)` as type-headed sections of sprite+name
cards (reusing `spriteUrl()` and `NAMES_ZH`, same as existing option/review cards).
Shows a loading state while fetching, an error state on failure.

### `src/components/DifficultyScreen.jsx`

Card markup changes from a single button per tier to a wrapper `<div>` containing the
existing selection `<button>` plus a new small "👀 See all Pokémon in this level"
`<button>` that calls a new `onPreview(key)` prop.

### `src/App.jsx`

New phase `'roster'` and `rosterDifficulty` state. `DifficultyScreen` gets
`onPreview={(key) => { setRosterDifficulty(key); setPhase('roster') }}`. Phase `'roster'`
renders `<RosterScreen difficultyKey={rosterDifficulty} onBack={() => setPhase('difficulty')} />`.

## Testing

- `gameLogic.test.js`: unit tests for `rosterPool` and `groupByType` with small fake
  pools/type maps.
- `pokemonFame.test.js`: extend the existing sanity checks to also cover
  `MASTER_PREVIEW_IDS` (no duplicates, no overlap with the other two lists, valid ID
  range, roughly-120 size).
- `DifficultyScreen.test.jsx`: extend to confirm the new preview link renders per tier
  and calls `onPreview` with the right key, and that it doesn't also trigger `onSelect`.
- `RosterScreen.jsx` fetches on mount like `PokemonSilhouette`/`App` do — verified by
  hand in the browser, consistent with how those are tested elsewhere in this codebase.

## Out of scope

- Search/filter within the roster page.
- Showing types for Master's *uncapped* remainder (only the 120-cap preview is built).
- Any indication in the roster of whether a Pokémon has appeared in the player's
  session history.
