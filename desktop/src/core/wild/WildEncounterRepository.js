import { clampInt, formatHex, offsetToPointer, pointerToOffset } from "@/util"
import WildEncounterGroup from "./WildEncounterGroup"
import WildEncounterHeader from "./WildEncounterHeader"
import WildEncounterTable from "./WildEncounterTable"
import WildPokemonSlot from "./WildPokemonSlot"

export const WILD_ENCOUNTER_GROUPS = [
  { key: "land", label: "陆地", offset: 0x04, count: 12, defaultRate: 20, rates: [20, 10, 10, 10, 10, 10, 10, 5, 5, 5, 4, 1] },
  { key: "water", label: "水面", offset: 0x08, count: 5, defaultRate: 20, rates: [30, 30, 20, 10, 10] },
  { key: "rockSmash", label: "碎岩", offset: 0x0c, count: 5, defaultRate: 20, rates: [60, 30, 5, 4, 1] },
  { key: "fishing", label: "钓鱼", offset: 0x10, count: 10, defaultRate: 20, rates: [20, 20, 10, 10, 10, 10, 10, 5, 4, 1] },
]

const WILD_HEADER_TABLE_SCAN_LIMIT = 0x800

export default class WildEncounterRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {WildEncounterTable | null} */
  table = null

  /** @type {Map<string, WildEncounterHeader>} */
  headersByMap = new Map()

  /** @type {boolean} */
  initialized = false

  /** @type {string} */
  status = "idle"

  /** @type {string} */
  error = ""

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
    this.headersByMap.clear()
    this.error = ""

    const ref = this.getWildHeaderTableRef()
    this.table = new WildEncounterTable(this.rom, ref?.offset ?? null, {
      profile: this.profile,
      pointerReferenceOffsets: this.getPointerReferenceOffsets(),
      pointer: ref?.ptr ?? 0,
      size: this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14,
    }).initialize()

    if (!ref) {
      this.status = "not-found"
      this.initialized = true
      return this
    }

    this.loadHeaders()
    this.status = "ok"
    this.initialized = true
    return this
  }

  /**
   * @returns {this}
   */
  reload() {
    return this.clear().initialize()
  }

  /**
   * @returns {number[]}
   */
  getPointerReferenceOffsets() {
    const configured = this.profile?.getAddress("wildEncounterHeaderPointerReferences")
    return Array.isArray(configured) ? configured : []
  }

  /**
   * @returns {{ ptrOffset: number, ptr: number, offset: number }[]}
   */
  getWildHeaderTableCandidates() {
    const candidates = []

    for (const ptrOffset of this.getPointerReferenceOffsets()) {
      if (!this.isValidOffset(ptrOffset, 4)) continue

      const ptr = this.rom.readPointer(ptrOffset)
      const offset = pointerToOffset(ptr)
      if (!this.isLikelyWildHeaderTableOffset(offset)) continue
      candidates.push({ ptrOffset, ptr, offset })
    }

    return candidates
  }

  /**
   * @returns {{ ptrOffset: number, ptr: number, offset: number } | null}
   */
  getWildHeaderTableRef() {
    return this.getWildHeaderTableCandidates()[0] || null
  }

  /**
   * @param {number | null} start
   * @returns {boolean}
   */
  isLikelyWildHeaderTableOffset(start) {
    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    if (!this.isValidOffset(start, headerSize)) return false

    let headerCount = 0
    for (let index = 0; index < WILD_HEADER_TABLE_SCAN_LIMIT; index += 1) {
      const offset = start + index * headerSize
      if (!this.isValidOffset(offset, headerSize)) return false

      const mapGroup = this.rom.readByte(offset)
      const mapNum = this.rom.readByte(offset + 0x01)
      if (mapGroup === 0xff && mapNum === 0xff) return headerCount > 0

      let hasGroup = false
      for (const def of WILD_ENCOUNTER_GROUPS) {
        const infoPointer = this.rom.readPointer(offset + def.offset)
        if (!infoPointer) continue
        hasGroup = true
        if (!this.isValidWildPokemonInfoPointer(infoPointer, def)) return false
      }

      if (!hasGroup) return false
      headerCount += 1
    }

    return false
  }

  /**
   * @param {number} infoPointer
   * @param {{ count: number }} def
   * @returns {boolean}
   */
  isValidWildPokemonInfoPointer(infoPointer, def) {
    const infoSize = this.profile?.getStructureSize("wildEncounterInfo", 0x08) ?? 0x08
    const pokemonSize = this.profile?.getStructureSize("wildPokemon", 0x04) ?? 0x04
    const infoOffset = pointerToOffset(infoPointer)
    if (!this.isValidOffset(infoOffset, infoSize)) return false

    const slotsPointer = this.rom.readPointer(infoOffset + 0x04)
    const slotsOffset = pointerToOffset(slotsPointer)
    return this.isValidOffset(slotsOffset, def.count * pokemonSize)
  }

  /**
   * @returns {WildEncounterHeader[]}
   */
  loadHeaders() {
    if (!this.table?.offset) return []

    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    this.table.headers = []

    for (let index = 0; index < WILD_HEADER_TABLE_SCAN_LIMIT; index += 1) {
      const offset = this.table.offset + index * headerSize
      if (!this.isValidOffset(offset, headerSize)) break

      const mapGroup = this.rom.readByte(offset)
      const mapNum = this.rom.readByte(offset + 0x01)
      if (mapGroup === 0xff && mapNum === 0xff) {
        this.table.terminatorOffset = offset
        break
      }

      const header = this.parseHeader(offset, index)
      if (!header) break
      this.table.add(header)
      this.registerHeader(header)
    }

    return this.table.headers
  }

  /**
   * @param {number} offset
   * @param {number} index
   * @returns {WildEncounterHeader | null}
   */
  parseHeader(offset, index = 0) {
    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    if (!this.isValidOffset(offset, headerSize)) return null

    const mapGroup = this.rom.readByte(offset)
    const mapNum = this.rom.readByte(offset + 0x01)
    const groupPointers = {}

    for (const def of WILD_ENCOUNTER_GROUPS) {
      groupPointers[def.key] = this.rom.readPointer(offset + def.offset)
    }

    const header = new WildEncounterHeader(this.rom, offset, {
      profile: this.profile,
      index,
      mapGroup,
      mapNum,
      groupPointers,
      size: headerSize,
    })

    for (const def of WILD_ENCOUNTER_GROUPS) {
      const group = this.parseGroup(groupPointers[def.key], def, header)
      header.groups[def.key] = group
      header[def.key] = group
      header[`${def.key}Pointer`] = groupPointers[def.key]
    }

    return header
  }

  /**
   * @param {number} infoPointer
   * @param {{ key: string, label: string, count: number, rates: number[] }} def
   * @param {WildEncounterHeader} header
   * @returns {WildEncounterGroup | null}
   */
  parseGroup(infoPointer, def, header) {
    if (!infoPointer) return null

    const infoSize = this.profile?.getStructureSize("wildEncounterInfo", 0x08) ?? 0x08
    const pokemonSize = this.profile?.getStructureSize("wildPokemon", 0x04) ?? 0x04
    const infoOffset = pointerToOffset(infoPointer)
    if (!this.isValidOffset(infoOffset, infoSize)) return null

    const slotsPointer = this.rom.readPointer(infoOffset + 0x04)
    const slotsOffset = pointerToOffset(slotsPointer)
    if (!this.isValidOffset(slotsOffset, def.count * pokemonSize)) return null

    const group = new WildEncounterGroup(this.rom, infoOffset, {
      profile: this.profile,
      header,
      kind: def.key,
      label: def.label,
      capacity: def.count,
      rates: def.rates,
      size: infoSize,
    })
    group.encounterRate = this.rom.readByte(infoOffset)
    group.slotsPointer = slotsPointer
    group.slotsOffset = slotsOffset

    for (let index = 0; index < def.count; index += 1) {
      group.addSlot(this.parseSlot(slotsOffset + index * pokemonSize, index, def, group))
    }

    return group
  }

  /**
   * @param {number} offset
   * @param {number} index
   * @param {{ key: string, rates: number[] }} def
   * @param {WildEncounterGroup} group
   * @returns {WildPokemonSlot}
   */
  parseSlot(offset, index, def, group) {
    return new WildPokemonSlot({
      group,
      index,
      offset,
      kind: def.key,
      rate: def.rates[index] ?? 0,
      minLevel: this.rom.readByte(offset),
      maxLevel: this.rom.readByte(offset + 0x01),
      pokemonId: this.rom.readWord(offset + 0x02),
    })
  }

  /**
   * @param {number} mapGroup
   * @param {number} mapNum
   * @returns {WildEncounterHeader | null}
   */
  getHeader(mapGroup, mapNum) {
    return this.headersByMap.get(`${Number(mapGroup)}:${Number(mapNum)}`) || null
  }

  /**
   * @param {string} kind
   * @returns {{ key: string, label: string, offset: number, count: number, defaultRate: number, rates: number[] } | null}
   */
  getGroupDef(kind) {
    return WILD_ENCOUNTER_GROUPS.find(def => def.key === kind) || null
  }

  /**
   * @param {WildPokemonSlot} slot
   * @param {{ minLevel?: number, maxLevel?: number, pokemonId?: number, speciesId?: number }} values
   * @returns {WildPokemonSlot}
   */
  writePokemonSlot(slot, values = {}) {
    if (!slot || !Number.isInteger(slot.offset) || !this.isValidOffset(slot.offset, 4)) {
      throw new Error("野生宝可梦槽位偏移无效")
    }

    const minLevel = clampInt(values.minLevel ?? slot.minLevel, 1, 100)
    const maxLevel = Math.max(minLevel, clampInt(values.maxLevel ?? slot.maxLevel, 1, 100))
    const pokemonId = clampInt(values.pokemonId ?? values.speciesId ?? slot.pokemonId, 0, 0xffff)

    this.rom.writeByte(slot.offset, minLevel)
    this.rom.writeByte(slot.offset + 0x01, maxLevel)
    this.rom.writeWord(slot.offset + 0x02, pokemonId)
    return slot.update({ minLevel, maxLevel, pokemonId })
  }

  /**
   * @param {WildEncounterGroup} group
   * @param {number} value
   * @returns {number}
   */
  writeEncounterRate(group, value) {
    if (!group || !Number.isInteger(group.offset) || !this.isValidOffset(group.offset, 1)) {
      throw new Error("野生遭遇率偏移无效")
    }

    const encounterRate = clampInt(value, 0, 255)
    this.rom.writeByte(group.offset, encounterRate)
    group.encounterRate = encounterRate
    return encounterRate
  }

  /**
   * @param {number} mapGroup
   * @param {number} mapNum
   * @param {{ enabledGroups?: string[], defaultEntry?: { pokemonId?: number, speciesId?: number, minLevel?: number, maxLevel?: number }, encounterRate?: Record<string, number>, freeStart?: number }} options
   * @returns {WildEncounterHeader | null}
   */
  createEncounterForMap(mapGroup, mapNum, options = {}) {
    if (this.getHeader(mapGroup, mapNum)) {
      throw new Error(`当前地图已经存在野生遭遇表：group=${mapGroup} map=${mapNum}`)
    }

    const enabledGroups = new Set(options.enabledGroups || WILD_ENCOUNTER_GROUPS.map(def => def.key))
    const header = new WildEncounterHeader(this.rom, null, {
      profile: this.profile,
      mapGroup: Number(mapGroup) & 0xff,
      mapNum: Number(mapNum) & 0xff,
    })

    for (const def of WILD_ENCOUNTER_GROUPS) {
      const group = enabledGroups.has(def.key)
        ? this.allocateWildGroup(def, {
          encounterRate: options.encounterRate?.[def.key] ?? def.defaultRate,
          defaultEntry: options.defaultEntry || {},
          freeStart: options.freeStart,
        })
        : null

      header.groups[def.key] = group
      header[def.key] = group
      header.groupPointers[def.key] = group ? offsetToPointer(group.offset) : 0
      if (group) group.header = header
    }

    const headers = [...(this.table?.headers || []), header]
    this.writeHeaderTableToFreeSpace(headers, options)
    return this.getHeader(mapGroup, mapNum)
  }

  /**
   * @param {number} mapGroup
   * @param {number} mapNum
   * @param {string} kind
   * @param {{ defaultEntry?: { pokemonId?: number, speciesId?: number, minLevel?: number, maxLevel?: number }, encounterRate?: number, freeStart?: number }} options
   * @returns {WildEncounterHeader | null}
   */
  addGroupToHeader(mapGroup, mapNum, kind, options = {}) {
    const header = this.getHeader(mapGroup, mapNum)
    if (!header) throw new Error("当前地图没有野生遭遇 Header，请先创建遭遇表")
    if (header.groups?.[kind]) throw new Error(`${this.getGroupDef(kind)?.label || kind} 已经存在`)

    const def = this.getGroupDef(kind)
    if (!def) throw new Error(`未知野生遭遇类型：${kind}`)

    const group = this.allocateWildGroup(def, {
      encounterRate: options.encounterRate ?? def.defaultRate,
      defaultEntry: options.defaultEntry || {},
      freeStart: options.freeStart,
    })

    group.header = header
    header.groups[def.key] = group
    header[def.key] = group
    header.groupPointers[def.key] = offsetToPointer(group.offset)

    this.writeHeaderTableToFreeSpace(this.table?.headers || [], options)
    return this.getHeader(mapGroup, mapNum)
  }

  /**
   * @param {{ key: string, label: string, count: number, defaultRate: number, rates: number[] }} def
   * @param {{ defaultEntry?: { pokemonId?: number, speciesId?: number, minLevel?: number, maxLevel?: number }, encounterRate?: number, freeStart?: number }} options
   * @returns {WildEncounterGroup}
   */
  allocateWildGroup(def, options = {}) {
    const infoSize = this.profile?.getStructureSize("wildEncounterInfo", 0x08) ?? 0x08
    const pokemonSize = this.profile?.getStructureSize("wildPokemon", 0x04) ?? 0x04
    const totalSize = infoSize + def.count * pokemonSize
    const allocation = this.project.freeSpaceManager.allocate(totalSize, {
      label: `WildPokemonInfo:${def.key}`,
      startOffset: options.freeStart,
      clear: false,
    })

    const infoOffset = allocation.offset
    const slotsOffset = infoOffset + infoSize
    const encounterRate = clampInt(options.encounterRate ?? def.defaultRate, 0, 255)
    const defaultEntry = options.defaultEntry || {}

    this.rom.fill(infoOffset, totalSize, 0x00)
    this.rom.writeByte(infoOffset, encounterRate)
    this.rom.writePointerOffset(infoOffset + 0x04, slotsOffset)

    const group = new WildEncounterGroup(this.rom, infoOffset, {
      profile: this.profile,
      kind: def.key,
      label: def.label,
      capacity: def.count,
      rates: def.rates,
      size: infoSize,
    })
    group.encounterRate = encounterRate
    group.slotsPointer = offsetToPointer(slotsOffset)
    group.slotsOffset = slotsOffset

    for (let index = 0; index < def.count; index += 1) {
      const slotOffset = slotsOffset + index * pokemonSize
      const slot = new WildPokemonSlot({
        group,
        index,
        offset: slotOffset,
        kind: def.key,
        rate: def.rates[index] ?? 0,
      })
      this.writePokemonSlot(slot, {
        minLevel: defaultEntry.minLevel ?? 2,
        maxLevel: defaultEntry.maxLevel ?? defaultEntry.minLevel ?? 2,
        pokemonId: defaultEntry.pokemonId ?? defaultEntry.speciesId ?? 1,
      })
      group.addSlot(slot)
    }

    return group
  }

  /**
   * @param {WildEncounterHeader[]} headers
   * @param {{ freeStart?: number }} options
   * @returns {this}
   */
  writeHeaderTableToFreeSpace(headers, options = {}) {
    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    const totalSize = (headers.length + 1) * headerSize
    const allocation = this.project.freeSpaceManager.allocate(totalSize, {
      label: "WildPokemonHeader[]",
      startOffset: options.freeStart,
      clear: false,
    })
    const tableOffset = allocation.offset

    this.rom.fill(tableOffset, totalSize, 0x00)
    headers.forEach((header, index) => {
      this.writeHeader(tableOffset + index * headerSize, header)
    })
    this.writeTerminatorHeader(tableOffset + headers.length * headerSize)
    this.updateHeaderTablePointerReferences(tableOffset)
    return this.reload()
  }

  /**
   * @param {number} offset
   * @param {WildEncounterHeader} header
   * @returns {void}
   */
  writeHeader(offset, header) {
    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    if (!this.isValidOffset(offset, headerSize)) throw new Error(`野生遭遇 Header 写入范围无效：${formatHex(offset)}`)

    this.rom.fill(offset, headerSize, 0x00)
    this.rom.writeByte(offset, Number(header.mapGroup) & 0xff)
    this.rom.writeByte(offset + 0x01, Number(header.mapNum) & 0xff)

    for (const def of WILD_ENCOUNTER_GROUPS) {
      const group = header.groups?.[def.key] || header[def.key] || null
      const pointer = group?.offset !== null && group?.offset !== undefined
        ? offsetToPointer(group.offset)
        : (header.groupPointers?.[def.key] || header[`${def.key}Pointer`] || 0)
      this.rom.writePointer(offset + def.offset, pointer)
    }
  }

  /**
   * @param {number} offset
   * @returns {void}
   */
  writeTerminatorHeader(offset) {
    const headerSize = this.profile?.getStructureSize("wildEncounterHeader", 0x14) ?? 0x14
    if (!this.isValidOffset(offset, headerSize)) throw new Error(`野生遭遇结束标记写入范围无效：${formatHex(offset)}`)

    this.rom.fill(offset, headerSize, 0x00)
    this.rom.writeByte(offset, 0xff)
    this.rom.writeByte(offset + 0x01, 0xff)
  }

  /**
   * @param {number} tableOffset
   * @returns {void}
   */
  updateHeaderTablePointerReferences(tableOffset) {
    const pointer = offsetToPointer(tableOffset)
    for (const ptrOffset of this.getPointerReferenceOffsets()) {
      if (this.isValidOffset(ptrOffset, 4)) this.rom.writePointer(ptrOffset, pointer)
    }
  }

  /**
   * @param {import("./WildEncounterHeader").default} header
   * @returns {import("./WildEncounterHeader").default}
   */
  registerHeader(header) {
    this.headersByMap.set(header.key, header)
    return header
  }

  /**
   * @param {number | null} offset
   * @param {number} [size]
   * @returns {boolean}
   */
  isValidOffset(offset, size = 1) {
    return Number.isInteger(offset) && offset >= 0 && offset + size <= this.rom.size
  }

  /**
   * @returns {this}
   */
  clear() {
    this.table = null
    this.headersByMap.clear()
    this.initialized = false
    this.status = "idle"
    this.error = ""
    return this
  }
}
