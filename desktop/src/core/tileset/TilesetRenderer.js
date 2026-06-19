import { formatHex, pointerToOffset } from "@/util"

export const TILE_RENDER_SCALE = 2
export const TILE_CELL_SIZE = 16 * TILE_RENDER_SCALE
export const MAX_METATILES_PER_TILESET = 512
export const SECONDARY_METATILE_START = 0x200
export const SECONDARY_TILE_START = 0x200
export const MAX_BG_TILE_COUNT = 0x400
export const METATILE_SIZE = 16
export const PRIMARY_PALETTE_COUNT = 6
export const TOTAL_FIELD_PALETTE_COUNT = 13

let tilesetAssetCache = new WeakMap()

function isValidRange(rom, offset, size = 1) {
  return Number.isInteger(offset) && offset >= 0 && offset + size <= rom?.size
}

function getCacheForRom(rom) {
  if (!tilesetAssetCache.has(rom)) tilesetAssetCache.set(rom, new Map())
  return tilesetAssetCache.get(rom)
}

export function clearTilesetAssetCache(rom = null) {
  if (rom) {
    tilesetAssetCache.delete(rom)
    return
  }

  tilesetAssetCache = new WeakMap()
}

export function readTilesetStruct(rom, tilesetPointer) {
  const offset = pointerToOffset(tilesetPointer)
  if (!isValidRange(rom, offset, 0x18)) return null

  return {
    offset,
    pointer: tilesetPointer,
    isCompressed: Boolean(rom.readByte(offset)),
    isSecondary: Boolean(rom.readByte(offset + 0x01)),
    tilesPointer: rom.readPointer(offset + 0x04),
    palettesPointer: rom.readPointer(offset + 0x08),
    metatilesPointer: rom.readPointer(offset + 0x0c),
    metatileAttributesPointer: rom.readPointer(offset + 0x10),
    callbackPointer: rom.readPointer(offset + 0x14),
  }
}

export function decodeBgr555(value) {
  const red = value & 0x1f
  const green = (value >> 5) & 0x1f
  const blue = (value >> 10) & 0x1f
  return [
    Math.round((red * 255) / 31),
    Math.round((green * 255) / 31),
    Math.round((blue * 255) / 31),
  ]
}

export function readRomPalettes(rom, palettesPointer) {
  const offset = pointerToOffset(palettesPointer)
  const palettes = []

  if (!isValidRange(rom, offset, 2)) {
    for (let paletteIndex = 0; paletteIndex < 16; paletteIndex += 1) {
      palettes[paletteIndex] = Array.from({ length: 16 }, (_, colorIndex) => {
        const value = 255 - colorIndex * 17
        return [value, value, value]
      })
    }
    return palettes
  }

  for (let paletteIndex = 0; paletteIndex < 16; paletteIndex += 1) {
    const palette = []

    for (let colorIndex = 0; colorIndex < 16; colorIndex += 1) {
      const colorOffset = offset + (paletteIndex * 16 + colorIndex) * 2
      palette.push(isValidRange(rom, colorOffset, 2) ? decodeBgr555(rom.readWord(colorOffset)) : [0, 0, 0])
    }

    palettes[paletteIndex] = palette
  }

  return palettes
}

export function lz77DecodeFromRom(rom, offset) {
  if (!isValidRange(rom, offset, 4) || rom.readByte(offset) !== 0x10) return null

  const outputLength = rom.readByte(offset + 1) | (rom.readByte(offset + 2) << 8) | (rom.readByte(offset + 3) << 16)
  if (outputLength <= 0 || outputLength > 0x400000) return null

  const output = new Uint8Array(outputLength)
  let sourceOffset = offset + 4
  let targetOffset = 0

  while (targetOffset < outputLength && isValidRange(rom, sourceOffset, 1)) {
    const flags = rom.readByte(sourceOffset)
    sourceOffset += 1

    for (let bit = 7; bit >= 0 && targetOffset < outputLength; bit -= 1) {
      if ((flags & (1 << bit)) === 0) {
        if (!isValidRange(rom, sourceOffset, 1)) return null
        output[targetOffset] = rom.readByte(sourceOffset)
        targetOffset += 1
        sourceOffset += 1
        continue
      }

      if (!isValidRange(rom, sourceOffset, 2)) return null
      const first = rom.readByte(sourceOffset)
      const second = rom.readByte(sourceOffset + 1)
      sourceOffset += 2

      const length = (first >> 4) + 3
      const displacement = ((first & 0x0f) << 8) | second
      const copyOffset = targetOffset - displacement - 1
      if (copyOffset < 0) return null

      for (let index = 0; index < length && targetOffset < outputLength; index += 1) {
        output[targetOffset] = output[copyOffset + index]
        targetOffset += 1
      }
    }
  }

  return targetOffset === outputLength ? output : null
}

