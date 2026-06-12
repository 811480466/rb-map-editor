import BaseMapEvent from "./BaseMapEvent"

export default class BgEvent extends BaseMapEvent {
  /** @type {number} */
  kind = 0

  /** @type {number} */
  argument = 0

  /** @type {number} */
  scriptPointer = 0

  /** @type {number | null} */
  scriptOffset = null

  /** @type {import("../script/Script").default | null} */
  script = null
}
