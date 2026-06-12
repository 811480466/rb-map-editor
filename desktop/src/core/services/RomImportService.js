import RomProject from "../project/RomProject"
import Rom from "../rom/Rom"
import PokemonTextCodec from "../text/PokemonTextCodec"
import { createRunAndBunProfile } from "../profiles"

export default class RomImportService {
  /** @type {() => import("../rom/RomProfile").default} */
  profileFactory = null

  /**
   * @param {{ profileFactory?: () => import("../rom/RomProfile").default }} options
   */
  constructor(options = {}) {
    this.profileFactory = options.profileFactory || createRunAndBunProfile
  }

  /**
   * @param {File} file
   * @returns {Promise<{
   *   project: RomProject,
   *   rom: Rom,
   *   profile: import("../rom/RomProfile").default,
   *   romName: string,
   *   maps: import("../map/MapRepository").MapListItem[]
   * }>}
   */
  async importFile(file) {
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("请选择一个 ROM 文件")
    }

    const arrayBuffer = await file.arrayBuffer()
    return this.importArrayBuffer(arrayBuffer, {
      name: file.name || "",
    })
  }

  /**
   * @param {ArrayBuffer | Uint8Array} arrayBuffer
   * @param {{ name?: string, profile?: import("../rom/RomProfile").default }} options
   * @returns {{
   *   project: RomProject,
   *   rom: Rom,
   *   profile: import("../rom/RomProfile").default,
   *   romName: string,
   *   maps: import("../map/MapRepository").MapListItem[]
   * }}
   */
  importArrayBuffer(arrayBuffer, options = {}) {
    const profile = options.profile || this.profileFactory()
    const rom = new Rom(arrayBuffer, {
      name: options.name || "",
    })
    const project = new RomProject(rom, profile, {
      textCodec: new PokemonTextCodec({
        table: PokemonTextCodec.createPokemonEnglishTable(),
      }),
    }).initialize()
    const maps = project.mapRepository.mapList

    return {
      project,
      rom,
      profile,
      romName: rom.name,
      maps,
    }
  }
}
