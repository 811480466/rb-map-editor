import RomEntity from "../rom/RomEntity"

export default class WildEncounterGroup extends RomEntity {
  /** @type {string} */
  kind = ""

  /** @type {number} */
  encounterRate = 0

  /** @type {number} */
  slotsPointer = 0

  /** @type {number | null} */
  slotsOffset = null

  /** @type {import("./WildPokemonSlot").default[]} */
  slots = []

  /** @type {number} */
  capacity = 0

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, kind?: string, capacity?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.kind = options.kind || ""
    this.capacity = options.capacity ?? 0
  }

  /**
   * @param {import("./WildPokemonSlot").default} slot
   * @returns {import("./WildPokemonSlot").default}
   */
  addSlot(slot) {
    this.slots.push(slot)
    return slot
  }
}
