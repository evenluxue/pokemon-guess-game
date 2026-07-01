import { describe, it, expect } from 'vitest'
import { traceDuration } from './traceDuration'

describe('traceDuration', () => {
  it('clamps very short outlines up to the 8s minimum', () => {
    expect(traceDuration(0)).toBe(8)
    expect(traceDuration(10)).toBe(8)
  })

  it('clamps very long outlines down to the 16s maximum', () => {
    expect(traceDuration(100000)).toBe(16)
  })

  it('scales linearly between the bounds', () => {
    // speed 200 units/s -> length 2400 => 12s (within [8, 16])
    expect(traceDuration(2400)).toBeCloseTo(12, 5)
  })

  it('honors an overridden speed', () => {
    // 1100 / 100 = 11s (within [8, 16])
    expect(traceDuration(1100, { speed: 100 })).toBe(11)
  })
})
