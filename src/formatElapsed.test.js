import { describe, it, expect } from 'vitest'
import { formatElapsed } from './formatElapsed'

describe('formatElapsed', () => {
  it('formats zero as 0:00', () => {
    expect(formatElapsed(0)).toBe('0:00')
  })

  it('formats sub-minute durations with zero-padded seconds', () => {
    expect(formatElapsed(5000)).toBe('0:05')
    expect(formatElapsed(45000)).toBe('0:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatElapsed(65000)).toBe('1:05')
    expect(formatElapsed(605000)).toBe('10:05')
  })

  it('truncates partial seconds down', () => {
    expect(formatElapsed(65999)).toBe('1:05')
  })

  it('does not zero-pad minutes', () => {
    expect(formatElapsed(3661000)).toBe('61:01')
  })
})
