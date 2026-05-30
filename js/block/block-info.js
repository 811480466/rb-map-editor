// ============================================================
// 地图格子 blockId / behavior / collision 查看
// ============================================================

function ensureCellTooltip() {
  let el = document.getElementById("cellTooltip");
  if (!el) {
    el = document.createElement("div");
    el.id = "cellTooltip";
    el.className = "cell-tooltip";
    document.body.appendChild(el);
  }

  Object.assign(el.style, {
    position: "fixed",
    display: "none",
    zIndex: "99999",
    pointerEvents: "none",
    maxWidth: "320px",
    padding: "7px 9px",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#fff",
    fontSize: "12px",
    lineHeight: "1.45",
    whiteSpace: "pre",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
  });

  return el;
}

function getMapCellFromMouseEvent(e) {
  if (!currentMap) return null;
  const rect = canvas.getBoundingClientRect();
  const cs = getCellSize();
  const x = Math.floor((e.clientX - rect.left) / cs);
  const y = Math.floor((e.clientY - rect.top) / cs);
  if (x < 0 || y < 0 || x >= currentMap.layout.width || y >= currentMap.layout.height) return null;
  return { x, y };
}

function getMetatileAttributeInfo(blockId) {
  if (!currentMap || !rom) return null;

  const primaryTs = readTilesetStruct(currentMap.layout.primaryTilesetPtr);
  const secondaryTs = readTilesetStruct(currentMap.layout.secondaryTilesetPtr);
  const useSecondary = blockId >= 512;
  const localMetatileId = useSecondary ? blockId - 512 : blockId;
  const ts = useSecondary ? secondaryTs : primaryTs;

  if (!ts) {
    return {
      source: useSecondary ? "secondary" : "primary",
      localMetatileId,
      attributesPtr: null,
      attributesOff: null,
      rawAttributes: null,
      behavior: null,
      collision: null,
      encounterType: null,
      terrainType: null,
      note: "tileset 结构无效，无法读取属性",
    };
  }

  const attrOff = ptrToOffset(ts.metatileAttributesPtr);
  const valueOff = attrOff === null ? null : attrOff + localMetatileId * 2;
  if (attrOff === null || !isValidOffset(valueOff, 2)) {
    return {
      source: useSecondary ? "secondary" : "primary",
      localMetatileId,
      attributesPtr: ts.metatileAttributesPtr,
      attributesOff: attrOff,
      rawAttributes: null,
      behavior: null,
      collision: null,
      encounterType: null,
      terrainType: null,
      note: "metatileAttributes 指针无效或越界",
    };
  }

  const raw = readU16(valueOff);
  // pokeemerald 常见 16-bit metatile attribute 拆分：behavior 9bit, collision 2bit, encounter 3bit, terrain 2bit。
  return {
    source: useSecondary ? "secondary" : "primary",
    localMetatileId,
    attributesPtr: ts.metatileAttributesPtr,
    attributesOff: attrOff,
    attributeValueOff: valueOff,
    rawAttributes: raw,
    behavior: raw & 0x01FF,
    collision: (raw >> 9) & 0x03,
    encounterType: (raw >> 11) & 0x07,
    terrainType: (raw >> 14) & 0x03,
    note: "按 Gen3 常见 metatileAttributes 位域解析；如改版修改结构，请以 rawAttributes 为准",
  };
}

function getMapCellInfo(x, y) {
  if (!currentMap || !rom) return null;
  const w = currentMap.layout.width;
  const h = currentMap.layout.height;
  if (x < 0 || y < 0 || x >= w || y >= h) return null;

  const mapOff = ptrToOffset(currentMap.layout.mapPtr);
  const cellOff = mapOff === null ? null : mapOff + (y * w + x) * 2;
  if (mapOff === null || !isValidOffset(cellOff, 2)) return null;

  const rawBlock = readU16(cellOff);
  const blockId = rawBlock & 0x03FF;
  const attr = getMetatileAttributeInfo(blockId);
  const events = currentEvents.filter(ev => ev.x === x && ev.y === y);

  return {
    x,
    y,
    cellOff,
    rawBlock,
    blockId,
    blockHex: hex(blockId, 4),
    blockSource: blockId >= 512 ? "secondary" : "primary",
    localMetatileId: blockId >= 512 ? blockId - 512 : blockId,
    attributes: attr,
    events,
  };
}

