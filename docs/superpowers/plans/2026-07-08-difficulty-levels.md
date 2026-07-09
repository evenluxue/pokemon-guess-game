# Difficulty Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the player pick Beginner/Advanced/Master Trainer before a session starts, so the silhouette pool is drawn from a matching Pokémon generation range.

**Architecture:** A new `DifficultyScreen` becomes the app's first phase; it feeds a chosen difficulty key into `App`, which looks up an `{offset, limit}` pair from a new `DIFFICULTY_LEVELS` config and fetches that slice of the PokeAPI pokemon list in the background while the player picks a round count on the (now difficulty-aware) `StartScreen`.

**Tech Stack:** React 19, Vite, Vitest + @testing-library/react.

## Global Constraints

- Beginner Trainer = National Dex 1–151 (Gen 1 only).
- Advanced Trainer = National Dex 1–386 (Gen 1–3).
- Master Trainer = National Dex 387–1025 (Gen 4–9).
- Chinese name subtitles (`NAMES_ZH`) are NOT extended beyond Gen 1 in this plan — untranslated Pokémon simply show no subtitle (existing `NAMES_ZH[name] &&` guards already handle this).
- No persistence of the chosen difficulty across sessions; no multi-pool caching (one pool in memory at a time, re-fetched on difficulty change).

---

### Task 1: Generalize the pool fetch and add difficulty config

**Files:**
- Modify: `src/pokeapi.js:34-40` (replace `fetchGen1List`)
- Test: `src/pokeapi.test.js`

**Interfaces:**
- Produces: `fetchPokemonRange(offset, limit) → Promise<{id, name}[]>` — `id` is `offset + index + 1`, `name` is capitalized, same shaping as the old `fetchGen1List`.
- Produces: `DIFFICULTY_LEVELS` — object keyed by `'beginner' | 'advanced' | 'master'`, each value `{ label: string, subtitle: string, offset: number, limit: number }`.

- [ ] **Step 1: Write the failing tests**

Replace the `fetchGen1List` describe block in `src/pokeapi.test.js` (and its import) with:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { spriteUrl, fetchPokemonDetails, fetchPokemonRange, DIFFICULTY_LEVELS } from './pokeapi'

afterEach(() => vi.restoreAllMocks())

// ...(keep the existing `spriteUrl` and `fetchPokemonDetails` describe blocks unchanged)...

