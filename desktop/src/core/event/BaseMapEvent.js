import RomEntity from "../rom/RomEntity"

export default class BaseMapEvent extends RomEntity {
  /** @type {number} */
  index = 0

  /** @type {number} */
  x = 0

  /** @type {number} */
  y = 0

  /** @type {number} */
  elevation = 0

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{
   *   profile?: import("../rom/RomProfile").default,
   *   size?: number,
   *   index?: number,
   *   x?: number,
   *   y?: number,
   *   elevation?: number
   * }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.index = options.index ?? 0
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.elevation = options.elevation ?? 0
  }
}
