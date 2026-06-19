import MapRepository from "../map/MapRepository"
import MapConnectionRepository from "../map/MapConnectionRepository"
import MapEventRepository from "../map/MapEventRepository"
import ObjectEventGraphicsRepository from "../event/ObjectEventGraphicsRepository"
import ScriptRepository from "../script/ScriptRepository"
import TilesetRepository from "../tileset/TilesetRepository"
import WildEncounterRepository from "../wild/WildEncounterRepository"
import FreeSpaceManager from "../rom/FreeSpaceManager"
import PokemonTextCodec from "../text/PokemonTextCodec"

export default class RomProject {
  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {FreeSpaceManager | null} */
  freeSpaceManager = null

  /** @type {MapRepository | null} */
  mapRepository = null

  /** @type {MapConnectionRepository | null} */
  mapConnectionRepository = null

  /** @type {MapEventRepository | null} */
  mapEventRepository = null

  /** @type {ObjectEventGraphicsRepository | null} */
  objectEventGraphicsRepository = null

  /** @type {TilesetRepository | null} */
  tilesetRepository = null

  /** @type {WildEncounterRepository | null} */
  wildEncounterRepository = null

  /** @type {ScriptRepository | null} */
  scriptRepository = null

  /** @type {PokemonTextCodec | null} */
  textCodec = null

  /** @type {boolean} */
  dirty = false

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {import("../rom/RomProfile").default} profile
   * @param {{
   *   freeSpaceManager?: FreeSpaceManager,
   *   textCodec?: PokemonTextCodec,
   *   textCodecOptions?: object,
   *   mapRepository?: MapRepository,
   *   mapConnectionRepository?: MapConnectionRepository,
   *   mapEventRepository?: MapEventRepository,
   *   objectEventGraphicsRepository?: ObjectEventGraphicsRepository,
   *   tilesetRepository?: TilesetRepository,
   *   wildEncounterRepository?: WildEncounterRepository,
   *   scriptRepository?: ScriptRepository
   * }} options
   */
  constructor(rom, profile, options = {}) {
    this.rom = rom
    this.profile = profile
    this.freeSpaceManager = options.freeSpaceManager || new FreeSpaceManager(rom, {
      startOffset: profile?.freeSpaceStart ?? 0,
    })
    this.textCodec = options.textCodec || new PokemonTextCodec(options.textCodecOptions)
    this.mapRepository = options.mapRepository || new MapRepository(this)
    this.mapConnectionRepository = options.mapConnectionRepository || new MapConnectionRepository(this)
    this.mapEventRepository = options.mapEventRepository || new MapEventRepository(this)
    this.objectEventGraphicsRepository = options.objectEventGraphicsRepository || new ObjectEventGraphicsRepository(this)
    this.tilesetRepository = options.tilesetRepository || new TilesetRepository(this)
    this.wildEncounterRepository = options.wildEncounterRepository || new WildEncounterRepository(this)
    this.scriptRepository = options.scriptRepository || new ScriptRepository(this)
  }

  /**
   * @returns {this}
   */
  initialize() {
    this.mapRepository.initialize()
    this.mapConnectionRepository.initialize()
    this.mapEventRepository.initialize()
    this.objectEventGraphicsRepository.initialize()
    this.tilesetRepository.initialize()
    this.wildEncounterRepository.initialize()
    this.scriptRepository.initialize()
    return this
  }

  /**
   * @returns {this}
   */
  markDirty() {
    this.dirty = true
    return this
  }

  /**
   * @returns {this}
   */
  markClean() {
    this.dirty = false
    return this
  }
}
