import Script from "./Script"
import ScriptAnalyzer from "./ScriptAnalyzer"

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

  /** @type {ScriptAnalyzer | null} */
  analyzer = null

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
    this.analyzer = new ScriptAnalyzer(this.project)
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
    this.analyzer = null
    this.initialized = false
    return this
  }

  /**
   * @param {number} offset
   * @param {object} options
   * @returns {ReturnType<ScriptAnalyzer["parseScript"]>}
   */
  analyzeScript(offset, options = {}) {
    if (!this.analyzer) this.analyzer = new ScriptAnalyzer(this.project)
    return this.analyzer.parseScript(offset, options)
  }

  /**
   * @param {ReturnType<ScriptAnalyzer["parseScript"]>} analysis
   * @returns {ReturnType<ScriptAnalyzer["collectTextEntries"]>}
   */
  collectTextEntries(analysis) {
    if (!this.analyzer) this.analyzer = new ScriptAnalyzer(this.project)
    return this.analyzer.collectTextEntries(analysis)
  }

  /**
   * @param {number} offset
   * @param {number} length
   * @returns {string}
   */
  formatHexDump(offset, length = 0x100) {
    if (!this.analyzer) this.analyzer = new ScriptAnalyzer(this.project)
    return this.analyzer.formatHexDump(offset, length)
  }
}
