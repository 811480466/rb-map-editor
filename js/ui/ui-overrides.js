// ============================================================
// UI overrides with editor modes, terrain painter, events view, metadata form
// ============================================================

(function applyUiOverrides() {
  let editorMode = "terrain"; // terrain | events | metadata
  let currentMouseMode = "paint"; // view | paint
  let selectedPaintBlockId = null;
  let originalRightPanelState = null;
  let originalDrawEvent = null;

  window.__rbEditorShowEvents = false;

  window.refreshMapList = function refreshMapListOverride() {
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
        h.mapGroup !== undefined ? `mapGroup=${h.mapGroup}` : "",
        h.mapNum !== undefined ? `mapNum=${h.mapNum}` : "",
        h.mapGroup !== undefined ? `${h.mapGroup}:${h.mapNum}` : "",
      ].join(" ").toLowerCase();
      return !query || text.includes(query);
    });

    list.innerHTML = "";

    if (!filteredHeaders.length) {
      list.innerHTML = `<div class="empty-tip">没有匹配的地图。</div>`;
      document.getElementById("scanInfo").textContent =
        `MapHeader 候选数量：${mapHeaders.length}\n当前筛选数量：0\n\n可以尝试搜索地图名 / mapNum / mapGroup / 地图编码 / 区域编码`;
      return;
    }

    for (let i = 0; i < filteredHeaders.length; i++) {
      const h = filteredHeaders[i];
      const mapName = getMapDisplayNameWithSuffix(h);
      const item = document.createElement("div");
      item.className = "map-option";
      item.dataset.index = String(i);
      item.title =
        `name=${mapName}\nmapNum=${h.mapNum ?? "?"}\nmapGroup=${h.mapGroup ?? "?"}\nmap id=${h.id ?? "?"}\nsection=${h.regionMapSectionId}\nheader=${hex(h.offset)}\nsize=${h.layout.width}x${h.layout.height}\nobj=${h.events.objectCount}, warp=${h.events.warpCount}, bg=${h.events.bgCount}, coord=${h.events.coordCount}`;
      item.innerHTML = `
        <div class="map-option-name">${escapeHtml(mapName)}</div>
        <div class="map-option-meta">
          <span class="map-meta-chip">mapNum:${escapeHtml(h.mapNum ?? "?")}</span>
          <span class="map-meta-chip">mapGroup:${escapeHtml(h.mapGroup ?? "?")}</span>
          <span class="map-meta-chip">地图编码:${escapeHtml(h.id ?? "?")}</span>
          <span class="map-meta-chip">区域编码:${escapeHtml(h.regionMap?.id ?? "?")}</span>
        </div>`;
      item.onclick = () => selectMap(i, true);
      list.appendChild(item);
    }

    document.getElementById("scanInfo").textContent =
      `MapHeader 候选数量：${mapHeaders.length}\n当前筛选数量：${filteredHeaders.length}\n\n说明：地图列表显示顺序为 mapNum、mapGroup、地图编码、区域编码。`;
  };

  function injectUiStyle() {
    if (document.getElementById("uiOverrideRuntimeStyle")) return;
    const style = document.createElement("style");
    style.id = "uiOverrideRuntimeStyle";
    style.textContent = `
      .map-canvas-scroll { overflow:auto !important; }
      .map-canvas-scroll canvas { max-width:none; max-height:none; }

      .editor-mode-bar { flex:0 0 auto; display:flex; align-items:center; gap:8px; padding:8px 14px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.96); }
      .editor-mode-title { flex:0 0 auto; color:var(--muted); font-size:12px; font-weight:700; }
      .editor-mode-options { display:flex; gap:8px; flex-wrap:wrap; }
      .editor-mode-option { width:auto; margin:0; padding:7px 12px; border:1px solid #cfe0fb; border-radius:999px; background:#fff; color:var(--blue-dark); font-size:12px; font-weight:700; }
      .editor-mode-option.active { background:var(--blue); border-color:var(--blue); color:#fff; }
      .editor-mode-option:hover { background:#e8f1ff; color:var(--blue-dark); }
      .editor-mode-option.active:hover { background:var(--blue-dark); color:#fff; }

      .map-toolbar { flex:0 0 auto; display:flex; align-items:center; gap:14px; padding:8px 14px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.94); }
      .map-toolbar-title { color:var(--blue-dark); font-size:13px; font-weight:700; }
      .map-toolbar-group { display:inline-flex; align-items:center; gap:8px; }
      .map-toolbar-option { display:inline-flex; align-items:center; gap:5px; color:var(--text); font-size:13px; cursor:pointer; user-select:none; }
      .map-toolbar-option input { width:auto; margin:0; padding:0; }

      .metadata-panel { flex:1 1 auto; min-height:0; display:none; padding:18px; overflow:auto; background:#f8fbff; }
      .metadata-panel.active { display:block; }
      .metadata-card { max-width:720px; margin:0 auto; padding:18px; border:1px solid var(--border); border-radius:14px; background:#fff; box-shadow:var(--shadow); }
      .metadata-card h3 { margin:0 0 14px; }
      .metadata-form-row { display:grid; grid-template-columns:120px minmax(0, 1fr); gap:12px; align-items:center; margin-bottom:12px; }
      .metadata-form-row label { color:var(--muted); font-size:13px; font-weight:700; }
      .metadata-weather-host .weather-control { display:flex; width:100%; flex:1 1 auto; }
      .metadata-weather-host .weather-control label { display:none; }
      .metadata-weather-host .weather-control select { width:100%; }

      .terrain-paint-panel { display:none; height:100%; min-height:0; flex-direction:column; overflow:hidden; }
      .terrain-paint-panel.active { display:flex; }
      .terrain-section-title { flex:0 0 auto; margin:0 0 6px; color:#334155; font-size:12px; font-weight:700; }
      .terrain-selection-box { flex:0 0 auto; min-height:74px; margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:10px; background:#f8fafc; display:flex; align-items:center; justify-content:center; }
      .terrain-selection-box canvas { width:64px; height:64px; image-rendering:pixelated; border:1px solid #94a3b8; background:#fff; }
      .terrain-library-wrap { flex:1 1 auto; min-height:0; overflow:auto; border:1px solid var(--border); border-radius:10px; background:#f8fafc; padding:8px; }
      .terrain-library-grid { display:grid; grid-template-columns:repeat(8, 36px); grid-auto-rows:36px; gap:2px; align-content:start; justify-content:start; }
      .terrain-card { width:36px; height:36px; margin:0; padding:2px; border:1px solid #cbd5e1; border-radius:4px; background:#fff; color:var(--text); display:flex; align-items:center; justify-content:center; box-shadow:none; }
      .terrain-card:hover { border-color:#60a5fa; background:#eff6ff; color:var(--text); }
      .terrain-card.active { border-color:var(--blue); background:#dbeafe; box-shadow:0 0 0 2px rgba(37,99,235,.20); z-index:1; }
      .terrain-card canvas { width:32px; height:32px; image-rendering:pixelated; border:none; box-shadow:none; background:transparent; }
      body.paint-mode #mapCanvas { cursor:crosshair; }
    `;
    document.head.appendChild(style);
  }

  function ensureEditorModeBar() {
    if (document.getElementById("editorModeBar")) return;
    injectUiStyle();

    const bar = document.createElement("div");
    bar.id = "editorModeBar";
    bar.className = "editor-mode-bar";
    bar.innerHTML = `
      <span class="editor-mode-title">模式</span>
      <div class="editor-mode-options">
        <button type="button" class="editor-mode-option" data-editor-mode="terrain">地形编辑</button>
        <button type="button" class="editor-mode-option" data-editor-mode="events">地图事件</button>
        <button type="button" class="editor-mode-option" data-editor-mode="metadata">地图元数据</button>
      </div>`;

    const currentMapBar = document.querySelector(".current-map-bar");
    if (currentMapBar) currentMapBar.insertAdjacentElement("afterend", bar);

    for (const btn of bar.querySelectorAll("button[data-editor-mode]")) {
      btn.addEventListener("click", () => setEditorMode(btn.dataset.editorMode));
    }
  }

  function ensureMapToolbar() {
    if (document.getElementById("mapToolbar")) return;
    injectUiStyle();

    const toolbar = document.createElement("div");
    toolbar.id = "mapToolbar";
    toolbar.className = "map-toolbar";
    toolbar.innerHTML = `
      <span class="map-toolbar-title">工具栏</span>
      <span id="mouseModeGroup" class="map-toolbar-group" role="radiogroup" aria-label="鼠标模式">
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="view"/><span>查看</span></label>
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="paint" checked/><span>绘制</span></label>
      </span>
      <label class="map-toolbar-option"><input id="blackGridToggle" type="checkbox"/><span>网格</span></label>
    `;

    const modeBar = document.getElementById("editorModeBar");
    if (modeBar) modeBar.insertAdjacentElement("afterend", toolbar);

    for (const radio of toolbar.querySelectorAll('input[name="mouseMode"]')) {
      radio.addEventListener("change", () => {
        if (radio.checked) setMouseMode(radio.value);
      });
    }

    const toggle = document.getElementById("blackGridToggle");
    if (toggle) {
      toggle.addEventListener("change", async () => {
        if (currentMap && editorMode !== "metadata") await renderMap(currentMap, currentEvents);
      });
    }
  }

  function ensureMetadataPanel() {
    let panel = document.getElementById("mapMetadataPanel");
    if (panel) return panel;

    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap) return null;

    panel = document.createElement("div");
    panel.id = "mapMetadataPanel";
    panel.className = "metadata-panel";
    panel.innerHTML = `
      <div class="metadata-card">
        <h3>地图元数据</h3>
        <div class="metadata-form-row">
          <label>天气</label>
          <div id="metadataWeatherHost" class="metadata-weather-host"></div>
        </div>
      </div>`;

    mapWrap.appendChild(panel);

    const weather = document.querySelector(".weather-control");
    const host = document.getElementById("metadataWeatherHost");
    if (weather && host) host.appendChild(weather);

    return panel;
  }

  function patchDrawEventVisibility() {
    if (originalDrawEvent || typeof drawEvent !== "function") return;
    originalDrawEvent = drawEvent;
    const wrapped = function drawEventVisibilityWrapper(ev) {
      if (!window.__rbEditorShowEvents) return;
      return originalDrawEvent(ev);
    };
    try {
      drawEvent = wrapped;
      window.drawEvent = wrapped;
    } catch (err) {
      window.drawEvent = wrapped;
    }
  }

  function setEditorMode(mode) {
    editorMode = ["terrain", "events", "metadata"].includes(mode) ? mode : "terrain";
    window.__rbEditorShowEvents = editorMode === "events";

    const toolbar = document.getElementById("mapToolbar");
    const mouseGroup = document.getElementById("mouseModeGroup");
    const mapShell = document.querySelector(".map-connection-shell");
    const legend = document.querySelector(".legend-bar");
    const metadataPanel = ensureMetadataPanel();

    for (const btn of document.querySelectorAll(".editor-mode-option")) {
      btn.classList.toggle("active", btn.dataset.editorMode === editorMode);
    }

    if (toolbar) toolbar.style.display = editorMode === "metadata" ? "none" : "flex";
    if (mouseGroup) mouseGroup.style.display = editorMode === "events" ? "none" : "inline-flex";
    if (mapShell) mapShell.style.display = editorMode === "metadata" ? "none" : "grid";
    if (legend) legend.style.display = editorMode === "events" ? "block" : "none";
    if (metadataPanel) metadataPanel.classList.toggle("active", editorMode === "metadata");

    if (editorMode === "events") {
      setMouseMode("view");
      setRightPanelPaintMode(false);
    } else if (editorMode === "terrain") {
      setMouseMode(currentMouseMode || "paint");
    } else {
      document.body.classList.remove("paint-mode");
      setRightPanelPaintMode(false);
    }

    if (currentMap && editorMode !== "metadata") renderMap(currentMap, currentEvents);
  }

  function setMouseMode(mode) {
    currentMouseMode = mode === "paint" ? "paint" : "view";
    for (const radio of document.querySelectorAll('input[name="mouseMode"]')) {
      radio.checked = radio.value === currentMouseMode;
    }
    document.body.classList.toggle("paint-mode", editorMode === "terrain" && currentMouseMode === "paint");
    setRightPanelPaintMode(editorMode === "terrain" && currentMouseMode === "paint");
  }

  function setRightPanelPaintMode(enabled) {
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return;

    if (!originalRightPanelState) {
      originalRightPanelState = new Map();
      for (const el of Array.from(rightPanel.children)) {
        if (el.id !== "terrainPaintPanel") originalRightPanelState.set(el, el.style.display || "");
      }
    }

    for (const [el, display] of originalRightPanelState.entries()) {
      el.style.display = enabled ? "none" : display;
    }

    let panel = document.getElementById("terrainPaintPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "terrainPaintPanel";
      panel.className = "terrain-paint-panel";
      panel.innerHTML = `
        <div class="terrain-section-title">当前地形</div>
        <div class="terrain-selection-box"><canvas id="terrainSelectionCanvas" width="32" height="32"></canvas></div>
        <div class="terrain-section-title">地形库</div>
        <div class="terrain-library-wrap"><div id="terrainList" class="terrain-library-grid"></div></div>`;
      rightPanel.appendChild(panel);
    }

    panel.classList.toggle("active", enabled);
    if (enabled) refreshTerrainPanel();
  }

  function isBlackGridEnabled() {
    return !!document.getElementById("blackGridToggle")?.checked;
  }

  function drawBlackGridOverlay(header) {
    if (!header || !isBlackGridEnabled()) return;

    const cs = getCellSize();
    const w = header.layout.width;
    const h = header.layout.height;
    const maxX = w * cs;
    const maxY = h * cs;

    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    for (let x = 0; x <= w; x++) {
      const px = x * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, maxY);
      ctx.stroke();
    }

    for (let y = 0; y <= h; y++) {
      const py = y * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(maxX, py);
      ctx.stroke();
    }

    ctx.restore();
  }

  function wrapRenderMapForGridToggle() {
    const originalRenderMap = window.renderMap || renderMap;
    if (!originalRenderMap || originalRenderMap.__gridToolbarWrapped) return;

    const wrappedRenderMap = async function renderMapWithGridToolbar(header, events) {
      const result = await originalRenderMap.call(this, header, events);
      drawBlackGridOverlay(header);
      if (editorMode === "terrain" && currentMouseMode === "paint") refreshTerrainPanel();
      return result;
    };

    wrappedRenderMap.__gridToolbarWrapped = true;
    window.renderMap = wrappedRenderMap;

    try {
      renderMap = wrappedRenderMap;
    } catch (err) {
      // 保留 window.renderMap 包装即可。
    }
  }

  function getAvailableBlockIdsForCurrentMap() {
    if (!currentMap || !rom || typeof loadRomTilesetAsset !== "function") return [];

    const primary = loadRomTilesetAsset(currentMap.layout.primaryTilesetPtr);
    const secondary = loadRomTilesetAsset(currentMap.layout.secondaryTilesetPtr);
    const blocks = [];

    if (primary?.metatiles?.length) {
      const primaryCount = Math.min(512, Math.floor(primary.metatiles.length / 16));
      for (let i = 0; i < primaryCount; i++) blocks.push({ blockId: i, source: "primary" });
    }

    if (secondary?.metatiles?.length) {
      const secondaryCount = Math.min(512, Math.floor(secondary.metatiles.length / 16));
      for (let i = 0; i < secondaryCount; i++) blocks.push({ blockId: 512 + i, source: "secondary" });
    }

    if (!blocks.length) {
      const w = currentMap.layout.width;
      const h = currentMap.layout.height;
      const mapOff = ptrToOffset(currentMap.layout.mapPtr);
      if (mapOff === null || !isValidOffset(mapOff, w * h * 2)) return [];
      const records = new Map();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const raw = readU16(mapOff + (y * w + x) * 2);
          const blockId = raw & 0x03FF;
          records.set(blockId, { blockId, source: blockId >= 512 ? "secondary" : "primary" });
        }
      }
      return Array.from(records.values()).sort((a, b) => a.blockId - b.blockId);
    }

    return blocks;
  }

  function fillImageDataWhite(imageData) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }
  }

  function drawTerrainIconFromTileset(blockId, iconCanvas) {
    const iconCtx = iconCanvas.getContext("2d");
    iconCtx.imageSmoothingEnabled = false;
    iconCtx.clearRect(0, 0, iconCanvas.width, iconCanvas.height);

    if (!currentMap || typeof loadRomTilesetAsset !== "function" || typeof drawRomMetatileToImage !== "function") return false;

    const primary = loadRomTilesetAsset(currentMap.layout.primaryTilesetPtr);
    const secondary = loadRomTilesetAsset(currentMap.layout.secondaryTilesetPtr);
    const useSecondary = blockId >= 512;
    const metatileAsset = useSecondary ? secondary : primary;
    const localMetatileId = useSecondary ? blockId - 512 : blockId;
    if (!metatileAsset) return false;

    const imageData = iconCtx.createImageData(32, 32);
    fillImageDataWhite(imageData);

    drawRomMetatileToImage(imageData, 0, 0, metatileAsset, localMetatileId, primary, secondary, null);
    iconCtx.putImageData(imageData, 0, 0);
    return true;
  }

  function drawTerrainIconFallback(blockId, iconCanvas) {
    const iconCtx = iconCanvas.getContext("2d");
    iconCtx.imageSmoothingEnabled = false;
    iconCtx.clearRect(0, 0, iconCanvas.width, iconCanvas.height);
    iconCtx.fillStyle = "#f8fbff";
    iconCtx.fillRect(0, 0, iconCanvas.width, iconCanvas.height);
    iconCtx.fillStyle = "#1e3a8a";
    iconCtx.font = "10px Arial";
    iconCtx.textAlign = "center";
    iconCtx.textBaseline = "middle";
    iconCtx.fillText(hex(blockId, 3), iconCanvas.width / 2, iconCanvas.height / 2);
  }

  function drawTerrainIcon(blockId, iconCanvas) {
    const ok = drawTerrainIconFromTileset(blockId, iconCanvas);
    if (!ok) drawTerrainIconFallback(blockId, iconCanvas);
  }

  function refreshTerrainPanel() {
    if (!currentMap || editorMode !== "terrain" || currentMouseMode !== "paint") return;

    const list = document.getElementById("terrainList");
    if (!list) return;

    list.innerHTML = "";
    const blocks = getAvailableBlockIdsForCurrentMap();

    if (!blocks.length) {
      list.innerHTML = `<div class="empty-tip">当前地图没有读取到可用地形。请确认已经导入 ROM 并选中地图。</div>`;
      return;
    }

    if (selectedPaintBlockId === null || !blocks.some(x => x.blockId === selectedPaintBlockId)) selectedPaintBlockId = blocks[0].blockId;

    for (const item of blocks) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "terrain-card";
      card.dataset.blockId = String(item.blockId);
      card.title = `${item.source} blockId=${hex(item.blockId, 4)}`;

      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = 32;
      iconCanvas.height = 32;
      drawTerrainIcon(item.blockId, iconCanvas);

      card.appendChild(iconCanvas);
      card.onclick = () => {
        selectedPaintBlockId = item.blockId;
        refreshTerrainSelectionState();
      };
      list.appendChild(card);
    }

    refreshTerrainSelectionState();
  }

  function refreshTerrainSelectionState() {
    for (const card of document.querySelectorAll(".terrain-card")) {
      card.classList.toggle("active", Number(card.dataset.blockId) === selectedPaintBlockId);
    }

    const selectionCanvas = document.getElementById("terrainSelectionCanvas");
    if (selectionCanvas && selectedPaintBlockId !== null) drawTerrainIcon(selectedPaintBlockId, selectionCanvas);
  }

  function paintMapCell(x, y) {
    if (!currentMap || editorMode !== "terrain" || currentMouseMode !== "paint" || selectedPaintBlockId === null) return;

    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return;

    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    const cellOff = mapOff === null ? null : mapOff + (y * w + x) * 2;
    if (mapOff === null || !isValidOffset(cellOff, 2)) return;

    const oldRaw = readU16(cellOff);
    const newRaw = (oldRaw & 0xFC00) | (selectedPaintBlockId & 0x03FF);
    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    renderMap(currentMap, currentEvents);
  }

  canvas.addEventListener("click", e => {
    if (editorMode !== "terrain" || currentMouseMode !== "paint") return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const cell = getMapCellFromMouseEvent(e);
    if (cell) paintMapCell(cell.x, cell.y);
  }, true);

  injectUiStyle();
  patchDrawEventVisibility();
  ensureEditorModeBar();
  ensureMapToolbar();
  ensureMetadataPanel();
  wrapRenderMapForGridToggle();
  setEditorMode("terrain");
})();