export function readRomTiles(rom, tilesetStruct) {
  const offset = pointerToOffset(tilesetStruct?.tilesPointer)
  if (offset === null) return null

  if (tilesetStruct.isCompressed) {
    const decoded = lz77DecodeFromRom(rom, offset)
    if (decoded) return decoded
  }

  const size = Math.min(0x8000, rom.size - offset)
  if (size <= 0) return null
  return rom.readBytes(offset, size)
}

export function readRomMetatiles(rom, tilesetStruct) {
  const offset = pointerToOffset(tilesetStruct?.metatilesPointer)
  if (!isValidRange(rom, offset, 16)) return null

  const attributesOffset = pointerToOffset(tilesetStruct?.metatileAttributesPointer)
  const maxSize = MAX_METATILES_PER_TILESET * METATILE_SIZE
  const sizeByAttributes =
    attributesOffset !== null && attributesOffset > offset
      ? attributesOffset - offset
      : maxSize
  const size = Math.min(maxSize, sizeByAttributes, rom.size - offset)

  if (size <= 0) return null
  return rom.readBytes(offset, size - (size % METATILE_SIZE))
}

export function loadRomTilesetAsset(rom, tilesetPointer) {
  if (!rom || !tilesetPointer) return null

  const cache = getCacheForRom(rom)
  const key = formatHex(tilesetPointer)
  if (cache.has(key)) return cache.get(key)

  const struct = readTilesetStruct(rom, tilesetPointer)
  if (!struct) return null

  const tiles = readRomTiles(rom, struct)
  const metatiles = readRomMetatiles(rom, struct)
  const palettes = readRomPalettes(rom, struct.palettesPointer)
  if (!tiles || !metatiles) return null

  const asset = {
    source: "rom",
    pointer: tilesetPointer,
    struct,
    tiles,
    palettes,
    metatiles,
    tileCount: Math.floor(tiles.length / 32),
    metatileCount: Math.floor(metatiles.length / 16),
  }

  cache.set(key, asset)
  return asset
}

export function getSecondaryTileStart() {
  return SECONDARY_TILE_START
}

export function resolveRomTileSource(primaryAsset, secondaryAsset, preferredAsset, tileId) {
  const secondaryTileStart = getSecondaryTileStart(primaryAsset)

  if (preferredAsset?.struct?.isSecondary && getSecondaryTileIdMode(primaryAsset, preferredAsset) === "local") {
    if (tileId >= 0 && tileId < preferredAsset.tileCount) {
      return { asset: preferredAsset, tileId }
    }
  }

  if (tileId >= secondaryTileStart) {
    const localId = tileId - secondaryTileStart
    if (secondaryAsset && localId >= 0 && localId < secondaryAsset.tileCount) {
      return { asset: secondaryAsset, tileId: localId }
    }
  } else if (primaryAsset && tileId < primaryAsset.tileCount) {
    return { asset: primaryAsset, tileId }
  }

  if (preferredAsset && tileId >= 0 && tileId < preferredAsset.tileCount) {
    return { asset: preferredAsset, tileId }
  }

  if (secondaryAsset && tileId >= 0 && tileId < secondaryAsset.tileCount) {
    return { asset: secondaryAsset, tileId }
  }

  if (primaryAsset && tileId >= 0 && tileId < primaryAsset.tileCount) {
    return { asset: primaryAsset, tileId }
  }

  return null
}

export function getSecondaryTileIdMode(primaryAsset, asset) {
  if (!asset?.struct?.isSecondary) return "global"

  const secondaryTileStart = getSecondaryTileStart(primaryAsset)
  if (asset.tileIdMode && asset.tileIdModeStart === secondaryTileStart) return asset.tileIdMode

  const count = Math.min(MAX_METATILES_PER_TILESET, Math.floor(asset.metatiles.length / 16))
  let globalTileReferences = 0

  for (let metatileId = 0; metatileId < count; metatileId += 1) {
    const base = metatileId * 16

    for (let layer = 0; layer < 8; layer += 1) {
      const entry = asset.metatiles[base + layer * 2] | (asset.metatiles[base + layer * 2 + 1] << 8)
      if ((entry & 0x03ff) >= secondaryTileStart) globalTileReferences += 1
    }
  }

  asset.tileIdModeStart = secondaryTileStart
  asset.tileIdMode = globalTileReferences > 0 ? "global" : "local"
  return asset.tileIdMode
}

