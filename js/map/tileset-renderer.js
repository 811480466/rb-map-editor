// ============================================================
// Tileset ZIP / 图块渲染
// ============================================================
function getCellSize() {
  return currentCellSize || CELL_SIZE;
}

function bytesEqualRom(off, bytes) {
  if (!isValidOffset(off, bytes.length)) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (rom[off + i] !== bytes[i]) return false;
  }
  return true;
}

function readTilesetStruct(tilesetPtr) {
  const off = ptrToOffset(tilesetPtr);
  if (off === null || !isValidOffset(off, 0x18)) return null;
  return {
    offset: off,
    ptr: tilesetPtr,
    isCompressed: readU8(off + 0x00),
    isSecondary: readU8(off + 0x01),
    tilesPtr: readPtr(off + 0x04),
    palettesPtr: readPtr(off + 0x08),
    metatilesPtr: readPtr(off + 0x0C),
    metatileAttributesPtr: readPtr(off + 0x10),
    callbackPtr: readPtr(off + 0x14),
  };
}


// ============================================================
// ROM 原生 Tileset 渲染
// ============================================================
function decodeBgr555(value) {
  const r5 = value & 0x1F;
  const g5 = (value >> 5) & 0x1F;
  const b5 = (value >> 10) & 0x1F;
  return [
    Math.round(r5 * 255 / 31),
    Math.round(g5 * 255 / 31),
    Math.round(b5 * 255 / 31),
  ];
}

function readRomPalettes(palettesPtr) {
  const off = ptrToOffset(palettesPtr);
  const palettes = [];
  if (off === null || !isValidOffset(off, 2)) {
    for (let p = 0; p < 16; p++) {
      palettes[p] = Array.from({ length: 16 }, (_, i) => [255 - i * 17, 255 - i * 17, 255 - i * 17]);
    }
    return palettes;
  }

  for (let p = 0; p < 16; p++) {
    const pal = [];
    for (let i = 0; i < 16; i++) {
      const colorOff = off + (p * 16 + i) * 2;
      pal.push(isValidOffset(colorOff, 2) ? decodeBgr555(readU16(colorOff)) : [0, 0, 0]);
    }
    palettes[p] = pal;
  }
  return palettes;
}

function lz77DecodeFromRom(off) {
  if (!isValidOffset(off, 4)) return null;
  if (readU8(off) !== 0x10) return null;

  const outLen = readU8(off + 1) | (readU8(off + 2) << 8) | (readU8(off + 3) << 16);
  if (outLen <= 0 || outLen > 0x400000) return null;

  const out = new Uint8Array(outLen);
  let src = off + 4;
  let dst = 0;

  while (dst < outLen && isValidOffset(src, 1)) {
    const flags = readU8(src++);
    for (let bit = 7; bit >= 0 && dst < outLen; bit--) {
      if ((flags & (1 << bit)) === 0) {
        if (!isValidOffset(src, 1)) return null;
        out[dst++] = readU8(src++);
      } else {
        if (!isValidOffset(src, 2)) return null;
        const b1 = readU8(src++);
        const b2 = readU8(src++);
        const length = (b1 >> 4) + 3;
        const disp = ((b1 & 0x0F) << 8) | b2;
        const copySrc = dst - disp - 1;
        if (copySrc < 0) return null;
        for (let i = 0; i < length && dst < outLen; i++) {
          out[dst] = out[copySrc + i];
          dst++;
        }
      }
    }
  }

  return dst === outLen ? out : null;
}

function readRawBytesFromRom(ptr, length) {
  const off = ptrToOffset(ptr);
  if (off === null || !isValidOffset(off, length)) return null;
  return new Uint8Array(rom.slice(off, off + length));
}

function readRomTiles(tilesetStruct) {
  const off = ptrToOffset(tilesetStruct.tilesPtr);
  if (off === null) return null;

  if (tilesetStruct.isCompressed) {
    const decoded = lz77DecodeFromRom(off);
    if (decoded) return decoded;
  }

  // 未压缩时没有长度字段，先按最多 1024 个 4bpp tile 读取。
  const maxRaw = Math.min(0x8000, rom.length - off);
  if (maxRaw <= 0) return null;
  return new Uint8Array(rom.slice(off, off + maxRaw));
}

function readRomMetatiles(tilesetStruct) {
  const off = ptrToOffset(tilesetStruct.metatilesPtr);
  if (off === null || !isValidOffset(off, 16)) return null;

  // 不强行猜表长，按从该位置到 ROM 末尾做只读视图；访问时会做边界判断。
  return new Uint8Array(rom.buffer, rom.byteOffset + off, rom.length - off);
}

