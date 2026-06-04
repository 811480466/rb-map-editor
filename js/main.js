// ============================================================
// UI
// ============================================================
let selectedMapIndex = -1;
const REGION_NAME_MAX_LENGTH = 64;

function getEditorModeFromState() {
  return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || window.RBEditorState?.mode || "terrain";
}

function ensureEventPanelIfNeeded(force = false) {
  if (!force && getEditorModeFromState() !== "events") return false;
  if (window.RBEditorRightPanel?.ensureEventsPanel) {
    window.RBEditorRightPanel.ensureEventsPanel();
    return true;
  }
  return !!document.getElementById("eventList");
}

function ensureMapInfoPanelIfNeeded(force = false) {
  if (!force && getEditorModeFromState() !== "metadata") return false;
  if (window.RBEditorRightPanel?.ensureMapInfoPanel) {
    window.RBEditorRightPanel.ensureMapInfoPanel();
    return true;
  }
  return !!document.getElementById("mapInfo");
}

function setActiveTab(tabName) {
  if (tabName === "events") {
    if (window.RBEditorSetMode) window.RBEditorSetMode("events");
    else window.RBEditorRightPanel?.showEventsOnly?.();
    return;
  }

  if (tabName === "mapInfo") {
    if (window.RBEditorSetMode) window.RBEditorSetMode("metadata");
    else window.RBEditorRightPanel?.showMapInfoOnly?.();
  }
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

function getRegionMapSectionOptionText(region) {
  const id = Number(region?.id ?? 0) & 0xFF;
  const name = region?.name || `Section ${id}`;
  return `${name}（编码:${id}）`;
}

function rebuildRegionMapSectionOptions(select, selectedId) {
  if (!select) return;

  select.innerHTML = "";
  const regionsById = new Map();
  for (const header of mapHeaders) {
    const region = header.regionMap;
    if (!region || regionsById.has(region.id)) continue;
    regionsById.set(region.id, region);
  }

  for (const [id, region] of regionsById) {
    const opt = document.createElement("option");
    opt.value = String(id);
    opt.textContent = getRegionMapSectionOptionText(region);
    select.appendChild(opt);
  }

  if (![...select.options].some(opt => opt.value === String(selectedId))) {
    const region = readRegionMapName(selectedId);
    const opt = document.createElement("option");
    opt.value = String(selectedId);
    opt.textContent = getRegionMapSectionOptionText(region);
    select.appendChild(opt);
  }
}

function updateRegionMapSectionSelect(header) {
  const select = document.getElementById("regionMapSectionSelect");
  const editButton = document.getElementById("editRegionMapNameBtn");
  if (!select) return;

  if (!header) {
    select.disabled = true;
    select.innerHTML = `<option value="">未加载地图</option>`;
    if (editButton) editButton.disabled = true;
    return;
  }

  rebuildRegionMapSectionOptions(select, header.regionMapSectionId);
  select.disabled = false;
  select.value = String(header.regionMapSectionId);
  if (editButton) editButton.disabled = false;
}

function refreshRegionMapSuffixCodes() {
  const regionMapNameCounts = new Map();
  for (const header of mapHeaders) {
    const regionMapName = header.regionMap?.name ?? "";
    const suffixCode = regionMapNameCounts.get(regionMapName) ?? 0;
    if (header.regionMap) header.regionMap.suffixCode = suffixCode;
    regionMapNameCounts.set(regionMapName, suffixCode + 1);
  }
}

function validateRegionEnglishName(value) {
  const name = String(value ?? "").trim().replace(/ +/g, " ");
  if (!name) throw new Error("区域名称不能为空。");
  if (name.length > REGION_NAME_MAX_LENGTH) {
    throw new Error(`区域名称不能超过 ${REGION_NAME_MAX_LENGTH} 个字符。`);
  }
  if (!/^[A-Za-z0-9 .,'!?()&+\-/%:;=<>]+$/.test(name)) {
    throw new Error("区域名称只能使用英文字母、数字、空格和常用英文标点。");
  }
  encodePokemonEnglishText(name);
  return name;
}

function getRegionNameCapacity(nameOff) {
  if (nameOff === null || !isValidOffset(nameOff, 1)) {
    throw new Error("当前区域名称指针无效，无法修改。");
  }

  for (let length = 0; length < REGION_NAME_MAX_LENGTH; length++) {
    if (!isValidOffset(nameOff + length, 1)) break;
    if (readU8(nameOff + length) === 0xFF) return length + 1;
  }

  throw new Error(`当前区域名称超过 ${REGION_NAME_MAX_LENGTH} 字节仍未结束，无法安全原地修改。`);
}

function writeRegionMapName(regionId, name) {
  if (!rom) throw new Error("尚未加载 ROM。");
  const entryOffset = G_REGION_MAP_ENTRIES + regionId * REGION_MAP_ENTRY_SIZE;
  if (!isValidOffset(entryOffset, REGION_MAP_ENTRY_SIZE)) {
    throw new Error(`区域条目偏移无效：${hex(entryOffset)}`);
  }

  const encoded = encodePokemonEnglishText(name);
  const currentRegion = readRegionMapName(regionId);
  const capacity = getRegionNameCapacity(currentRegion.nameOff);
  if (encoded.length > capacity) {
    throw new Error(`区域名称不能超过原长度：最多 ${capacity - 1} 字符，当前 ${encoded.length - 1} 字符。`);
  }

  for (let i = 0; i < capacity; i++) writeU8(currentRegion.nameOff + i, 0xFF);
  for (let i = 0; i < encoded.length; i++) writeU8(currentRegion.nameOff + i, encoded[i]);
  return readRegionMapName(regionId);
}

function setRegionNameEditStatus(message, isError = false) {
  const status = document.getElementById("regionNameEditStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function closeRegionNameModal() {
  const modal = document.getElementById("regionNameModal");
  if (!modal) return;
  modal.classList.remove("open", "show");
  modal.setAttribute("aria-hidden", "true");
}

function openRegionNameModal() {
  const select = document.getElementById("regionMapSectionSelect");
  if (!rom || !currentMap || !select || select.disabled) return;

  const modal = document.getElementById("regionNameModal") || window.RBEditorAppShell?.ensureRegionNameModal?.();
  const regionId = Number(select.value) & 0xFF;
  const region = mapHeaders.find(header => header.regionMap?.id === regionId)?.regionMap || readRegionMapName(regionId);
  const input = document.getElementById("regionNameInput");
  const subtitle = document.getElementById("regionNameModalSubtitle");
  if (!modal || !input) return;

  modal.dataset.regionId = String(regionId);
  input.value = region.name || "";
  if (subtitle) subtitle.textContent = `当前区域编码：${regionId}`;
  setRegionNameEditStatus("只能使用英文字母、数字、空格和常用英文标点。");
  modal.classList.add("open", "show");
  modal.setAttribute("aria-hidden", "false");
  input.focus();
  input.select();
}

function saveRegionNameEdit() {
  const modal = document.getElementById("regionNameModal");
  const input = document.getElementById("regionNameInput");
  if (!modal || !input) return;

  try {
    const regionId = Number(modal.dataset.regionId) & 0xFF;
    const name = validateRegionEnglishName(input.value);
    const updatedRegion = writeRegionMapName(regionId, name);

    for (const header of mapHeaders) {
      if (header.regionMap?.id !== regionId) continue;
      header.regionMap = { ...updatedRegion, suffixCode: header.regionMap?.suffixCode ?? 0 };
    }
    refreshRegionMapSuffixCodes();
    updateCurrentMapName(currentMap);

    const mapInfo = document.getElementById("mapInfo");
    if (mapInfo) mapInfo.textContent = buildMapInfoText(currentMap);

    refreshMapList();
    selectedMapIndex = filteredHeaders.indexOf(currentMap);
    for (const item of document.querySelectorAll(".map-option")) {
      item.classList.toggle("active", Number(item.dataset.index) === selectedMapIndex);
    }

    document.getElementById("scanInfo").textContent =
      `已修改区域名称：${name}\n` +
      `region id    : ${regionId}\n` +
      `name pointer : ${hex(updatedRegion.namePtr)}\n` +
      `name offset  : ${hex(updatedRegion.nameOff)}\n\n` +
      `点击“导出修改后的 ROM”保存。`;
    closeRegionNameModal();
  } catch (err) {
    setRegionNameEditStatus(err?.message || String(err), true);
  }
}

function updateCurrentMapName(header) {
  document.getElementById("currentMapName").textContent = header
    ? getMapDisplayNameWithSuffix(header)
    : "未选择地图";
  updateRegionMapSectionSelect(header);
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

  const eventList = document.getElementById("eventList");
  if (eventList) eventList.innerHTML = "";

  const eventSummary = document.getElementById("eventSummary");
  if (eventSummary) {
    eventSummary.innerHTML = `
      <div>OBJ: 0</div>
      <div>TRAINER: 0</div>
      <div>WARP: 0</div>
      <div>BG/COORD: 0</div>
    `;
  }

  const eventDetail = document.getElementById("eventDetail");
  if (eventDetail) eventDetail.textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";

  const warpTools = document.getElementById("warpTools");
  if (warpTools) {
    warpTools.className = "warp-tools empty";
    warpTools.innerHTML = "";
  }

  clearConnectionEdgeNav();
  const mapInfo = document.getElementById("mapInfo");
  if (mapInfo) mapInfo.textContent = "未加载地图。";
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
    `同一区域的多个房间可能显示同一个名称，详细信息请看右侧“地图信息”模式。`;
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

  if (getEditorModeFromState() === "events" || switchToEventsTab) {
    ensureEventPanelIfNeeded(true);
    renderEventList(currentEvents);
    const eventDetail = document.getElementById("eventDetail");
    if (eventDetail) eventDetail.textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";
    renderWarpTools(null);
  }

  if (getEditorModeFromState() === "metadata") {
    ensureMapInfoPanelIfNeeded(true);
    const mapInfo = document.getElementById("mapInfo");
    if (mapInfo) mapInfo.textContent = buildMapInfoText(header);
  }

  renderConnectionEdgeNav(header);
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

  const mapInfo = document.getElementById("mapInfo");
  if (mapInfo) mapInfo.textContent = buildMapInfoText(currentMap);
  document.getElementById("scanInfo").textContent =
    `已修改天气：${getMapDisplayNameWithSuffix(currentMap)}\n` +
    `weather offset: ${hex(weatherOff)}\n` +
    `weather value : ${hex(weatherValue, 2)} (${getWeatherLabel(weatherValue)})\n\n` +
    `点击“导出修改后的 ROM”保存。`;
}

function applyCurrentMapRegionMapSection(value) {
  if (!rom || !currentMap) return;
  const regionMapSectionId = Number(value) & 0xFF;
  const regionOff = currentMap.offset + 0x14;
  if (!isValidOffset(regionOff, 1)) {
    alert("当前地图 regionMapSectionId 偏移无效，无法修改。");
    updateRegionMapSectionSelect(currentMap);
    return;
  }

  rom[regionOff] = regionMapSectionId;
  currentMap.regionMapSectionId = regionMapSectionId;
  currentMap.regionMap = readRegionMapName(regionMapSectionId);
  refreshRegionMapSuffixCodes();

  updateCurrentMapName(currentMap);

  const mapInfo = document.getElementById("mapInfo");
  if (mapInfo) mapInfo.textContent = buildMapInfoText(currentMap);

  if (typeof refreshMapList === "function") {
    refreshMapList();
    selectedMapIndex = filteredHeaders.indexOf(currentMap);
    for (const item of document.querySelectorAll(".map-option")) {
      item.classList.toggle("active", Number(item.dataset.index) === selectedMapIndex);
    }
  }

  document.getElementById("scanInfo").textContent =
    `已修改所属区域：${getMapDisplayNameWithSuffix(currentMap)}\n` +
    `region offset : ${hex(regionOff)}\n` +
    `region value  : ${hex(regionMapSectionId, 2)} (${getMapDisplayName(currentMap)})\n\n` +
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

document.addEventListener("change", (e) => {
  if (e.target?.id === "regionMapSectionSelect") {
    applyCurrentMapRegionMapSection(e.target.value);
  }
});

document.addEventListener("click", (e) => {
  if (e.target?.id === "editRegionMapNameBtn") {
    openRegionNameModal();
  } else if (e.target?.id === "saveRegionNameEdit") {
    saveRegionNameEdit();
  } else if (e.target?.id === "closeRegionNameModal" || e.target?.id === "cancelRegionNameEdit") {
    closeRegionNameModal();
  } else if (e.target?.id === "regionNameModal") {
    closeRegionNameModal();
  }
});

document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("regionNameModal");
  if (!modal?.classList.contains("show")) return;
  if (e.key === "Escape") {
    closeRegionNameModal();
  } else if (e.key === "Enter" && e.target?.id === "regionNameInput") {
    e.preventDefault();
    saveRegionNameEdit();
  }
});

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
    if (document.getElementById("eventSummary")) renderEventSummary([]);
    const eventList = document.getElementById("eventList");
    if (eventList) eventList.innerHTML = "";
    const eventDetail = document.getElementById("eventDetail");
    if (eventDetail) eventDetail.textContent = "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。";
    const mapInfo = document.getElementById("mapInfo");
    if (mapInfo) mapInfo.textContent = "未加载地图。";
    updateCurrentMapName(null);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

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
