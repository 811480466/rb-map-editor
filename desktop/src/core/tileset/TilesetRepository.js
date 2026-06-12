export default class TilesetRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {Map<number, import("./Tileset").default>} */
  tilesets = new Map()

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
    this.initialized = true
    return this
  }

  /**
   * @param {number} pointer
   * @returns {import("./Tileset").default | null}
   */
  getByPointer(pointer) {
    return this.tilesets.get(pointer) || null
  }

  /**
   * @param {import("./Tileset").default} tileset
   * @returns {import("./Tileset").default}
   */
  register(tileset) {
    if (tileset.pointer !== 0) this.tilesets.set(tileset.pointer, tileset)
    if (tileset.offset !== null) this.tilesets.set(tileset.offset, tileset)
    return tileset
  }

  /**
   * @returns {this}
   */
  clear() {
    this.tilesets.clear()
    this.initialized = false
    return this
  }
}
