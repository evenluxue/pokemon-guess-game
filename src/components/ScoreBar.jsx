export default function ScoreBar({ round, totalRounds, score, elapsed }) {
  return (
    <div className="score-bar">
      <span>Round {round} / {totalRounds}</span>
      <span>Time: {elapsed}</span>
      <span>Score: {score}</span>
    </div>
  )
}
