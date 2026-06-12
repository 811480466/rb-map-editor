import BaseMapEvent from "./BaseMapEvent"

export default class ObjectEvent extends BaseMapEvent {
  /** @type {number} */
  localId = 0

  /** @type {number} */
  graphicsId = 0

  /** @type {number} */
  movementType = 0

  /** @type {number} */
  movementRangeX = 0

  /** @type {number} */
  movementRangeY = 0

  /** @type {number} */
  trainerType = 0

  /** @type {number} */
  trainerRangeOrBerryTreeId = 0

  /** @type {number} */
  scriptPointer = 0

  /** @type {number | null} */
  scriptOffset = null

  /** @type {number} */
  eventFlag = 0

  /** @type {import("../script/Script").default | null} */
  script = null

  /** @type {import("../script/TrainerBattleCommand").default | null} */
  trainerBattle = null

  /** @returns {boolean} */
  get isTrainer() {
    return this.trainerBattle !== null
  }
}
