import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { fetchGen1List, fetchPokemonDetails } from './pokeapi'
import { pickRound, scoreRound, bestType } from './gameLogic'
import { formatElapsed } from './formatElapsed'
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
  const [pool, setPool] = useState(null) // [{id, name}]
  const [loadError, setLoadError] = useState(false)
  const [phase, setPhase] = useState('start') // start | loading | playing | revealed | results
  const [totalRounds, setTotalRounds] = useState(10)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [current, setCurrent] = useState(null) // {details, options}
  const [hintsUsed, setHintsUsed] = useState(0)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([]) // [{ round, name, types, spriteUrl, guess, correct, points }]
  const [reviewEntry, setReviewEntry] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const maxScore = totalRounds * 10

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

  useEffect(() => {
    if (startedAt === null || phase === 'results') return
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, phase])

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

  function play(rounds) {
    setTotalRounds(rounds)
    setRound(1)
    setScore(0)
    setHistory([])
    setStartedAt(Date.now())
    setElapsedMs(0)
    startRound()
  }

  function goToStart() {
    setReviewEntry(null)
    setPhase('start')
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
    setPhase('revealed')
  }

  function next() {
    if (round >= totalRounds) {
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
