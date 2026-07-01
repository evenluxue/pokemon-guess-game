const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ccc"/></svg>'

export default function PokemonSilhouette({ src, revealed, correct, wrong, alt }) {
  return (
    <div className="silhouette-wrap">
      <img
        className={revealed ? 'silhouette revealed' : 'silhouette'}
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon'}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
      />
      {correct && <div className="stamp correct-stamp">Correct!</div>}
      {wrong && <div className="stamp wrong-stamp">Oops!</div>}
    </div>
  )
}
