import { useEffect, useState } from 'react'
import { fetchPokemonRange, fetchTypeMap, spriteUrl, DIFFICULTY_LEVELS } from '../pokeapi'
import { BEGINNER_IDS, ADVANCED_IDS, MASTER_PREVIEW_IDS, TOTAL_POKEMON } from '../pokemonFame'
import { rosterPool, groupByType } from '../gameLogic'
import { NAMES_ZH } from '../pokemonNamesZh'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

// Master's roster is capped to MASTER_PREVIEW_IDS so this page isn't
// rendering 700+ sprites at once — actual Master gameplay is unaffected.
const ROSTER_IDS = {
  beginner: BEGINNER_IDS,
  advanced: ADVANCED_IDS,
  master: MASTER_PREVIEW_IDS,
}

export default function RosterScreen({ difficultyKey, onBack }) {
  const [groups, setGroups] = useState(null) // null while loading
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPokemonRange(0, TOTAL_POKEMON), fetchTypeMap()])
      .then(([allPokemon, typeMap]) => {
        if (cancelled) return
        const pool = rosterPool(allPokemon, ROSTER_IDS[difficultyKey])
        setGroups(groupByType(pool, typeMap))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [difficultyKey])

  const level = DIFFICULTY_LEVELS[difficultyKey]

  return (
    <div className="screen roster-screen">
      <h1>{level.label} Roster</h1>
      <p>{level.subtitle}</p>
      <button className="link-btn" onClick={onBack}>‹ Back</button>
      {error && <p>Couldn't load the roster.</p>}
      {!error && !groups && <p>Loading…</p>}
      {groups &&
        Object.entries(groups).map(([type, mons]) => (
          <div key={type} className="roster-type-group">
            <h2 className="roster-type-title">{type}</h2>
            <div className="roster-grid">
              {mons.map((p) => (
                <div className="roster-mon" key={p.id}>
                  <img
                    className="roster-img"
                    src={spriteUrl(p.id)}
                    alt={p.name}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER
                    }}
                  />
                  <span className="roster-name">{p.name}</span>
                  {NAMES_ZH[p.name] && <span className="roster-zh">{NAMES_ZH[p.name]}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
