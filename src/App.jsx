import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'
import { fetchPokemonRange, fetchPokemonDetails, DIFFICULTY_LEVELS } from './pokeapi'
import { pickRound, scoreRound, bestType, pickAnswerEntry } from './gameLogic'
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
  const startRound = useCallback(async (activePool, excludeName) => {
    setPhase('loading')
    setHintsUsed(0)
    setSelected(null)
    setIntervalStart(Date.now())
    const names = activePool.map((p) => p.name)
    const answerEntry = pickAnswerEntry(activePool, excludeName)
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

  function skip() {
    const activeMs = intervalStart === null ? 0 : Date.now() - intervalStart
    const newAccumulated = accumulatedMs + activeMs
    setAccumulatedMs(newAccumulated)
    setElapsedMs(newAccumulated)
    startRound(pool, current.details.name)
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
      {!answered && (
        <button className="skip-btn" onClick={skip}>
          ⏭ Skip this one
        </button>
      )}
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