describe('fetchPokemonRange', () => {
  it('returns {id, name} entries starting at offset+1', async () => {
    const results = Array.from({ length: 151 }, (_, i) => ({
      name: `mon${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchPokemonRange(0, 151)
    expect(list).toHaveLength(151)
    expect(list[0]).toEqual({ id: 1, name: 'Mon1' })
    expect(list[24]).toEqual({ id: 25, name: 'Mon25' })
  })

  it('offsets ids for a non-zero offset', async () => {
    const results = Array.from({ length: 639 }, (_, i) => ({
      name: `mon${387 + i}`,
      url: `https://pokeapi.co/api/v2/pokemon/${387 + i}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchPokemonRange(386, 639)
    expect(list).toHaveLength(639)
    expect(list[0]).toEqual({ id: 387, name: 'Mon387' })
    expect(list[1]).toEqual({ id: 388, name: 'Mon388' })
  })
})

describe('DIFFICULTY_LEVELS', () => {
  it('defines beginner, advanced, and master with the correct dex ranges', () => {
    expect(DIFFICULTY_LEVELS.beginner).toEqual({
      label: 'Beginner Trainer',
      subtitle: 'Gen 1 · Kanto',
      offset: 0,
      limit: 151,
    })
    expect(DIFFICULTY_LEVELS.advanced).toEqual({
      label: 'Advanced Trainer',
      subtitle: 'Gen 1–3 · Kanto to Hoenn',
      offset: 0,
      limit: 386,
    })
    expect(DIFFICULTY_LEVELS.master).toEqual({
      label: 'Master Trainer',
      subtitle: 'Gen 4–9 · Sinnoh onward',
      offset: 386,
      limit: 639,
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pokeapi.test.js`
Expected: FAIL — `fetchPokemonRange` and `DIFFICULTY_LEVELS` are not exported yet.

- [ ] **Step 3: Implement**

In `src/pokeapi.js`, replace the `fetchGen1List` function (lines 34-40) with:

```js
export async function fetchPokemonRange(offset, limit) {
  const data = await getJson(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`)
  return data.results.map((entry, index) => ({
    id: offset + index + 1,
    name: capitalize(entry.name),
  }))
}

export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner Trainer', subtitle: 'Gen 1 · Kanto', offset: 0, limit: 151 },
  advanced: { label: 'Advanced Trainer', subtitle: 'Gen 1–3 · Kanto to Hoenn', offset: 0, limit: 386 },
  master: { label: 'Master Trainer', subtitle: 'Gen 4–9 · Sinnoh onward', offset: 386, limit: 639 },
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pokeapi.test.js`
Expected: PASS (all describe blocks, including the untouched `spriteUrl`/`fetchPokemonDetails` ones)

- [ ] **Step 5: Commit**

```bash
git add src/pokeapi.js src/pokeapi.test.js
git commit -m "feat: generalize pokemon list fetch and add difficulty ranges"
```

---

### Task 2: DifficultyScreen component

**Files:**
- Create: `src/components/DifficultyScreen.jsx`
- Create: `src/components/DifficultyScreen.test.jsx`
- Modify: `src/App.css` (append new rules)

**Interfaces:**
- Consumes: `DIFFICULTY_LEVELS` from `src/pokeapi.js` (Task 1).
- Produces: `<DifficultyScreen onSelect={(key) => void} />` — renders one button per `DIFFICULTY_LEVELS` entry; clicking a button calls `onSelect` with that entry's key (`'beginner' | 'advanced' | 'master'`).

- [ ] **Step 1: Write the failing test**

Create `src/components/DifficultyScreen.test.jsx`:

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DifficultyScreen from './DifficultyScreen'

afterEach(cleanup)

describe('DifficultyScreen', () => {
  it('renders a card for each difficulty level', () => {
    render(<DifficultyScreen onSelect={() => {}} />)
    expect(screen.getByText('Beginner Trainer')).toBeTruthy()
    expect(screen.getByText('Advanced Trainer')).toBeTruthy()
    expect(screen.getByText('Master Trainer')).toBeTruthy()
  })

  it('calls onSelect with the chosen difficulty key', () => {
    const onSelect = vi.fn()
    render(<DifficultyScreen onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Advanced Trainer'))
    expect(onSelect).toHaveBeenCalledWith('advanced')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/DifficultyScreen.test.jsx`
Expected: FAIL — `./DifficultyScreen` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/DifficultyScreen.jsx`:

```jsx
import { DIFFICULTY_LEVELS } from '../pokeapi'

export default function DifficultyScreen({ onSelect }) {
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Choose your trainer level.</p>
      <div className="difficulty-select">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
          <button key={key} className="difficulty-btn" onClick={() => onSelect(key)}>
            <span className="difficulty-label">{level.label}</span>
            <span className="difficulty-subtitle">{level.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

Append to `src/App.css`:

```css
.difficulty-select {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.9rem 1rem;
  border: 2px solid var(--accent-dark);
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.1s, background 0.15s;
}

.difficulty-btn:hover { transform: translateY(-2px); background: rgba(255, 203, 5, 0.12); }

.difficulty-label { font-size: 1.1rem; font-weight: 700; }
.difficulty-subtitle { font-size: 0.85rem; opacity: 0.75; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/DifficultyScreen.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/DifficultyScreen.jsx src/components/DifficultyScreen.test.jsx src/App.css
git commit -m "feat: add difficulty selection screen"
```

---

### Task 3: StartScreen shows the chosen difficulty and a way back

**Files:**
- Modify: `src/components/StartScreen.jsx` (full rewrite, see below)
- Create: `src/components/StartScreen.test.jsx`
- Modify: `src/App.css` (append new rules)

**Interfaces:**
- Consumes: `DIFFICULTY_LEVELS` from `src/pokeapi.js` (Task 1).
- Produces: `<StartScreen difficulty={key} onChangeDifficulty={() => void} onStart={(rounds) => void} />` — `difficulty` must be a valid `DIFFICULTY_LEVELS` key. Round-count behavior (`onStart(rounds)`) is unchanged from before.

- [ ] **Step 1: Write the failing tests**

Create `src/components/StartScreen.test.jsx`:

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import StartScreen from './StartScreen'

afterEach(cleanup)

describe('StartScreen', () => {
  it('shows the chosen difficulty label and subtitle', () => {
    render(<StartScreen difficulty="advanced" onChangeDifficulty={() => {}} onStart={() => {}} />)
    expect(screen.getByText('Advanced Trainer')).toBeTruthy()
    expect(screen.getByText(/Gen 1–3/)).toBeTruthy()
  })

  it('calls onChangeDifficulty when "Change level" is clicked', () => {
    const onChangeDifficulty = vi.fn()
    render(<StartScreen difficulty="beginner" onChangeDifficulty={onChangeDifficulty} onStart={() => {}} />)
    fireEvent.click(screen.getByText('‹ Change level'))
    expect(onChangeDifficulty).toHaveBeenCalled()
  })

  it('calls onStart with the selected round count', () => {
    const onStart = vi.fn()
    render(<StartScreen difficulty="beginner" onChangeDifficulty={() => {}} onStart={onStart} />)
    fireEvent.click(screen.getByText('15'))
    fireEvent.click(screen.getByText('Play'))
    expect(onStart).toHaveBeenCalledWith(15)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/StartScreen.test.jsx`
Expected: FAIL — `StartScreen` doesn't render a difficulty label/subtitle or a "Change level" control yet.

- [ ] **Step 3: Implement**

Replace the full contents of `src/components/StartScreen.jsx` with:

```jsx
import { useState } from 'react'
import { DIFFICULTY_LEVELS } from '../pokeapi'

const ROUND_OPTIONS = [5, 10, 15, 20]

export default function StartScreen({ difficulty, onChangeDifficulty, onStart }) {
  const [rounds, setRounds] = useState(10)
  const level = DIFFICULTY_LEVELS[difficulty]
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Guess the Pokémon from its silhouette.</p>
      <p>+10 per correct answer. Hints cost 2 points each.</p>
      <div className="difficulty-summary">
        <p>
          <span className="difficulty-summary-label">{level.label}</span> · {level.subtitle}
        </p>
        <button className="link-btn" onClick={onChangeDifficulty}>
          ‹ Change level
        </button>
      </div>
      <div className="round-select">
        <p className="round-label">How many rounds?</p>
        <div className="round-options">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              className={n === rounds ? 'round-btn selected' : 'round-btn'}
              onClick={() => setRounds(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button className="primary" onClick={() => onStart(rounds)}>
        Play
      </button>
    </div>
  )
}
```

Append to `src/App.css`:

```css
.difficulty-summary { margin: 0.5rem 0 1rem; opacity: 0.9; }
.difficulty-summary-label { color: var(--accent); font-weight: 700; }

.link-btn {
  display: block;
  margin: 0.25rem auto 0;
  background: transparent;
  border: none;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/StartScreen.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StartScreen.jsx src/components/StartScreen.test.jsx src/App.css
git commit -m "feat: show chosen difficulty and change-level control on round screen"
```

---

### Task 4: Wire difficulty into App's phase flow and pool loading

**Files:**
- Modify: `src/App.jsx` (full rewrite, see below)

**Interfaces:**
- Consumes: `fetchPokemonRange`, `DIFFICULTY_LEVELS` (Task 1); `<DifficultyScreen onSelect>` (Task 2); `<StartScreen difficulty, onChangeDifficulty, onStart>` (Task 3).
- Produces: no new exports — this is the top-level app; verified manually in the browser (this codebase has no `App.test.jsx`; App wiring has always been checked by hand, same as the session-timer feature).

This task has no unit test of its own — it's pure wiring. Verification is: the full existing test suite still passes, plus a manual browser walkthrough (Step 3).

- [ ] **Step 1: Run the full suite before touching App.jsx, to get a clean baseline**

Run: `npm test`
Expected: PASS (all existing tests, including the ones just added in Tasks 1-3)

- [ ] **Step 2: Rewrite App.jsx**

Replace the full contents of `src/App.jsx` with:

```jsx
import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import { fetchPokemonRange, fetchPokemonDetails, DIFFICULTY_LEVELS } from './pokeapi'
import { pickRound, scoreRound, bestType } from './gameLogic'
import { formatElapsed } from './formatElapsed'
import DifficultyScreen from './components/DifficultyScreen'
import StartScreen from './components/StartScreen'
import ScoreBar from './components/ScoreBar'
import PokemonSilhouette from './components/PokemonSilhouette'
import HintPanel from './components/HintPanel'
import OptionButtons from './components/OptionButtons'
import ResultsScreen from './components/ResultsScreen'
import GuessHistory from './components/GuessHistory'
import ReviewModal from './components/ReviewModal'
import TypeShowcase from './components/TypeShowcase'

export default function App() {
  const [difficulty, setDifficulty] = useState('beginner')
  const [pool, setPool] = useState(null) // [{id, name}]
  const [loadError, setLoadError] = useState(false)
  const [phase, setPhase] = useState('difficulty') // difficulty | rounds | loading | playing | revealed | results
  const [totalRounds, setTotalRounds] = useState(10)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [current, setCurrent] = useState(null) // {details, options}
  const [hintsUsed, setHintsUsed] = useState(0)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([]) // [{ round, name, types, spriteUrl, guess, correct, points }]
  const [reviewEntry, setReviewEntry] = useState(null)
  const [accumulatedMs, setAccumulatedMs] = useState(0)
  const [intervalStart, setIntervalStart] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const poolPromiseRef = useRef(null)
  const pendingStartRef = useRef(false)

  const maxScore = totalRounds * 10

  const loadPool = useCallback((difficultyKey) => {
    setLoadError(false)
    const { offset, limit } = DIFFICULTY_LEVELS[difficultyKey]
    const promise = fetchPokemonRange(offset, limit)
      .then((list) => {
        setPool(list)
        return list
      })
      .catch(() => {
        setLoadError(true)
        return null
      })
    poolPromiseRef.current = promise
    return promise
  }, [])

  useEffect(() => {
    if (intervalStart === null) return
    const tick = () => setElapsedMs(accumulatedMs + (Date.now() - intervalStart))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [accumulatedMs, intervalStart])

  // Takes the pool explicitly instead of reading state: play() may call this
  // right after awaiting a pool fetch that just resolved, and the memoized
  // closure from render time would otherwise still see the pre-fetch (null) pool.
  const startRound = useCallback(async (activePool) => {
    setPhase('loading')
    setHintsUsed(0)
    setSelected(null)
    setIntervalStart(Date.now())
    const names = activePool.map((p) => p.name)
    const answerEntry = activePool[Math.floor(Math.random() * activePool.length)]
    const { options } = pickRound(names, answerEntry.name)
    const details = await fetchPokemonDetails(answerEntry.id)
    setCurrent({ details, options })
    setPhase('playing')
  }, [])

  function selectDifficulty(key) {
    setDifficulty(key)
    setPool(null)
    loadPool(key)
    setPhase('rounds')
  }

  // Retrying after a failed pool fetch: if the failure happened while play()
  // was already waiting on it (pendingStartRef), resume straight into the
  // round on success instead of leaving the player stuck on "Loading…".
  function retryLoad() {
    loadPool(difficulty).then((list) => {
      if (list && pendingStartRef.current) {
        pendingStartRef.current = false
        startRound(list)
      }
    })
  }

  async function play(rounds) {
    setTotalRounds(rounds)
    setRound(1)
    setScore(0)
    setHistory([])
    setAccumulatedMs(0)
    let activePool = pool
    if (!activePool) {
      setPhase('loading')
      pendingStartRef.current = true
      activePool = await poolPromiseRef.current
      if (!activePool) return
    }
    pendingStartRef.current = false
    startRound(activePool)
  }

  function goToStart() {
    setReviewEntry(null)
    setPhase('rounds')
  }

  function getHint() {
    setHintsUsed((n) => Math.min(3, n + 1))
  }

  function answer(name) {
    setSelected(name)
    const correct = name === current.details.name
    const points = scoreRound(correct, hintsUsed)
    setScore((s) => s + points)
    setHistory((h) => [
      ...h,
      {
        round,
        name: current.details.name,
        types: current.details.types,
        spriteUrl: current.details.spriteUrl,
        guess: name,
        correct,
        points,
      },
    ])
    const activeMs = intervalStart === null ? 0 : Date.now() - intervalStart
    const newAccumulated = accumulatedMs + activeMs
    setAccumulatedMs(newAccumulated)
    setElapsedMs(newAccumulated)
    setIntervalStart(null)
    setPhase('revealed')
  }

  function next() {
    if (round >= totalRounds) {
      setPhase('results')
    } else {
      setRound((r) => r + 1)
      startRound(pool)
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
        <button className="primary" onClick={retryLoad}>Retry</button>
      </div>
    )
  }

  if (phase === 'difficulty') {
    return <DifficultyScreen onSelect={selectDifficulty} />
  }

  if (phase === 'rounds') {
    return (
      <StartScreen
        difficulty={difficulty}
        onChangeDifficulty={() => setPhase('difficulty')}
        onStart={play}
      />
    )
  }

  if (phase === 'results') {
    const trainerType = bestType(history)
    const typeMons = trainerType
      ? [
          ...new Map(
            history
              .filter((h) => h.types.includes(trainerType))
              .map((h) => [h.name, h])
          ).values(),
        ]
      : []
    return (
      <div className="game-layout">
        <GuessHistory history={history} onSelect={setReviewEntry} />
        <ResultsScreen
          score={score}
          maxScore={maxScore}
          elapsed={formatElapsed(elapsedMs)}
          trainerType={trainerType}
          onPlayAgain={goToStart}
        />
        <TypeShowcase type={trainerType} mons={typeMons} />
        {reviewEntry && (
          <ReviewModal entry={reviewEntry} onClose={() => setReviewEntry(null)} />
        )}
      </div>
    )
  }

  if (phase === 'loading' || !current) {
    return <div className="screen"><p>Loading…</p></div>
  }

  const { details, options } = current
  const answered = phase === 'revealed'
  const isCorrect = answered && selected === details.name

  return (
    <div className="game-layout">
      <GuessHistory history={history} />
      <div className="screen game-screen">
        <ScoreBar round={round} totalRounds={totalRounds} score={score} elapsed={formatElapsed(elapsedMs)} />
      <PokemonSilhouette src={details.spriteUrl} revealed={answered} correct={isCorrect} wrong={answered && !isCorrect} alt={details.name} />
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
            {round >= totalRounds ? 'See Results' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
```

Note the two behavioral changes from the previous version, both intentional:
1. There's no more mount-time `useEffect` that eagerly fetches a pool — fetching now starts only once a difficulty is chosen (`selectDifficulty`).
2. `goToStart` (wired to `ResultsScreen`'s "Play Again") now returns to the `'rounds'` phase rather than a single `'start'` phase, since the difficulty picker and round picker are now two separate phases and the player's pool is still valid — no need to make them re-pick a difficulty every replay.

- [ ] **Step 3: Manual verification in the browser**

Run: `npm run dev`, open the printed local URL.

Walk through all three difficulties:
- **Beginner Trainer**: select it, confirm the round screen shows "Beginner Trainer · Gen 1 · Kanto", click "‹ Change level" and confirm it returns to the difficulty screen, re-select Beginner Trainer, pick 5 rounds, click Play. Confirm the game loads and only Gen 1-looking Pokémon (silhouettes/names you recognize as Kanto) appear across all 5 rounds.
- **Advanced Trainer**: repeat, confirm subtitle "Gen 1–3 · Kanto to Hoenn", play a session, confirm some non-Gen-1 Pokémon show up (Chinese subtitle absent for those is expected and fine).
- **Master Trainer**: repeat, confirm subtitle "Gen 4–9 · Sinnoh onward", play a session, confirm Pokémon are from Gen 4+ (no Kanto starters, etc.).
- From the Results screen, click "Play Again" and confirm it goes straight to the round-count screen (same difficulty, no need to re-pick).
- Simulate a fetch failure: in devtools, set Network to "Offline", pick a difficulty, and confirm the "Couldn't load Pokémon" / Retry screen appears; set Network back to "Online" (or "No throttling"), click Retry, and confirm the game proceeds normally (test this once during the round-picker wait, and once by clicking Retry immediately after clicking Play so the failure happens mid-`loading`).

Expected: All of the above behave as described, with no console errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS (all suites)

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add difficulty selection to the game flow"
```

---

## Post-plan

Once all four tasks are committed, the difficulty feature is complete: end-to-end flow difficulty → rounds → play → results, backed by generation-scoped Pokémon pools, with graceful handling of untranslated Chinese names and of pool-fetch failures at any point in the flow.
