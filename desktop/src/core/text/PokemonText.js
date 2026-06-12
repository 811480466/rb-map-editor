export default class PokemonText {
  /** @type {number} */
  pointer = 0

  /** @type {number | null} */
  offset = null

  /** @type {Uint8Array | null} */
  bytes = null

  /** @type {string} */
  value = ""

  /**
   * @param {{ pointer?: number, offset?: number | null, bytes?: Uint8Array | null, value?: string }} options
   */
  constructor(options = {}) {
    this.pointer = options.pointer ?? 0
    this.offset = options.offset ?? null
    this.bytes = options.bytes || null
    this.value = options.value || ""
  }
}
