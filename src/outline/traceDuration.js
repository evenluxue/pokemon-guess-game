/**
 * Map an outline's total length (in viewBox units) to a draw duration in
 * seconds, so complex shapes draw slower than simple ones, clamped to [min, max].
 */
export function traceDuration(length, { speed = 350, min = 5, max = 10 } = {}) {
  const raw = length / speed
  return Math.min(max, Math.max(min, raw))
}
