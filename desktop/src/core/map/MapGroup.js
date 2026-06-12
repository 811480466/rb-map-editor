import RomEntity from "../rom/RomEntity"

export default class MapGroup extends RomEntity {
  /** @type {number} */
  id = 0

  /** @type {number} */
  mapCount = 0

  /** @type {number[]} */
  headerPointers = []

  /** @type {import("./MapHeader").default[]} */
  maps = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, id?: number, mapCount?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.id = options.id ?? 0
    this.mapCount = options.mapCount ?? 0
  }
}
