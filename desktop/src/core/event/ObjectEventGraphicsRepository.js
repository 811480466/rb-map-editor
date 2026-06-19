import { pointerToOffset } from "@/util"
import { decodeBgr555, lz77DecodeFromRom } from "../tileset/TilesetRenderer"

export const OBJECT_EVENT_GRAPHICS_INFO_SIZE = 0x24
export const SPRITE_FRAME_IMAGE_SIZE = 0x08
export const OBJECT_EVENT_GRAPHICS_POINTER_COUNT = 239
export const OBJECT_EVENT_SPRITE_SCALE = 2

const MAX_SPRITE_FRAME_SIZE = 0x4000
const MAX_LZ77_OBJECT_SIZE = 0x20000
const GBA_POINTER_MIN = 0x08000000
const OBJECT_EVENT_PALETTE_TAGS = [
  0x1103, 0x1104, 0x1105, 0x1106,
  0x1107, 0x1108, 0x1109, 0x110a,
  0x1100, 0x1101, 0x1102, 0x1115,
  0x110b, 0x110c, 0x110d, 0x110e,
  0x110f, 0x1110, 0x1111, 0x1112,
  0x1113, 0x1114, 0x1116, 0x1117,
  0x1118, 0x1119, 0x111b, 0x111c,
  0x111d, 0x111e, 0x111f, 0x1120,
  0x1121, 0x1122, 0x1123,
]

function readDword(bytes, offset) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0
}