function loadRomTilesetAsset(tilesetPtr) {
  if (!rom || !tilesetPtr) return null;
  const key = hex(tilesetPtr);
  if (romTilesetAssetCache.has(key)) return romTilesetAssetCache.get(key);

  const ts = readTilesetStruct(tilesetPtr);
  if (!ts) return null;

  const tiles = readRomTiles(ts);
  const metatiles = readRomMetatiles(ts);
  const palettes = readRomPalettes(ts.palettesPtr);

  if (!tiles || !metatiles) return null;

  const asset = {
    source: "rom",
    ptr: tilesetPtr,
    struct: ts,
    tiles,
    palettes,
    metatiles,
    tileCount: Math.floor(tiles.length / 32),
  };

  romTilesetAssetCache.set(key, asset);
  return asset;
}

function drawRom8x8TileToImage(dest, dx, dy, asset, tileId, palId, hflip, vflip, transparentZero) {
  const tileOff = tileId * 32;
  if (!asset || tileOff < 0 || tileOff + 32 > asset.tiles.length) return;
  const pal = asset.palettes[palId] || asset.palettes[0];

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const sx = hflip ? 7 - x : x;
      const sy = vflip ? 7 - y : y;
      const byte = asset.tiles[tileOff + sy * 4 + (sx >> 1)];
      const idx = (sx & 1) ? (byte >> 4) : (byte & 0x0F);
      if (transparentZero && idx === 0) continue;

      const color = pal[idx] || [0, 0, 0];
      const baseX = (dx + x) * TILE_RENDER_SCALE;
      const baseY = (dy + y) * TILE_RENDER_SCALE;

      for (let yy = 0; yy < TILE_RENDER_SCALE; yy++) {
        for (let xx = 0; xx < TILE_RENDER_SCALE; xx++) {
          const di = ((baseY + yy) * dest.width + (baseX + xx)) * 4;
          dest.data[di + 0] = color[0];
          dest.data[di + 1] = color[1];
          dest.data[di + 2] = color[2];
          dest.data[di + 3] = 255;
        }
      }
    }
  }
}

function resolveRomTileSource(primaryAsset, secondaryAsset, preferredAsset, tileId) {
  // Gen 3 地图渲染时，metatile 里的 8x8 tileId 通常是 BG VRAM 的全局编号：
  // 0x000-0x1FF 来自 primary tileset，0x200-0x3FF 来自 secondary tileset。
  // 旧版把 secondary metatile 的 tileId 全部当作 secondary 内部编号，会导致部分地图缺块/错块。
  if (tileId >= 0x200) {
    const localId = tileId - 0x200;
    if (secondaryAsset && localId >= 0 && localId < secondaryAsset.tileCount) {
      return { asset: secondaryAsset, tileId: localId, source: "secondary-global" };
    }
  } else {
    if (primaryAsset && tileId < primaryAsset.tileCount) {
      return { asset: primaryAsset, tileId, source: "primary-global" };
    }
  }

  // 兼容少数资源：如果 metatile 使用局部编号，优先尝试当前 metatile 所属 tileset。
  if (preferredAsset && tileId >= 0 && tileId < preferredAsset.tileCount) {
    return { asset: preferredAsset, tileId, source: "preferred-local" };
  }

  if (secondaryAsset && tileId >= 0 && tileId < secondaryAsset.tileCount) {
    return { asset: secondaryAsset, tileId, source: "secondary-local-fallback" };
  }

  if (primaryAsset && tileId >= 0 && tileId < primaryAsset.tileCount) {
    return { asset: primaryAsset, tileId, source: "primary-local-fallback" };
  }

  return null;
}

