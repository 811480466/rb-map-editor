import { formatHex, offsetToPointer, pointerToOffset } from "@/util"
import BgEvent from "../event/BgEvent"
import CoordEvent from "../event/CoordEvent"
import ObjectEvent from "../event/ObjectEvent"
import WarpEvent from "../event/WarpEvent"
import TrainerBattleCommand, { TRAINER_BATTLE_POINTER_FIELDS } from "../script/TrainerBattleCommand"
import MapEventCollection from "./MapEventCollection"

export const MAP_EVENTS_SIZE = 0x14
export const OBJECT_EVENT_SIZE = 0x18
export const WARP_EVENT_SIZE = 0x08
export const COORD_EVENT_SIZE = 0x10
export const BG_EVENT_SIZE = 0x0c
export const MAP_EVENT_EXTRA_CAPACITY = 8

export const MAP_EVENT_TYPE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "object", label: "对象" },
  { value: "trainer", label: "训练家" },
  { value: "warp", label: "传送点" },
  { value: "coord", label: "坐标" },
  { value: "bg", label: "背景" },
]

const EVENT_ARRAY_CONFIG = {
  object: {
    countKey: "objectCount",
    pointerKey: "objectPointer",
    offsetKey: "objectOffset",
    countOffset: 0x00,
    pointerOffset: 0x04,
    size: OBJECT_EVENT_SIZE,
    max: 100,
  },
  warp: {
    countKey: "warpCount",
    pointerKey: "warpPointer",
    offsetKey: "warpOffset",
    countOffset: 0x01,
    pointerOffset: 0x08,
    size: WARP_EVENT_SIZE,
    max: 100,
  },
  coord: {
    countKey: "coordCount",
    pointerKey: "coordPointer",
    offsetKey: "coordOffset",
    countOffset: 0x02,
    pointerOffset: 0x0c,
    size: COORD_EVENT_SIZE,
    max: 160,
  },
  bg: {
    countKey: "bgCount",
    pointerKey: "bgPointer",
    offsetKey: "bgOffset",
    countOffset: 0x03,
    pointerOffset: 0x10,
    size: BG_EVENT_SIZE,
    max: 160,
  },
}

function normalizeInt(value, min, max, fallback = min) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, Math.trunc(number)))
}

function normalizeByte(value, fallback = 0) {
  return normalizeInt(value, 0, 0xff, fallback)
}

function normalizeWord(value, fallback = 0) {
  return normalizeInt(value, 0, 0xffff, fallback)
}

function normalizeS16(value, fallback = 0) {
  return normalizeInt(value, -0x8000, 0x7fff, fallback)
}

function normalizePointer(value, fallback = 0) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback >>> 0
  return Math.max(0, Math.min(0xffffffff, Math.trunc(number))) >>> 0
}

function readS16(rom, offset) {
  const value = rom.readWord(offset)
  return value > 0x7fff ? value - 0x10000 : value
}

function writeS16(rom, offset, value) {
  const normalized = normalizeS16(value)
  rom.writeWord(offset, normalized < 0 ? normalized + 0x10000 : normalized)
}

export function getMapEventKey(event) {
  return event ? `${event.type}:${event.index}` : ""
}

export function getMapEventTypeLabel(event) {
  if (!event) return ""
  if (event.type === "object" && event.trainerBattle) return "训练家"
  return MAP_EVENT_TYPE_OPTIONS.find(option => option.value === event.type)?.label || event.type
}

export default class MapEventRepository {
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
   * @returns {MapEventCollection}
   */
  parseEvents(header) {
    const offset = header?.eventsOffset ?? pointerToOffset(header?.eventsPointer)
    const collection = new MapEventCollection(this.rom, offset, {
      profile: this.profile,
      size: this.profile?.getStructureSize("mapEvents", MAP_EVENTS_SIZE) ?? MAP_EVENTS_SIZE,
    })

    collection.status = "none"
    if (!header || !this.isValidOffset(offset, MAP_EVENTS_SIZE)) {
      if (header) header.events = collection
      return collection
    }

    collection.status = "ok"
    collection.objectCount = this.rom.readByte(offset)
    collection.warpCount = this.rom.readByte(offset + 0x01)
    collection.coordCount = this.rom.readByte(offset + 0x02)
    collection.bgCount = this.rom.readByte(offset + 0x03)
    collection.objectPointer = this.rom.readPointer(offset + 0x04)
    collection.warpPointer = this.rom.readPointer(offset + 0x08)
    collection.coordPointer = this.rom.readPointer(offset + 0x0c)
    collection.bgPointer = this.rom.readPointer(offset + 0x10)
    collection.objectOffset = pointerToOffset(collection.objectPointer)
    collection.warpOffset = pointerToOffset(collection.warpPointer)
    collection.coordOffset = pointerToOffset(collection.coordPointer)
    collection.bgOffset = pointerToOffset(collection.bgPointer)

    if (!this.isCollectionRangeValid(collection)) {
      collection.status = "invalid"
      header.events = collection
      return collection
    }

    collection.objects = this.parseObjectEvents(collection.objectOffset, collection.objectCount)
    collection.warps = this.parseWarpEvents(collection.warpOffset, collection.warpCount)
    collection.coords = this.parseCoordEvents(collection.coordOffset, collection.coordCount)
    collection.backgrounds = this.parseBgEvents(collection.bgOffset, collection.bgCount)
    header.events = collection
    return collection
  }

