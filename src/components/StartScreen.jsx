export default function StartScreen({ onStart }) {
  return (
    <div className="screen start-screen">
      <h1>Who's That Pokémon?</h1>
      <p>Guess the Gen 1 Pokémon from its silhouette.</p>
      <p>10 rounds. +10 per correct answer. Hints cost 2 points each.</p>
      <button className="primary" onClick={onStart}>
        Play
      </button>
    </div>
  )
}