export function resolveRomPaletteAsset(primaryAsset, secondaryAsset, fallbackAsset, paletteId) {
  if (paletteId >= PRIMARY_PALETTE_COUNT && paletteId < TOTAL_FIELD_PALETTE_COUNT) {
    return secondaryAsset || fallbackAsset || primaryAsset
  }

  return primaryAsset || fallbackAsset || secondaryAsset
}

export function fillImageData(imageData, color = [255, 255, 255, 255]) {
  for (let index = 0; index < imageData.data.length; index += 4) {
    imageData.data[index] = color[0]
    imageData.data[index + 1] = color[1]
    imageData.data[index + 2] = color[2]
    imageData.data[index + 3] = color[3]
  }
}

export function drawRom8x8TileToImageData(
  imageData,
  dx,
  dy,
  asset,
  tileId,
  paletteId,
  horizontalFlip,
  verticalFlip,
  transparentZero,
  scale = TILE_RENDER_SCALE,
  paletteAsset = asset,
) {
  const tileOffset = tileId * 32
  if (!asset || tileOffset < 0 || tileOffset + 32 > asset.tiles.length) return false

  const palette = paletteAsset?.palettes?.[paletteId] || asset.palettes[paletteId] || asset.palettes[0]
  if (!palette) return false

  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const sourceX = horizontalFlip ? 7 - x : x
      const sourceY = verticalFlip ? 7 - y : y
      const byte = asset.tiles[tileOffset + sourceY * 4 + (sourceX >> 1)]
      const colorIndex = (sourceX & 1) ? (byte >> 4) : (byte & 0x0f)
      if (transparentZero && colorIndex === 0) continue

      const color = palette[colorIndex] || [0, 0, 0]
      const baseX = (dx + x) * scale
      const baseY = (dy + y) * scale

      for (let yy = 0; yy < scale; yy += 1) {
        for (let xx = 0; xx < scale; xx += 1) {
          const dataIndex = ((baseY + yy) * imageData.width + (baseX + xx)) * 4
          imageData.data[dataIndex] = color[0]
          imageData.data[dataIndex + 1] = color[1]
          imageData.data[dataIndex + 2] = color[2]
          imageData.data[dataIndex + 3] = 255
        }
      }
    }
  }

  return true
}

export function drawRomMetatileToImageData(
  imageData,
  cellX,
  cellY,
  metatileAsset,
  metatileId,
  primaryAsset,
  secondaryAsset,
  stats = null,
  scale = TILE_RENDER_SCALE,
  options = {},
) {
  if (!metatileAsset || metatileId < 0) {
    if (stats) stats.missingMetatiles += 1
    return false
  }

  const base = metatileId * 16
  if (base + 16 > metatileAsset.metatiles.length) {
    if (stats) stats.missingMetatiles += 1
    return false
  }

  const positions = [
    [0, 0], [8, 0], [0, 8], [8, 8],
    [0, 0], [8, 0], [0, 8], [8, 8],
  ]
  const transparentZero = options.transparentZero ?? null

  for (let layer = 0; layer < 8; layer += 1) {
    const entry = metatileAsset.metatiles[base + layer * 2] | (metatileAsset.metatiles[base + layer * 2 + 1] << 8)
    const rawTileId = entry & 0x03ff
    const horizontalFlip = (entry & 0x0400) !== 0
    const verticalFlip = (entry & 0x0800) !== 0
    const paletteId = (entry >> 12) & 0x0f
    const [x, y] = positions[layer]
    const resolved = resolveRomTileSource(primaryAsset, secondaryAsset, metatileAsset, rawTileId)
    const paletteAsset = resolveRomPaletteAsset(primaryAsset, secondaryAsset, metatileAsset, paletteId)

    if (options.skipBlankTiles && rawTileId === 0 && paletteId === 0 && !horizontalFlip && !verticalFlip) {
      continue
    }

    if (!resolved) {
      if (stats) stats.missingTiles += 1
      continue
    }

    drawRom8x8TileToImageData(
      imageData,
      cellX * 16 + x,
      cellY * 16 + y,
      resolved.asset,
      resolved.tileId,
      paletteId,
      horizontalFlip,
      verticalFlip,
      transparentZero ?? (layer >= 4),
      scale,
      paletteAsset,
    )
  }

  return true
}

export function getTilesetAssetsForHeader(header) {
  const rom = header?.rom
  const layout = header?.layout
  return {
    primary: loadRomTilesetAsset(rom, layout?.primaryTilesetPointer),
    secondary: loadRomTilesetAsset(rom, layout?.secondaryTilesetPointer),
  }
}

