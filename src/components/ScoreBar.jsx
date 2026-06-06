export default function ScoreBar({ round, totalRounds, score }) {
  return (
    <div className="score-bar">
      <span>Round {round} / {totalRounds}</span>
      <span>Score: {score}</span>
    </div>
  )
}
