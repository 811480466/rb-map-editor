export default class Palette {
  /** @type {number} */
  id = 0

  /** @type {number[]} */
  colors = []

  /**
   * @param {{ id?: number, colors?: number[] }} options
   */
  constructor(options = {}) {
    this.id = options.id ?? 0
    this.colors = [...(options.colors || [])]
  }

  /**
   * @param {number} index
   * @returns {number | null}
   */
  getColor(index) {
    return this.colors[index] ?? null
  }

  /**
   * @param {number} index
   * @param {number} color
   * @returns {this}
   */
  setColor(index, color) {
    this.colors[index] = color
    return this
  }
}
