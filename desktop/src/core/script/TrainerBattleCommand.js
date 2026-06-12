import ScriptCommand from "./ScriptCommand"

export const TRAINER_BATTLE_POINTER_FIELDS = {
  0: ["introText", "defeatText"],
  1: ["introText", "defeatText", "continueScript"],
  2: ["introText", "defeatText", "continueScript"],
  3: ["defeatText"],
  4: ["introText", "defeatText", "notEnoughPokemonText"],
  5: ["introText", "defeatText"],
  6: ["introText", "defeatText", "notEnoughPokemonText", "continueScript"],
  7: ["introText", "defeatText", "notEnoughPokemonText"],
  8: ["introText", "defeatText", "notEnoughPokemonText", "continueScript"],
  9: ["introText", "defeatText"],
  10: ["introText", "defeatText"],
  11: ["introText", "defeatText"],
  12: ["introText", "defeatText"],
}

export default class TrainerBattleCommand extends ScriptCommand {
  /** @type {number} */
  battleType = 0

  /** @type {number} */
  trainerId = 0

  /** @type {number} */
  localId = 0

  /** @type {number[]} */
  pointers = []

  /** @type {Record<string, import("../text/PokemonText").default>} */
  texts = {}

  /** @type {number} */
  continueScriptPointer = 0

  /** @type {number | null} */
  continueScriptOffset = null

  /**
   * @param {{
   *   index?: number,
   *   offset?: number,
   *   pointer?: number,
   *   opcode?: number,
   *   name?: string,
   *   size?: number,
   *   args?: import("./ScriptArgument").default[],
   *   battleType?: number,
   *   trainerId?: number,
   *   localId?: number,
   *   pointers?: number[],
   *   texts?: Record<string, import("../text/PokemonText").default>,
   *   continueScriptPointer?: number,
   *   continueScriptOffset?: number | null
   * }} options
   */
  constructor(options = {}) {
    super({
      name: "trainerbattle",
      ...options,
    })
    this.battleType = options.battleType ?? 0
    this.trainerId = options.trainerId ?? 0
    this.localId = options.localId ?? 0
    this.pointers = [...(options.pointers || [])]
    this.texts = { ...options.texts }
    this.continueScriptPointer = options.continueScriptPointer ?? 0
    this.continueScriptOffset = options.continueScriptOffset ?? null
  }

  /** @returns {string[]} */
  get pointerFields() {
    return TRAINER_BATTLE_POINTER_FIELDS[this.battleType] || []
  }
}
