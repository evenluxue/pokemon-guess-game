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

export function pickAnswerEntry(pool, excludeName) {
  const candidates = excludeName ? pool.filter((p) => p.name !== excludeName) : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function pickRound(pool, answer) {
  const distractors = shuffle(pool.filter((name) => name !== answer)).slice(0, 3)
  const options = shuffle([answer, ...distractors])
  return { answer, options }
}

// Given a round history of { types: string[], correct: boolean }, return the
// type the player guessed correctly at the highest rate. Ties break by more
// appearances, then more correct, then alphabetically. Returns null when no
// correct guesses exist.
export function bestType(history) {
  const stats = {}
  for (const entry of history) {
    for (const type of entry.types) {
      if (!stats[type]) stats[type] = { correct: 0, total: 0 }
      stats[type].total += 1
      if (entry.correct) stats[type].correct += 1
    }
  }

  let best = null
  for (const [type, { correct, total }] of Object.entries(stats)) {
    if (correct === 0) continue
    const candidate = { type, rate: correct / total, total, correct }
    if (best === null || isBetterType(candidate, best)) best = candidate
  }
  return best ? best.type : null
}

function isBetterType(a, b) {
  if (a.rate !== b.rate) return a.rate > b.rate
  if (a.total !== b.total) return a.total > b.total
  if (a.correct !== b.correct) return a.correct > b.correct
  return a.type < b.type
}
