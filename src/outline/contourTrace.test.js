import { describe, it, expect } from 'vitest'
import { traceContours } from './contourTrace'

// helper: build an alpha grid from a string map (# = opaque, . = transparent)
function grid(rows) {
  const height = rows.length
  const width = rows[0].length
  const alpha = new Uint8ClampedArray(width * height)
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      alpha[y * width + x] = ch === '#' ? 255 : 0
    })
  })
  return { alpha, width, height }
}

describe('traceContours', () => {
  it('returns no contours for a fully transparent grid', () => {
    const { alpha, width, height } = grid(['...', '...', '...'])
    expect(traceContours(alpha, width, height, 128)).toEqual([])
  })

  it('traces the 8 border pixels of a solid 3x3 block', () => {
    const { alpha, width, height } = grid(['###', '###', '###'])
    const contours = traceContours(alpha, width, height, 128)
    expect(contours).toHaveLength(1)
    // 8 boundary pixels, center (1,1) excluded
    expect(contours[0]).toHaveLength(8)
    const hasCenter = contours[0].some((p) => p.x === 1 && p.y === 1)
    expect(hasCenter).toBe(false)
    // starts at the top-left opaque pixel
    expect(contours[0][0]).toEqual({ x: 0, y: 0 })
  })

  it('traces the perimeter of a solid 4x3 rectangle (10 pixels)', () => {
    const { alpha, width, height } = grid(['####', '####', '####'])
    const contours = traceContours(alpha, width, height, 128)
    expect(contours).toHaveLength(1)
    expect(contours[0]).toHaveLength(10) // 2*4 + 2*3 - 4
  })

  it('filters out a single stray pixel (loop too short)', () => {
    const { alpha, width, height } = grid(['...', '.#.', '...'])
    expect(traceContours(alpha, width, height, 128)).toEqual([])
  })
})
