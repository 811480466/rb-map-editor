import RomEntity from "../rom/RomEntity"

export default class WildEncounterHeader extends RomEntity {
  /** @type {number} */
  index = 0

  /** @type {number} */
  mapGroup = 0

  /** @type {number} */
  mapNum = 0

  /** @type {Record<string, number>} */
  groupPointers = {}

  /** @type {Record<string, import("./WildEncounterGroup").default | null>} */
  groups = {}

  /** @type {number} */
  landPointer = 0

  /** @type {number} */
  waterPointer = 0

  /** @type {number} */
  rockSmashPointer = 0

  /** @type {number} */
  fishingPointer = 0

  /** @type {import("./WildEncounterGroup").default | null} */
  land = null

  /** @type {import("./WildEncounterGroup").default | null} */
  water = null

  /** @type {import("./WildEncounterGroup").default | null} */
  rockSmash = null

  /** @type {import("./WildEncounterGroup").default | null} */
  fishing = null

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{
   *   profile?: import("../rom/RomProfile").default,
   *   size?: number,
   *   index?: number,
   *   mapGroup?: number,
   *   mapNum?: number,
   *   groupPointers?: Record<string, number>
   * }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.index = options.index ?? 0
    this.mapGroup = options.mapGroup ?? 0
    this.mapNum = options.mapNum ?? 0
    this.groupPointers = { ...(options.groupPointers || {}) }
  }

  /** @returns {string} */
  get key() {
    return `${this.mapGroup}:${this.mapNum}`
  }

  /**
   * @returns {import("./WildEncounterGroup").default[]}
   */
  getGroups() {
    return [this.land, this.water, this.rockSmash, this.fishing].filter(Boolean)
  }
}