  /**
   * @param {import("./MapHeader").default | null} header
   * @returns {import("../event/BaseMapEvent").default[]}
   */
  getEvents(header) {
    return this.parseEvents(header).all
  }

  /**
   * @param {import("./MapHeader").default | null} header
   * @param {string} key
   * @returns {import("../event/BaseMapEvent").default | null}
   */
  getEventByKey(header, key) {
    return this.getEvents(header).find(event => getMapEventKey(event) === key) || null
  }

  parseObjectEvents(offset, count) {
    if (count <= 0 || !this.isValidOffset(offset, count * OBJECT_EVENT_SIZE)) return []
    return Array.from({ length: count }, (_, index) => this.parseObjectEvent(offset + index * OBJECT_EVENT_SIZE, index))
  }

  parseObjectEvent(offset, index) {
    const scriptPointer = this.rom.readPointer(offset + 0x10)
    const scriptOffset = pointerToOffset(scriptPointer)
    const movementRangeRaw = this.rom.readWord(offset + 0x0a)
    const event = new ObjectEvent(this.rom, offset, {
      profile: this.profile,
      size: OBJECT_EVENT_SIZE,
      index,
      x: readS16(this.rom, offset + 0x04),
      y: readS16(this.rom, offset + 0x06),
      elevation: this.rom.readByte(offset + 0x08),
    })

    event.type = "object"
    event.localId = this.rom.readByte(offset)
    event.graphicsId = this.rom.readByte(offset + 0x01)
    event.inConnection = this.rom.readByte(offset + 0x02)
    event.padding03 = this.rom.readByte(offset + 0x03)
    event.movementType = this.rom.readByte(offset + 0x09)
    event.movementRangeRaw = movementRangeRaw
    event.movementRangeX = movementRangeRaw & 0x0f
    event.movementRangeY = (movementRangeRaw >> 4) & 0x0f
    event.trainerType = this.rom.readWord(offset + 0x0c)
    event.trainerRangeOrBerryTreeId = this.rom.readWord(offset + 0x0e)
    event.scriptPointer = scriptPointer
    event.scriptOffset = this.isValidOffset(scriptOffset, 1) ? scriptOffset : null
    event.eventFlag = this.rom.readWord(offset + 0x14)
    event.padding16 = this.rom.readWord(offset + 0x16)
    event.trainerBattle = this.parseTrainerBattleScript(event.scriptOffset, scriptPointer)
    return event
  }

  parseWarpEvents(offset, count) {
    if (count <= 0 || !this.isValidOffset(offset, count * WARP_EVENT_SIZE)) return []
    return Array.from({ length: count }, (_, index) => this.parseWarpEvent(offset + index * WARP_EVENT_SIZE, index))
  }

  parseWarpEvent(offset, index) {
    const event = new WarpEvent(this.rom, offset, {
      profile: this.profile,
      size: WARP_EVENT_SIZE,
      index,
      x: readS16(this.rom, offset),
      y: readS16(this.rom, offset + 0x02),
      elevation: this.rom.readByte(offset + 0x04),
    })

    event.type = "warp"
    event.warpId = this.rom.readByte(offset + 0x05)
    event.mapNum = this.rom.readByte(offset + 0x06)
    event.mapGroup = this.rom.readByte(offset + 0x07)
    event.targetMap = this.findMapByGroupNum(event.mapGroup, event.mapNum)
    return event
  }

