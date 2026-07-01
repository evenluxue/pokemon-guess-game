import { NAMES_ZH } from '../pokemonNamesZh'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

export default function ReviewModal({ entry, onClose }) {
  const zh = NAMES_ZH[entry.name]
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="modal-round">Round {entry.round}</p>
        <img
          className="modal-img"
          src={entry.spriteUrl}
          alt={entry.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER
          }}
        />
        <h2 className="modal-name">
          {entry.name}
          {zh && <span className="modal-name-zh">{zh}</span>}
        </h2>
        <p className="modal-types">{entry.types.join(' · ')}</p>
        <p className={entry.correct ? 'modal-result hit' : 'modal-result miss'}>
          {entry.correct
            ? `✓ You got it!  (+${entry.points})`
            : `✗ You guessed ${entry.guess}  (${entry.points})`}
        </p>
      </div>
    </div>
  )
}
