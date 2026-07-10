function message(score, maxScore) {
  const pct = maxScore > 0 ? score / maxScore : 0
  if (pct >= 0.9) return 'Pokémon Master!'
  if (pct >= 0.6) return 'Great job, trainer!'
  if (pct >= 0.3) return 'Keep training!'
  return 'Better luck next time!'
}

export default function ResultsScreen({ score, maxScore, elapsed, trainerType, onPlayAgain, onHome }) {
  return (
    <div className="screen results-screen">
      <h1>Game Over</h1>
      <p className="final-score">{score} / {maxScore}</p>
      <p className="final-time">Time: {elapsed}</p>
      <p>{message(score, maxScore)}</p>
      {trainerType && (
        <p className="trainer-type">
          You are the <span>{trainerType}</span>-type Pokémon Trainer!
        </p>
      )}
      <button className="primary" onClick={onPlayAgain}>
        Play Again
      </button>
      <button className="link-btn" onClick={onHome}>
        🏠 Home
      </button>
    </div>
  )
}
