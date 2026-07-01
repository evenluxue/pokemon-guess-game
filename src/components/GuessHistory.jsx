export default function GuessHistory({ history, onSelect }) {
  return (
    <div className="history-panel">
      <h2 className="history-title">History</h2>
      {history.length === 0 ? (
        <p className="history-empty">No guesses yet</p>
      ) : (
        <>
          {onSelect && <p className="history-hint">Tap a round to review</p>}
          <ul className="history-list">
            {history.map((h) => {
              const className =
                'history-item ' + (h.correct ? 'hit' : 'miss') + (onSelect ? ' clickable' : '')
              const content = (
                <>
                  <span className="history-icon">{h.correct ? '✓' : '✗'}</span>
                  <span className="history-name">{h.name}</span>
                  <span className="history-points">
                    {h.points > 0 ? `+${h.points}` : h.points}
                  </span>
                </>
              )
              return (
                <li key={h.round}>
                  {onSelect ? (
                    <button className={className} onClick={() => onSelect(h)}>
                      {content}
                    </button>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
