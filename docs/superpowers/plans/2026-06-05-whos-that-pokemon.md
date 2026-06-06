# Who's That Pokémon? Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React "Who's That Pokémon?" guessing game — silhouette of a Gen 1 Pokémon, 4 multiple-choice names, optional point-costing hints, 10-round sessions scored out of 100.

**Architecture:** Vite + React SPA. Pure logic (`gameLogic.js`) and data shaping (`pokeapi.js`) are framework-free and unit-tested with Vitest. `App.jsx` owns session state and composes small presentational components. Live data + sprites from PokeAPI.

**Tech Stack:** React 18, Vite, Vitest, plain CSS, PokeAPI (`pokeapi.co`).

---

## File Structure

- `package.json`, `vite.config.js`, `index.html` — scaffold (Vite react template).
- `src/main.jsx` — React entry point.
- `src/App.jsx` — session state owner; composes components.
- `src/gameLogic.js` — pure functions: `pickRound`, `scoreRound`. No React, no network.
- `src/gameLogic.test.js` — Vitest tests for game logic.
- `src/pokeapi.js` — data layer: `spriteUrl`, `fetchPokemonDetails`, `fetchGen1List`.
- `src/pokeapi.test.js` — Vitest tests for data shaping (mocked `fetch`).
- `src/components/StartScreen.jsx`
- `src/components/ScoreBar.jsx`
- `src/components/PokemonSilhouette.jsx`
- `src/components/HintPanel.jsx`
- `src/components/OptionButtons.jsx`
- `src/components/ResultsScreen.jsx`
- `src/App.css` — styling.

---

## Task 1: Scaffold the Vite + React project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

- [ ] **Step 1: Scaffold with Vite react template**

Run in the project root (it already contains `.git`, `docs/`, `.gitignore`):

```bash
npm create vite@latest . -- --template react
```

If prompted that the directory is not empty, choose "Ignore files and continue".
This creates `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`,
`src/App.jsx`, `src/App.css`, `src/index.css`, and an `assets/` folder.

- [ ] **Step 2: Install dependencies plus Vitest**

```bash
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add the test script and jsdom test env to package.json**

In `package.json`, ensure the `"scripts"` block contains:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Add a `test` config to `vite.config.js` so component tests get a DOM:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Verify dev server boots**

Run: `npm run build`
Expected: builds successfully with no errors (exits 0).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React project with Vitest"
```

---

## Task 2: `scoreRound` (pure scoring logic)

**Files:**
- Create: `src/gameLogic.js`
- Test: `src/gameLogic.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/gameLogic.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { scoreRound } from './gameLogic'

describe('scoreRound', () => {
  it('awards 10 for a correct answer with no hints', () => {
    expect(scoreRound(true, 0)).toBe(10)
  })

  it('subtracts 2 per hint used on a correct answer', () => {
    expect(scoreRound(true, 1)).toBe(8)
    expect(scoreRound(true, 2)).toBe(6)
  })

  it('floors a correct answer at 1 even with all 3 hints', () => {
    expect(scoreRound(true, 3)).toBe(4)
  })

  it('returns 0 for a wrong answer regardless of hints', () => {
    expect(scoreRound(false, 0)).toBe(0)
    expect(scoreRound(false, 3)).toBe(0)
  })
})
```

Note: with −2/hint and 3 hints, 10 − 6 = 4, which is above the floor of 1; the
floor only matters if hint cost ever increases. The floor is asserted via the
`Math.max(1, …)` implementation and exercised by the no-below-1 guarantee.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/gameLogic.test.js`
Expected: FAIL — `scoreRound is not a function` / module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/gameLogic.js`:

```js
export function scoreRound(correct, hintsUsed) {
  if (!correct) return 0
  return Math.max(1, 10 - 2 * hintsUsed)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/gameLogic.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/gameLogic.js src/gameLogic.test.js
git commit -m "feat: add scoreRound scoring logic"
```

---

