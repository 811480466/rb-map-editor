import WildEncounterTable from "./WildEncounterTable"

export default class WildEncounterRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {WildEncounterTable | null} */
  table = null

  /** @type {Map<string, import("./WildEncounterHeader").default>} */
  headersByMap = new Map()

  /** @type {boolean} */
  initialized = false

  /**
   * @param {import("../project/RomProject").default} project
   */
  constructor(project) {
    this.project = project
    this.rom = project?.rom || null
    this.profile = project?.profile || null
  }

  /**
   * @returns {this}
   */
  initialize() {
    this.table = new WildEncounterTable(this.rom, this.profile?.getAddress("wildEncounterHeaders"), {
      profile: this.profile,
    }).initialize()
    this.initialized = true
    return this
  }

  /**
   * @param {number} mapGroup
   * @param {number} mapNum
   * @returns {import("./WildEncounterHeader").default | null}
   */
  getHeader(mapGroup, mapNum) {
    return this.headersByMap.get(`${mapGroup}:${mapNum}`) || null
  }

  /**
   * @param {import("./WildEncounterHeader").default} header
   * @returns {import("./WildEncounterHeader").default}
   */
  registerHeader(header) {
    this.headersByMap.set(`${header.mapGroup}:${header.mapNum}`, header)
    return header
  }

  /**
   * @returns {this}
   */
  clear() {
    this.table = null
    this.headersByMap.clear()
    this.initialized = false
    return this
  }
}
