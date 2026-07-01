/**
 * Map an outline's total length (in viewBox units) to a draw duration in
 * seconds, so complex shapes draw slower than simple ones, clamped to [min, max].
 */
export function traceDuration(length, { speed = 200, min = 8, max = 16 } = {}) {
  const raw = length / speed
  return Math.min(max, Math.max(min, raw))
}
