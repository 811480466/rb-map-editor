import { formatHex, offsetToPointer, pointerToOffset } from "@/util"
import MapConnection from "./MapConnection"
import MapConnectionCollection from "./MapConnectionCollection"

export const MAP_CONNECTIONS_SIZE = 0x08
export const MAP_CONNECTION_SIZE = 0x0c
export const MANAGED_CONNECTION_CAPACITY = 6
export const MANAGED_CONNECTION_BYTES = MANAGED_CONNECTION_CAPACITY * MAP_CONNECTION_SIZE
export const CONNECTION_PREVIEW_DEPTH = 8

export const CONNECTION_DIRECTION_OPTIONS = [
  { value: 1, key: "south", label: "下 / South", shortLabel: "下" },
  { value: 2, key: "north", label: "上 / North", shortLabel: "上" },
  { value: 3, key: "west", label: "左 / West", shortLabel: "左" },
  { value: 4, key: "east", label: "右 / East", shortLabel: "右" },
  { value: 5, key: "dive", label: "潜水 / Dive", shortLabel: "潜水" },
  { value: 6, key: "emerge", label: "上浮 / Emerge", shortLabel: "上浮" },
]

const CARDINAL_DIRECTIONS = new Set([1, 2, 3, 4])

function normalizeByte(value, fallback = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(0, Math.min(255, Math.trunc(number)))
}

function normalizeS32(value, fallback = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(-2147483648, Math.min(2147483647, Math.trunc(number)))
}

function readS32(rom, offset) {
  const value = rom.readDword(offset)
  return value > 0x7fffffff ? value - 0x100000000 : value
}

function writeS32(rom, offset, value) {
  rom.writeDword(offset, normalizeS32(value) >>> 0)
}

export function connectionDirectionName(direction) {
  return CONNECTION_DIRECTION_OPTIONS.find(option => option.value === Number(direction))?.label || `未知方向 ${direction}`
}

export function connectionDirectionShortName(direction) {
  return CONNECTION_DIRECTION_OPTIONS.find(option => option.value === Number(direction))?.shortLabel || `未知 ${direction}`
}

export function oppositeConnectionDirection(direction) {
  const opposite = { 1: 2, 2: 1, 3: 4, 4: 3, 5: 6, 6: 5 }
  return opposite[Number(direction)] ?? null
}

