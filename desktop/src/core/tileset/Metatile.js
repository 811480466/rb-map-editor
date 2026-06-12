export default class Metatile {
  /** @type {number} */
  id = 0

  /** @type {number[]} */
  rawTiles = []

  /** @type {import("./MetatileAttribute").default | null} */
  attribute = null

  /**
   * @param {{ id?: number, rawTiles?: number[], attribute?: import("./MetatileAttribute").default | null }} options
   */
  constructor(options = {}) {
    this.id = options.id ?? 0
    this.rawTiles = [...(options.rawTiles || [])]
    this.attribute = options.attribute || null
  }
}
