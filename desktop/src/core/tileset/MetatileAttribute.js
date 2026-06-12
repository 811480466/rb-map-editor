export default class MetatileAttribute {
  /** @type {number} */
  behavior = 0

  /** @type {number} */
  terrainType = 0

  /** @type {number} */
  encounterType = 0

  /** @type {number} */
  layerType = 0

  /**
   * @param {{ behavior?: number, terrainType?: number, encounterType?: number, layerType?: number }} options
   */
  constructor(options = {}) {
    this.behavior = options.behavior ?? 0
    this.terrainType = options.terrainType ?? 0
    this.encounterType = options.encounterType ?? 0
    this.layerType = options.layerType ?? 0
  }
}
