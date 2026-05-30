// ============================================================
// UI
// ============================================================
let selectedMapIndex = -1;

function setActiveTab(tabName) {
  const isEvents = tabName === "events";

  document.getElementById("tabEvents").classList.toggle("active", isEvents);
  document.getElementById("tabMapInfo").classList.toggle("active", !isEvents);
  document.getElementById("eventTab").classList.toggle("active", isEvents);
  document.getElementById("mapInfoTab").classList.toggle("active", !isEvents);
}

function buildConnectionsInfoText(header) {
  if (!header) return "";
  const parsed = parseMapConnections(header.connectionsPtr);
  header.connectionsParsed = parsed;

  if (!parsed.list.length) {
    return `Connections     : count=${parsed.count}, status=${parsed.status}\n`;
  }

  const lines = [];
  lines.push(`Connections     : count=${parsed.count}, headerOff=${parsed.offset !== null ? hex(parsed.offset) : "null"}, dataOff=${parsed.dataOff !== null ? hex(parsed.dataOff) : "null"}`);

  for (const conn of parsed.list) {
    const targetMap = findMapByGroupNum(conn.mapGroup, conn.mapNum);
    const targetName = targetMap ? getMapDisplayNameWithCode(targetMap) : "未匹配地图";
    const info = getConnectionDestinationInfo(conn, header);
    lines.push(
      `  #${conn.index} ${connectionDirectionName(conn.direction)} offset=${conn.connectionOffset} -> group=${conn.mapGroup}, map=${conn.mapNum} / ${targetName} / ${info?.statusText ?? "未能判断"}`
    );
  }

  return lines.join("\n") + "\n";
}

function buildMapInfoText(header) {
  if (!header) return "未加载地图。";

  return (
    `Map name         : ${header.regionMap?.name ?? ""}\n` +
    `Map suffix code  : ${header.regionMap?.suffixCode ?? 0}\n` +
    `Region section   : ${header.regionMapSectionId}\n` +
    `Region entry     : x=${header.regionMap?.x ?? 0}, y=${header.regionMap?.y ?? 0}, w=${header.regionMap?.width ?? 0}, h=${header.regionMap?.height ?? 0}\n` +
    `Region name ptr  : ${hex(header.regionMap?.namePtr ?? 0)}\n` +
    `Region name off  : ${header.regionMap?.nameOff !== null ? hex(header.regionMap.nameOff) : "null"}\n\n` +

    `MapHeader offset : ${hex(header.offset)}\n` +
    `MapHeader ptr    : ${hex(header.ptr)}\n\n` +

    `Layout ptr       : ${hex(header.layoutPtr)}\n` +
    `Layout offset    : ${hex(header.layout.offset)}\n` +
    `Map size         : ${header.layout.width} x ${header.layout.height}\n` +
    `Border ptr       : ${hex(header.layout.borderPtr)}\n` +
    `Blockmap ptr     : ${hex(header.layout.mapPtr)}\n` +
    `Primary tileset  : ${hex(header.layout.primaryTilesetPtr)}\n` +
    `Secondary tileset: ${hex(header.layout.secondaryTilesetPtr)}\n\n` +

    `Events ptr       : ${hex(header.eventsPtr)}\n` +
    `Events offset    : ${hex(header.events.offset)}\n` +
    `Object count     : ${header.events.objectCount}\n` +
    `Warp count       : ${header.events.warpCount}\n` +
    `Coord count      : ${header.events.coordCount}\n` +
    `BG count         : ${header.events.bgCount}\n\n` +

    `Object ptr       : ${hex(header.events.objectPtr)}\n` +
    `Object offset    : ${header.events.objectOff !== null ? hex(header.events.objectOff) : "null"}\n` +
    `Warp ptr         : ${hex(header.events.warpPtr)}\n` +
    `Warp offset      : ${header.events.warpOff !== null ? hex(header.events.warpOff) : "null"}\n` +
    `Coord ptr        : ${hex(header.events.coordPtr)}\n` +
    `Coord offset     : ${header.events.coordOff !== null ? hex(header.events.coordOff) : "null"}\n` +
    `BG ptr           : ${hex(header.events.bgPtr)}\n` +
    `BG offset        : ${header.events.bgOff !== null ? hex(header.events.bgOff) : "null"}\n\n` +

    `Scripts ptr      : ${hex(header.scriptsPtr)}\n` +
    `Connections ptr  : ${hex(header.connectionsPtr)}\n\n` +

    `music            : ${hex(header.music, 4)}\n` +
    `mapLayoutId      : ${header.mapLayoutId}\n` +
    `cave             : ${header.cave}\n` +
    `weather          : ${header.weather}\n` +
    `mapType          : ${header.mapType}\n` +
    `filler_18        : ${hex(header.filler18_0, 2)} ${hex(header.filler18_1, 2)}\n\n` +

    `allowCycling     : ${header.allowCycling}\n` +
    `allowEscaping    : ${header.allowEscaping}\n` +
    `allowRunning     : ${header.allowRunning}\n` +
    `showMapName      : ${header.showMapName}\n` +
    `mapFlags raw     : ${hex(header.mapFlags, 2)}\n` +
    `battleType       : ${header.battleType}`
  );
}

