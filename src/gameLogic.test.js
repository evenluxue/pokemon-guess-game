import { describe, it, expect } from 'vitest'
import { scoreRound, pickRound, bestType } from './gameLogic'

describe('scoreRound', () => {
  it('awards 10 for a correct answer with no hints', () => {
    expect(scoreRound(true, 0)).toBe(10)
  })

  it('subtracts 2 per hint used on a correct answer', () => {
    expect(scoreRound(true, 1)).toBe(8)
    expect(scoreRound(true, 2)).toBe(6)
  })

  it('floors a correct answer at 1 even with all 3 hints', () => {
    expect(scoreRound(true, 3)).toBe(4)
  })

  it('returns 0 for a wrong answer regardless of hints', () => {
    expect(scoreRound(false, 0)).toBe(0)
    expect(scoreRound(false, 3)).toBe(0)
  })
})

describe('pickRound', () => {
  const pool = ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Jigglypuff', 'Meowth']

  it('returns exactly 4 options', () => {
    const { options } = pickRound(pool, 'Pikachu')
    expect(options).toHaveLength(4)
  })

  it('includes the answer among the options', () => {
    const { options, answer } = pickRound(pool, 'Pikachu')
    expect(answer).toBe('Pikachu')
    expect(options).toContain('Pikachu')
  })

  it('returns 4 unique options', () => {
    const { options } = pickRound(pool, 'Pikachu')
    expect(new Set(options).size).toBe(4)
  })

  it('only uses names from the pool', () => {
    const { options } = pickRound(pool, 'Pikachu')
    options.forEach((name) => expect(pool).toContain(name))
  })
})

describe('bestType', () => {
  it('returns null for empty history', () => {
    expect(bestType([])).toBe(null)
  })

  it('returns null when no guesses were correct', () => {
    const history = [
      { types: ['Fire'], correct: false },
      { types: ['Water'], correct: false },
    ]
    expect(bestType(history)).toBe(null)
  })

  it('returns the type with the highest correct rate', () => {
    const history = [
      { types: ['Fire'], correct: true },
      { types: ['Fire'], correct: true },
      { types: ['Water'], correct: false },
      { types: ['Grass'], correct: true },
      { types: ['Grass'], correct: false },
    ]
    // Fire 2/2 = 1.0 beats Grass 1/2 and Water 0/1
    expect(bestType(history)).toBe('Fire')
  })

  it('breaks rate ties by number of appearances', () => {
    const history = [
      { types: ['Electric'], correct: true }, // Electric 1/1 = 1.0
      { types: ['Rock'], correct: true }, // Rock 2/2 = 1.0
      { types: ['Rock'], correct: true },
    ]
    expect(bestType(history)).toBe('Rock')
  })

  it('counts each type of a dual-type Pokémon', () => {
    const history = [{ types: ['Water', 'Flying'], correct: true }]
    // both 1/1; full tie resolves alphabetically -> Flying
    expect(bestType(history)).toBe('Flying')
  })
})
