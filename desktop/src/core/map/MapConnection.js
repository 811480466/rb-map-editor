import RomEntity from "../rom/RomEntity"

export default class MapConnection extends RomEntity {
  /** @type {number} */
  index = 0

  /** @type {number} */
  direction = 0

  /** @type {number} */
  displacement = 0

  /** @type {number} */
  mapGroup = 0

  /** @type {number} */
  mapNum = 0

  /** @type {import("./MapHeader").default | null} */
  targetMap = null

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{
   *   profile?: import("../rom/RomProfile").default,
   *   size?: number,
   *   index?: number,
   *   direction?: number,
   *   displacement?: number,
   *   connectionOffset?: number,
   *   mapGroup?: number,
   *   mapNum?: number
   * }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.index = options.index ?? 0
    this.direction = options.direction ?? 0
    this.displacement = options.displacement ?? options.connectionOffset ?? 0
    this.mapGroup = options.mapGroup ?? 0
    this.mapNum = options.mapNum ?? 0
  }

  /** @returns {number} */
  get connectionOffset() {
    return this.displacement
  }

  /** @param {number} value */
  set connectionOffset(value) {
    this.displacement = value
  }

  /** @returns {string} */
  get targetKey() {
    return `${this.mapGroup}:${this.mapNum}`
  }
}
