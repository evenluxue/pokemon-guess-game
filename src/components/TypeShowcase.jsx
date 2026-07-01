const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

export default function TypeShowcase({ type, mons }) {
  if (!type || mons.length === 0) return null
  return (
    <div className="showcase-panel">
      <h2 className="showcase-title">Your {type}-type Pokémon</h2>
      <div className="showcase-grid">
        {mons.map((m) => (
          <div className="showcase-mon" key={m.name}>
            <img
              className="showcase-img"
              src={m.spriteUrl}
              alt={m.name}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER
              }}
            />
            <span className="showcase-name">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