function drawRomMetatileToImage(dest, cellX, cellY, metatileAsset, metatileId, primaryAsset, secondaryAsset, stats) {
  if (!metatileAsset || metatileId < 0) {
    if (stats) stats.missingMetatiles++;
    return;
  }

  const base = metatileId * 16;
  if (base + 16 > metatileAsset.metatiles.length) {
    if (stats) stats.missingMetatiles++;
    return;
  }

  const subPos = [
    [0, 0], [8, 0], [0, 8], [8, 8],
    [0, 0], [8, 0], [0, 8], [8, 8],
  ];

  for (let layer = 0; layer < 8; layer++) {
    const lo = metatileAsset.metatiles[base + layer * 2];
    const hi = metatileAsset.metatiles[base + layer * 2 + 1];
    const entry = lo | (hi << 8);
    const rawTileId = entry & 0x03FF;
    const hflip = (entry & 0x0400) !== 0;
    const vflip = (entry & 0x0800) !== 0;
    const palId = (entry >> 12) & 0x0F;
    const [px, py] = subPos[layer];
    const resolved = resolveRomTileSource(primaryAsset, secondaryAsset, metatileAsset, rawTileId);

    if (!resolved) {
      if (stats) stats.missingTiles++;
      continue;
    }

    drawRom8x8TileToImage(
      dest,
      cellX * 16 + px,
      cellY * 16 + py,
      resolved.asset,
      resolved.tileId,
      palId,
      hflip,
      vflip,
      layer >= 4
    );
  }
}

async function renderRomTilesetMap(header, events) {
  if (!document.getElementById("useRomTilesets")?.checked) return false;

  const serial = ++renderSerial;
  const primary = loadRomTilesetAsset(header.layout.primaryTilesetPtr);
  const secondary = loadRomTilesetAsset(header.layout.secondaryTilesetPtr);
  if (!primary && !secondary) return false;
  if (serial !== renderSerial) return true;

  const w = header.layout.width;
  const h = header.layout.height;
  const mapOff = ptrToOffset(header.layout.mapPtr);
  if (mapOff === null || !isValidOffset(mapOff, w * h * 2)) return false;

  currentCellSize = TILE_CELL_SIZE;
  canvas.width = Math.max(w * TILE_CELL_SIZE, 600);
  canvas.height = Math.max(h * TILE_CELL_SIZE, 600);

  const img = ctx.createImageData(w * TILE_CELL_SIZE, h * TILE_CELL_SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i + 0] = 255;
    img.data[i + 1] = 255;
    img.data[i + 2] = 255;
    img.data[i + 3] = 255;
  }

  const renderStats = { missingMetatiles: 0, missingTiles: 0 };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const raw = readU16(mapOff + (y * w + x) * 2);
      const blockId = raw & 0x03FF;
      if (blockId < 512) {
        drawRomMetatileToImage(img, x, y, primary, blockId, primary, secondary, renderStats);
      } else {
        drawRomMetatileToImage(img, x, y, secondary, blockId - 512, primary, secondary, renderStats);
      }
    }
  }

  ctx.putImageData(img, 0, 0);

  ctx.strokeStyle = "rgba(15, 23, 42, 0.10)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_CELL_SIZE, 0);
    ctx.lineTo(x * TILE_CELL_SIZE, h * TILE_CELL_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_CELL_SIZE);
    ctx.lineTo(w * TILE_CELL_SIZE, y * TILE_CELL_SIZE);
    ctx.stroke();
  }

  for (const ev of events) drawEvent(ev);

  const tsP = readTilesetStruct(header.layout.primaryTilesetPtr);
  const tsS = readTilesetStruct(header.layout.secondaryTilesetPtr);
  const status = document.getElementById("tilesetStatus");
  if (status) {
    status.textContent =
      `当前使用 ROM 原生 tileset 渲染：\n` +
      `Primary struct=${hex(header.layout.primaryTilesetPtr)}, tiles=${tsP ? hex(tsP.tilesPtr) : "null"}, metatiles=${tsP ? hex(tsP.metatilesPtr) : "null"}\n` +
      `Secondary struct=${hex(header.layout.secondaryTilesetPtr)}, tiles=${tsS ? hex(tsS.tilesPtr) : "null"}, metatiles=${tsS ? hex(tsS.metatilesPtr) : "null"}\n` +
      `已启用全局 tileId 修正：0x000-0x1FF=primary，0x200-0x3FF=secondary。\n` +
      `缺失 metatile=${renderStats.missingMetatiles}, 缺失 tile=${renderStats.missingTiles}\n` +
      `tilesets.zip 现在只作为备用/对比。`;
  }

  return true;
}

function normalizeDirName(name) {
  return name.replace(/\/+$/, "");
}

function zipEntry(path) {
  return tilesetZip ? tilesetZip.file(path) : null;
}

function parseJascPal(text) {
  const lines = text.trim().split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const count = Number(lines[2] || 16);
  const colors = [];
  for (let i = 0; i < count; i++) {
    const parts = (lines[3 + i] || "0 0 0").split(/\s+/).map(Number);
    colors.push([parts[0] || 0, parts[1] || 0, parts[2] || 0]);
  }
  while (colors.length < 16) colors.push([0, 0, 0]);
  return colors.slice(0, 16);
}

