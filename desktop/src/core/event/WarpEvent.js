import BaseMapEvent from "./BaseMapEvent"

export default class WarpEvent extends BaseMapEvent {
  /** @type {number} */
  warpId = 0

  /** @type {number} */
  mapNum = 0

  /** @type {number} */
  mapGroup = 0

  /** @type {WarpEvent | null} */
  targetWarp = null

  /** @returns {string} */
  get targetKey() {
    return `${this.mapGroup}:${this.mapNum}:${this.warpId}`
  }
}
