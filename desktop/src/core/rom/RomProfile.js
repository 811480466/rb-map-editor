import { GBA_ROM_POINTER_BASE } from "../../util/pointer"

export default class RomProfile {
  /** @type {string} */
  id = ""

  /** @type {string} */
  name = ""

  /** @type {string} */
  version = ""

  /** @type {number} */
  gbaBase = GBA_ROM_POINTER_BASE

  /** @type {Record<string, number>} */
  addresses = {}

  /** @type {Record<string, number>} */
  counts = {}

  /** @type {Record<string, number>} */
  structureSizes = {}

  /** @type {Record<string, number>} */
  limits = {}

  /** @type {number} */
  freeSpaceStart = 0

  /**
   * @param {{
   *   id?: string,
   *   name?: string,
   *   version?: string,
   *   gbaBase?: number,
   *   addresses?: Record<string, number>,
   *   counts?: Record<string, number>,
   *   structureSizes?: Record<string, number>,
   *   limits?: Record<string, number>,
   *   freeSpaceStart?: number
   * }} options
   */
  constructor(options = {}) {
    this.id = options.id || ""
    this.name = options.name || ""
    this.version = options.version || ""
    this.gbaBase = options.gbaBase ?? GBA_ROM_POINTER_BASE
    this.addresses = { ...options.addresses }
    this.counts = { ...options.counts }
    this.structureSizes = { ...options.structureSizes }
    this.limits = { ...options.limits }
    this.freeSpaceStart = options.freeSpaceStart ?? 0
  }

  /**
   * @param {string} name
   * @param {number | null} [fallback]
   * @returns {number | null}
   */
  getAddress(name, fallback = null) {
    return this.addresses[name] ?? fallback
  }

  /**
   * @param {string} name
   * @param {number} [fallback]
   * @returns {number}
   */
  getCount(name, fallback = 0) {
    return this.counts[name] ?? fallback
  }

  /**
   * @param {string} name
   * @param {number} [fallback]
   * @returns {number}
   */
  getStructureSize(name, fallback = 0) {
    return this.structureSizes[name] ?? fallback
  }

  /**
   * @param {string} name
   * @param {number} [fallback]
   * @returns {number}
   */
  getLimit(name, fallback = 0) {
    return this.limits[name] ?? fallback
  }
}
