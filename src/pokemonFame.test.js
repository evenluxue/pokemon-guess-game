import { describe, it, expect } from 'vitest'
import { BEGINNER_IDS, ADVANCED_IDS, MASTER_PREVIEW_IDS, TOTAL_POKEMON } from './pokemonFame'

describe('pokemonFame data', () => {
  it('has no duplicate IDs within BEGINNER_IDS', () => {
    expect(new Set(BEGINNER_IDS).size).toBe(BEGINNER_IDS.length)
  })

  it('has no duplicate IDs within ADVANCED_IDS', () => {
    expect(new Set(ADVANCED_IDS).size).toBe(ADVANCED_IDS.length)
  })

  it('has no duplicate IDs within MASTER_PREVIEW_IDS', () => {
    expect(new Set(MASTER_PREVIEW_IDS).size).toBe(MASTER_PREVIEW_IDS.length)
  })

  it('has no ID appearing in both BEGINNER_IDS and ADVANCED_IDS', () => {
    const beginnerSet = new Set(BEGINNER_IDS)
    const overlap = ADVANCED_IDS.filter((id) => beginnerSet.has(id))
    expect(overlap).toEqual([])
  })

  it('has no ID in MASTER_PREVIEW_IDS that also appears in BEGINNER_IDS or ADVANCED_IDS', () => {
    const claimedSet = new Set([...BEGINNER_IDS, ...ADVANCED_IDS])
    const overlap = MASTER_PREVIEW_IDS.filter((id) => claimedSet.has(id))
    expect(overlap).toEqual([])
  })

  it('keeps every ID within the valid dex range', () => {
    for (const id of [...BEGINNER_IDS, ...ADVANCED_IDS, ...MASTER_PREVIEW_IDS]) {
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThanOrEqual(TOTAL_POKEMON)
    }
  })

  it('roughly matches the intended tier sizes', () => {
    expect(BEGINNER_IDS.length).toBeGreaterThan(30)
    expect(BEGINNER_IDS.length).toBeLessThan(60)
    expect(ADVANCED_IDS.length).toBeGreaterThan(150)
    expect(ADVANCED_IDS.length).toBeLessThan(250)
    expect(MASTER_PREVIEW_IDS.length).toBeGreaterThan(100)
    expect(MASTER_PREVIEW_IDS.length).toBeLessThan(140)
  })
})
