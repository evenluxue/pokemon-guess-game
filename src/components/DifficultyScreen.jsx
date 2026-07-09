import { DIFFICULTY_LEVELS } from '../pokeapi'

export default function DifficultyScreen({ onSelect }) {
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Choose your trainer level.</p>
      <div className="difficulty-select">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
          <button key={key} className="difficulty-btn" onClick={() => onSelect(key)}>
            <span className="difficulty-label">{level.label}</span>
            <span className="difficulty-subtitle">{level.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