export default class MapConnectionRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /**
   * @param {import("../project/RomProject").default} project
   */
  constructor(project) {
    this.project = project
    this.rom = project?.rom || null
    this.profile = project?.profile || null
  }

  /**
   * @returns {this}
   */
  initialize() {
    return this
  }

  /**
   * @param {import("./MapHeader").default | null} header
   * @returns {MapConnectionCollection}
   */
  parseConnections(header) {
    const pointer = header?.connectionsPointer ?? 0
    const headerOffset = pointerToOffset(pointer)
    const collection = new MapConnectionCollection(this.rom, headerOffset, {
      profile: this.profile,
      size: this.profile?.getStructureSize("mapConnections", MAP_CONNECTIONS_SIZE) ?? MAP_CONNECTIONS_SIZE,
    })

    collection.pointer = pointer
    collection.status = "none"
    collection.connectionsPointer = 0
    collection.dataPointer = 0
    collection.connectionsOffset = null

    if (!header || pointer === 0 || headerOffset === null) {
      header.connections = collection
      return collection
    }

    if (!this.isValidOffset(headerOffset, MAP_CONNECTIONS_SIZE)) {
      collection.status = "invalid-header"
      header.connections = collection
      return collection
    }

    const count = readS32(this.rom, headerOffset)
    const dataPointer = this.rom.readPointer(headerOffset + 0x04)
    const dataOffset = pointerToOffset(dataPointer)
    collection.count = count
    collection.dataPointer = dataPointer
    collection.connectionsPointer = dataPointer
    collection.connectionsOffset = dataOffset

    if (count <= 0) {
      collection.status = "empty"
      header.connections = collection
      return collection
    }

    if (count > 32 || dataOffset === null || !this.isValidOffset(dataOffset, count * MAP_CONNECTION_SIZE)) {
      collection.status = "invalid-data"
      header.connections = collection
      return collection
    }

    collection.status = "ok"
    for (let index = 0; index < count; index += 1) {
      const offset = dataOffset + index * MAP_CONNECTION_SIZE
      const connection = new MapConnection(this.rom, offset, {
        profile: this.profile,
        size: MAP_CONNECTION_SIZE,
        index,
        direction: this.rom.readByte(offset),
        displacement: readS32(this.rom, offset + 0x04),
        mapGroup: this.rom.readByte(offset + 0x08),
        mapNum: this.rom.readByte(offset + 0x09),
      })
      connection.targetMap = this.findMapByGroupNum(connection.mapGroup, connection.mapNum)
      collection.add(connection)
    }

    header.connections = collection
    return collection
  }

  /**
   * @param {import("./MapHeader").default | null} header
   * @returns {MapConnection[]}
   */
  getConnections(header) {
    return this.parseConnections(header).connections || []
  }

  /**
   * @param {number} mapGroup
   * @param {number} mapNum
   * @returns {import("./MapHeader").default | null}
   */
  findMapByGroupNum(mapGroup, mapNum) {
    return this.project?.mapRepository?.getMapHeader(Number(mapGroup), Number(mapNum)) || null
  }

  /**
   * @param {MapConnection | object} connection
   * @param {import("./MapHeader").default | null} fromHeader
   * @returns {object | null}
   */
  getConnectionDestinationInfo(connection, fromHeader) {
    if (!connection) return null

    const targetMap = this.findMapByGroupNum(connection.mapGroup, connection.mapNum)
    const targetConnections = targetMap ? this.getConnections(targetMap) : []
    const expectedReverseDirection = oppositeConnectionDirection(connection.direction)
    const reverseConnections = targetConnections.filter(item =>
      fromHeader &&
      item.mapGroup === fromHeader.mapGroup &&
      item.mapNum === fromHeader.mapNum
    )
    const exactReverseConnection = expectedReverseDirection === null
      ? null
      : reverseConnections.find(item => item.direction === expectedReverseDirection) || null

    let status = "unknown"
    let statusText = "未能判断"

    if (!targetMap) {
      status = "bad"
      statusText = "目标地图不存在 / gMapGroups 未命中"
    } else if (exactReverseConnection) {
      status = "ok"
      statusText = `双向连接：目标地图存在 ${connectionDirectionName(exactReverseConnection.direction)} 连接返回当前地图`
    } else if (reverseConnections.length) {
      status = "warn"
      statusText = `目标地图有 ${reverseConnections.length} 条连接返回当前地图，但方向不是预期的反方向`
    } else {
      status = "warn"
      statusText = "疑似单向连接：目标地图没有连接返回当前地图"
    }

    return {
      fromMap: fromHeader,
      targetMap,
      targetConnections,
      reverseConnections,
      exactReverseConnection,
      expectedReverseDirection,
      status,
      statusText,
    }
  }

  /**
   * @param {import("./MapHeader").default} header
   * @returns {Array<object>}
   */
  getConnectionPreviewRects(header) {
    if (!header?.layout) return []

    const rects = [{
      header,
      x: 0,
      y: 0,
      w: header.layout.width,
      h: header.layout.height,
      cropX: 0,
      cropY: 0,
      cropW: header.layout.width,
      cropH: header.layout.height,
      kind: "current",
      conn: null,
    }]

    for (const connection of this.getConnections(header).filter(item => CARDINAL_DIRECTIONS.has(item.direction))) {
      const targetMap = this.findMapByGroupNum(connection.mapGroup, connection.mapNum)
      if (!targetMap?.layout) continue

      let x = 0
      let y = 0
      let w = targetMap.layout.width
      let h = targetMap.layout.height
      let cropX = 0
      let cropY = 0
      let cropW = targetMap.layout.width
      let cropH = targetMap.layout.height

      if (connection.direction === 2) {
        h = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.height)
        x = connection.connectionOffset
        y = -h
        cropY = targetMap.layout.height - h
        cropH = h
      } else if (connection.direction === 1) {
        h = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.height)
        x = connection.connectionOffset
        y = header.layout.height
        cropY = 0
        cropH = h
      } else if (connection.direction === 3) {
        w = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.width)
        x = -w
        y = connection.connectionOffset
        cropX = targetMap.layout.width - w
        cropW = w
      } else if (connection.direction === 4) {
        w = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.width)
        x = header.layout.width
        y = connection.connectionOffset
        cropX = 0
        cropW = w
      }

      rects.push({ header: targetMap, x, y, w, h, cropX, cropY, cropW, cropH, kind: "connection", conn: connection })
    }

    return rects
  }

  /**
   * @param {Array<object>} rects
   * @returns {{ minX: number, minY: number, maxX: number, maxY: number }}
   */
  getPreviewBounds(rects) {
    const current = rects[0]?.header
    if (!current?.layout) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }

    return {
      minX: rects.some(rect => rect.conn?.direction === 3) ? -CONNECTION_PREVIEW_DEPTH : 0,
      minY: rects.some(rect => rect.conn?.direction === 2) ? -CONNECTION_PREVIEW_DEPTH : 0,
      maxX: current.layout.width + (rects.some(rect => rect.conn?.direction === 4) ? CONNECTION_PREVIEW_DEPTH : 0),
      maxY: current.layout.height + (rects.some(rect => rect.conn?.direction === 1) ? CONNECTION_PREVIEW_DEPTH : 0),
    }
  }

  /**
   * @param {number | null} dataOffset
   * @returns {boolean}
   */
  isManagedConnectionArray(dataOffset) {
    if (!Number.isInteger(dataOffset)) return false
    return this.project?.freeSpaceManager?.allocations?.some(range =>
      range.contains(dataOffset, MANAGED_CONNECTION_BYTES) &&
      String(range.label || "").startsWith("MapConnection")
    ) === true
  }

  /**
   * @param {MapConnectionCollection | null} parsed
   * @returns {object}
   */
  getStorageInfo(parsed) {
    const freeSpace = this.project?.freeSpaceManager
    const managed = this.isManagedConnectionArray(parsed?.connectionsOffset)
    return {
      managed,
      text: managed ? `managed capacity=${MANAGED_CONNECTION_CAPACITY}` : "not migrated",
      freeStart: freeSpace?.startOffset ?? null,
      allocations: freeSpace?.allocations?.length ?? 0,
    }
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {number} index
   * @param {object} values
   * @returns {MapConnectionCollection}
   */
  updateConnection(header, index, values) {
    const parsed = this.parseConnections(header)
    const connection = parsed.connections.find(item => item.index === Number(index))
    if (!connection || !this.isValidOffset(connection.offset, MAP_CONNECTION_SIZE)) {
      throw new Error("连接器结构偏移无效")
    }

    this.writeConnectionEntry(connection.offset, values)
    return this.parseConnections(header)
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {object} values
   * @returns {MapConnectionCollection}
   */
  addConnection(header, values) {
    const parsed = this.parseConnections(header)
    const connections = parsed.connections.map((connection, index) => this.normalizeConnection(connection, index))
    if (connections.length >= MANAGED_CONNECTION_CAPACITY) {
      throw new Error(`连接数量不能超过 ${MANAGED_CONNECTION_CAPACITY} 条`)
    }

    connections.push(this.normalizeConnection(values, connections.length))
    return this.rewriteConnectionsToManagedArray(header, connections)
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {number} index
   * @returns {MapConnectionCollection}
   */
  deleteConnection(header, index) {
    const parsed = this.parseConnections(header)
    const targetIndex = Number(index)
    const connections = parsed.connections
      .filter(connection => connection.index !== targetIndex)
      .map((connection, nextIndex) => this.normalizeConnection(connection, nextIndex))

    if (connections.length === parsed.connections.length) {
      throw new Error(`未找到连接 #${targetIndex}`)
    }

    return this.rewriteConnectionsToManagedArray(header, connections)
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {object[]} connections
   * @returns {MapConnectionCollection}
   */
  rewriteConnectionsToManagedArray(header, connections) {
    if (!header) throw new Error("当前没有可编辑的地图")
    if (connections.length > MANAGED_CONNECTION_CAPACITY) {
      throw new Error(`连接数量不能超过 ${MANAGED_CONNECTION_CAPACITY} 条`)
    }

    const parsed = this.parseConnections(header)
    const headerOffset = this.ensureConnectionsHeader(header, parsed)
    const dataOffset = this.isManagedConnectionArray(parsed.connectionsOffset)
      ? parsed.connectionsOffset
      : this.allocateConnectionArray()

    this.rom.fill(dataOffset, MANAGED_CONNECTION_BYTES, 0x00)
    connections.forEach((connection, index) => {
      this.writeConnectionEntry(dataOffset + index * MAP_CONNECTION_SIZE, this.normalizeConnection(connection, index))
    })

    writeS32(this.rom, headerOffset, connections.length)
    this.rom.writePointerOffset(headerOffset + 0x04, dataOffset)
    header.connectionsPointer = offsetToPointer(headerOffset)
    header.connections = this.parseConnections(header)
    return header.connections
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {MapConnectionCollection} parsed
   * @returns {number}
   */
  ensureConnectionsHeader(header, parsed) {
    if (Number.isInteger(parsed?.offset) && this.isValidOffset(parsed.offset, MAP_CONNECTIONS_SIZE)) {
      return parsed.offset
    }

    const allocation = this.project?.freeSpaceManager?.allocate(MAP_CONNECTIONS_SIZE, {
      label: "MapConnections",
      clear: false,
    })
    if (!allocation) throw new Error("空白区管理器不可用")

    const headerOffset = allocation.offset
    this.rom.fill(headerOffset, MAP_CONNECTIONS_SIZE, 0x00)
    this.rom.writePointerOffset(header.offset + 0x0c, headerOffset)
    header.connectionsPointer = offsetToPointer(headerOffset)
    return headerOffset
  }

  /**
   * @returns {number}
   */
  allocateConnectionArray() {
    const allocation = this.project?.freeSpaceManager?.allocate(MANAGED_CONNECTION_BYTES, {
      label: `MapConnection[${MANAGED_CONNECTION_CAPACITY}]`,
      clear: false,
    })
    if (!allocation) throw new Error("空白区管理器不可用")
    return allocation.offset
  }

  /**
   * @param {number} offset
   * @param {object} values
   * @returns {void}
   */
  writeConnectionEntry(offset, values) {
    if (!this.isValidOffset(offset, MAP_CONNECTION_SIZE)) {
      throw new Error(`MapConnection 写入范围无效：${formatHex(offset)}`)
    }

    const connection = this.normalizeConnection(values)
    this.rom.writeByte(offset, connection.direction)
    this.rom.writeByte(offset + 0x01, 0)
    this.rom.writeByte(offset + 0x02, 0)
    this.rom.writeByte(offset + 0x03, 0)
    writeS32(this.rom, offset + 0x04, connection.connectionOffset)
    this.rom.writeByte(offset + 0x08, connection.mapGroup)
    this.rom.writeByte(offset + 0x09, connection.mapNum)
    this.rom.writeByte(offset + 0x0a, 0)
    this.rom.writeByte(offset + 0x0b, 0)
  }

  /**
   * @param {object} connection
   * @param {number} [fallbackIndex]
   * @returns {{ index: number, direction: number, connectionOffset: number, mapGroup: number, mapNum: number }}
   */
  normalizeConnection(connection, fallbackIndex = 0) {
    return {
      index: Number.isInteger(connection?.index) ? connection.index : fallbackIndex,
      direction: normalizeByte(connection?.direction, 4),
      connectionOffset: normalizeS32(connection?.connectionOffset ?? connection?.displacement ?? connection?.offset, 0),
      mapGroup: normalizeByte(connection?.mapGroup, 0),
      mapNum: normalizeByte(connection?.mapNum, 0),
    }
  }

  /**
   * @param {number | null} offset
   * @param {number} [size]
   * @returns {boolean}
   */
  isValidOffset(offset, size = 1) {
    return Number.isInteger(offset) && offset >= 0 && offset + size <= this.rom?.size
  }
}
