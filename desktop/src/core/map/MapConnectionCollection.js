import RomEntity from "../rom/RomEntity"

export default class MapConnectionCollection extends RomEntity {
  /** @type {number} */
  pointer = 0

  /** @type {number} */
  count = 0

  /** @type {number} */
  dataPointer = 0

  /** @type {number} */
  connectionsPointer = 0

  /** @type {number | null} */
  connectionsOffset = null

  /** @type {number} */
  capacity = 0

  /** @type {import("./MapConnection").default[]} */
  connections = []

  /** @type {boolean} */
  migrated = false

  /** @type {string} */
  status = "none"

  /**
   * @param {import("./MapConnection").default} connection
   * @returns {import("./MapConnection").default}
   */
  add(connection) {
    this.connections.push(connection)
    this.count = this.connections.length
    return connection
  }

  /**
   * @param {number} index
   * @returns {import("./MapConnection").default | null}
   */
  remove(index) {
    const removed = this.connections.splice(index, 1)[0] || null
    this.count = this.connections.length
    return removed
  }
}
