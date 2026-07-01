import { describe, it, expect, vi, afterEach } from 'vitest'
import { spriteUrl, fetchPokemonDetails, fetchGen1List } from './pokeapi'

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

describe('fetchGen1List', () => {
  it('returns 151 {id, name} entries with capitalized names', async () => {
    const results = Array.from({ length: 151 }, (_, i) => ({
      name: `mon${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results }) }))
    )

    const list = await fetchGen1List()
    expect(list).toHaveLength(151)
    expect(list[0]).toEqual({ id: 1, name: 'Mon1' })
    expect(list[24]).toEqual({ id: 25, name: 'Mon25' })
  })
})
