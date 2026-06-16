import RomEntity from "../rom/RomEntity"

export default class WildEncounterTable extends RomEntity {
  /** @type {number[]} */
  pointerReferenceOffsets = []

  /** @type {number} */
  pointer = 0

  /** @type {number | null} */
  terminatorOffset = null

  /** @type {number[]} */
  headerPointers = []

  /** @type {import("./WildEncounterHeader").default[]} */
  headers = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number | null} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, pointerReferenceOffsets?: number[], pointer?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.pointerReferenceOffsets = [...(options.pointerReferenceOffsets || [])]
    this.pointer = options.pointer ?? 0
  }

  /**
   * @param {import("./WildEncounterHeader").default} header
   * @returns {import("./WildEncounterHeader").default}
   */
  add(header) {
    this.headers.push(header)
    return header
  }
}