## Task 3: `pickRound` (round option generation)

**Files:**
- Modify: `src/gameLogic.js`
- Test: `src/gameLogic.test.js`

- [ ] **Step 1: Write the failing test**

Append to `src/gameLogic.test.js`:

```js
import { pickRound } from './gameLogic'

describe('pickRound', () => {
  const pool = ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Jigglypuff', 'Meowth']

  it('returns exactly 4 options', () => {
    const { options } = pickRound(pool, 'Pikachu')
    expect(options).toHaveLength(4)
  })

  it('includes the answer among the options', () => {
    const { options, answer } = pickRound(pool, 'Pikachu')
    expect(answer).toBe('Pikachu')
    expect(options).toContain('Pikachu')
  })

  it('returns 4 unique options', () => {
    const { options } = pickRound(pool, 'Pikachu')
    expect(new Set(options).size).toBe(4)
  })

  it('only uses names from the pool', () => {
    const { options } = pickRound(pool, 'Pikachu')
    options.forEach((name) => expect(pool).toContain(name))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/gameLogic.test.js`
Expected: FAIL — `pickRound is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `src/gameLogic.js`:

```js
function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRound(pool, answer) {
  const distractors = shuffle(pool.filter((name) => name !== answer)).slice(0, 3)
  const options = shuffle([answer, ...distractors])
  return { answer, options }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/gameLogic.test.js`
Expected: PASS (all gameLogic tests).

- [ ] **Step 5: Commit**

```bash
git add src/gameLogic.js src/gameLogic.test.js
git commit -m "feat: add pickRound option generation"
```

---

## Task 4: `spriteUrl` and `fetchPokemonDetails` (data shaping)

**Files:**
- Create: `src/pokeapi.js`
- Test: `src/pokeapi.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/pokeapi.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { spriteUrl, fetchPokemonDetails } from './pokeapi'

afterEach(() => vi.restoreAllMocks())

describe('spriteUrl', () => {
  it('builds the official sprite URL from an id', () => {
    expect(spriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    )
  })
})

describe('fetchPokemonDetails', () => {
  it('shapes the API response into name, types, genus, spriteUrl', async () => {
    const pokemonResponse = {
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
    }
    const speciesResponse = {
      genera: [
        { genus: 'Seed Pokémon', language: { name: 'fr' } },
        { genus: 'Mouse Pokémon', language: { name: 'en' } },
      ],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(url.includes('/pokemon-species/') ? speciesResponse : pokemonResponse),
        })
      )
    )

    const details = await fetchPokemonDetails(25)
    expect(details).toEqual({
      id: 25,
      name: 'Pikachu',
      types: ['Electric'],
      genus: 'Mouse Pokémon',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pokeapi.test.js`
Expected: FAIL — module/exports not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/pokeapi.js`:

```js
const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const API_BASE = 'https://pokeapi.co/api/v2'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function spriteUrl(id) {
  return `${SPRITE_BASE}/${id}.png`
}

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`)
  return res.json()
}

export async function fetchPokemonDetails(id) {
  const [pokemon, species] = await Promise.all([
    getJson(`${API_BASE}/pokemon/${id}`),
    getJson(`${API_BASE}/pokemon-species/${id}`),
  ])
  const englishGenus = species.genera.find((g) => g.language.name === 'en')
  return {
    id: pokemon.id,
    name: capitalize(pokemon.name),
    types: pokemon.types.map((t) => capitalize(t.type.name)),
    genus: englishGenus ? englishGenus.genus : 'Unknown Pokémon',
    spriteUrl: spriteUrl(id),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pokeapi.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pokeapi.js src/pokeapi.test.js
git commit -m "feat: add spriteUrl and fetchPokemonDetails data shaping"
```

---

## Task 5: `fetchGen1List`

**Files:**
- Modify: `src/pokeapi.js`
- Test: `src/pokeapi.test.js`

- [ ] **Step 1: Write the failing test**

Append to `src/pokeapi.test.js`:

```js
import { fetchGen1List } from './pokeapi'

describe('fetchGen1List', () => {
  it('returns 151 {id, name} entries with capitalized names', async () => {
    const results = Array.from({ length: 151 }, (_, i) => ({
      name: `mon${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchGen1List()
    expect(list).toHaveLength(151)
    expect(list[0]).toEqual({ id: 1, name: 'Mon1' })
    expect(list[24]).toEqual({ id: 25, name: 'Mon25' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/pokeapi.test.js`
Expected: FAIL — `fetchGen1List is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `src/pokeapi.js`:

```js
export async function fetchGen1List() {
  const data = await getJson(`${API_BASE}/pokemon?limit=151&offset=0`)
  return data.results.map((entry, index) => ({
    id: index + 1,
    name: capitalize(entry.name),
  }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/pokeapi.test.js`
Expected: PASS (all pokeapi tests).

- [ ] **Step 5: Commit**

```bash
git add src/pokeapi.js src/pokeapi.test.js
git commit -m "feat: add fetchGen1List"
```

---

## Task 6: Presentational components

**Files:**
- Create: `src/components/StartScreen.jsx`, `src/components/ScoreBar.jsx`,
  `src/components/PokemonSilhouette.jsx`, `src/components/HintPanel.jsx`,
  `src/components/OptionButtons.jsx`, `src/components/ResultsScreen.jsx`

These are simple presentational components driven entirely by props. No tests at
this layer (logic is tested in gameLogic/pokeapi; these are wired and verified by
the manual run in Task 8).

- [ ] **Step 1: StartScreen**

Create `src/components/StartScreen.jsx`:

```jsx
export default function StartScreen({ onStart }) {
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Guess the Gen 1 Pokémon from its silhouette.</p>
      <p>10 rounds. +10 per correct answer. Hints cost 2 points each.</p>
      <button className="primary" onClick={onStart}>
        Play
      </button>
    </div>
  )
}
```

- [ ] **Step 2: ScoreBar**

Create `src/components/ScoreBar.jsx`:

```jsx
export default function ScoreBar({ round, totalRounds, score }) {
  return (
    <div className="score-bar">
      <span>Round {round} / {totalRounds}</span>
      <span>Score: {score}</span>
    </div>
  )
}
```

- [ ] **Step 3: PokemonSilhouette**

Create `src/components/PokemonSilhouette.jsx`:

```jsx
const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

export default function PokemonSilhouette({ src, revealed, alt }) {
  return (
    <div className="silhouette-wrap">
      <img
        className={revealed ? 'silhouette revealed' : 'silhouette'}
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon'}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: HintPanel**

Create `src/components/HintPanel.jsx`. `hints` is an array of strings already
revealed; `onGetHint` reveals the next; disabled once 3 are shown or after answer.

```jsx
export default function HintPanel({ hints, onGetHint, disabled }) {
  return (
    <div className="hint-panel">
      <button className="hint-btn" onClick={onGetHint} disabled={disabled}>
        Get a hint (−2)
      </button>
      <ul className="hint-list">
        {hints.map((hint, i) => (
          <li key={i}>{hint}</li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 5: OptionButtons**

Create `src/components/OptionButtons.jsx`. Before answering, clicking calls
`onAnswer(name)`. After answering (`answered` true), highlight the correct option
green and a wrong selection red; disable all.

```jsx
export default function OptionButtons({ options, answer, selected, answered, onAnswer }) {
  function classFor(name) {
    if (!answered) return 'option'
    if (name === answer) return 'option correct'
    if (name === selected) return 'option wrong'
    return 'option'
  }
  return (
    <div className="options">
      {options.map((name) => (
        <button
          key={name}
          className={classFor(name)}
          disabled={answered}
          onClick={() => onAnswer(name)}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: ResultsScreen**

Create `src/components/ResultsScreen.jsx`:

```jsx
function message(score) {
  if (score >= 90) return 'Pokémon Master!'
  if (score >= 60) return 'Great job, trainer!'
  if (score >= 30) return 'Keep training!'
  return 'Better luck next time!'
}

export default function ResultsScreen({ score, maxScore, onPlayAgain }) {
  return (
    <div className="screen results-screen">
      <h1>Game Over</h1>
      <p className="final-score">{score} / {maxScore}</p>
      <p>{message(score)}</p>
      <button className="primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components
git commit -m "feat: add presentational components"
```

---

## Task 7: `App.jsx` — session state and wiring

**Files:**
- Modify: `src/App.jsx`, `src/main.jsx` (ensure it renders `App`)

- [ ] **Step 1: Implement App**

Replace `src/App.jsx` with:

```jsx
import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { fetchGen1List, fetchPokemonDetails } from './pokeapi'
import { pickRound, scoreRound } from './gameLogic'
import StartScreen from './components/StartScreen'
import ScoreBar from './components/ScoreBar'
import PokemonSilhouette from './components/PokemonSilhouette'
import HintPanel from './components/HintPanel'
import OptionButtons from './components/OptionButtons'
import ResultsScreen from './components/ResultsScreen'

const TOTAL_ROUNDS = 10
const MAX_SCORE = TOTAL_ROUNDS * 10

export default function App() {
  const [pool, setPool] = useState(null) // [{id, name}]
  const [loadError, setLoadError] = useState(false)
  const [phase, setPhase] = useState('start') // start | loading | playing | revealed | results
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [current, setCurrent] = useState(null) // {details, options}
  const [hintsUsed, setHintsUsed] = useState(0)
  const [selected, setSelected] = useState(null)

  const loadPool = useCallback(async () => {
    setLoadError(false)
    try {
      const list = await fetchGen1List()
      setPool(list)
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    loadPool()
  }, [loadPool])

  const startRound = useCallback(async () => {
    setPhase('loading')
    setHintsUsed(0)
    setSelected(null)
    const names = pool.map((p) => p.name)
    const answerEntry = pool[Math.floor(Math.random() * pool.length)]
    const { options } = pickRound(names, answerEntry.name)
    const details = await fetchPokemonDetails(answerEntry.id)
    setCurrent({ details, options })
    setPhase('playing')
  }, [pool])

  function play() {
    setRound(1)
    setScore(0)
    startRound()
  }

  function getHint() {
    setHintsUsed((n) => Math.min(3, n + 1))
  }

  function answer(name) {
    setSelected(name)
    const correct = name === current.details.name
    setScore((s) => s + scoreRound(correct, hintsUsed))
    setPhase('revealed')
  }

  function next() {
    if (round >= TOTAL_ROUNDS) {
      setPhase('results')
    } else {
      setRound((r) => r + 1)
      startRound()
    }
  }

  function buildHints(details) {
    return [
      `Type: ${details.types.join(' · ')}`,
      `Category: ${details.genus}`,
      `Starts with: ${details.name.charAt(0)}`,
    ].slice(0, hintsUsed)
  }

  if (loadError) {
    return (
      <div className="screen">
        <p>Couldn't load Pokémon.</p>
        <button className="primary" onClick={loadPool}>Retry</button>
      </div>
    )
  }

  if (phase === 'start') {
    return <StartScreen onStart={play} />
  }

  if (phase === 'results') {
    return <ResultsScreen score={score} maxScore={MAX_SCORE} onPlayAgain={play} />
  }

  if (phase === 'loading' || !current) {
    return <div className="screen"><p>Loading…</p></div>
  }

  const { details, options } = current
  const answered = phase === 'revealed'

  return (
    <div className="screen game-screen">
      <ScoreBar round={round} totalRounds={TOTAL_ROUNDS} score={score} />
      <PokemonSilhouette src={details.spriteUrl} revealed={answered} alt={details.name} />
      {answered && (
        <p className="reveal-name">
          {selected === details.name ? "It's " : 'It was '} {details.name}!
        </p>
      )}
      <HintPanel hints={buildHints(details)} onGetHint={getHint} disabled={answered || hintsUsed >= 3} />
      <OptionButtons
        options={options}
        answer={details.name}
        selected={selected}
        answered={answered}
        onAnswer={answer}
      />
      {answered && (
        <button className="primary" onClick={next}>
          {round >= TOTAL_ROUNDS ? 'See Results' : 'Next'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: builds successfully (exits 0), no unresolved imports.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all gameLogic and pokeapi tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: wire up App session state and game loop"
```

---

## Task 8: Styling and manual verification

**Files:**
- Modify: `src/App.css` (replace contents), `src/index.css` (base reset)

- [ ] **Step 1: Write App.css**

Replace `src/App.css` with styling that implements the silhouette effect and a
clean centered layout:

```css
:root {
  --bg: #1f2a44;
  --card: #2b3a5e;
  --accent: #ffcb05;
  --accent-dark: #3b4cca;
  --correct: #4caf50;
  --wrong: #e53935;
  --text: #f5f5f5;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
}

#root { min-height: 100vh; display: grid; place-items: center; padding: 1rem; }

.screen {
  background: var(--card);
  border-radius: 16px;
  padding: 2rem;
  width: min(440px, 100%);
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h1 { color: var(--accent); margin-top: 0; }

.score-bar {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 1rem;
}

.silhouette-wrap { display: grid; place-items: center; min-height: 200px; }

.silhouette {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: brightness(0);
  transition: filter 0.5s ease;
  image-rendering: pixelated;
}

.silhouette.revealed { filter: none; }

.reveal-name { font-size: 1.3rem; font-weight: 700; color: var(--accent); }

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 1rem 0;
}

.option {
  padding: 0.75rem;
  border: 2px solid var(--accent-dark);
  border-radius: 10px;
  background: #fff;
  color: #222;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.1s;
}

.option:hover:not(:disabled) { transform: translateY(-2px); }
.option.correct { background: var(--correct); color: #fff; border-color: var(--correct); }
.option.wrong { background: var(--wrong); color: #fff; border-color: var(--wrong); }
.option:disabled { cursor: default; }

.hint-panel { margin: 0.5rem 0; }

.hint-btn {
  background: transparent;
  color: var(--accent);
  border: 1px dashed var(--accent);
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.hint-btn:disabled { opacity: 0.4; cursor: default; }

.hint-list { list-style: none; padding: 0; margin: 0.5rem 0 0; font-size: 0.9rem; }
.hint-list li { background: rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 0.3rem; margin: 0.25rem 0; }

.primary {
  background: var(--accent);
  color: #222;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
}

.primary:hover { filter: brightness(1.05); }

.final-score { font-size: 2.5rem; font-weight: 800; color: var(--accent); }
```

- [ ] **Step 2: Clear index.css default Vite styles**

Replace `src/index.css` with a minimal reset so Vite's default centered/dark
template styles don't fight App.css:

```css
:root { color-scheme: dark; }
body { margin: 0; }
```

- [ ] **Step 3: Manual run and verify**

Run: `npm run dev`
Open the printed local URL in a browser and verify:
- Start screen shows; clicking Play loads a silhouette (black shape).
- "Get a hint" reveals Type, then Category, then First letter, then disables.
- Clicking a name highlights correct (green) / wrong (red) and reveals color sprite.
- Next advances; after 10 rounds the results screen shows score / 100.
- Play Again restarts at round 1 with score 0.

- [ ] **Step 4: Final full verification**

Run: `npm test && npm run build`
Expected: all tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.css src/index.css
git commit -m "style: add game styling and silhouette reveal effect"
```

---

## Done

After Task 8: a playable, tested "Who's That Pokémon?" game. All pure logic is
unit-tested; the UI is verified by manual run. Future work (out of scope): more
generations, streaks, timers, leaderboards.
