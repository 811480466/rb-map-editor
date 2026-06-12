export default class ScriptArgument {
  /** @type {string} */
  name = ""

  /** @type {string} */
  type = ""

  /** @type {*} */
  value = null

  /** @type {number} */
  size = 0

  /** @type {number} */
  offset = 0

  /**
   * @param {{ name?: string, type?: string, value?: *, size?: number, offset?: number }} options
   */
  constructor(options = {}) {
    this.name = options.name || ""
    this.type = options.type || ""
    this.value = options.value ?? null
    this.size = options.size ?? 0
    this.offset = options.offset ?? 0
  }
}
