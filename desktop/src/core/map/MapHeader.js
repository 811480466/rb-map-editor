import RomEntity from "../rom/RomEntity"

export default class MapHeader extends RomEntity {
  /** @type {number} */
  id = 0

  /** @type {number} */
  mapGroup = 0

  /** @type {number} */
  mapNum = 0

  /** @type {number} */
  regionSuffixCode = 0

  /** @type {number} */
  layoutPointer = 0

  /** @type {number} */
  eventsPointer = 0

  /** @type {number} */
  scriptsPointer = 0

  /** @type {number} */
  connectionsPointer = 0

  /** @type {number | null} */
  eventsOffset = null

  /** @type {number} */
  music = 0

  /** @type {number} */
  mapLayoutId = 0

  /** @type {number} */
  regionMapSectionId = 0

  /** @type {number} */
  cave = 0

  /** @type {number} */
  weather = 0

  /** @type {number} */
  mapType = 0

  /** @type {number} */
  filler18 = 0

  /** @type {number} */
  mapFlags = 0

  /** @type {number} */
  battleType = 0

  /** @type {import("./MapLayout").default | null} */
  layout = null

  /** @type {import("./MapEventCollection").default | null} */
  events = null

  /** @type {import("./MapConnectionCollection").default | null} */
  connections = null

  /** @type {import("./RegionMapSection").default | null} */
  regionSection = null

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, mapGroup?: number, mapNum?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.mapGroup = options.mapGroup ?? 0
    this.mapNum = options.mapNum ?? 0
  }

  /** @returns {string} */
  get key() {
    return `${this.mapGroup}:${this.mapNum}`
  }

  /** @returns {boolean} */
  get allowsRunning() {
    return Boolean(this.mapFlags & 0x04)
  }

  /** @returns {boolean} */
  get showsMapName() {
    return Boolean((this.mapFlags >> 3) & 0x1f)
  }

  /** @returns {boolean} */
  get allowsBiking() {
    return Boolean(this.mapFlags & 0x01)
  }

  /** @returns {boolean} */
  get allowsEscaping() {
    return Boolean(this.mapFlags & 0x02)
  }
}
