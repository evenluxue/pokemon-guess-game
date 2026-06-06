import { describe, it, expect, vi, afterEach } from 'vitest'
import { spriteUrl, fetchPokemonDetails } from './pokeapi'

afterEach(() => vi.restoreAllMocks())

describe('spriteUrl', () => {
  it('builds the official sprite URL from an id', () => {
    expect(spriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
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
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    })
  })
})
