import MapGroupTable from "./MapGroupTable"
import MapHeader from "./MapHeader"
import MapLayout from "./MapLayout"
import { formatMapDisplayName, translateMapName } from "./MapNameTranslator"
import RegionMapSection from "./RegionMapSection"

/**
 * @typedef {Object} MapListItem
 * @property {string} key
 * @property {string} code
 * @property {string} name
 * @property {string} englishName
 * @property {string} translatedName
 * @property {number} suffixCode
 * @property {number} mapGroup
 * @property {number} mapNum
 * @property {number} mapCode
 * @property {number} regionCode
 * @property {number} headerOffset
 * @property {number | null} layoutOffset
 * @property {number} width
 * @property {number} height
 */

export default class MapRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  /** @type {MapGroupTable | null} */
  groupTable = null

  /** @type {Map<string, MapHeader>} */
  mapHeaders = new Map()

  /** @type {Map<number, MapLayout>} */
  layouts = new Map()

  /** @type {Map<number, RegionMapSection>} */
  regionSections = new Map()

  /** @type {MapListItem[]} */
  mapList = []

  /** @type {boolean} */
  initialized = false

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
    this.groupTable = new MapGroupTable(this.rom, this.profile?.getAddress("mapGroups"), {
      profile: this.profile,
      count: this.profile?.getCount("mapGroups"),
    }).initialize()
    this.loadMapList()
    this.initialized = true
    return this
  }

  /**
   * @returns {MapListItem[]}
   */
  loadMapList() {
    this.mapHeaders.clear()
    this.layouts.clear()
    this.mapList = []

    const mapGroupsOffset = this.profile?.getAddress("mapGroups")
    const groupCount = this.profile?.getCount("mapGroups")
    if (!this.isValidOffset(mapGroupsOffset, groupCount * 4)) return this.mapList

    const groupArrayOffsets = this.readGroupArrayOffsets(mapGroupsOffset, groupCount)
    const regionNameCounts = new Map()
    let id = 0

    for (let mapGroup = 0; mapGroup < groupCount; mapGroup += 1) {
      const groupArrayOffset = groupArrayOffsets[mapGroup]
      if (groupArrayOffset === null) continue

      const nextGroupArrayOffset = mapGroup + 1 < groupCount ? groupArrayOffsets[mapGroup + 1] : mapGroupsOffset
      const mapCount = this.resolveMapCount(groupArrayOffset, nextGroupArrayOffset)

      for (let mapNum = 0; mapNum < mapCount; mapNum += 1) {
        const headerOffset = this.safePointerOffset(groupArrayOffset + mapNum * 4)
        if (headerOffset === null) continue

        const header = this.parseMapHeader(headerOffset, mapGroup, mapNum)
        if (!header) continue

        header.id = id
        header.regionSuffixCode = this.nextRegionSuffixCode(header, regionNameCounts)
        this.registerMapHeader(header)
        this.mapList.push(this.toListItem(header))
        id += 1
      }
    }

    return this.mapList
  }

  /**
   * @param {number} mapGroupsOffset
   * @param {number} groupCount
   * @returns {(number | null)[]}
   */
  readGroupArrayOffsets(mapGroupsOffset, groupCount) {
    const offsets = []

    for (let index = 0; index < groupCount; index += 1) {
      offsets.push(this.safePointerOffset(mapGroupsOffset + index * 4))
    }

    return offsets
  }

  /**
   * @param {number} groupArrayOffset
   * @param {number | null} nextGroupArrayOffset
   * @returns {number}
   */
  resolveMapCount(groupArrayOffset, nextGroupArrayOffset) {
    const maxMaps = this.profile?.getLimit("maxFallbackMapsPerGroup", 512) ?? 512

    if (
      nextGroupArrayOffset !== null &&
      nextGroupArrayOffset > groupArrayOffset &&
      (nextGroupArrayOffset - groupArrayOffset) % 4 === 0
    ) {
      return Math.min((nextGroupArrayOffset - groupArrayOffset) / 4, maxMaps)
    }

    let count = 0

    while (count < maxMaps && this.isValidOffset(groupArrayOffset + count * 4, 4)) {
      const headerOffset = this.safePointerOffset(groupArrayOffset + count * 4)
      if (headerOffset === null || !this.parseMapHeader(headerOffset, 0, count)) break
      count += 1
    }

    return count
  }

  /**
   * @param {number} offset
   * @param {number} mapGroup
   * @param {number} mapNum
   * @returns {MapHeader | null}
   */
  parseMapHeader(offset, mapGroup, mapNum) {
    const size = this.profile?.getStructureSize("mapHeader", 0x1c) ?? 0x1c
    if (!this.isValidOffset(offset, size)) return null

    const layoutOffset = this.safePointerOffset(offset)
    const eventsOffset = this.safePointerOffset(offset + 0x04)
    if (layoutOffset === null || eventsOffset === null) return null

    const layout = this.parseMapLayout(layoutOffset)
    if (!layout) return null

    const header = new MapHeader(this.rom, offset, {
      profile: this.profile,
      mapGroup,
      mapNum,
      size,
    })

    header.layoutPointer = this.rom.readPointer(offset)
    header.eventsPointer = this.rom.readPointer(offset + 0x04)
    header.scriptsPointer = this.rom.readPointer(offset + 0x08)
    header.connectionsPointer = this.rom.readPointer(offset + 0x0c)
    header.music = this.rom.readWord(offset + 0x10)
    header.mapLayoutId = this.rom.readWord(offset + 0x12)
    header.regionMapSectionId = this.rom.readByte(offset + 0x14)
    header.cave = this.rom.readByte(offset + 0x15)
    header.weather = this.rom.readByte(offset + 0x16)
    header.mapType = this.rom.readByte(offset + 0x17)
    header.filler18 = this.rom.readWord(offset + 0x18)
    header.mapFlags = this.rom.readByte(offset + 0x1a)
    header.battleType = this.rom.readByte(offset + 0x1b)
    header.layout = layout
    header.eventsOffset = eventsOffset
    header.regionSection = this.readRegionMapSection(header.regionMapSectionId)

    return header
  }

  /**
   * @param {number} offset
   * @returns {MapLayout | null}
   */
  parseMapLayout(offset) {
    const size = this.profile?.getStructureSize("mapLayout", 0x18) ?? 0x18
    if (!this.isValidOffset(offset, size)) return null

    const width = this.rom.readDword(offset)
    const height = this.rom.readDword(offset + 0x04)
    const maxWidth = this.profile?.getLimit("maxMapWidth", 512) ?? 512
    const maxHeight = this.profile?.getLimit("maxMapHeight", 512) ?? 512

    if (width <= 0 || height <= 0 || width > maxWidth || height > maxHeight) return null

    const mapOffset = this.safePointerOffset(offset + 0x0c)
    const primaryTilesetOffset = this.safePointerOffset(offset + 0x10)
    const secondaryTilesetOffset = this.safePointerOffset(offset + 0x14)
    if (mapOffset === null || primaryTilesetOffset === null || secondaryTilesetOffset === null) return null
    if (!this.isValidOffset(mapOffset, Math.min(width * height * 2, 64))) return null

    const cached = this.layouts.get(offset)
    if (cached) return cached

    const layout = new MapLayout(this.rom, offset, {
      profile: this.profile,
      size,
    })
    layout.width = width
    layout.height = height
    layout.borderPointer = this.rom.readPointer(offset + 0x08)
    layout.mapPointer = this.rom.readPointer(offset + 0x0c)
    layout.primaryTilesetPointer = this.rom.readPointer(offset + 0x10)
    layout.secondaryTilesetPointer = this.rom.readPointer(offset + 0x14)
    layout.borderOffset = this.safePointerOffset(offset + 0x08)
    layout.mapOffset = mapOffset

    this.layouts.set(offset, layout)
    return layout
  }

  /**
   * @param {number} id
   * @returns {RegionMapSection}
   */
  readRegionMapSection(id) {
    if (this.regionSections.has(id)) return this.regionSections.get(id)

    const tableOffset = this.profile?.getAddress("regionMapEntries")
    const size = this.profile?.getStructureSize("regionMapEntry", 0x08) ?? 0x08
    const offset = tableOffset + id * size
    const section = new RegionMapSection(this.rom, offset, {
      profile: this.profile,
      id,
      size,
    })

    if (!this.isValidOffset(offset, size)) {
      this.regionSections.set(id, section)
      return section
    }

    section.x = this.rom.readByte(offset)
    section.y = this.rom.readByte(offset + 0x01)
    section.width = this.rom.readByte(offset + 0x02)
    section.height = this.rom.readByte(offset + 0x03)
    section.namePointer = this.rom.readPointer(offset + 0x04)
    section.nameOffset = this.safePointerOffset(offset + 0x04)
    section.name = this.readPokemonText(section.nameOffset)

    this.regionSections.set(id, section)
    return section
  }

  /**
   * @param {number | null} offset
   * @param {number} [maxLength]
   * @returns {string}
   */
  readPokemonText(offset, maxLength = 120) {
    if (offset === null || !this.isValidOffset(offset, 1)) return ""

    const bytes = []
    for (let index = 0; index < maxLength && this.isValidOffset(offset + index, 1); index += 1) {
      const byte = this.rom.readByte(offset + index)
      bytes.push(byte)
      if (byte === 0xff) break
    }

    return this.project?.textCodec?.decode(bytes)?.trim() || ""
  }

  /**
   * @param {MapHeader} header
   * @param {Map<string, number>} regionNameCounts
   * @returns {number}
   */
  nextRegionSuffixCode(header, regionNameCounts) {
    const name = header.regionSection?.name || ""
    const suffixCode = regionNameCounts.get(name) ?? 0
    regionNameCounts.set(name, suffixCode + 1)
    return suffixCode
  }

  /**
   * @param {MapHeader} header
   * @returns {MapListItem}
   */
  toListItem(header) {
    const englishName = header.regionSection?.name || `Section ${header.regionMapSectionId}`
    const translatedName = translateMapName(englishName) || englishName
    const displayName = formatMapDisplayName(englishName, header.regionSuffixCode)

    return {
      key: header.key,
      code: header.key,
      name: displayName,
      englishName,
      translatedName,
      suffixCode: header.regionSuffixCode,
      mapGroup: header.mapGroup,
      mapNum: header.mapNum,
      mapCode: header.id,
      regionCode: header.regionMapSectionId,
      headerOffset: header.offset,
      layoutOffset: header.layout?.offset ?? null,
      width: header.layout?.width ?? 0,
      height: header.layout?.height ?? 0,
    }
  }

  /**
   * @param {number} offset
   * @returns {number | null}
   */
  safePointerOffset(offset) {
    if (!this.isValidOffset(offset, 4)) return null
    const pointerOffset = this.rom.readPointerOffset(offset)
    return this.isValidOffset(pointerOffset, 1) ? pointerOffset : null
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
   * @param {number} mapGroup
   * @param {number} mapNum
   * @returns {MapHeader | null}
   */
  getMapHeader(mapGroup, mapNum) {
    return this.mapHeaders.get(`${mapGroup}:${mapNum}`) || null
  }

  /**
   * @param {MapHeader} header
   * @returns {MapHeader}
   */
  registerMapHeader(header) {
    this.mapHeaders.set(`${header.mapGroup}:${header.mapNum}`, header)
    return header
  }

  /**
   * @returns {this}
   */
  clear() {
    this.groupTable = null
    this.mapHeaders.clear()
    this.layouts.clear()
    this.regionSections.clear()
    this.mapList = []
    this.initialized = false
    return this
  }
}
