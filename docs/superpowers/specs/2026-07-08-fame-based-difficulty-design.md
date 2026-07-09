# Fame-Based Difficulty — Design

**Date:** 2026-07-08
**Status:** Approved

## Goal

Replace the generation-based difficulty tiers (Beginner Trainer = Gen 1, Advanced =
Gen 1–3, Master = Gen 4–9) with tiers based on how well-known a Pokémon actually is.
Generation number is a poor proxy for "will a kid recognize this" — plenty of Gen 1
Pokémon are obscure (Tangela, Farfetch'd) while plenty of newer Pokémon are extremely
famous (Greninja, Sylveon, Mimikyu).

## Data source

PokeAPI has no popularity/fame field. There is no way to derive this algorithmically,
so the tiers are built from two hand-curated lists of National Dex IDs:

- `BEGINNER_IDS` (~47) — unmistakable household names: full Gen 1 starter lines,
  Pikachu, Eevee + its evolutions, mascot legendaries (Mewtwo, Mew, Lugia, Rayquaza,
  Zacian/Zamazenta, etc.), and a handful of modern icons (Greninja, Sylveon, Mimikyu,
  Lucario).
- `ADVANCED_IDS` (~200) — solidly recognizable but not mascot-level: other starter
  lines, popular non-starter evolutions, notable legendaries, gym-leader signature
  Pokémon, spread across all 9 generations.
- **Master Trainer = everything else** (the long tail not in either list above).

Tiers are disjoint: a Pokémon appears in exactly one tier, so Advanced doesn't just
reshuffle Beginner's icons in with more.

**This is a best-effort human judgment call, not a verified ranking.** The full lists
live in `src/pokemonFame.js` for easy review/editing after this lands.

## Mechanics

- `DIFFICULTY_LEVELS` (`src/pokeapi.js`) simplifies to just `{label, subtitle}` per
  tier — the `offset`/`limit` dex-range fields go away entirely.
- New copy: Beginner "The famous faces", Advanced "Solid fan favorites", Master
  "Deep-cut Pokédex".
- Pool loading changes shape: instead of fetching a contiguous dex slice, it fetches
  the *entire* National Dex once (`fetchPokemonRange(0, TOTAL_POKEMON)`, `TOTAL_POKEMON
  = 1025`), then filters down to the selected tier client-side.
- New pure, fully-parameterized function in `gameLogic.js`:
  ```js
  poolForDifficulty(allPokemon, beginnerIds, advancedIds, difficultyKey)
  ```
  Returns the filtered `{id, name}[]` for `'beginner' | 'advanced' | 'master'`. Taking
  the ID lists as parameters (rather than importing them directly) keeps this testable
  against tiny fake lists, independent of the real curated content.
- `StartScreen`/`DifficultyScreen` need no code changes — they already just render
  `label`/`subtitle` from `DIFFICULTY_LEVELS`.

## Testing

- `gameLogic.test.js`: unit tests for `poolForDifficulty` using small fake pools/ID
  lists — each tier returns the right subset, tiers don't leak into each other.
- `src/pokemonFame.test.js` (new): data-sanity checks on the real curated lists — no
  ID appears in both `BEGINNER_IDS` and `ADVANCED_IDS`, no duplicates within either
  list, all IDs are in `1..TOTAL_POKEMON`. This checks the data is well-formed, not
  *which* Pokémon are "famous" (that's inherently subjective and not something a test
  can verify).
- `pokeapi.test.js`: update the `DIFFICULTY_LEVELS` test for the new `{label,
  subtitle}`-only shape.

## Out of scope

- Any UI for players to see *why* a Pokémon landed in a given tier.
- Making the curated lists configurable/editable in-app — they're a source file, edited
  via a normal code change.
- Re-deriving tiers from any external popularity API (none exists for this purpose).
