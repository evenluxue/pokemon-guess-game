export function scoreRound(correct, hintsUsed) {
  if (!correct) return 0
  return Math.max(1, 10 - 2 * hintsUsed)
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRound(pool, answer) {
  const distractors = shuffle(pool.filter((name) => name !== answer)).slice(0, 3)
  const options = shuffle([answer, ...distractors])
  return { answer, options }
}
