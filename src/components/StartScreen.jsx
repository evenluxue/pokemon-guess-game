import { useState } from 'react'

const ROUND_OPTIONS = [5, 10, 15, 20]

export default function StartScreen({ onStart }) {
  const [rounds, setRounds] = useState(10)
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Guess the Gen 1 Pokémon from its silhouette.</p>
      <p>+10 per correct answer. Hints cost 2 points each.</p>
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