export function getAvailableMetatileBlocks(primaryAsset, secondaryAsset) {
  const blocks = []

  if (primaryAsset?.metatiles?.length) {
    const count = Math.min(MAX_METATILES_PER_TILESET, Math.floor(primaryAsset.metatiles.length / 16))
    for (let blockId = 0; blockId < count; blockId += 1) {
      blocks.push({ blockId, source: "primary" })
    }
  }

  if (secondaryAsset?.metatiles?.length) {
    const count = Math.min(MAX_METATILES_PER_TILESET, Math.floor(secondaryAsset.metatiles.length / 16))
    for (let index = 0; index < count; index += 1) {
      blocks.push({ blockId: SECONDARY_METATILE_START + index, source: "secondary" })
    }
  }

  return blocks
}

export function getUsedMapBlocks(header) {
  const layout = header?.layout
  const rom = header?.rom
  if (!rom || !layout || !isValidRange(rom, layout.mapOffset, layout.width * layout.height * 2)) return []

  const blocks = new Map()
  for (let y = 0; y < layout.height; y += 1) {
    for (let x = 0; x < layout.width; x += 1) {
      const raw = rom.readWord(layout.mapOffset + (y * layout.width + x) * 2)
      const blockId = raw & 0x03ff
      blocks.set(blockId, { blockId, source: blockId >= SECONDARY_METATILE_START ? "secondary" : "primary" })
    }
  }

  return [...blocks.values()].sort((left, right) => left.blockId - right.blockId)
}

