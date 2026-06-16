export default class WildPokemonSlot {
  /** @type {import("./WildEncounterGroup").default | null} */
  group = null

  /** @type {number} */
  index = 0

  /** @type {number | null} */
  offset = null

  /** @type {string} */
  kind = ""

  /** @type {number} */
  minLevel = 0

  /** @type {number} */
  maxLevel = 0

  /** @type {number} */
  pokemonId = 0

  /** @type {number} */
  speciesId = 0

  /** @type {number} */
  rate = 0

  /**
   * @param {{
   *   group?: import("./WildEncounterGroup").default | null,
   *   index?: number,
   *   offset?: number | null,
   *   kind?: string,
   *   minLevel?: number,
   *   maxLevel?: number,
   *   pokemonId?: number,
   *   speciesId?: number,
   *   rate?: number
   * }} options
   */
  constructor(options = {}) {
    this.group = options.group || null
    this.index = options.index ?? 0
    this.offset = options.offset ?? null
    this.kind = options.kind || ""
    this.minLevel = options.minLevel ?? 0
    this.maxLevel = options.maxLevel ?? 0
    this.pokemonId = options.pokemonId ?? options.speciesId ?? 0
    this.speciesId = this.pokemonId
    this.rate = options.rate ?? 0
  }

  /**
   * @param {{ minLevel?: number, maxLevel?: number, pokemonId?: number, speciesId?: number }} values
   * @returns {this}
   */
  update(values = {}) {
    this.minLevel = values.minLevel ?? this.minLevel
    this.maxLevel = values.maxLevel ?? this.maxLevel
    this.pokemonId = values.pokemonId ?? values.speciesId ?? this.pokemonId
    this.speciesId = this.pokemonId
    return this
  }
}
