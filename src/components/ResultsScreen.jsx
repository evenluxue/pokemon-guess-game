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
