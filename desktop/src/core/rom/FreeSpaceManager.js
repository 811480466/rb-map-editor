import AllocationRange from "./AllocationRange"
import { align as alignOffset, formatHex } from "@/util"

export default class FreeSpaceManager {
  /** @type {import("./Rom").default} */
  rom = null

  /** @type {number} */
  startOffset = 0

  /** @type {number} */
  fillByte = 0xff

  /** @type {AllocationRange[]} */
  allocations = []

  /**
   * @param {import("./Rom").default} rom
   * @param {{ startOffset?: number, fillByte?: number }} options
   */
  constructor(rom, options = {}) {
    this.rom = rom
    this.startOffset = options.startOffset ?? 0
    this.fillByte = options.fillByte ?? 0xff
  }

  /**
   * @param {number} offset
   * @param {number} [alignment]
   * @returns {number}
   */
  align(offset, alignment = 4) {
    return alignOffset(offset, alignment)
  }

  /**
   * @param {number} offset
   * @param {number} size
   * @param {number} [fillByte]
   * @returns {boolean}
   */
  isBlankRange(offset, size, fillByte = this.fillByte) {
    this.rom.ensureRange(offset, size)

    for (let index = offset; index < offset + size; index += 1) {
      if (this.rom.bytes[index] !== fillByte) return false
    }

    return true
  }

  /**
   * @param {number} offset
   * @param {number} size
   * @returns {boolean}
   */
  isReserved(offset, size) {
    const candidate = new AllocationRange(offset, size)
    return this.allocations.some((allocation) => allocation.overlaps(candidate))
  }

  /**
   * @param {number} size
   * @param {{ alignment?: number, fillByte?: number, startOffset?: number }} options
   * @returns {number | null}
   */
  find(size, options = {}) {
    const alignment = options.alignment ?? 4
    const fillByte = options.fillByte ?? this.fillByte
    let offset = this.align(options.startOffset ?? this.startOffset, alignment)

    while (offset + size <= this.rom.size) {
      if (!this.isReserved(offset, size) && this.isBlankRange(offset, size, fillByte)) {
        return offset
      }

      offset = this.align(offset + 1, alignment)
    }

    return null
  }

  /**
   * @param {number} offset
   * @param {number} size
   * @param {{ label?: string, fillByte?: number }} options
   * @returns {AllocationRange}
   */
  reserve(offset, size, options = {}) {
    if (this.isReserved(offset, size)) {
      throw new Error(`ROM range is already reserved: ${formatHex(offset)}`)
    }

    const range = new AllocationRange(offset, size, options)
    this.allocations.push(range)
    this.allocations.sort((left, right) => left.offset - right.offset)
    return range
  }

  /**
   * @param {number} size
   * @param {{ alignment?: number, fillByte?: number, startOffset?: number, label?: string, clear?: boolean }} options
   * @returns {AllocationRange}
   */
  allocate(size, options = {}) {
    const offset = this.find(size, options)

    if (offset === null) {
      throw new Error(`No blank ROM range large enough for ${size} bytes`)
    }

    const range = this.reserve(offset, size, options)
    if (options.clear !== false) this.rom.fill(offset, size, options.fillByte ?? this.fillByte)
    return range
  }

  /**
   * @param {AllocationRange} range
   * @returns {this}
   */
  release(range) {
    const index = this.allocations.indexOf(range)
    if (index >= 0) this.allocations.splice(index, 1)
    return this
  }

  /**
   * @returns {this}
   */
  clear() {
    this.allocations.length = 0
    return this
  }
}
