import { describe, it, expect, vi, afterEach } from 'vitest'
import { spriteUrl, fetchPokemonDetails, fetchPokemonRange, DIFFICULTY_LEVELS } from './pokeapi'

afterEach(() => vi.restoreAllMocks())

describe('spriteUrl', () => {
  it('builds the official sprite URL from an id', () => {
    expect(spriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    )
  })
})

describe('fetchPokemonDetails', () => {
  it('shapes the API response into name, types, genus, spriteUrl', async () => {
    const pokemonResponse = {
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
    }
    const speciesResponse = {
      genera: [
        { genus: 'Seed Pokémon', language: { name: 'fr' } },
        { genus: 'Mouse Pokémon', language: { name: 'en' } },
      ],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(url.includes('/pokemon-species/') ? speciesResponse : pokemonResponse),
        })
      )
    )

    const details = await fetchPokemonDetails(25)
    expect(details).toEqual({
      id: 25,
      name: 'Pikachu',
      types: ['Electric'],
      genus: 'Mouse Pokémon',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    })
  })
})

describe('fetchPokemonRange', () => {
  it('returns {id, name} entries starting at offset+1', async () => {
    const results = Array.from({ length: 151 }, (_, i) => ({
      name: `mon${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchPokemonRange(0, 151)
    expect(list).toHaveLength(151)
    expect(list[0]).toEqual({ id: 1, name: 'Mon1' })
    expect(list[24]).toEqual({ id: 25, name: 'Mon25' })
  })

  it('offsets ids for a non-zero offset', async () => {
    const results = Array.from({ length: 639 }, (_, i) => ({
      name: `mon${387 + i}`,
      url: `https://pokeapi.co/api/v2/pokemon/${387 + i}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchPokemonRange(386, 639)
    expect(list).toHaveLength(639)
    expect(list[0]).toEqual({ id: 387, name: 'Mon387' })
    expect(list[1]).toEqual({ id: 388, name: 'Mon388' })
  })
})

describe('DIFFICULTY_LEVELS', () => {
  it('defines beginner, advanced, and master with label and subtitle', () => {
    expect(DIFFICULTY_LEVELS.beginner).toEqual({
      label: 'Beginner Trainer',
      subtitle: 'The famous faces',
    })
    expect(DIFFICULTY_LEVELS.advanced).toEqual({
      label: 'Advanced Trainer',
      subtitle: 'Solid fan favorites',
    })
    expect(DIFFICULTY_LEVELS.master).toEqual({
      label: 'Master Trainer',
      subtitle: 'Deep-cut Pokédex',
    })
  })
})
