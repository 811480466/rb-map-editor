import RomEntity from "../rom/RomEntity"

export default class Tileset extends RomEntity {
  /** @type {number} */
  id = 0

  /** @type {number} */
  pointer = 0

  /** @type {boolean} */
  isCompressed = false

  /** @type {boolean} */
  isSecondary = false

  /** @type {number} */
  tilesPointer = 0

  /** @type {number} */
  palettesPointer = 0

  /** @type {number} */
  metatilesPointer = 0

  /** @type {number} */
  metatileAttributesPointer = 0

  /** @type {number} */
  callbackPointer = 0

  /** @type {number | null} */
  tilesOffset = null

  /** @type {number | null} */
  palettesOffset = null

  /** @type {number | null} */
  metatilesOffset = null

  /** @type {number | null} */
  metatileAttributesOffset = null

  /** @type {import("./Palette").default[]} */
  palettes = []

  /** @type {import("./Metatile").default[]} */
  metatiles = []

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{
   *   profile?: import("../rom/RomProfile").default,
   *   size?: number,
   *   id?: number,
   *   pointer?: number,
   *   isCompressed?: boolean,
   *   isSecondary?: boolean
   * }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.id = options.id ?? 0
    this.pointer = options.pointer ?? 0
    this.isCompressed = options.isCompressed ?? false
    this.isSecondary = options.isSecondary ?? false
  }
}
