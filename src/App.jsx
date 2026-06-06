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
