# Who's That Pokémon? — Design

## Summary

A web-based "Who's That Pokémon?" guessing game. Each round shows a darkened
silhouette of a Generation 1 Pokémon and four name choices. The player picks the
correct name. An optional hint system reveals clues one at a time at a point cost.
A session is 10 fixed rounds; the player gets a final score out of 100.

## Stack

- **React + Vite** single-page app.
- **Plain CSS** (no UI framework).
- **PokeAPI** (`pokeapi.co`) for live data; sprites served from the PokeAPI
  GitHub sprite repo via stable URL built from the Pokémon id.
- **Vitest** for unit tests.
- Scope: **Generation 1 only (151 Pokémon)**.

## Game Flow

1. **Start screen** — title, brief instructions, "Play" button.
2. **Round (repeated 10×):**
   - Pick a random Gen-1 Pokémon as the answer plus 3 random distractors.
   - Display the answer's sprite as a black silhouette.
   - Show 4 name buttons (the answer + 3 distractors, shuffled).
   - Show a "Get a hint" button.
3. **Hints** — revealed one at a time, in order, each costing points:
   1. Type(s), e.g. "Fire" or "Water · Flying"
   2. Genus (Pokédex category), e.g. "Seed Pokémon"
   3. First letter, e.g. "Starts with B"
   - The hint button disables after the 3rd hint is shown.
4. **Answer:**
   - Correct → reveal the sprite in full color, show "It's <Name>!", award round points.
   - Wrong → highlight the correct option, award 0 for the round.
   - Then a "Next" button advances to the next round.
5. **Results screen** — total score out of 100, an encouragement message,
   "Play Again" button that resets the session.

## Scoring

- Correct answer: **+10** base.
- Each hint used in the round: **−2** (maximum −6 for all three hints).
- A correct answer never scores below **+1** (floor), even with all hints used.
- Wrong answer: **0** for the round.
- Final score = sum across 10 rounds (max 100).

`scoreRound(correct, hintsUsed)`:
- if `!correct` → `0`
- else → `max(1, 10 - 2 * hintsUsed)`

## Architecture

Small, focused, independently testable units.

### `src/pokeapi.js` — data layer
- `fetchGen1List()` — fetches the list of 151 Gen-1 Pokémon (id + name) once on
  app load. Returns an array of `{ id, name }`.
- `fetchPokemonDetails(id)` — fetches a single Pokémon's details and shapes them
  into `{ id, name, types: string[], genus: string, spriteUrl: string }`.
- `spriteUrl(id)` — builds the stable sprite URL from the id (no API call).
- Data-shaping functions are pure and unit-testable with mocked `fetch`.

### `src/gameLogic.js` — pure game logic (no React)
- `pickRound(pool, answerPokemon)` — given the pool of names and the chosen
  answer, returns `{ answer, options }` where `options` is 4 unique names
  (answer + 3 random distractors), shuffled.
- `scoreRound(correct, hintsUsed)` — scoring math above.
- Session helpers for advancing rounds / resetting.
- Fully unit-testable; no network, no React.

### `src/App.jsx` — session state owner
State:
- `phase`: `start` | `playing` | `revealed` | `results`
- `round`: current round number (1–10)
- `score`: cumulative score
- `hintsUsed`: hints revealed this round (0–3)
- current answer + options + details

### Components
- `StartScreen` — instructions + Play.
- `ScoreBar` — round number and running score.
- `PokemonSilhouette` — renders the sprite; applies CSS `filter: brightness(0)`
  to show a pure black silhouette, transitions the filter off on reveal.
- `HintPanel` — shows revealed hints and the "Get a hint" button (disabled after 3).
- `OptionButtons` — the 4 name buttons; highlights correct/incorrect after answer.
- `ResultsScreen` — final score + Play Again.

## Silhouette Technique

Load the real color sprite and apply CSS `filter: brightness(0)` so it renders as
a solid black shape. On reveal, transition the filter off to fade in the color.
No image preprocessing or canvas work required.

## Error Handling

- Initial Gen-1 list fetch fails → show "Couldn't load Pokémon — Retry" with a
  retry button.
- A sprite image that fails to load → fall back to a placeholder image/box.
- Per-round detail fetch failure → retry the round's fetch (or skip to a new
  random answer).

## Testing (Vitest)

- `gameLogic.js`:
  - `pickRound` always returns exactly 4 unique options including the answer.
  - `scoreRound` covers: correct no hints (+10), correct with hints
    (−2 each), the +1 floor with 3 hints, and wrong (0).
- `pokeapi.js`:
  - `fetchPokemonDetails` shapes a mocked API response into the expected
    `{ id, name, types, genus, spriteUrl }`.
  - `spriteUrl` builds the expected URL for a given id.

## Out of Scope (YAGNI)

- Other generations (Gen 1 only for now).
- Streak bonuses, timers, leaderboards, persistence.
- Free-text answer input (multiple choice only).
- Audio/cries.
