export function scoreRound(correct, hintsUsed) {
  if (!correct) return 0
  return Math.max(1, 10 - 2 * hintsUsed)
}
