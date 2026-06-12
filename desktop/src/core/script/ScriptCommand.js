export default class ScriptCommand {
  /** @type {number} */
  index = 0

  /** @type {number} */
  offset = 0

  /** @type {number} */
  pointer = 0

  /** @type {number} */
  opcode = 0

  /** @type {string} */
  name = ""

  /** @type {number} */
  size = 0

  /** @type {import("./ScriptArgument").default[]} */
  args = []

  /** @type {number} */
  targetPointer = 0

  /** @type {number | null} */
  targetOffset = null

  /** @type {import("../text/PokemonText").default | null} */
  text = null

  /**
   * @param {{
   *   index?: number,
   *   offset?: number,
   *   pointer?: number,
   *   opcode?: number,
   *   name?: string,
   *   size?: number,
   *   args?: import("./ScriptArgument").default[],
   *   targetPointer?: number,
   *   targetOffset?: number | null,
   *   text?: import("../text/PokemonText").default | null
   * }} options
   */
  constructor(options = {}) {
    this.index = options.index ?? 0
    this.offset = options.offset ?? 0
    this.pointer = options.pointer ?? 0
    this.opcode = options.opcode ?? 0
    this.name = options.name || ""
    this.size = options.size ?? 0
    this.args = [...(options.args || [])]
    this.targetPointer = options.targetPointer ?? 0
    this.targetOffset = options.targetOffset ?? null
    this.text = options.text || null
  }

  /**
   * @param {import("./ScriptArgument").default} argument
   * @returns {import("./ScriptArgument").default}
   */
  addArgument(argument) {
    this.args.push(argument)
    return argument
  }
}
