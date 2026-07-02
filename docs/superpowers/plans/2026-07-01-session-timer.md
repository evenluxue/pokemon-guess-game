# Session Timer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live stopwatch to the guess session so teams can compare both score and elapsed time.

**Architecture:** A pure `formatElapsed(ms)` helper formats milliseconds as `M:SS`. `App.jsx` tracks `startedAt`/`elapsedMs` state, driven by a `setInterval` effect that runs only while a session is active (any phase except `start`/`results`). `ScoreBar` and `ResultsScreen` each gain an `elapsed` string prop to render.

**Tech Stack:** React (hooks: `useState`, `useEffect`), Vitest for unit tests.

## Global Constraints

- Stopwatch counts up from `0:00`; no time limit, no countdown.
- Timer starts the instant "Play" is clicked; stops the instant the last round transitions to the `results` phase; not paused per-round.
- Elapsed time format is `M:SS` (minutes not zero-padded, seconds zero-padded to 2 digits), e.g. `4:05`, `12:00`.
- No in-app team concept, naming, or persisted leaderboard — out of scope.
- No countdown/time-limit mode — out of scope.

---

### Task 1: `formatElapsed` helper

**Files:**
- Create: `src/formatElapsed.js`
- Test: `src/formatElapsed.test.js`

**Interfaces:**
- Consumes: nothing (pure function, no dependencies).
- Produces: `formatElapsed(ms: number) => string` — later tasks (Task 2) import this from `src/formatElapsed.js` and call it as `formatElapsed(elapsedMs)`.

- [ ] **Step 1: Write the failing test**

Create `src/formatElapsed.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { formatElapsed } from './formatElapsed'

describe('formatElapsed', () => {
  it('formats zero as 0:00', () => {
    expect(formatElapsed(0)).toBe('0:00')
  })

  it('formats sub-minute durations with zero-padded seconds', () => {
    expect(formatElapsed(5000)).toBe('0:05')
    expect(formatElapsed(45000)).toBe('0:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatElapsed(65000)).toBe('1:05')
    expect(formatElapsed(605000)).toBe('10:05')
  })

  it('truncates partial seconds down', () => {
    expect(formatElapsed(65999)).toBe('1:05')
  })

  it('does not zero-pad minutes', () => {
    expect(formatElapsed(3661000)).toBe('61:01')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/formatElapsed.test.js`