export function drawFallbackMetatile(ctx, x, y, size, blockId) {
  const hue = (blockId * 37) % 360
  ctx.fillStyle = `hsl(${hue} 52% 82%)`
  ctx.fillRect(x, y, size, size)
  ctx.strokeStyle = `hsl(${hue} 42% 54%)`
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)
  ctx.fillStyle = "#1f2937"
  ctx.font = `${Math.max(9, Math.floor(size * 0.22))}px Consolas, Monaco, monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(formatHex(blockId, 3), x + size / 2, y + size / 2)
}

export function drawMetatilePreviewToCanvas(canvas, blockId, header, options = {}) {
  const ctx = canvas?.getContext("2d")
  if (!ctx) return

  const { primary, secondary } = getTilesetAssetsForHeader(header)
  const useSecondary = blockId >= SECONDARY_METATILE_START
  const asset = useSecondary ? secondary : primary
  const localId = useSecondary ? blockId - SECONDARY_METATILE_START : blockId

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!asset) {
    drawFallbackMetatile(ctx, 0, 0, canvas.width, blockId)
    return
  }

  const imageData = ctx.createImageData(TILE_CELL_SIZE, TILE_CELL_SIZE)
  fillImageData(imageData)
  drawRomMetatileToImageData(imageData, 0, 0, asset, localId, primary, secondary, null, TILE_RENDER_SCALE, options)
  ctx.putImageData(imageData, 0, 0)
}

export function drawMapGrid(ctx, width, height, cellSize = TILE_CELL_SIZE) {
  ctx.save()
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1

  for (let x = 0; x <= width; x += 1) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize + 0.5, 0)
    ctx.lineTo(x * cellSize + 0.5, height * cellSize)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += 1) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize + 0.5)
    ctx.lineTo(width * cellSize, y * cellSize + 0.5)
    ctx.stroke()
  }

  ctx.restore()
}

export function renderHeaderMapToCanvas(canvas, header, options = {}) {
  const ctx = canvas?.getContext("2d")
  const layout = header?.layout
  const rom = header?.rom
  const stats = {
    rendered: false,
    missingMetatiles: 0,
    missingTiles: 0,
    fallback: false,
  }

  if (!ctx || !layout || !rom || !isValidRange(rom, layout.mapOffset, layout.width * layout.height * 2)) {
    return stats
  }

  const cellSize = options.cellSize || TILE_CELL_SIZE
  canvas.width = layout.width * cellSize
  canvas.height = layout.height * cellSize
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { primary, secondary } = getTilesetAssetsForHeader(header)
  if (!primary && !secondary) {
    stats.fallback = true

    for (let y = 0; y < layout.height; y += 1) {
      for (let x = 0; x < layout.width; x += 1) {
        const raw = rom.readWord(layout.mapOffset + (y * layout.width + x) * 2)
        drawFallbackMetatile(ctx, x * cellSize, y * cellSize, cellSize, raw & 0x03ff)
      }
    }

    if (options.showGrid) drawMapGrid(ctx, layout.width, layout.height, cellSize)
    stats.rendered = true
    return stats
  }

  const imageData = ctx.createImageData(layout.width * cellSize, layout.height * cellSize)
  fillImageData(imageData)

  for (let y = 0; y < layout.height; y += 1) {
    for (let x = 0; x < layout.width; x += 1) {
      const raw = rom.readWord(layout.mapOffset + (y * layout.width + x) * 2)
      const blockId = raw & 0x03ff
      const useSecondary = blockId >= SECONDARY_METATILE_START
      const asset = useSecondary ? secondary : primary
      const localId = useSecondary ? blockId - SECONDARY_METATILE_START : blockId

      if (!drawRomMetatileToImageData(imageData, x, y, asset, localId, primary, secondary, stats)) {
        stats.fallback = true
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  if (stats.fallback) {
    for (let y = 0; y < layout.height; y += 1) {
      for (let x = 0; x < layout.width; x += 1) {
        const raw = rom.readWord(layout.mapOffset + (y * layout.width + x) * 2)
        const blockId = raw & 0x03ff
        const useSecondary = blockId >= SECONDARY_METATILE_START
        const asset = useSecondary ? secondary : primary
        const localId = useSecondary ? blockId - SECONDARY_METATILE_START : blockId
        const base = localId * 16
        if (!asset || base + 16 > asset.metatiles.length) {
          drawFallbackMetatile(ctx, x * cellSize, y * cellSize, cellSize, blockId)
        }
      }
    }
  }

  if (options.showGrid) drawMapGrid(ctx, layout.width, layout.height, cellSize)
  stats.rendered = true
  return stats
}

export function getMapCellOffset(header, x, y) {
  const layout = header?.layout
  const rom = header?.rom
  if (!layout || !rom) return null
  if (x < 0 || y < 0 || x >= layout.width || y >= layout.height) return null

  const offset = layout.mapOffset + (y * layout.width + x) * 2
  return isValidRange(rom, offset, 2) ? offset : null
}

export function readMetatileAttributeInfo(header, blockId) {
  const rom = header?.rom
  const { primary, secondary } = getTilesetAssetsForHeader(header)
  const useSecondary = blockId >= SECONDARY_METATILE_START
  const asset = useSecondary ? secondary : primary
  const localMetatileId = useSecondary ? blockId - SECONDARY_METATILE_START : blockId
  const attributesOffset = pointerToOffset(asset?.struct?.metatileAttributesPointer)
  const valueOffset = attributesOffset === null ? null : attributesOffset + localMetatileId * 2

  if (!asset || !isValidRange(rom, valueOffset, 2)) {
    return {
      source: useSecondary ? "secondary" : "primary",
      localMetatileId,
      rawAttributes: null,
      behavior: null,
      collision: null,
      encounterType: null,
      terrainType: null,
    }
  }

  const rawAttributes = rom.readWord(valueOffset)
  return {
    source: useSecondary ? "secondary" : "primary",
    localMetatileId,
    rawAttributes,
    behavior: rawAttributes & 0x01ff,
    collision: (rawAttributes >> 9) & 0x03,
    encounterType: (rawAttributes >> 11) & 0x07,
    terrainType: (rawAttributes >> 14) & 0x03,
  }
}

export function readMapCellInfo(header, x, y) {
  const offset = getMapCellOffset(header, x, y)
  if (offset === null) return null

  const rawBlock = header.rom.readWord(offset)
  const blockId = rawBlock & 0x03ff
  return {
    x,
    y,
    offset,
    rawBlock,
    blockId,
    collision: (rawBlock >> 10) & 0x03,
    elevation: (rawBlock >> 12) & 0x0f,
    attributes: readMetatileAttributeInfo(header, blockId),
  }
}

export function writeMapBlockId(header, x, y, blockId) {
  const offset = getMapCellOffset(header, x, y)
  if (offset === null) return false

  const oldRaw = header.rom.readWord(offset)
  const newRaw = (oldRaw & 0xfc00) | (blockId & 0x03ff)
  header.rom.writeWord(offset, newRaw)
  return newRaw !== oldRaw
}

export function writeMapCollision(header, x, y, collision, elevation) {
  const offset = getMapCellOffset(header, x, y)
  if (offset === null) return false

  const oldRaw = header.rom.readWord(offset)
  const blockId = oldRaw & 0x03ff
  const newRaw = blockId | ((collision & 0x03) << 10) | ((elevation & 0x0f) << 12)
  header.rom.writeWord(offset, newRaw)
  return newRaw !== oldRaw
}