  parseCoordEvents(offset, count) {
    if (count <= 0 || !this.isValidOffset(offset, count * COORD_EVENT_SIZE)) return []
    return Array.from({ length: count }, (_, index) => this.parseCoordEvent(offset + index * COORD_EVENT_SIZE, index))
  }

  parseCoordEvent(offset, index) {
    const scriptPointer = this.rom.readPointer(offset + 0x0c)
    const scriptOffset = pointerToOffset(scriptPointer)
    const event = new CoordEvent(this.rom, offset, {
      profile: this.profile,
      size: COORD_EVENT_SIZE,
      index,
      x: readS16(this.rom, offset),
      y: readS16(this.rom, offset + 0x02),
      elevation: this.rom.readByte(offset + 0x04),
    })

    event.type = "coord"
    event.trigger = this.rom.readWord(offset + 0x06)
    event.indexVariable = this.rom.readWord(offset + 0x08)
    event.padding0A = this.rom.readWord(offset + 0x0a)
    event.scriptPointer = scriptPointer
    event.scriptOffset = this.isValidOffset(scriptOffset, 1) ? scriptOffset : null
    return event
  }

  parseBgEvents(offset, count) {
    if (count <= 0 || !this.isValidOffset(offset, count * BG_EVENT_SIZE)) return []
    return Array.from({ length: count }, (_, index) => this.parseBgEvent(offset + index * BG_EVENT_SIZE, index))
  }

  parseBgEvent(offset, index) {
    const scriptPointer = this.rom.readPointer(offset + 0x08)
    const scriptOffset = pointerToOffset(scriptPointer)
    const event = new BgEvent(this.rom, offset, {
      profile: this.profile,
      size: BG_EVENT_SIZE,
      index,
      x: readS16(this.rom, offset),
      y: readS16(this.rom, offset + 0x02),
      elevation: this.rom.readByte(offset + 0x04),
    })

    event.type = "bg"
    event.kind = this.rom.readByte(offset + 0x05)
    event.argument = this.rom.readWord(offset + 0x06)
    event.scriptPointer = scriptPointer
    event.scriptOffset = this.isValidOffset(scriptOffset, 1) ? scriptOffset : null
    return event
  }