function formatCellTooltip(info) {
  if (!info) return "";
  const a = info.attributes || {};
  const lines = [
    `x:${info.x} y:${info.y}`,
    `blockId=${info.blockId} (${info.blockHex})`,
    `${info.blockSource} metatile=${info.localMetatileId}`,
  ];
  if (a.rawAttributes !== null && a.rawAttributes !== undefined) {
    lines.push(`behavior=${hex(a.behavior, 3)} collision=${a.collision}`);
    lines.push(`encounter=${a.encounterType} terrain=${a.terrainType}`);
  } else {
    lines.push(`attributes: ${a.note || "无法读取"}`);
  }
  if (info.events.length) lines.push(`events=${info.events.map(ev => ev.type + "#" + ev.index).join(", ")}`);
  return lines.join("\n");
}

function formatCellForDisplay(info) {
  if (!info) return "未选中有效地图格子。";
  const a = info.attributes || {};
  const eventSummary = info.events.map(ev => ({ type: ev.type, index: ev.index, offset: hex(ev.offset), x: ev.x, y: ev.y }));
  return JSON.stringify({
    type: "map_cell",
    x: info.x,
    y: info.y,
    cellOffset: hex(info.cellOff),
    rawBlock: hex(info.rawBlock, 4),
    blockId: info.blockId,
    blockHex: info.blockHex,
    blockSource: info.blockSource,
    localMetatileId: info.localMetatileId,
    metatileAttributes: {
      source: a.source,
      attributesPtr: hex(a.attributesPtr),
      attributesOff: hex(a.attributesOff),
      attributeValueOff: hex(a.attributeValueOff),
      rawAttributes: a.rawAttributes === null || a.rawAttributes === undefined ? null : hex(a.rawAttributes, 4),
      behavior: a.behavior === null || a.behavior === undefined ? null : hex(a.behavior, 3),
      collision: a.collision,
      encounterType: a.encounterType,
      terrainType: a.terrainType,
      note: a.note,
    },
    eventsOnCell: eventSummary,
  }, null, 2);
}

function showCellDetail(info) {
  selectedEventKey = null;
  for (const row of document.querySelectorAll(".event-row")) row.classList.remove("active");
  document.getElementById("eventDetail").textContent = formatCellForDisplay(info);
  renderWarpTools(null);
}

canvas.addEventListener("click", (e) => {
  if (!currentMap) return;

  const cell = getMapCellFromMouseEvent(e);
  if (!cell) return;
  const info = getMapCellInfo(cell.x, cell.y);

  const hits = currentEvents.filter(ev => ev.x === cell.x && ev.y === cell.y);
  if (hits.length) {
    showEventDetail(hits[0]);
  } else {
    showCellDetail(info);
  }
});

canvas.addEventListener("dblclick", (e) => {
  if (!currentMap) return;

  const cell = getMapCellFromMouseEvent(e);
  if (!cell) return;

  const warp = currentEvents.find(ev => ev.type === "warp" && ev.x === cell.x && ev.y === cell.y);
  if (warp) jumpToWarpTarget(warp, true);
});

canvas.addEventListener("mousemove", (e) => {
  const tooltip = ensureCellTooltip();

  if (!currentMap) {
    tooltip.style.display = "none";
    return;
  }

  const cell = getMapCellFromMouseEvent(e);
  if (!cell) {
    tooltip.style.display = "none";
    return;
  }

  const info = getMapCellInfo(cell.x, cell.y);
  tooltip.textContent = formatCellTooltip(info);
  tooltip.style.left = `${e.clientX + 14}px`;
  tooltip.style.top = `${e.clientY + 14}px`;
  tooltip.style.display = "block";
});

canvas.addEventListener("mouseleave", () => {
  const tooltip = document.getElementById("cellTooltip");
  if (tooltip) tooltip.style.display = "none";
});
