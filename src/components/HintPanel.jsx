export default function HintPanel({ hints, onGetHint, disabled }) {
  return (
    <div className="hint-panel">
      <button className="hint-btn" onClick={onGetHint} disabled={disabled}>
        💡 Get a hint (−2)
      </button>
      <div className="hint-list">
        {hints.map((hint, i) => (
          <div className="hint-card" key={i}>
            <span className="hint-icon">💡</span>
            <span>{hint}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