function readWord(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readS16(bytes, offset) {
  const value = readWord(bytes, offset)
  return value > 0x7fff ? value - 0x10000 : value
}

function isValidRange(rom, offset, size = 1) {
  return Number.isInteger(offset) && offset >= 0 && offset + size <= rom?.size
}

function pointerLooksValid(rom, pointer, size = 1) {
  return pointer >= GBA_POINTER_MIN && isValidRange(rom, pointerToOffset(pointer), size)
}

function makeFallbackPalette() {
  return Array.from({ length: 16 }, (_, index) => {
    const shade = 255 - index * 13
    return [shade, shade, shade]
  })
}

export default class ObjectEventGraphicsRepository {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  /** @type {import("../rom/RomProfile").default | null} */
  profile = null

  graphicsPointerTableOffset = null

  paletteTableOffset = null

  infoCache = new Map()

  paletteCache = new Map()

  spriteCache = new Map()

  constructor(project) {
    this.project = project
    this.rom = project?.rom || null
    this.profile = project?.profile || null
  }

  initialize() {
    return this
  }

  getSprite(graphicsId) {
    const id = Number(graphicsId)
    if (!Number.isInteger(id) || id < 0 || id >= OBJECT_EVENT_GRAPHICS_POINTER_COUNT) return null
    if (this.spriteCache.has(id)) return this.spriteCache.get(id)

    const sprite = this.buildSprite(id)
    this.spriteCache.set(id, sprite)
    return sprite
  }

  buildSprite(graphicsId) {
    try {
      const info = this.getGraphicsInfo(graphicsId)
      if (!info) return null

      const frame = this.readFirstFrame(info)
      const palette = this.readPaletteByTag(info.paletteTag)
      if (!frame || !palette) return null

      const dataUrl = this.renderFrameToDataUrl(frame.data, palette, info.width, info.height)
      if (!dataUrl) return null

      return {
        graphicsId,
        width: info.width,
        height: info.height,
        renderWidth: info.width * OBJECT_EVENT_SPRITE_SCALE,
        renderHeight: info.height * OBJECT_EVENT_SPRITE_SCALE,
        paletteTag: info.paletteTag,
        dataUrl,
      }
    } catch {
      return null
    }
  }

  getGraphicsInfo(graphicsId) {
    const id = Number(graphicsId)
    if (this.infoCache.has(id)) return this.infoCache.get(id)

    const tableOffset = this.getGraphicsPointerTableOffset()
    if (tableOffset === null) return null
    if (!isValidRange(this.rom, tableOffset + id * 4, 4)) return null

    const pointer = this.rom.readPointer(tableOffset + id * 4)
    const offset = pointerToOffset(pointer)
    const info = this.readGraphicsInfo(offset)
    this.infoCache.set(id, info)
    return info
  }

  getGraphicsPointerTableOffset() {
    if (this.graphicsPointerTableOffset !== null) return this.graphicsPointerTableOffset

    const configured = this.profile?.getAddress("objectEventGraphicsInfoPointers")
    if (configured > 0 && isValidRange(this.rom, configured, OBJECT_EVENT_GRAPHICS_POINTER_COUNT * 4)) {
      this.graphicsPointerTableOffset = configured
      return configured
    }

    this.graphicsPointerTableOffset = this.findGraphicsPointerTableOffset()
    return this.graphicsPointerTableOffset
  }

  findGraphicsPointerTableOffset() {
    const bytes = this.rom?.bytes
    const tableSize = OBJECT_EVENT_GRAPHICS_POINTER_COUNT * 4
    if (!bytes || bytes.length < tableSize) return null

    for (let offset = 0; offset <= bytes.length - tableSize; offset += 4) {
      const firstPointer = readDword(bytes, offset)
      if (!pointerLooksValid(this.rom, firstPointer, OBJECT_EVENT_GRAPHICS_INFO_SIZE)) continue

      const firstInfo = this.readGraphicsInfo(pointerToOffset(firstPointer))
      if (!this.isLikelyGraphicsInfo(firstInfo)) continue

      const sampleIndexes = [1, 2, 5, 10, 26, 59, 89, 238]
      let score = 1
      for (const index of sampleIndexes) {
        const pointer = readDword(bytes, offset + index * 4)
        const info = this.readGraphicsInfo(pointerToOffset(pointer))
        if (this.isLikelyGraphicsInfo(info)) score += 1
      }

      if (score >= 7) return offset
    }

    return null
  }

  readGraphicsInfo(offset) {
    if (!isValidRange(this.rom, offset, OBJECT_EVENT_GRAPHICS_INFO_SIZE)) return null

    const bytes = this.rom.bytes
    const flags = bytes[offset + 0x0c]
    const info = {
      offset,
      tileTag: readWord(bytes, offset),
      paletteTag: readWord(bytes, offset + 0x02),
      reflectionPaletteTag: readWord(bytes, offset + 0x04),
      size: readWord(bytes, offset + 0x06),
      width: readS16(bytes, offset + 0x08),
      height: readS16(bytes, offset + 0x0a),
      paletteSlot: flags & 0x0f,
      shadowSize: (flags >> 4) & 0x03,
      inanimate: Boolean(flags & 0x40),
      disableReflectionPaletteLoad: Boolean(flags & 0x80),
      tracks: bytes[offset + 0x0d],
      oamPointer: readDword(bytes, offset + 0x10),
      subspriteTablesPointer: readDword(bytes, offset + 0x14),
      animsPointer: readDword(bytes, offset + 0x18),
      imagesPointer: readDword(bytes, offset + 0x1c),
      affineAnimsPointer: readDword(bytes, offset + 0x20),
    }

    info.firstFrame = this.readFrameImage(info.imagesPointer, 0)
    return info
  }

  isLikelyGraphicsInfo(info) {
    if (!info) return false
    if (info.width < 8 || info.width > 64 || info.height < 8 || info.height > 64) return false
    if (info.width % 8 !== 0 || info.height % 8 !== 0) return false
    if (info.size <= 0 || info.size > MAX_SPRITE_FRAME_SIZE) return false
    if (!pointerLooksValid(this.rom, info.imagesPointer, SPRITE_FRAME_IMAGE_SIZE)) return false
    if (!pointerLooksValid(this.rom, info.oamPointer, 4)) return false
    if (!pointerLooksValid(this.rom, info.animsPointer, 4)) return false
    if (!info.firstFrame) return false
    if (info.firstFrame.size !== Math.floor((info.width * info.height) / 2)) return false
    if (!pointerLooksValid(this.rom, info.firstFrame.dataPointer, info.firstFrame.size)) return false
    return info.paletteTag === 0x11ff || (info.paletteTag >= 0x1100 && info.paletteTag <= 0x1123)
  }

  readFrameImage(imagesPointer, index = 0) {
    const offset = pointerToOffset(imagesPointer)
    const entryOffset = offset === null ? null : offset + index * SPRITE_FRAME_IMAGE_SIZE
    if (!isValidRange(this.rom, entryOffset, SPRITE_FRAME_IMAGE_SIZE)) return null

    const dataPointer = this.rom.readPointer(entryOffset)
    const dataOffset = pointerToOffset(dataPointer)
    const size = this.rom.readWord(entryOffset + 0x04)
    if (size <= 0 || size > MAX_SPRITE_FRAME_SIZE || !isValidRange(this.rom, dataOffset, size)) return null

    return {
      dataPointer,
      dataOffset,
      size,
      data: this.readFrameBytes(dataOffset, size),
    }
  }

  readFirstFrame(info) {
    if (!info) return null
    return info.firstFrame || this.readFrameImage(info.imagesPointer, 0)
  }

  readFrameBytes(offset, size) {
    if (this.rom.readByte(offset) === 0x10) {
      const decoded = lz77DecodeFromRom(this.rom, offset)
      if (decoded && decoded.length >= size && decoded.length <= MAX_LZ77_OBJECT_SIZE) return decoded.slice(0, size)
    }

    return this.rom.readBytes(offset, size)
  }

  readPaletteByTag(tag) {
    const key = Number(tag)
    if (this.paletteCache.has(key)) return this.paletteCache.get(key)

    const palette = this.findPaletteByTag(key) || makeFallbackPalette()
    this.paletteCache.set(key, palette)
    return palette
  }

  findPaletteByTag(tag) {
    const tableOffset = this.getPaletteTableOffset()
    if (!isValidRange(this.rom, tableOffset, 8)) return null

    for (let index = 0; index < 96; index += 1) {
      const entryOffset = tableOffset + index * 8
      if (!isValidRange(this.rom, entryOffset, 8)) break

      const pointer = this.rom.readPointer(entryOffset)
      const entryTag = this.rom.readWord(entryOffset + 0x04)
      if (pointer === 0 && entryTag === 0) break
      if (entryTag !== tag) continue

      const paletteOffset = pointerToOffset(pointer)
      if (!isValidRange(this.rom, paletteOffset, 32)) return null

      return Array.from({ length: 16 }, (_, colorIndex) =>
        decodeBgr555(this.rom.readWord(paletteOffset + colorIndex * 2))
      )
    }

    return null
  }

  getPaletteTableOffset() {
    if (this.paletteTableOffset !== null) return this.paletteTableOffset

    const configured = this.profile?.getAddress("objectEventSpritePalettes")
    if (configured > 0 && isValidRange(this.rom, configured, 8)) {
      this.paletteTableOffset = configured
      return configured
    }

    this.paletteTableOffset = this.findPaletteTableOffset()
    return this.paletteTableOffset
  }

  findPaletteTableOffset() {
    const bytes = this.rom?.bytes
    if (!bytes) return null

    for (let offset = 0; offset <= bytes.length - 40; offset += 4) {
      let matched = 0
      for (let index = 0; index < 5; index += 1) {
        const entryOffset = offset + index * 8
        const pointer = readDword(bytes, entryOffset)
        const tag = readWord(bytes, entryOffset + 0x04)
        if (tag === OBJECT_EVENT_PALETTE_TAGS[index] && pointerLooksValid(this.rom, pointer, 32)) matched += 1
        else break
      }

      if (matched >= 5) return offset
    }

    return null
  }

  renderFrameToDataUrl(frameData, palette, width, height) {
    if (typeof document === "undefined") return null

    const canvas = document.createElement("canvas")
    canvas.width = width * OBJECT_EVENT_SPRITE_SCALE
    canvas.height = height * OBJECT_EVENT_SPRITE_SCALE
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.imageSmoothingEnabled = false
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    this.draw4bppFrame(imageData, frameData, palette, width, height)
    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL("image/png")
  }

  draw4bppFrame(imageData, frameData, palette, width, height) {
    const scale = OBJECT_EVENT_SPRITE_SCALE
    const tilesWide = Math.ceil(width / 8)

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const tileX = Math.floor(x / 8)
        const tileY = Math.floor(y / 8)
        const localX = x % 8
        const localY = y % 8
        const tileOffset = (tileY * tilesWide + tileX) * 32
        const byteOffset = tileOffset + localY * 4 + (localX >> 1)
        if (byteOffset >= frameData.length) continue

        const byte = frameData[byteOffset]
        const colorIndex = (localX & 1) ? (byte >> 4) : (byte & 0x0f)
        if (colorIndex === 0) continue

        const color = palette[colorIndex] || [0, 0, 0]
        const baseX = x * scale
        const baseY = y * scale

        for (let yy = 0; yy < scale; yy += 1) {
          for (let xx = 0; xx < scale; xx += 1) {
            const index = ((baseY + yy) * imageData.width + baseX + xx) * 4
            imageData.data[index] = color[0]
            imageData.data[index + 1] = color[1]
            imageData.data[index + 2] = color[2]
            imageData.data[index + 3] = 255
          }
        }
      }
    }
  }
}
