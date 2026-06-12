export default class MapBlock {
  /** @type {number} */
  x = 0

  /** @type {number} */
  y = 0

  /** @type {number} */
  raw = 0

  /** @type {number} */
  metatileId = 0

  /** @type {number} */
  collision = 0

  /** @type {number} */
  elevation = 0

  /**
   * @param {{ x?: number, y?: number, raw?: number }} options
   */
  constructor(options = {}) {
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.setRaw(options.raw ?? 0)
  }

  /**
   * @param {number} raw
   * @returns {this}
   */
  setRaw(raw) {
    this.raw = raw & 0xffff
    this.metatileId = this.raw & 0x03ff
    this.collision = (this.raw >> 10) & 0x03
    this.elevation = (this.raw >> 12) & 0x0f
    return this
  }

  /**
   * @returns {number}
   */
  rebuildRaw() {
    this.raw = (
      (this.metatileId & 0x03ff) |
      ((this.collision & 0x03) << 10) |
      ((this.elevation & 0x0f) << 12)
    )
    return this.raw
  }
}
