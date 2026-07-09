import { describe, it, expect } from 'vitest'
import {
  scoreRound,
  pickRound,
  bestType,
  pickAnswerEntry,
  poolForDifficulty,
  rosterPool,
  groupByType,
} from './gameLogic'

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

describe('pickAnswerEntry', () => {
  const pool = [
    { id: 1, name: 'Bulbasaur' },
    { id: 4, name: 'Charmander' },
    { id: 7, name: 'Squirtle' },
  ]

  it('returns an entry from the pool when no exclusion is given', () => {
    const entry = pickAnswerEntry(pool, null)
    expect(pool).toContain(entry)
  })

  it('never returns the excluded entry', () => {
    const twoEntryPool = [pool[0], pool[1]]
    for (let i = 0; i < 20; i++) {
      const entry = pickAnswerEntry(twoEntryPool, 'Bulbasaur')
      expect(entry).toEqual(pool[1])
    }
  })
})

describe('poolForDifficulty', () => {
  const allPokemon = [
    { id: 1, name: 'Bulbasaur' },
    { id: 2, name: 'Ivysaur' },
    { id: 3, name: 'Venusaur' },
    { id: 4, name: 'Charmander' },
    { id: 5, name: 'Charmeleon' },
  ]
  const beginnerIds = [1, 2]
  const advancedIds = [3, 4]

  it('returns only the beginner-tier entries for "beginner"', () => {
    const pool = poolForDifficulty(allPokemon, beginnerIds, advancedIds, 'beginner')
    expect(pool).toEqual([allPokemon[0], allPokemon[1]])
  })

  it('returns only the advanced-tier entries for "advanced"', () => {
    const pool = poolForDifficulty(allPokemon, beginnerIds, advancedIds, 'advanced')
    expect(pool).toEqual([allPokemon[2], allPokemon[3]])
  })

  it('returns everything not in beginner or advanced for "master"', () => {
    const pool = poolForDifficulty(allPokemon, beginnerIds, advancedIds, 'master')
    expect(pool).toEqual([allPokemon[4]])
  })
})

describe('rosterPool', () => {
  const allPokemon = [
    { id: 1, name: 'Bulbasaur' },
    { id: 2, name: 'Ivysaur' },
    { id: 3, name: 'Venusaur' },
    { id: 25, name: 'Pikachu' },
  ]

  it('returns only entries whose id is in the given list', () => {
    expect(rosterPool(allPokemon, [1, 25])).toEqual([allPokemon[0], allPokemon[3]])
  })

  it('returns an empty array when the id list matches nothing', () => {
    expect(rosterPool(allPokemon, [999])).toEqual([])
  })
})

describe('groupByType', () => {
  const pool = [
    { id: 1, name: 'Bulbasaur' },
    { id: 6, name: 'Charizard' },
    { id: 25, name: 'Pikachu' },
  ]
  const typeMap = {
    Bulbasaur: ['Grass', 'Poison'],
    Charizard: ['Fire', 'Flying'],
    Pikachu: ['Electric'],
  }

  it('groups each entry under every one of its types', () => {
    const groups = groupByType(pool, typeMap)
    expect(groups.Grass).toEqual([pool[0]])
    expect(groups.Poison).toEqual([pool[0]])
    expect(groups.Fire).toEqual([pool[1]])
    expect(groups.Flying).toEqual([pool[1]])
    expect(groups.Electric).toEqual([pool[2]])
  })

  it('sorts type keys alphabetically', () => {
    const groups = groupByType(pool, typeMap)
    expect(Object.keys(groups)).toEqual(['Electric', 'Fire', 'Flying', 'Grass', 'Poison'])
  })

  it('sorts entries within a type alphabetically by name', () => {
    const twoGrass = [
      { id: 1, name: 'Bulbasaur' },
      { id: 43, name: 'Oddish' },
    ]
    const grassTypeMap = { Bulbasaur: ['Grass'], Oddish: ['Grass'] }
    const groups = groupByType(twoGrass, grassTypeMap)
    expect(groups.Grass.map((p) => p.name)).toEqual(['Bulbasaur', 'Oddish'])
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
