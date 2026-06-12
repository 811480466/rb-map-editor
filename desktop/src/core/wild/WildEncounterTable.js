import RomEntity from "../rom/RomEntity"

export default class WildEncounterTable extends RomEntity {
  /** @type {number[]} */
  headerPointers = []

  /** @type {import("./WildEncounterHeader").default[]} */
  headers = []

  /**
   * @param {import("./WildEncounterHeader").default} header
   * @returns {import("./WildEncounterHeader").default}
   */
  add(header) {
    this.headers.push(header)
    return header
  }
}
