import { describe, it, expect } from 'vitest'
import { traceDuration } from './traceDuration'

describe('traceDuration', () => {
  it('clamps very short outlines up to the 5s minimum', () => {
    expect(traceDuration(0)).toBe(5)
    expect(traceDuration(10)).toBe(5)
  })

  it('clamps very long outlines down to the 10s maximum', () => {
    expect(traceDuration(100000)).toBe(10)
  })

  it('scales linearly between the bounds', () => {
    // default speed 350 units/s -> length 2450 => 7s
    expect(traceDuration(2450)).toBeCloseTo(7, 5)
  })

  it('honors an overridden speed', () => {
    expect(traceDuration(700, { speed: 100 })).toBe(7)
  })
})
