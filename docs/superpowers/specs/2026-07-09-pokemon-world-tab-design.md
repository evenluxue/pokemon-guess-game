# Pokémon World Tab — Design

**Date:** 2026-07-09
**Status:** Approved

## Goal

Add a bilingual (English + 中文) educational tab to the very first screen, introducing
kids new to Pokémon to the world: Trainers, Poké Balls, Pokémon, Gym Leagues, Battle &
Friendship, and Leveling Up & Growth.

## Structure

A new `BeginningScreen` wraps the app's first screen with a small tab bar:

- **🎮 Play** — today's `DifficultyScreen`, unchanged.
- **📖 Pokémon World** — new `WorldIntroScreen`.

Tab state is local to `BeginningScreen` (doesn't affect `App`'s phase machine at all —
`App` still just renders `<BeginningScreen onSelect={selectDifficulty}
onPreview={previewRoster} />` in the `'difficulty'` phase, same props `DifficultyScreen`
already takes).

## Content (all static, no network fetch)

Six sections, each with an English paragraph, a 中文 paragraph, and (where relevant) real
sprite art via the existing `spriteUrl()` helper:

1. **Trainers 训练师** — what a Trainer is; Ash Ketchum (小智) and his partner Pikachu
   (皮卡丘) — Pikachu's sprite shown.
2. **Poké Balls 精灵球** — what they do (catching/carrying Pokémon) — illustrated with a
   small CSS-drawn Poké Ball icon (no accurate emoji exists; a few CSS rules draw a
   red/white ball with a center button, no image asset needed).
3. **Pokémon 宝可梦** — what they are (creatures with types and powers) — a lineup of
   real sprites: Bulbasaur, Charmander, Squirtle, Pikachu.
4. **Gym Leagues 道馆与联盟** — Gym Leaders, Badges, the Pokémon League, becoming
   Champion.
5. **Battle & Friendship 对战与友情** — battling builds trust between Trainer and
   Pokémon, not just strength.
6. **Level Up & Growth 升级与成长** — experience, leveling, evolution — illustrated with
   the real Charmander → Charmeleon → Charizard evolution line, connected by arrows.

Content is a static array of `{ key, icon, titleEn, titleZh, textEn, textZh, sprites,
evolutionChain }` objects inside `WorldIntroScreen.jsx` — no data file needed elsewhere,
since it's presentation content specific to this one screen.

## Modules

### `src/components/WorldIntroScreen.jsx` (new)

Renders the six sections in order: icon/title (EN + ZH), English paragraph, Chinese
paragraph, and an optional sprite row (plain lineup, or an evolution chain with `→`
arrows between stages when `evolutionChain: true`).

### `src/components/BeginningScreen.jsx` (new)

Owns `tab` state (`'play' | 'world'`, defaults to `'play'`). Renders the tab bar plus
either `<DifficultyScreen onSelect onPreview>` or `<WorldIntroScreen />`. Neither child
component changes — `DifficultyScreen` keeps its own `.screen` wrapper and existing
tests/behavior untouched; the tab bar sits above it as its own small control, not nested
inside another card.

### `src/App.jsx`

Swap `<DifficultyScreen onSelect={selectDifficulty} onPreview={previewRoster} />` for
`<BeginningScreen onSelect={selectDifficulty} onPreview={previewRoster} />` in the
`'difficulty'` phase branch. No other App changes.

## Testing

- `BeginningScreen.test.jsx` (new): defaults to the Play tab (difficulty cards visible);
  clicking "📖 Pokémon World" swaps to the intro content; clicking "🎮 Play" swaps back;
  confirms `onSelect`/`onPreview` still reach `DifficultyScreen` through the wrapper.
- `WorldIntroScreen.jsx`: a light render test confirming all six section titles (EN)
  appear, consistent with how content-only components are treated elsewhere in this
  codebase (e.g. `ResultsScreen` has no dedicated test file, `DifficultyScreen` does
  because it has interaction to verify) — here there is real interaction to check
  (nothing) but titles rendering is a cheap regression guard against future copy edits
  breaking the array shape.

## Out of scope

- Any other companions besides Ash/Pikachu (e.g. Misty/Brock) — kept to the most
  universally recognized pair for this pass.
- Quizzes/interactivity within the Pokémon World tab — it's read-only educational
  content.
- Persisting which tab was last open across sessions.
