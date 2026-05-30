// ============================================================
// UI overrides with paint mode and icon-only terrain selector
// ============================================================

(function applyUiOverrides() {
  let currentMouseMode = "view";
  let selectedPaintBlockId = null;
  let originalRightPanelState = null;

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
      .map-toolbar { flex:0 0 auto; display:flex; align-items:center; gap:14px; padding:8px 14px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.94); }
      .map-toolbar-title { color:var(--blue-dark); font-size:13px; font-weight:700; }
      .map-toolbar-group { display:inline-flex; align-items:center; gap:8px; }
      .map-toolbar-option { display:inline-flex; align-items:center; gap:5px; color:var(--text); font-size:13px; cursor:pointer; user-select:none; }
      .map-toolbar-option input { width:auto; margin:0; padding:0; }
      .terrain-paint-panel { display:none; height:100%; min-height:0; flex-direction:column; }
      .terrain-paint-panel.active { display:flex; }
      .terrain-list { flex:1 1 auto; min-height:0; overflow:auto; display:grid; grid-template-columns:repeat(auto-fill, 40px); align-content:start; gap:8px; padding:2px 4px 4px 0; }
      .terrain-card { width:40px; height:40px; margin:0; padding:3px; border:1px solid var(--border); border-radius:8px; background:#fff; color:var(--text); box-shadow:0 4px 14px rgba(15,23,42,.04); display:flex; align-items:center; justify-content:center; }
      .terrain-card:hover { border-color:#93c5fd; background:#f2f7ff; color:var(--text); }
      .terrain-card.active { border-color:var(--blue); background:var(--blue-soft); box-shadow:0 0 0 3px rgba(37,99,235,.14); }
      .terrain-card canvas { width:32px; height:32px; image-rendering:pixelated; border:none; border-radius:4px; box-shadow:none; background:transparent; }
      body.paint-mode #mapCanvas { cursor:crosshair; }
    `;
    document.head.appendChild(style);
  }

  function ensureMapToolbar() {
    if (document.getElementById("mapToolbar")) return;
    injectUiStyle();

    const toolbar = document.createElement("div");
    toolbar.id = "mapToolbar";
    toolbar.className = "map-toolbar";
    toolbar.innerHTML = `
      <span class="map-toolbar-title">工具栏</span>
      <span class="map-toolbar-group" role="radiogroup" aria-label="鼠标模式">
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="view" checked/><span>查看</span></label>
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="paint"/><span>绘制</span></label>
      </span>
      <label class="map-toolbar-option"><input id="blackGridToggle" type="checkbox"/><span>网格</span></label>
    `;

    const currentMapBar = document.querySelector(".current-map-bar");
    if (currentMapBar) currentMapBar.insertAdjacentElement("afterend", toolbar);

    for (const radio of toolbar.querySelectorAll('input[name="mouseMode"]')) {
      radio.addEventListener("change", () => {
        if (radio.checked) setMouseMode(radio.value);
      });
    }

    const toggle = document.getElementById("blackGridToggle");
    if (toggle) {
      toggle.addEventListener("change", async () => {
        if (currentMap) await renderMap(currentMap, currentEvents);
      });
    }
  }

  function setMouseMode(mode) {
    currentMouseMode = mode === "paint" ? "paint" : "view";
    document.body.classList.toggle("paint-mode", currentMouseMode === "paint");
    setRightPanelPaintMode(currentMouseMode === "paint");
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
      panel.innerHTML = `<div id="terrainList" class="terrain-list"></div>`;
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
      if (currentMouseMode === "paint") refreshTerrainPanel();
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
      for (let i = 0; i < primaryCount; i++) {
        blocks.push({ blockId: i, source: "primary" });
      }
    }

    if (secondary?.metatiles?.length) {
      const secondaryCount = Math.min(512, Math.floor(secondary.metatiles.length / 16));
      for (let i = 0; i < secondaryCount; i++) {
        blocks.push({ blockId: 512 + i, source: "secondary" });
      }
    }

    // 如果 tileset 暂时读不到，退回当前地图已使用的 blockId，避免右侧完全空白。
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

    if (!currentMap || typeof loadRomTilesetAsset !== "function" || typeof drawRomMetatileToImage !== "function") {
      return false;
    }

    const primary = loadRomTilesetAsset(currentMap.layout.primaryTilesetPtr);
    const secondary = loadRomTilesetAsset(currentMap.layout.secondaryTilesetPtr);
    const useSecondary = blockId >= 512;
    const metatileAsset = useSecondary ? secondary : primary;
    const localMetatileId = useSecondary ? blockId - 512 : blockId;

    if (!metatileAsset) return false;

    const imageData = iconCtx.createImageData(32, 32);
    fillImageDataWhite(imageData);

    drawRomMetatileToImage(
      imageData,
      0,
      0,
      metatileAsset,
      localMetatileId,
      primary,
      secondary,
      null
    );

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
    if (!currentMap || currentMouseMode !== "paint") return;

    const list = document.getElementById("terrainList");
    if (!list) return;

    list.innerHTML = "";
    const blocks = getAvailableBlockIdsForCurrentMap();

    if (!blocks.length) {
      list.innerHTML = `<div class="empty-tip">当前地图没有读取到可用地形。请确认已经导入 ROM 并选中地图。</div>`;
      return;
    }

    if (selectedPaintBlockId === null || !blocks.some(x => x.blockId === selectedPaintBlockId)) {
      selectedPaintBlockId = blocks[0].blockId;
    }

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
  }

  function paintMapCell(x, y) {
    if (!currentMap || currentMouseMode !== "paint" || selectedPaintBlockId === null) return;

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
    if (currentMouseMode !== "paint") return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const cell = getMapCellFromMouseEvent(e);
    if (cell) paintMapCell(cell.x, cell.y);
  }, true);

  ensureMapToolbar();
  wrapRenderMapForGridToggle();
})();
