import Script from "./Script"

export default class ScriptRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {Map<number, Script>} */
  scripts = new Map()

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
   * @param {number} offset
   * @returns {Script | null}
   */
  getScript(offset) {
    return this.scripts.get(offset) || null
  }

  /**
   * @param {number} offset
   * @param {{ pointer?: number, profile?: import("../rom/RomProfile").default, size?: number }} options
   * @returns {Script}
   */
  createScript(offset, options = {}) {
    const script = new Script(this.rom, offset, {
      profile: this.profile,
      ...options,
    })
    this.scripts.set(offset, script)
    return script
  }

  /**
   * @param {Script} script
   * @returns {Script}
   */
  register(script) {
    if (script.offset !== null) this.scripts.set(script.offset, script)
    return script
  }

  /**
   * @returns {this}
   */
  clear() {
    this.scripts.clear()
    this.initialized = false
    return this
  }
}
