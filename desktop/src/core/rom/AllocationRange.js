export default class AllocationRange {
  /** @type {number} */
  offset = 0

  /** @type {number} */
  size = 0

  /** @type {string} */
  label = ""

  /** @type {number} */
  fillByte = 0xff

  /**
   * @param {number} offset
   * @param {number} size
   * @param {{ label?: string, fillByte?: number }} options
   */
  constructor(offset, size, options = {}) {
    this.offset = offset
    this.size = size
    this.label = options.label || ""
    this.fillByte = options.fillByte ?? 0xff
  }

  /** @returns {number} */
  get endOffset() {
    return this.offset + this.size
  }

  /**
   * @param {number} offset
   * @param {number} [size]
   * @returns {boolean}
   */
  contains(offset, size = 1) {
    return offset >= this.offset && offset + size <= this.endOffset
  }

  /**
   * @param {AllocationRange} other
   * @returns {boolean}
   */
  overlaps(other) {
    return this.offset < other.endOffset && other.offset < this.endOffset
  }
}
