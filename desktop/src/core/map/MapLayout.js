import RomEntity from "../rom/RomEntity"

export default class MapLayout extends RomEntity {
  /** @type {number} */
  id = 0

  /** @type {number} */
  width = 0

  /** @type {number} */
  height = 0

  /** @type {number} */
  borderPointer = 0

  /** @type {number} */
  mapPointer = 0

  /** @type {number} */
  primaryTilesetPointer = 0

  /** @type {number} */
  secondaryTilesetPointer = 0

  /** @type {number | null} */
  borderOffset = null

  /** @type {number | null} */
  mapOffset = null

  /** @type {import("../tileset/Tileset").default | null} */
  primaryTileset = null

  /** @type {import("../tileset/Tileset").default | null} */
  secondaryTileset = null

  /** @type {import("./MapBlock").default[]} */
  borderBlocks = []

  /** @type {import("./MapBlock").default[]} */
  blocks = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, id?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.id = options.id ?? 0
  }

  /** @returns {number} */
  get blockCount() {
    return this.width * this.height
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {import("./MapBlock").default | null}
   */
  getBlock(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null
    return this.blocks[y * this.width + x] || null
  }
}
