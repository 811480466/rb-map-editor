// ============================================================
// 区域地图名称
// ============================================================
function readRegionMapName(regionMapSectionId) {
  const entry = G_REGION_MAP_ENTRIES + regionMapSectionId * REGION_MAP_ENTRY_SIZE;

  if (!isValidOffset(entry, REGION_MAP_ENTRY_SIZE)) {
    return {
      id: regionMapSectionId,
      name: "",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      namePtr: 0,
      nameOff: null,
      suffixCode: 0,
    };
  }

  const x = readU8(entry + 0);
  const y = readU8(entry + 1);
  const width = readU8(entry + 2);
  const height = readU8(entry + 3);
  const namePtr = readU32(entry + 4);
  const nameOff = ptrToOffset(namePtr);

  let name = "";

  if (nameOff !== null && isValidOffset(nameOff, 1)) {
    name = decodePokemonText(nameOff).trim();
  }

  return {
    id: regionMapSectionId,
    name,
    x,
    y,
    width,
    height,
    namePtr,
    nameOff,
    suffixCode: 0,
  };
}

// ============================================================
// MapLayout
// ============================================================
function parseMapLayout(layoutOff) {
  if (!isValidOffset(layoutOff, 0x18)) return null;

  const width = readU32(layoutOff + 0x00);
  const height = readU32(layoutOff + 0x04);
  const borderPtr = readPtr(layoutOff + 0x08);
  const mapPtr = readPtr(layoutOff + 0x0C);
  const primaryTilesetPtr = readPtr(layoutOff + 0x10);
  const secondaryTilesetPtr = readPtr(layoutOff + 0x14);

  if (width <= 0 || height <= 0 || width > 512 || height > 512) return null;
  if (!isValidPtr(mapPtr, Math.min(width * height * 2, 64))) return null;
  if (!isValidPtr(primaryTilesetPtr, 4)) return null;
  if (!isValidPtr(secondaryTilesetPtr, 4)) return null;

  return {
    offset: layoutOff,
    width,
    height,
    borderPtr,
    mapPtr,
    primaryTilesetPtr,
    secondaryTilesetPtr,
  };
}

// ============================================================
// MapEvents
// ============================================================
function parseMapEvents(eventsOff) {
  if (!isValidOffset(eventsOff, MAP_EVENTS_SIZE)) return null;

  const objectCount = readU8(eventsOff + 0x00);
  const warpCount = readU8(eventsOff + 0x01);
  const coordCount = readU8(eventsOff + 0x02);
  const bgCount = readU8(eventsOff + 0x03);

  const objectPtr = readPtr(eventsOff + 0x04);
  const warpPtr = readPtr(eventsOff + 0x08);
  const coordPtr = readPtr(eventsOff + 0x0C);
  const bgPtr = readPtr(eventsOff + 0x10);

  if (objectCount > 100 || warpCount > 100 || coordCount > 160 || bgCount > 160) return null;

  const objectOff = ptrToOffset(objectPtr);
  const warpOff = ptrToOffset(warpPtr);
  const coordOff = ptrToOffset(coordPtr);
  const bgOff = ptrToOffset(bgPtr);

  if (objectCount > 0 && !isValidOffset(objectOff, objectCount * OBJECT_EVENT_SIZE)) return null;
  if (warpCount > 0 && !isValidOffset(warpOff, warpCount * WARP_EVENT_SIZE)) return null;
  if (coordCount > 0 && !isValidOffset(coordOff, coordCount * COORD_EVENT_SIZE)) return null;
  if (bgCount > 0 && !isValidOffset(bgOff, bgCount * BG_EVENT_SIZE)) return null;

  return {
    offset: eventsOff,
    objectCount,
    warpCount,
    coordCount,
    bgCount,
    objectPtr,
    warpPtr,
    coordPtr,
    bgPtr,
    objectOff,
    warpOff,
    coordOff,
    bgOff,
  };
}

