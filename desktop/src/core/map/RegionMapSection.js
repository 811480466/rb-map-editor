import RomEntity from "../rom/RomEntity"

export default class RegionMapSection extends RomEntity {
  /** @type {number} */
  id = 0

  /** @type {number} */
  namePointer = 0

  /** @type {number | null} */
  nameOffset = null

  /** @type {string} */
  name = ""

  /** @type {number} */
  x = 0

  /** @type {number} */
  y = 0

  /** @type {number} */
  width = 0

  /** @type {number} */
  height = 0

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, id?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.id = options.id ?? 0
  }
}
