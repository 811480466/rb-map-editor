import BaseMapEvent from "./BaseMapEvent"

export default class CoordEvent extends BaseMapEvent {
  /** @type {number} */
  trigger = 0

  /** @type {number} */
  indexVariable = 0

  /** @type {number} */
  scriptPointer = 0

  /** @type {number | null} */
  scriptOffset = null

  /** @type {import("../script/Script").default | null} */
  script = null
}