function ensureWeatherOption(value) {
  const select = document.getElementById("weatherSelect");
  if (!select) return;

  const valueText = String(value);
  if ([...select.options].some(opt => opt.value === valueText)) return;

  const opt = document.createElement("option");
  opt.value = valueText;
  opt.textContent = `${hex(value, 2)} = ${getWeatherLabel(value)}`;
  select.appendChild(opt);
}

function updateWeatherSelect(header) {
  const select = document.getElementById("weatherSelect");
  if (!select) return;

  if (!header) {
    select.disabled = true;
    select.value = "0";
    return;
  }

  ensureWeatherOption(header.weather);
  select.disabled = false;
  select.value = String(header.weather);
}

function updateCurrentMapName(header) {
  document.getElementById("currentMapName").textContent = header
    ? getMapDisplayNameWithSuffix(header)
    : "未选择地图";
  updateWeatherSelect(header);
}

function resetViewerState(keepRom = false) {
  if (!keepRom) {
    rom = null;
    romFileName = "";
  }

  mapHeaders = [];
  filteredHeaders = [];
  currentEvents = [];
  currentMap = null;
  selectedEventKey = null;
  romTilesetAssetCache.clear();
  mapGroupIndex.clear();
  mapHeaderByOffset.clear();
  selectedMapIndex = -1;

  document.getElementById("mapSearch").value = "";
  document.getElementById("mapList").innerHTML = `<div class="empty-tip">导入 ROM 后会自动扫描地图。</div>`;
  document.getElementById("eventList").innerHTML = "";
  document.getElementById("eventSummary").innerHTML = `
    <div>OBJ: 0</div>
    <div>TRAINER: 0</div>
    <div>WARP: 0</div>
    <div>BG/COORD: 0</div>
  `;
  document.getElementById("eventDetail").textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";
  const warpTools = document.getElementById("warpTools");
  if (warpTools) {
    warpTools.className = "warp-tools empty";
    warpTools.innerHTML = "";
  }
  const connectionTools = document.getElementById("connectionTools");
  if (connectionTools) {
    connectionTools.className = "warp-tools empty";
    connectionTools.innerHTML = "";
  }
  clearConnectionEdgeNav();
  document.getElementById("mapInfo").textContent = "未加载地图。";
  updateCurrentMapName(null);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function refreshMapList() {
  const list = document.getElementById("mapList");
  const query = document.getElementById("mapSearch").value.trim().toLowerCase();

  filteredHeaders = mapHeaders.filter(h => {
    const enName = getMapEnglishName(h);
    const cnName = getMapDisplayName(h);
    const text = [
      enName,
      cnName,
      String(h.id ?? ""),
      String(h.regionMapSectionId),
      h.mapGroup !== undefined ? `group=${h.mapGroup}` : "",
      h.mapNum !== undefined ? `map=${h.mapNum}` : "",
      h.mapGroup !== undefined ? `${h.mapGroup}:${h.mapNum}` : "",
      // hex(h.offset),
      // hex(h.ptr),
      // `${h.layout.width}x${h.layout.height}`,
      // `obj=${h.events.objectCount}`,
      // `warp=${h.events.warpCount}`,
      // `bg=${h.events.bgCount}`,
      // `coord=${h.events.coordCount}`,
    ].join(" ").toLowerCase();

    return !query || text.includes(query);
  });

  list.innerHTML = "";

  if (!filteredHeaders.length) {
    list.innerHTML = `<div class="empty-tip">没有匹配的地图。</div>`;
    document.getElementById("scanInfo").textContent =
      `MapHeader 候选数量：${mapHeaders.length}\n` +
      `当前筛选数量：0\n\n` +
      `可以尝试搜索地图名`;
    return;
  }

  for (let i = 0; i < filteredHeaders.length; i++) {
    const h = filteredHeaders[i];
    const mapName = getMapDisplayNameWithSuffix(h);
    const mapNameEn = getMapEnglishName(h);

    const item = document.createElement("div");
    item.className = "map-option";
    item.dataset.index = String(i);
    item.title =
      `name=${mapName}\n` +
      `map id=${h.id ?? "?"}\n` +
      `section=${h.regionMapSectionId}\n` +
      `header=${hex(h.offset)}\n` +
      `size=${h.layout.width}x${h.layout.height}\n` +
      `obj=${h.events.objectCount}, warp=${h.events.warpCount}, bg=${h.events.bgCount}, coord=${h.events.coordCount}`;

    item.innerHTML = `
      <div class="map-option-name">${escapeHtml(mapName)}</div>
      <div class="map-option-meta">地图编码:${escapeHtml(h.id ?? "?")}　Group:${escapeHtml(h.mapGroup ?? "?")} Map:${escapeHtml(h.mapNum ?? "?")}　区域编码:${escapeHtml(h.regionMap?.id ?? "?")}</div>
    `;
    item.onclick = () => selectMap(i, true);

    list.appendChild(item);
  }

  document.getElementById("scanInfo").textContent =
    `MapHeader 候选数量：${mapHeaders.length}\n` +
    `当前筛选数量：${filteredHeaders.length}\n\n` +
    `说明：当前仍是简单扫描模式，但已经过滤空 map_name 和零事件候选。\n` +
    `地图名来自 gRegionMapEntries，通过 MapHeader.regionMapSectionId 解析。\n` +
    `同一区域的多个房间可能显示同一个名称，详细信息请看右侧“地图信息”Tab。`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function selectMap(idx, switchToEventsTab = false) {
  if (!filteredHeaders.length) return;
  if (idx < 0 || idx >= filteredHeaders.length) return;

  const header = filteredHeaders[idx];

  selectedMapIndex = idx;
  currentMap = header;
  currentEvents = loadMapEvents(header);
  selectedEventKey = null;

  for (const item of document.querySelectorAll(".map-option")) {
    item.classList.toggle("active", Number(item.dataset.index) === idx);
  }

  autoMatchTilesetsForCurrentMap().then(() => renderMap(header, currentEvents));
  renderEventList(currentEvents);

  document.getElementById("mapInfo").textContent = buildMapInfoText(header);
  renderConnectionTools(header);
  renderConnectionEdgeNav(header);
  document.getElementById("eventDetail").textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";
  renderWarpTools(null);
  updateCurrentMapName(header);

  if (switchToEventsTab) setActiveTab("events");
}

async function handleRomFile(file) {
  if (!file) return;

  const buf = await file.arrayBuffer();
  rom = new Uint8Array(buf);
  romFileName = file.name || "rom.gba";

  resetViewerState(true);
  const exportBtn = document.getElementById("exportRomBtn");
  if (exportBtn) exportBtn.disabled = false;

  document.getElementById("scanInfo").textContent =
    `ROM 已加载。\n` +
    `文件名：${file.name}\n` +
    `大小：${hex(rom.length)} bytes\n\n` +
    `正在自动扫描 MapHeader...`;

  // 让浏览器先刷新“正在扫描”的提示，避免大 ROM 扫描时界面看起来卡住。
  await new Promise(resolve => setTimeout(resolve, 0));

  mapHeaders = scanMapHeaders();
  const groupStats = rebuildMapGroupIndex();
  refreshMapList();

  document.getElementById("scanInfo").textContent +=
    `

gMapGroups offset：${hex(GMAPGROUPS_OFFSET)}
` +
    `gMapGroups 有效 group：${groupStats.validGroups}/${MAP_GROUP_COUNT}
` +
    `gMapGroups 命中地图：${groupStats.totalMaps}`;

  if (filteredHeaders.length) {
    selectMap(0, false);
  }
}

const setupModal = document.getElementById("setupModal");

function openSetupModal() {
  setupModal.classList.add("open");
  setupModal.setAttribute("aria-hidden", "false");
}

function closeSetupModal() {
  setupModal.classList.remove("open");
  setupModal.setAttribute("aria-hidden", "true");
}

document.getElementById("openSetupModal").addEventListener("click", openSetupModal);
document.getElementById("closeSetupModal").addEventListener("click", closeSetupModal);
document.getElementById("doneSetupModal").addEventListener("click", closeSetupModal);

setupModal.addEventListener("click", (e) => {
  if (e.target === setupModal) closeSetupModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && setupModal.classList.contains("open")) {
    closeSetupModal();
  }
});
function applyCurrentMapWeather(value) {
  if (!rom || !currentMap) return;
  const weatherValue = Number(value) & 0xFF;
  const weatherOff = currentMap.offset + 0x16;
  if (!isValidOffset(weatherOff, 1)) {
    alert("当前地图 weather 偏移无效，无法修改。");
    updateWeatherSelect(currentMap);
    return;
  }

  rom[weatherOff] = weatherValue;
  currentMap.weather = weatherValue;

  // 同一个 MapHeader 可能同时存在于筛选列表 / group 索引中，更新当前对象后刷新详情即可。
  document.getElementById("mapInfo").textContent = buildMapInfoText(currentMap);
  document.getElementById("scanInfo").textContent =
    `已修改天气：${getMapDisplayNameWithSuffix(currentMap)}\n` +
    `weather offset: ${hex(weatherOff)}\n` +
    `weather value : ${hex(weatherValue, 2)} (${getWeatherLabel(weatherValue)})\n\n` +
    `点击“导出修改后的 ROM”保存。`;
}

function exportModifiedRom() {
  if (!rom) return;
  const baseName = (romFileName || "rom.gba").replace(/\.(gba|bin)$/i, "");
  const ext = (/\.bin$/i.test(romFileName || "") ? ".bin" : ".gba");
  const outName = `${baseName}.weather_modified${ext}`;
  const blob = new Blob([rom], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const weatherSelectEl = document.getElementById("weatherSelect");
if (weatherSelectEl) {
  weatherSelectEl.addEventListener("change", (e) => applyCurrentMapWeather(e.target.value));
}

const exportRomBtn = document.getElementById("exportRomBtn");
if (exportRomBtn) {
  exportRomBtn.addEventListener("click", exportModifiedRom);
}

document.getElementById("romFile").addEventListener("change", async (e) => {
  await handleRomFile(e.target.files[0]);
});

document.getElementById("mapSearch").addEventListener("input", () => {
  refreshMapList();

  if (filteredHeaders.length) {
    selectMap(0, false);
  } else {
    currentEvents = [];
    currentMap = null;
    selectedEventKey = null;
    selectedMapIndex = -1;
    renderEventSummary([]);
    document.getElementById("eventList").innerHTML = "";
    document.getElementById("eventDetail").textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";
    document.getElementById("mapInfo").textContent = "未加载地图。";
    updateCurrentMapName(null);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

document.getElementById("tabEvents").addEventListener("click", () => setActiveTab("events"));
document.getElementById("tabMapInfo").addEventListener("click", () => setActiveTab("mapInfo"));

document.getElementById("tilesetZipFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById("tilesetStatus").textContent =
    `正在读取 ${file.name} ...`;

  try {
    const catalog = await buildTilesetCatalogFromZip(file);
    if (!catalog.length) {
      document.getElementById("tilesetStatus").textContent =
        "没有在 ZIP 中找到 primary/* 或 secondary/* 下的 tiles.png + metatiles.bin。";
    }
  } catch (err) {
    document.getElementById("tilesetStatus").textContent =
      "tilesets.zip 加载失败：" + (err?.message || String(err));
  }
});

document.getElementById("primaryTilesetSelect").addEventListener("change", async () => {
  if (currentMap) await renderMap(currentMap, currentEvents);
});

document.getElementById("secondaryTilesetSelect").addEventListener("change", async () => {
  if (currentMap) await renderMap(currentMap, currentEvents);
});

document.getElementById("autoMatchTilesets").addEventListener("change", async () => {
  await autoMatchTilesetsForCurrentMap();
  if (currentMap) await renderMap(currentMap, currentEvents);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  resetViewerState(false);
  document.getElementById("romFile").value = "";
  document.getElementById("tilesetZipFile").value = "";
  tilesetZip = null;
  tilesetCatalog = [];
  tilesetAssets.clear();
  tilesetAutoMatchCache.clear();
  romTilesetAssetCache.clear();
  document.getElementById("primaryTilesetSelect").innerHTML = '<option value="">未加载 tilesets.zip</option>';
  document.getElementById("secondaryTilesetSelect").innerHTML = '<option value="">未加载 tilesets.zip</option>';
  document.getElementById("tilesetStatus").textContent = "默认优先使用 ROM 内部 tileset 渲染；tilesets.zip 作为调试/备用。";
  document.getElementById("scanInfo").textContent = "请先导入 ROM。";
  setActiveTab("events");
});

const useRomTilesetsEl = document.getElementById("useRomTilesets");
if (useRomTilesetsEl) {
  useRomTilesetsEl.addEventListener("change", async () => {
    if (currentMap) await renderMap(currentMap, currentEvents);
  });
}
