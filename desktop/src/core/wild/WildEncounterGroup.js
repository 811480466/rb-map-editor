import RomEntity from "../rom/RomEntity"

export default class WildEncounterGroup extends RomEntity {
  /** @type {import("./WildEncounterHeader").default | null} */
  header = null

  /** @type {string} */
  kind = ""

  /** @type {string} */
  label = ""

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

  /** @type {number[]} */
  rates = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{
   *   profile?: import("../rom/RomProfile").default,
   *   size?: number,
   *   header?: import("./WildEncounterHeader").default | null,
   *   kind?: string,
   *   label?: string,
   *   capacity?: number,
   *   rates?: number[]
   * }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.header = options.header || null
    this.kind = options.kind || ""
    this.label = options.label || this.kind
    this.capacity = options.capacity ?? 0
    this.rates = [...(options.rates || [])]
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
