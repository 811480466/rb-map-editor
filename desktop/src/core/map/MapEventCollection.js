import RomEntity from "../rom/RomEntity"

export default class MapEventCollection extends RomEntity {
  /** @type {number} */
  objectCount = 0

  /** @type {number} */
  warpCount = 0

  /** @type {number} */
  coordCount = 0

  /** @type {number} */
  bgCount = 0

  /** @type {number} */
  objectPointer = 0

  /** @type {number} */
  warpPointer = 0

  /** @type {number} */
  coordPointer = 0

  /** @type {number} */
  bgPointer = 0

  /** @type {number | null} */
  objectOffset = null

  /** @type {number | null} */
  warpOffset = null

  /** @type {number | null} */
  coordOffset = null

  /** @type {number | null} */
  bgOffset = null

  /** @type {import("../event/ObjectEvent").default[]} */
  objects = []

  /** @type {import("../event/WarpEvent").default[]} */
  warps = []

  /** @type {import("../event/CoordEvent").default[]} */
  coords = []

  /** @type {import("../event/BgEvent").default[]} */
  backgrounds = []

  /** @returns {import("../event/BaseMapEvent").default[]} */
  get all() {
    return [...this.objects, ...this.warps, ...this.coords, ...this.backgrounds]
  }
}
