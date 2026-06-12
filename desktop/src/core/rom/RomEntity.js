export default class RomEntity {
  /** @type {import("./Rom").default | null} */
  rom = null

  /** @type {import("./RomProfile").default | null} */
  profile = null

  /** @type {number | null} */
  offset = null

  /** @type {number} */
  size = 0

  /** @type {boolean} */
  initialized = false

  /**
   * @param {import("./Rom").default | null} rom
   * @param {number | null} offset
   * @param {{ profile?: import("./RomProfile").default | null, size?: number }} options
   */
  constructor(rom = null, offset = null, options = {}) {
    this.rom = rom
    this.profile = options.profile || null
    this.offset = offset
    this.size = options.size ?? 0
  }

  /**
   * @returns {this}
   */
  initialize() {
    this.initialized = true
    return this
  }

  /**
   * @returns {this}
   */
  reload() {
    this.initialized = false
    return this.initialize()
  }

  /**
   * @returns {import("./Rom").default}
   */
  requireRom() {
    if (!this.rom) {
      throw new Error(`${this.constructor.name} requires a Rom instance`)
    }

    return this.rom
  }
}
