// ============================================================
// Event 解析
// ============================================================
function parseObjectEvent(baseOff, index) {
  const off = baseOff + index * OBJECT_EVENT_SIZE;

  const localId = readU8(off + 0x00);
  const graphicsId = readU8(off + 0x01);
  const kind = readU8(off + 0x02);
  const movementType = readU8(off + 0x03);
  const x = readS16(off + 0x04);
  const y = readS16(off + 0x06);
  const elevation = readU8(off + 0x08);
  const movementRange = readU8(off + 0x09);
  const movementRangeX = movementRange & 0x0F;
  const movementRangeY = (movementRange >> 4) & 0x0F;
  const unknownA = readU16(off + 0x0A);
  const trainerType = readU16(off + 0x0C);
  const trainerRange = readU16(off + 0x0E);
  const scriptPtr = readPtr(off + 0x10);
  const scriptOff = ptrToOffset(scriptPtr);
  const flagId = readU16(off + 0x14);
  const unknown16 = readU16(off + 0x16);

  const trainerBattle = parseTrainerBattleScript(scriptOff);

  return {
    type: "object",
    index,
    offset: off,

    localId,
    graphicsId,
    kind,
    movementType,
    x,
    y,
    elevation,
    movementRangeX,
    movementRangeY,
    unknownA,
    trainerType,
    trainerRange,
    scriptPtr,
    scriptOff,
    flagId,
    unknown16,

    trainerBattle,
  };
}

function parseWarpEvent(baseOff, index) {
  const off = baseOff + index * WARP_EVENT_SIZE;

  return {
    type: "warp",
    index,
    offset: off,
    x: readS16(off + 0x00),
    y: readS16(off + 0x02),
    elevation: readU8(off + 0x04),
    warpId: readU8(off + 0x05),
    mapNum: readU8(off + 0x06),
    mapGroup: readU8(off + 0x07),
  };
}

function parseCoordEvent(baseOff, index) {
  const off = baseOff + index * COORD_EVENT_SIZE;
  const scriptPtr = readPtr(off + 0x0C);

  return {
    type: "coord",
    index,
    offset: off,
    x: readS16(off + 0x00),
    y: readS16(off + 0x02),
    elevation: readU8(off + 0x04),
    trigger: readU16(off + 0x06),
    indexValue: readU16(off + 0x08),
    scriptPtr,
    scriptOff: ptrToOffset(scriptPtr),
  };
}

function parseBgEvent(baseOff, index) {
  const off = baseOff + index * BG_EVENT_SIZE;
  const scriptPtr = readPtr(off + 0x08);

  return {
    type: "bg",
    index,
    offset: off,
    x: readS16(off + 0x00),
    y: readS16(off + 0x02),
    elevation: readU8(off + 0x04),
    kind: readU8(off + 0x05),
    data0: readU16(off + 0x06),
    scriptPtr,
    scriptOff: ptrToOffset(scriptPtr),
  };
}

function loadMapEvents(header) {
  const events = [];
  const e = header.events;

  for (let i = 0; i < e.objectCount; i++) {
    events.push(parseObjectEvent(e.objectOff, i));
  }

  for (let i = 0; i < e.warpCount; i++) {
    events.push(parseWarpEvent(e.warpOff, i));
  }

  for (let i = 0; i < e.coordCount; i++) {
    events.push(parseCoordEvent(e.coordOff, i));
  }

  for (let i = 0; i < e.bgCount; i++) {
    events.push(parseBgEvent(e.bgOff, i));
  }

  return events;
}