Expected: FAIL — `Failed to resolve import "./formatElapsed"` (file doesn't exist yet)

- [ ] **Step 3: Write minimal implementation**

Create `src/formatElapsed.js`:

```js
export function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/formatElapsed.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/formatElapsed.js src/formatElapsed.test.js
git commit -m "feat: add formatElapsed time-formatting helper"
```

---

### Task 2: Wire timer state into `App.jsx`

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `formatElapsed(ms: number) => string` from `src/formatElapsed.js` (Task 1).
- Produces: `elapsed` string (formatted via `formatElapsed(elapsedMs)`) passed as a prop to `ScoreBar` (Task 3) and `ResultsScreen` (Task 4).

This task has no isolated unit test of its own — `App.jsx` is not currently under test (there's no `App.test.jsx` in the repo), and the timer's interval-driven behavior is verified manually in the browser per Step 4 below. Tasks 3 and 4 add the prop plumbing this depends on; do this task first since `ScoreBar`/`ResultsScreen` need a real `elapsed` value to receive.

- [ ] **Step 1: Add timer state and import**

In `src/App.jsx`, add the import at the top alongside the other local imports:

```js
import { formatElapsed } from './formatElapsed'
```

Add new state right after the existing `reviewEntry` state (`src/App.jsx:26`):

```js
  const [reviewEntry, setReviewEntry] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
```

- [ ] **Step 2: Start/reset the clock in `play()`**

Modify `play()` (`src/App.jsx:56-62`) to reset the clock alongside its existing resets:

```js
  function play(rounds) {
    setTotalRounds(rounds)
    setRound(1)
    setScore(0)
    setHistory([])
    setStartedAt(Date.now())
    setElapsedMs(0)
    startRound()
  }
```

- [ ] **Step 3: Add the ticking effect**

Add a new `useEffect` after the `loadPool` effect (`src/App.jsx:40-42`):

```js
  useEffect(() => {
    if (startedAt === null || phase === 'results') return
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, phase])
```

This runs whenever `startedAt` is set and `phase` isn't `results` — covering `loading`, `playing`, and `revealed` phases across every round. It re-subscribes on phase changes but keeps ticking from the same `startedAt`, so elapsed time is continuous across rounds. When `phase` becomes `'results'`, the effect's condition short-circuits (no new interval is scheduled) and the previous interval's cleanup fires, freezing `elapsedMs` at its last-set value (at most ~1s stale — acceptable for a session-length stopwatch per the spec).

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`

- Open the app, click Play. Confirm no console errors.
- (Wiring for display comes in Tasks 3–4; for now just confirm the app still loads and plays through a full session without errors, since `elapsedMs` isn't rendered anywhere yet.)

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: track session elapsed time in App state"
```

---

### Task 3: Display live elapsed time in `ScoreBar`

**Files:**
- Modify: `src/components/ScoreBar.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `elapsed: string` prop (already computed via `formatElapsed(elapsedMs)` from Task 2's state).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the `elapsed` prop to `ScoreBar`**

Replace the full contents of `src/components/ScoreBar.jsx`:

```jsx
export default function ScoreBar({ round, totalRounds, score, elapsed }) {
  return (
    <div className="score-bar">
      <span>Round {round} / {totalRounds}</span>
      <span>Time: {elapsed}</span>
      <span>Score: {score}</span>
    </div>
  )
}
```

- [ ] **Step 2: Pass `elapsed` from `App.jsx`**

In `src/App.jsx`, find the `<ScoreBar>` usage (`src/App.jsx:163`):

```jsx
        <ScoreBar round={round} totalRounds={totalRounds} score={score} />
```

Replace with:

```jsx
        <ScoreBar round={round} totalRounds={totalRounds} score={score} elapsed={formatElapsed(elapsedMs)} />
```

- [ ] **Step 3: Manual verification in the browser**

Run: `npm run dev`

- Click Play, confirm the score bar shows "Round 1 / N", "Time: 0:00", "Score: 0".
- Wait a few seconds without answering; confirm the time ticks up once per second.
- Answer a round and move to the next; confirm the timer keeps counting continuously (does not reset per round).

- [ ] **Step 4: Commit**

```bash
git add src/components/ScoreBar.jsx src/App.jsx
git commit -m "feat: show live elapsed time in score bar"
```

---

### Task 4: Display final elapsed time on `ResultsScreen`

**Files:**
- Modify: `src/components/ResultsScreen.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `elapsed: string` prop (`formatElapsed(elapsedMs)` from Task 2's state, frozen once `phase === 'results'`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the `elapsed` prop to `ResultsScreen`**

Replace the full contents of `src/components/ResultsScreen.jsx`:

```jsx
function message(score) {
  if (score >= 90) return 'Pokémon Master!'
  if (score >= 60) return 'Great job, trainer!'
  if (score >= 30) return 'Keep training!'
  return 'Better luck next time!'
}

export default function ResultsScreen({ score, maxScore, elapsed, trainerType, onPlayAgain }) {
  return (
    <div className="screen results-screen">
      <h1>Game Over</h1>
      <p className="final-score">{score} / {maxScore}</p>
      <p className="final-time">Time: {elapsed}</p>
      <p>{message(score)}</p>
      {trainerType && (
        <p className="trainer-type">
          You are the <span>{trainerType}</span>-type Pokémon Trainer!
        </p>
      )}
      <button className="primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add a style for `.final-time`**

In `src/App.css`, right after the `.final-score` rule (`src/App.css:362`):

```css
.final-score { font-size: 2.5rem; font-weight: 800; color: var(--accent); }

.final-time { font-size: 1.1rem; font-weight: 600; opacity: 0.85; margin: 0.25rem 0 0; }
```

- [ ] **Step 3: Pass `elapsed` from `App.jsx`**

In `src/App.jsx`, find the `<ResultsScreen>` usage (`src/App.jsx:137-142`):

```jsx
        <ResultsScreen
          score={score}
          maxScore={maxScore}
          trainerType={trainerType}
          onPlayAgain={goToStart}
        />
```

Replace with:

```jsx
        <ResultsScreen
          score={score}
          maxScore={maxScore}
          elapsed={formatElapsed(elapsedMs)}
          trainerType={trainerType}
          onPlayAgain={goToStart}
        />
```

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`

- Play a full session (pick 5 rounds to keep it quick) through to the Results screen.
- Confirm "Time: M:SS" appears under the final score and matches roughly what was ticking in the score bar during the last round.
- Confirm the time on the score bar does **not** keep changing once Results is shown (frozen).
- Click "Play Again", start a new session, confirm the score bar timer resets to `0:00` and starts counting from there.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultsScreen.jsx src/App.jsx src/App.css
git commit -m "feat: show final elapsed time on results screen"
```

---

### Task 5: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All tests pass, including the 5 new `formatElapsed` tests.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Full manual playthrough**

Run: `npm run dev`

- Start a session, confirm the timer ticks live in the score bar throughout.
- Finish the session, confirm the final time freezes correctly on Results.
- Click "Play Again" and start a second session, confirm the timer resets and behaves identically.
- Open the browser console throughout; confirm no errors or warnings related to the timer.

- [ ] **Step 4: Commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found in session timer verification pass"
```

(Skip this step if no fixups were needed.)