// ============================================================
// MapHeader
// struct MapHeader
// {
//   +0x00 mapLayout
//   +0x04 events
//   +0x08 mapScripts
//   +0x0C connections
//   +0x10 music
//   +0x12 mapLayoutId
//   +0x14 regionMapSectionId
//   +0x15 cave
//   +0x16 weather
//   +0x17 mapType
//   +0x18 filler_18[2]
//   +0x1A flags bitfield
//   +0x1B battleType
// }
// ============================================================
function parseMapHeader(headerOff) {
  if (!isValidOffset(headerOff, MAP_HEADER_SIZE)) return null;

  const layoutPtr = readPtr(headerOff + 0x00);
  const eventsPtr = readPtr(headerOff + 0x04);
  const scriptsPtr = readPtr(headerOff + 0x08);
  const connectionsPtr = readPtr(headerOff + 0x0C);

  const layoutOff = ptrToOffset(layoutPtr);
  const eventsOff = ptrToOffset(eventsPtr);

  if (!isValidOffset(layoutOff, 0x18)) return null;
  if (!isValidOffset(eventsOff, MAP_EVENTS_SIZE)) return null;

  const layout = parseMapLayout(layoutOff);
  const events = parseMapEvents(eventsOff);

  if (!layout || !events) return null;

  const music = readU16(headerOff + 0x10);
  const mapLayoutId = readU16(headerOff + 0x12);
  const regionMapSectionId = readU8(headerOff + 0x14);
  const cave = readU8(headerOff + 0x15);
  const weather = readU8(headerOff + 0x16);
  const mapType = readU8(headerOff + 0x17);

  const filler18_0 = readU8(headerOff + 0x18);
  const filler18_1 = readU8(headerOff + 0x19);

  const mapFlags = readU8(headerOff + 0x1A);
  const allowCycling = (mapFlags & 0x01) !== 0;
  const allowEscaping = (mapFlags & 0x02) !== 0;
  const allowRunning = (mapFlags & 0x04) !== 0;
  const showMapName = (mapFlags >> 3) & 0x1F;

  const battleType = readU8(headerOff + 0x1B);

  const regionMap = readRegionMapName(regionMapSectionId);

  return {
    offset: headerOff,
    ptr: GBA_BASE + headerOff,

    layoutPtr,
    eventsPtr,
    scriptsPtr,
    connectionsPtr,

    layout,
    events,

    music,
    mapLayoutId,
    regionMapSectionId,
    regionMap,

    cave,
    weather,
    mapType,

    filler18_0,
    filler18_1,

    mapFlags,
    allowCycling,
    allowEscaping,
    allowRunning,
    showMapName,

    battleType,
  };
}

// ============================================================
// 扫描 MapHeader 候选
// ============================================================
function scanMapHeaders() {
  const found = [];
  const seen = new Set();
  const regionMapNameCounts = new Map();

  for (let off = 0; off < rom.length - MAP_HEADER_SIZE; off += 4) {
    const header = parseMapHeader(off);
    if (!header) continue;

    // 过滤无名的候选，减少误判
    const name = header.regionMap?.name?.trim() ?? "";
    // if (!name) continue;

    // // 再过滤一些明显异常但结构上碰巧通过的数据
    // if (header.layout.width < 2 || header.layout.height < 2) continue;
    // if (header.events.objectCount === 0 &&
    //     header.events.warpCount === 0 &&
    //     header.events.coordCount === 0 &&
    //     header.events.bgCount === 0) {
    //   continue;
    // }

    // const key = [
    //   header.offset,
    //   header.layout.offset,
    //   header.events.offset,
    //   header.layout.width,
    //   header.layout.height,
    //   header.regionMapSectionId,
    // ].join(":");

    // if (seen.has(key)) continue;
    // seen.add(key);

    header.id = found.length;
    const regionMapName = header.regionMap?.name ?? "";
    const suffixCode = regionMapNameCounts.get(regionMapName) ?? 0;
    if (header.regionMap) header.regionMap.suffixCode = suffixCode;
    regionMapNameCounts.set(regionMapName, suffixCode + 1);
    found.push(header);
  }

  // found.sort((a, b) => {
  //   const an = a.regionMap?.name ?? "";
  //   const bn = b.regionMap?.name ?? "";
  //   const c = an.localeCompare(bn);
  //   if (c !== 0) return c;
  //   return a.offset - b.offset;
  // });

  return found;
}
