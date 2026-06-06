const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
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

export async function fetchGen1List() {
  const data = await getJson(`${API_BASE}/pokemon?limit=151&offset=0`)
  return data.results.map((entry, index) => ({
    id: index + 1,
    name: capitalize(entry.name),
  }))
}
