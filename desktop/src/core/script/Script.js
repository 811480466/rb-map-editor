import RomEntity from "../rom/RomEntity"

export default class Script extends RomEntity {
  /** @type {number} */
  pointer = 0

  /** @type {import("./ScriptCommand").default[]} */
  commands = []

  /** @type {Map<string, number>} */
  labels = new Map()

  /** @type {number[]} */
  references = []

  /** @type {boolean} */
  terminated = false

  /**
   * @param {import("../rom/Rom").default} rom
   * @param {number} offset
   * @param {{ profile?: import("../rom/RomProfile").default, size?: number, pointer?: number }} options
   */
  constructor(rom, offset, options = {}) {
    super(rom, offset, options)
    this.pointer = options.pointer ?? 0
  }

  /**
   * @param {import("./ScriptCommand").default} command
   * @returns {import("./ScriptCommand").default}
   */
  addCommand(command) {
    this.commands.push(command)
    return command
  }

  /**
   * @param {number} index
   * @returns {import("./ScriptCommand").default | null}
   */
  getCommand(index) {
    return this.commands[index] || null
  }
}
