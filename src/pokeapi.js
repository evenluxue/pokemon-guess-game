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

const TYPE_NAMES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy',
]

// Building a name -> types[] map from the 18 /type endpoints (each lists every
// Pokémon of that type) is a fixed ~18 requests, regardless of how many
// Pokémon we need types for — much cheaper than fetching each one individually.
export async function fetchTypeMap() {
  const typeResponses = await Promise.all(
    TYPE_NAMES.map((type) => getJson(`${API_BASE}/type/${type}`))
  )
  const map = {}
  for (const data of typeResponses) {
    const typeName = capitalize(data.name)
    for (const { pokemon } of data.pokemon) {
      const name = capitalize(pokemon.name)
      if (!map[name]) map[name] = []
      map[name].push(typeName)
    }
  }
  return map
}

export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner Trainer', subtitle: 'The famous faces' },
  advanced: { label: 'Advanced Trainer', subtitle: 'Solid fan favorites' },
  master: { label: 'Master Trainer', subtitle: 'Deep-cut Pokédex' },
}
