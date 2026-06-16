import { POKEMON_SPECIES_DATA } from "./PokemonSpeciesData"

function flattenPokemonSpeciesData(input, output = []) {
  if (!input) return output

  if (Array.isArray(input)) {
    for (const item of input) flattenPokemonSpeciesData(item, output)
    return output
  }

  if (typeof input !== "object") return output

  const id = Number(input.id)
  if (Number.isInteger(id)) {
    output.push({
      ...input,
      id,
    })
    return output
  }

  for (const [key, value] of Object.entries(input)) {
    if (!value || typeof value !== "object") continue

    const fallbackId = Number(value.id ?? key)
    if (Number.isInteger(fallbackId)) {
      output.push({
        ...value,
        id: fallbackId,
      })
    }
  }

  return output
}

export function normalizePokemonSpeciesData(data = POKEMON_SPECIES_DATA) {
  const seen = new Set()
  return flattenPokemonSpeciesData(data)
    .filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .sort((left, right) => left.id - right.id)
}

export const POKEMON_SPECIES = Object.freeze(normalizePokemonSpeciesData())

export const POKEMON_SPECIES_BY_ID = new Map(
  POKEMON_SPECIES.map(item => [item.id, item]),
)

export function getPokemonSpeciesById(id) {
  return POKEMON_SPECIES_BY_ID.get(Number(id)) || null
}

export function formatPokemonSpeciesLabel(species) {
  const item = typeof species === "object" && species !== null
    ? species
    : getPokemonSpeciesById(species)
  const id = Number(item?.id ?? species)
  const paddedId = Number.isInteger(id) ? String(id).padStart(4, "0") : "????"
  const name = item?.name || item?.code || "Unknown"
  const code = item?.code ? ` / ${item.code}` : ""
  return `#${paddedId} ${name}${code}`
}

export function createPokemonSpeciesOptions(speciesList = POKEMON_SPECIES) {
  return speciesList.map(item => ({
    value: item.id,
    label: formatPokemonSpeciesLabel(item),
  }))
}

export const POKEMON_SPECIES_OPTIONS = Object.freeze(createPokemonSpeciesOptions())
