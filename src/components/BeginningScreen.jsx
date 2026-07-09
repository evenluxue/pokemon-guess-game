import { useState } from 'react'
import DifficultyScreen from './DifficultyScreen'
import WorldIntroScreen from './WorldIntroScreen'

export default function BeginningScreen({ onSelect, onPreview }) {
  const [tab, setTab] = useState('play')
  return (
    <div className="beginning-wrap">
      <div className="tab-bar">
        <button
          className={tab === 'play' ? 'tab-btn selected' : 'tab-btn'}
          onClick={() => setTab('play')}
        >
          🎮 Play
        </button>
        <button
          className={tab === 'world' ? 'tab-btn selected' : 'tab-btn'}
          onClick={() => setTab('world')}
        >
          📖 Pokémon World
        </button>
      </div>
      {tab === 'play' ? (
        <DifficultyScreen onSelect={onSelect} onPreview={onPreview} />
      ) : (
        <WorldIntroScreen />
      )}
    </div>
  )
}