async function loadTilesetAsset(dir) {
  if (!dir) return null;
  if (tilesetAssets.has(dir)) return tilesetAssets.get(dir);

  const meta = tilesetCatalog.find(x => x.dir === dir);
  if (!meta) return null;

  const promise = (async () => {
    const tilesFile = zipEntry(`${dir}/tiles.png`);
    const metaFile = zipEntry(`${dir}/metatiles.bin`);
    if (!tilesFile || !metaFile) return null;

    const blob = await tilesFile.async("blob");
    const bitmap = await createImageBitmap(blob);
    const off = document.createElement("canvas");
    off.width = bitmap.width;
    off.height = bitmap.height;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(bitmap, 0, 0);
    const imageData = octx.getImageData(0, 0, off.width, off.height);

    const metatiles = new Uint8Array(await metaFile.async("arraybuffer"));
    const palettes = [];
    for (let i = 0; i < 16; i++) {
      const palFile = zipEntry(`${dir}/palettes/${String(i).padStart(2, "0")}.pal`);
      if (palFile) {
        palettes[i] = parseJascPal(await palFile.async("text"));
      } else {
        const gray = [];
        for (let j = 0; j < 16; j++) {
          const v = 255 - j * 17;
          gray.push([v, v, v]);
        }
        palettes[i] = gray;
      }
    }

    return {
      dir,
      kind: meta.kind,
      imageData,
      tileWidth: off.width,
      tileHeight: off.height,
      tilesPerRow: Math.floor(off.width / 8),
      tileCount: Math.floor(off.width / 8) * Math.floor(off.height / 8),
      metatiles,
      metatileCount: Math.floor(metatiles.length / 16),
      palettes,
    };
  })();

  tilesetAssets.set(dir, promise);
  return promise;
}

function inferTileIndexFromDecodedRgb(r) {
  // pokeemerald 源码 tiles.png 通常是 16 阶灰度索引图：0=255, 15=0。
  const idx = Math.round((255 - r) / 17);
  return Math.max(0, Math.min(15, idx));
}

function draw8x8TileToImage(dest, dx, dy, asset, tileId, palId, hflip, vflip, transparentZero) {
  const srcX = (tileId % asset.tilesPerRow) * 8;
  const srcY = Math.floor(tileId / asset.tilesPerRow) * 8;
  const pal = asset.palettes[palId] || asset.palettes[0];

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const sx = srcX + (hflip ? 7 - x : x);
      const sy = srcY + (vflip ? 7 - y : y);
      if (sx < 0 || sy < 0 || sx >= asset.tileWidth || sy >= asset.tileHeight) continue;

      const si = (sy * asset.tileWidth + sx) * 4;
      const r = asset.imageData.data[si];
      const idx = inferTileIndexFromDecodedRgb(r);
      if (transparentZero && idx === 0) continue;

      const color = pal[idx] || [0, 0, 0];
      const baseX = (dx + x) * TILE_RENDER_SCALE;
      const baseY = (dy + y) * TILE_RENDER_SCALE;

      for (let yy = 0; yy < TILE_RENDER_SCALE; yy++) {
        for (let xx = 0; xx < TILE_RENDER_SCALE; xx++) {
          const di = ((baseY + yy) * dest.width + (baseX + xx)) * 4;
          dest.data[di + 0] = color[0];
          dest.data[di + 1] = color[1];
          dest.data[di + 2] = color[2];
          dest.data[di + 3] = 255;
        }
      }
    }
  }
}

function resolveZipTileSource(primaryAsset, secondaryAsset, preferredAsset, tileId) {
  if (tileId >= 0x200) {
    const localId = tileId - 0x200;
    if (secondaryAsset && localId >= 0 && localId < secondaryAsset.tileCount) {
      return { asset: secondaryAsset, tileId: localId };
    }
  } else {
    if (primaryAsset && tileId < primaryAsset.tileCount) {
      return { asset: primaryAsset, tileId };
    }
  }

  if (preferredAsset && tileId >= 0 && tileId < preferredAsset.tileCount) {
    return { asset: preferredAsset, tileId };
  }
  if (secondaryAsset && tileId >= 0 && tileId < secondaryAsset.tileCount) {
    return { asset: secondaryAsset, tileId };
  }
  if (primaryAsset && tileId >= 0 && tileId < primaryAsset.tileCount) {
    return { asset: primaryAsset, tileId };
  }
  return null;
}

