const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const API_BASE = 'https://pokeapi.co/api/v2'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function spriteUrl(id) {
  return `${SPRITE_BASE}/${id}.png`
}

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`)
  return res.json()
}

export async function fetchPokemonDetails(id) {
  const [pokemon, species] = await Promise.all([
    getJson(`${API_BASE}/pokemon/${id}`),
    getJson(`${API_BASE}/pokemon-species/${id}`),
  ])
  const englishGenus = species.genera.find((g) => g.language.name === 'en')
  return {
    id: pokemon.id,
    name: capitalize(pokemon.name),
    types: pokemon.types.map((t) => capitalize(t.type.name)),
    genus: englishGenus ? englishGenus.genus : 'Unknown Pokémon',
    spriteUrl: spriteUrl(id),
  }
}

export async function fetchPokemonRange(offset, limit) {
  const data = await getJson(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`)
  return data.results.map((entry, index) => ({
    id: offset + index + 1,
    name: capitalize(entry.name),
  }))
}

export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner Trainer', subtitle: 'Gen 1 · Kanto', offset: 0, limit: 151 },
  advanced: { label: 'Advanced Trainer', subtitle: 'Gen 1–3 · Kanto to Hoenn', offset: 0, limit: 386 },
  master: { label: 'Master Trainer', subtitle: 'Gen 4–9 · Sinnoh onward', offset: 386, limit: 639 },
}