  parseTrainerBattleScript(offset, pointer = 0) {
    if (!this.isValidOffset(offset, 6) || this.rom.readByte(offset) !== 0x5c) return null

    const battleType = this.rom.readByte(offset + 0x01)
    const pointerFields = TRAINER_BATTLE_POINTER_FIELDS[battleType] || []
    const size = 6 + pointerFields.length * 4
    if (!this.isValidOffset(offset, size)) return null

    const pointers = pointerFields.map((field, index) => this.rom.readPointer(offset + 0x06 + index * 4))
    const command = new TrainerBattleCommand({
      index: 0,
      offset,
      pointer,
      opcode: 0x5c,
      size,
      battleType,
      trainerId: this.rom.readWord(offset + 0x02),
      localId: this.rom.readWord(offset + 0x04),
      pointers,
    })

    const continueIndex = pointerFields.indexOf("continueScript")
    if (continueIndex >= 0) {
      command.continueScriptPointer = pointers[continueIndex]
      command.continueScriptOffset = pointerToOffset(pointers[continueIndex])
    }

    return command
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {string} type
   * @param {number} index
   * @param {object} values
   * @returns {MapEventCollection}
   */
  updateEvent(header, type, index, values) {
    const event = this.findEvent(header, type, index)
    if (!event) throw new Error(`未找到事件 ${type} #${index}`)

    if (event.type === "object") this.writeObjectEvent(event, values)
    else if (event.type === "warp") this.writeWarpEvent(event, values)
    else if (event.type === "coord") this.writeCoordEvent(event, values)
    else if (event.type === "bg") this.writeBgEvent(event, values)

    return this.parseEvents(header)
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {string} type
   * @param {object} values
   * @returns {MapEventCollection}
   */
  addEvent(header, type, values = {}) {
    const collection = this.parseEvents(header)
    const normalizedType = type === "trainer" ? "object" : type
    const config = EVENT_ARRAY_CONFIG[normalizedType]
    if (!config) throw new Error(`不支持新增事件类型: ${type}`)

    const items = this.getEventsByArrayType(collection, normalizedType)
      .map(event => this.normalizeEventValues(event))
    if (items.length >= config.max) throw new Error(`${getMapEventTypeLabel({ type: normalizedType })}数量已达上限`)

    items.push(this.normalizeNewEventValues(normalizedType, values, header, items))
    this.rewriteEventArray(header, normalizedType, items)
    return this.parseEvents(header)
  }

  /**
   * @param {import("./MapHeader").default} header
   * @param {string} type
   * @param {number} index
   * @returns {MapEventCollection}
   */
  deleteEvent(header, type, index) {
    const normalizedType = type === "trainer" ? "object" : type
    const config = EVENT_ARRAY_CONFIG[normalizedType]
    if (!config) throw new Error(`不支持删除事件类型: ${type}`)

    const collection = this.parseEvents(header)
    const count = collection[config.countKey]
    const dataOffset = collection[config.offsetKey]
    const eventIndex = normalizeInt(index, 0, config.max, -1)

    if (eventIndex < 0 || eventIndex >= count || !this.isValidOffset(dataOffset, count * config.size)) {
      throw new Error(`事件 index 无效: ${index}`)
    }

    for (let slot = eventIndex; slot < count - 1; slot += 1) {
      const targetOffset = dataOffset + slot * config.size
      const sourceOffset = targetOffset + config.size
      this.rom.writeBytes(targetOffset, this.rom.readBytes(sourceOffset, config.size))
    }

    this.rom.fill(dataOffset + (count - 1) * config.size, config.size, 0x00)
    this.rom.writeByte(collection.offset + config.countOffset, count - 1)
    return this.parseEvents(header)
  }

  findEvent(header, type, index) {
    const normalizedType = type === "trainer" ? "object" : type
    return this.getEvents(header).find(event => event.type === normalizedType && event.index === Number(index)) || null
  }

  writeCommonEventFields(event, values) {
    writeS16(this.rom, event.offset, values.x ?? event.x)
    writeS16(this.rom, event.offset + 0x02, values.y ?? event.y)
    this.rom.writeByte(event.offset + 0x04, normalizeByte(values.elevation ?? event.elevation))
  }

  writeObjectEvent(event, values) {
    if (!this.isValidOffset(event.offset, OBJECT_EVENT_SIZE)) {
      throw new Error(`对象事件写入范围无效: ${formatHex(event.offset)}`)
    }

    const next = this.normalizeEventValues({ ...event, ...values })
    this.rom.writeByte(event.offset, next.localId)
    this.rom.writeByte(event.offset + 0x01, next.graphicsId)
    this.rom.writeByte(event.offset + 0x02, next.inConnection)
    this.rom.writeByte(event.offset + 0x03, next.padding03)
    writeS16(this.rom, event.offset + 0x04, next.x)
    writeS16(this.rom, event.offset + 0x06, next.y)
    this.rom.writeByte(event.offset + 0x08, next.elevation)
    this.rom.writeByte(event.offset + 0x09, next.movementType)
    this.rom.writeWord(event.offset + 0x0a, next.movementRangeRaw)
    this.rom.writeWord(event.offset + 0x0c, next.trainerType)
    this.rom.writeWord(event.offset + 0x0e, next.trainerRangeOrBerryTreeId)
    this.rom.writePointer(event.offset + 0x10, next.scriptPointer)
    this.rom.writeWord(event.offset + 0x14, next.eventFlag)
    this.rom.writeWord(event.offset + 0x16, next.padding16)

    if (event.trainerBattle && values.trainerId !== undefined && this.isValidOffset(event.scriptOffset, 4)) {
      this.rom.writeWord(event.scriptOffset + 0x02, normalizeWord(values.trainerId, event.trainerBattle.trainerId))
    }
  }

  writeWarpEvent(event, values) {
    if (!this.isValidOffset(event.offset, WARP_EVENT_SIZE)) {
      throw new Error(`传送点写入范围无效: ${formatHex(event.offset)}`)
    }

    this.writeCommonEventFields(event, values)
    this.rom.writeByte(event.offset + 0x05, normalizeByte(values.warpId ?? event.warpId))
    this.rom.writeByte(event.offset + 0x06, normalizeByte(values.mapNum ?? event.mapNum))
    this.rom.writeByte(event.offset + 0x07, normalizeByte(values.mapGroup ?? event.mapGroup))
  }

  writeCoordEvent(event, values) {
    if (!this.isValidOffset(event.offset, COORD_EVENT_SIZE)) {
      throw new Error(`坐标事件写入范围无效: ${formatHex(event.offset)}`)
    }

    this.writeCommonEventFields(event, values)
    this.rom.writeWord(event.offset + 0x06, normalizeWord(values.trigger ?? event.trigger))
    this.rom.writeWord(event.offset + 0x08, normalizeWord(values.indexVariable ?? event.indexVariable))
    this.rom.writePointer(event.offset + 0x0c, normalizePointer(values.scriptPointer ?? event.scriptPointer))
  }

  writeBgEvent(event, values) {
    if (!this.isValidOffset(event.offset, BG_EVENT_SIZE)) {
      throw new Error(`背景事件写入范围无效: ${formatHex(event.offset)}`)
    }

    this.writeCommonEventFields(event, values)
    this.rom.writeByte(event.offset + 0x05, normalizeByte(values.kind ?? event.kind))
    this.rom.writeWord(event.offset + 0x06, normalizeWord(values.argument ?? event.argument))
    this.rom.writePointer(event.offset + 0x08, normalizePointer(values.scriptPointer ?? event.scriptPointer))
  }

  rewriteEventArray(header, type, items) {
    const collection = this.parseEvents(header)
    const config = EVENT_ARRAY_CONFIG[type]
    if (!collection || !this.isValidOffset(collection.offset, MAP_EVENTS_SIZE)) {
      throw new Error("MapEvents 结构无效")
    }

    const capacity = Math.min(config.max, Math.max(items.length + MAP_EVENT_EXTRA_CAPACITY, 1))
    const allocation = this.project?.freeSpaceManager?.allocate(capacity * config.size, {
      label: `MapEvent:${type}[capacity=${capacity}]`,
      clear: false,
    })
    if (!allocation) throw new Error("空白区管理器不可用")

    const dataOffset = allocation.offset
    this.rom.fill(dataOffset, capacity * config.size, 0x00)
    items.forEach((item, index) => this.writeEventEntry(type, dataOffset + index * config.size, item, index))
    this.rom.writeByte(collection.offset + config.countOffset, items.length)
    this.rom.writePointerOffset(collection.offset + config.pointerOffset, dataOffset)
  }

  writeEventEntry(type, offset, item, index = 0) {
    if (type === "object") this.writeObjectEvent({ ...item, type, offset, index }, item)
    else if (type === "warp") this.writeWarpEvent({ ...item, type, offset, index }, item)
    else if (type === "coord") this.writeCoordEvent({ ...item, type, offset, index }, item)
    else if (type === "bg") this.writeBgEvent({ ...item, type, offset, index }, item)
  }

  normalizeEventValues(event = {}) {
    const type = event.type || "object"
    const common = {
      x: normalizeS16(event.x, 0),
      y: normalizeS16(event.y, 0),
      elevation: normalizeByte(event.elevation, 0),
    }

    if (type === "warp") {
      return {
        ...common,
        warpId: normalizeByte(event.warpId, 0),
        mapNum: normalizeByte(event.mapNum, 0),
        mapGroup: normalizeByte(event.mapGroup, 0),
      }
    }

    if (type === "coord") {
      return {
        ...common,
        trigger: normalizeWord(event.trigger, 0),
        indexVariable: normalizeWord(event.indexVariable, 0),
        scriptPointer: normalizePointer(event.scriptPointer, 0),
      }
    }

    if (type === "bg") {
      return {
        ...common,
        kind: normalizeByte(event.kind, 0),
        argument: normalizeWord(event.argument, 0),
        scriptPointer: normalizePointer(event.scriptPointer, 0),
      }
    }

    const movementRangeX = normalizeInt(event.movementRangeX, 0, 0x0f, 0)
    const movementRangeY = normalizeInt(event.movementRangeY, 0, 0x0f, 0)
    return {
      ...common,
      localId: normalizeByte(event.localId, 1),
      graphicsId: normalizeByte(event.graphicsId, 0),
      inConnection: normalizeByte(event.inConnection, 0),
      padding03: normalizeByte(event.padding03, 0),
      movementType: normalizeByte(event.movementType, 0),
      movementRangeX,
      movementRangeY,
      movementRangeRaw: movementRangeX | (movementRangeY << 4),
      trainerType: normalizeWord(event.trainerType, 0),
      trainerRangeOrBerryTreeId: normalizeWord(event.trainerRangeOrBerryTreeId, 0),
      scriptPointer: normalizePointer(event.scriptPointer, 0),
      eventFlag: normalizeWord(event.eventFlag, 0),
      padding16: normalizeWord(event.padding16, 0),
    }
  }

  normalizeNewEventValues(type, values, header, existing = []) {
    const previous = existing[existing.length - 1] || {}
    const common = {
      x: normalizeS16(values.x, previous.x ?? 0),
      y: normalizeS16(values.y, previous.y ?? 0),
      elevation: normalizeByte(values.elevation, previous.elevation ?? 0),
    }

    if (type === "warp") {
      return this.normalizeEventValues({
        type,
        ...common,
        warpId: values.warpId ?? 0,
        mapNum: values.mapNum ?? header?.mapNum ?? 0,
        mapGroup: values.mapGroup ?? header?.mapGroup ?? 0,
      })
    }

    if (type === "coord") {
      return this.normalizeEventValues({
        type,
        ...common,
        trigger: values.trigger ?? 0,
        indexVariable: values.indexVariable ?? 0,
        scriptPointer: values.scriptPointer ?? 0,
      })
    }

    if (type === "bg") {
      return this.normalizeEventValues({
        type,
        ...common,
        kind: values.kind ?? 0,
        argument: values.argument ?? 0,
        scriptPointer: values.scriptPointer ?? 0,
      })
    }

    return this.normalizeEventValues({
      type: "object",
      ...common,
      localId: values.localId ?? this.getNextLocalId(existing),
      graphicsId: values.graphicsId ?? 0,
      movementType: values.movementType ?? 0,
      movementRangeX: values.movementRangeX ?? 0,
      movementRangeY: values.movementRangeY ?? 0,
      trainerType: values.trainerType ?? 0,
      trainerRangeOrBerryTreeId: values.trainerRangeOrBerryTreeId ?? 0,
      scriptPointer: values.scriptPointer ?? 0,
      eventFlag: values.eventFlag ?? 0,
    })
  }

  getNextLocalId(events) {
    const used = new Set(events.map(event => Number(event.localId)).filter(Number.isInteger))
    for (let id = 1; id <= 0xff; id += 1) {
      if (!used.has(id)) return id
    }
    return 1
  }

  getEventsByArrayType(collection, type) {
    if (type === "object") return collection.objects
    if (type === "warp") return collection.warps
    if (type === "coord") return collection.coords
    if (type === "bg") return collection.backgrounds
    return []
  }

  /**
   * @param {import("../event/WarpEvent").default | null} warp
   * @param {import("./MapHeader").default | null} fromHeader
   * @returns {object | null}
   */
  getWarpDestinationInfo(warp, fromHeader) {
    if (!warp || warp.type !== "warp") return null

    const targetMap = this.findMapByGroupNum(warp.mapGroup, warp.mapNum)
    const targetWarps = targetMap ? this.parseEvents(targetMap).warps : []
    const targetWarp = targetWarps[warp.warpId] || null
    const reverseWarps = targetWarps.filter(item =>
      fromHeader &&
      item.mapGroup === fromHeader.mapGroup &&
      item.mapNum === fromHeader.mapNum
    )
    const exactReverseWarp = reverseWarps.find(item => item.warpId === warp.index) || null

    let status = "warn"
    let statusText = "没有找到返回当前地图的 warp"
    if (!targetMap) {
      status = "bad"
      statusText = "目标地图不存在"
    } else if (!targetWarp) {
      status = "bad"
      statusText = `目标地图没有 warpId=${warp.warpId}`
    } else if (exactReverseWarp) {
      status = "ok"
      statusText = `双向匹配：目标 Warp 会返回当前 Warp #${warp.index}`
    } else if (reverseWarps.length) {
      status = "warn"
      statusText = `有 ${reverseWarps.length} 个返回当前地图的候选 Warp`
    }

    return {
      targetMap,
      targetWarps,
      targetWarp,
      reverseWarps,
      exactReverseWarp,
      status,
      statusText,
    }
  }

  findMapByGroupNum(mapGroup, mapNum) {
    return this.project?.mapRepository?.getMapHeader(Number(mapGroup), Number(mapNum)) || null
  }

  isCollectionRangeValid(collection) {
    return Object.entries(EVENT_ARRAY_CONFIG).every(([, config]) => {
      const count = collection[config.countKey]
      const offset = collection[config.offsetKey]
      if (count < 0 || count > config.max) return false
      return count === 0 || this.isValidOffset(offset, count * config.size)
    })
  }

  /**
   * @param {number | null} offset
   * @param {number} [size]
   * @returns {boolean}
   */
  isValidOffset(offset, size = 1) {
    return Number.isInteger(offset) && offset >= 0 && offset + size <= this.rom?.size
  }

  offsetToPointer(offset) {
    return offsetToPointer(offset)
  }
}