function drawMetatileToImage(dest, cellX, cellY, metatileAsset, metatileId, primaryAsset, secondaryAsset, stats) {
  if (!metatileAsset || metatileId < 0 || metatileId >= metatileAsset.metatileCount) {
    if (stats) stats.missingMetatiles++;
    return;
  }

  const base = metatileId * 16;
  const subPos = [
    [0, 0], [8, 0], [0, 8], [8, 8],
    [0, 0], [8, 0], [0, 8], [8, 8],
  ];

  for (let layer = 0; layer < 8; layer++) {
    const lo = metatileAsset.metatiles[base + layer * 2];
    const hi = metatileAsset.metatiles[base + layer * 2 + 1];
    if (lo === undefined || hi === undefined) continue;

    const entry = lo | (hi << 8);
    const rawTileId = entry & 0x03FF;
    const hflip = (entry & 0x0400) !== 0;
    const vflip = (entry & 0x0800) !== 0;
    const palId = (entry >> 12) & 0x0F;
    const [px, py] = subPos[layer];
    const resolved = resolveZipTileSource(primaryAsset, secondaryAsset, metatileAsset, rawTileId);

    if (!resolved) {
      if (stats) stats.missingTiles++;
      continue;
    }

    draw8x8TileToImage(
      dest,
      cellX * 16 + px,
      cellY * 16 + py,
      resolved.asset,
      resolved.tileId,
      palId,
      hflip,
      vflip,
      layer >= 4
    );
  }
}

async function renderTilesetMap(header, events) {
  const primaryDir = document.getElementById("primaryTilesetSelect")?.value || "";
  const secondaryDir = document.getElementById("secondaryTilesetSelect")?.value || "";
  if (!primaryDir && !secondaryDir) return false;

  const serial = ++renderSerial;
  const primary = await loadTilesetAsset(primaryDir);
  const secondary = await loadTilesetAsset(secondaryDir);
  if (serial !== renderSerial) return true;

  const w = header.layout.width;
  const h = header.layout.height;
  const mapOff = ptrToOffset(header.layout.mapPtr);
  if (mapOff === null || !isValidOffset(mapOff, w * h * 2)) return false;

  currentCellSize = TILE_CELL_SIZE;
  canvas.width = Math.max(w * TILE_CELL_SIZE, 600);
  canvas.height = Math.max(h * TILE_CELL_SIZE, 600);

  const img = ctx.createImageData(w * TILE_CELL_SIZE, h * TILE_CELL_SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i + 0] = 255;
    img.data[i + 1] = 255;
    img.data[i + 2] = 255;
    img.data[i + 3] = 255;
  }

  const renderStats = { missingMetatiles: 0, missingTiles: 0 };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const raw = readU16(mapOff + (y * w + x) * 2);
      const blockId = raw & 0x03FF;
      if (blockId < 512) {
        drawMetatileToImage(img, x, y, primary, blockId, primary, secondary, renderStats);
      } else {
        drawMetatileToImage(img, x, y, secondary, blockId - 512, primary, secondary, renderStats);
      }
    }
  }

  ctx.putImageData(img, 0, 0);

  // 轻微网格，方便点选事件。
  ctx.strokeStyle = "rgba(15, 23, 42, 0.10)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_CELL_SIZE, 0);
    ctx.lineTo(x * TILE_CELL_SIZE, h * TILE_CELL_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_CELL_SIZE);
    ctx.lineTo(w * TILE_CELL_SIZE, y * TILE_CELL_SIZE);
    ctx.stroke();
  }

  for (const ev of events) drawEvent(ev);
  return true;
}

async function renderMap(header, events) {
  // 优先：直接读取 ROM 内 Tileset 结构、LZ77 tiles、palette、metatiles。
  // 备用：如果关闭 ROM 原生渲染，或 ROM 渲染失败，再用 tilesets.zip。
  const romOk = await renderRomTilesetMap(header, events);
  if (romOk) return;

  const zipOk = tilesetZip ? await renderTilesetMap(header, events) : false;
  if (!zipOk) renderSimpleMap(header, events);
}

