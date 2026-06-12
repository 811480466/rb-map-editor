export default class WildPokemonSlot {
  /** @type {number} */
  index = 0

  /** @type {number} */
  minLevel = 0

  /** @type {number} */
  maxLevel = 0

  /** @type {number} */
  pokemonId = 0

  /** @type {number} */
  rate = 0

  /**
   * @param {{ index?: number, minLevel?: number, maxLevel?: number, pokemonId?: number, rate?: number }} options
   */
  constructor(options = {}) {
    this.index = options.index ?? 0
    this.minLevel = options.minLevel ?? 0
    this.maxLevel = options.maxLevel ?? 0
    this.pokemonId = options.pokemonId ?? 0
    this.rate = options.rate ?? 0
  }
}
