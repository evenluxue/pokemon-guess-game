import { DIFFICULTY_LEVELS } from '../pokeapi'

export default function DifficultyScreen({ onSelect, onPreview }) {
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Choose your trainer level.</p>
      <div className="difficulty-select">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
          <div key={key} className="difficulty-card">
            <button className="difficulty-btn" onClick={() => onSelect(key)}>
              <span className="difficulty-label">{level.label}</span>
              <span className="difficulty-subtitle">{level.subtitle}</span>
            </button>
            <button className="roster-link" onClick={() => onPreview(key)}>
              👀 See all Pokémon in this level
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