async function buildTilesetCatalogFromZip(file) {
  if (typeof JSZip === "undefined") {
    throw new Error("JSZip 没有加载成功。当前 HTML 使用 CDN 加载 JSZip，离线环境请改用解压后的文件夹方案。/n");
  }

  tilesetZip = await JSZip.loadAsync(file);
  tilesetAssets.clear();
  tilesetAutoMatchCache.clear();
  romTilesetAssetCache.clear();

  const dirs = new Map();
  for (const path of Object.keys(tilesetZip.files)) {
    const m = path.match(/^(primary|secondary)\/([^/]+)\/(tiles\.png|metatiles\.bin|palettes\/00\.pal)$/);
    if (!m) continue;
    const dir = `${m[1]}/${m[2]}`;
    if (!dirs.has(dir)) dirs.set(dir, { dir, kind: m[1], name: m[2], hasTiles: false, hasMetatiles: false });
    const item = dirs.get(dir);
    if (path.endsWith("tiles.png")) item.hasTiles = true;
    if (path.endsWith("metatiles.bin")) item.hasMetatiles = true;
  }

  tilesetCatalog = Array.from(dirs.values())
    .filter(x => x.hasTiles && x.hasMetatiles)
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));

  fillTilesetSelects();
  await autoMatchTilesetsForCurrentMap();
  if (currentMap) await renderMap(currentMap, currentEvents);

  return tilesetCatalog;
}

function fillTilesetSelects() {
  const primarySelect = document.getElementById("primaryTilesetSelect");
  const secondarySelect = document.getElementById("secondaryTilesetSelect");
  if (!primarySelect || !secondarySelect) return;

  const fill = (select, kind) => {
    const list = tilesetCatalog.filter(x => x.kind === kind);
    select.innerHTML = `<option value="">不使用 ${kind}</option>`;
    for (const item of list) {
      const opt = document.createElement("option");
      opt.value = item.dir;
      opt.textContent = item.name;
      select.appendChild(opt);
    }
  };

  fill(primarySelect, "primary");
  fill(secondarySelect, "secondary");

  document.getElementById("tilesetStatus").textContent =
    `tilesets.zip 已加载。\n` +
    `Primary: ${tilesetCatalog.filter(x => x.kind === "primary").length} 个\n` +
    `Secondary: ${tilesetCatalog.filter(x => x.kind === "secondary").length} 个\n` +
    `选择地图后会自动尝试匹配；匹配失败可手动选择。`;
}

async function matchTilesetDirByMetatiles(tilesetPtr, kind) {
  if (!rom || !tilesetZip || !tilesetCatalog.length) return "";
  const ts = readTilesetStruct(tilesetPtr);
  if (!ts) return "";
  const metatilesOff = ptrToOffset(ts.metatilesPtr);
  if (metatilesOff === null) return "";

  const cacheKey = `${kind}:${hex(ts.metatilesPtr)}`;
  if (tilesetAutoMatchCache.has(cacheKey)) return tilesetAutoMatchCache.get(cacheKey);

  const candidates = tilesetCatalog.filter(x => x.kind === kind);
  for (const c of candidates) {
    const file = zipEntry(`${c.dir}/metatiles.bin`);
    if (!file) continue;
    const bytes = new Uint8Array(await file.async("arraybuffer"));
    if (bytesEqualRom(metatilesOff, bytes)) {
      tilesetAutoMatchCache.set(cacheKey, c.dir);
      return c.dir;
    }
  }

  tilesetAutoMatchCache.set(cacheKey, "");
  return "";
}

async function autoMatchTilesetsForCurrentMap() {
  if (!currentMap || !tilesetZip || !document.getElementById("autoMatchTilesets")?.checked) return;

  const p = await matchTilesetDirByMetatiles(currentMap.layout.primaryTilesetPtr, "primary");
  const s = await matchTilesetDirByMetatiles(currentMap.layout.secondaryTilesetPtr, "secondary");

  const ps = document.getElementById("primaryTilesetSelect");
  const ss = document.getElementById("secondaryTilesetSelect");
  if (p && ps) ps.value = p;
  if (s && ss) ss.value = s;

  const tsP = readTilesetStruct(currentMap.layout.primaryTilesetPtr);
  const tsS = readTilesetStruct(currentMap.layout.secondaryTilesetPtr);
  document.getElementById("tilesetStatus").textContent =
    `当前地图 tileset 匹配：\n` +
    `Primary ROM metatiles=${tsP ? hex(tsP.metatilesPtr) : "null"} -> ${p || "未匹配"}\n` +
    `Secondary ROM metatiles=${tsS ? hex(tsS.metatilesPtr) : "null"} -> ${s || "未匹配"}\n` +
    `如果渲染不对，可以手动改下方两个选项。`;
}
