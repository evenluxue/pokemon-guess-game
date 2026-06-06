export default function HintPanel({ hints, onGetHint, disabled }) {
  return (
    <div className="hint-panel">
      <button className="hint-btn" onClick={onGetHint} disabled={disabled}>
        Get a hint (−2)
      </button>
      <ul className="hint-list">
        {hints.map((hint, i) => (
          <li key={i}>{hint}</li>
        ))}
      </ul>
    </div>
  )
}
