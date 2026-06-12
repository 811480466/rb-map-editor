import RomEntity from "../rom/RomEntity"

export default class MapGroupTable extends RomEntity {
  /** @type {number} */
  count = 0

  /** @type {number[]} */
  groupPointers = []

  /** @type {import("./MapGroup").default[]} */
  groups = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number | null} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, count?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.count = options.count ?? 0
  }
}
