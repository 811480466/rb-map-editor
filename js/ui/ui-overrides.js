// ============================================================
// UI overrides with paint mode and terrain selector
// ============================================================

(function applyUiOverrides() {
  let currentMouseMode = "view";
  let selectedPaintBlockId = null;
  let originalRightPanelState = null;

  const originalRefreshMapList = window.refreshMapList || refreshMapList;

  window.refreshMapList = function refreshMapListOverride() {
    const list = document.getElementById("mapList");
    const query = document.getElementById("mapSearch").value.trim().toLowerCase();

    filteredHeaders = mapHeaders.filter(h => {
      const enName = getMapEnglishName(h);
      const cnName = getMapDisplayName(h);
      const text = [
        enName, cnName, String(h.id ?? ""), String(h.regionMapSectionId),
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

  // ================================
  // Toolbar with mouse mode and terrain
  // ================================

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
      .terrain-paint-header { flex:0 0 auto; margin-bottom:10px; }
      .terrain-paint-title { margin:0 0 4px; color:var(--blue-dark); font-size:18px; }
      .terrain-paint-tip { color:var(--muted); font-size:12px; line-height:1.45; }
      .terrain-selected { flex:0 0 auto; padding:8px 10px; border:1px solid var(--border); border-radius:10px; background:#f8fbff; color:var(--text); font-size:12px; line-height:1.5; margin-bottom:10px; }
      .terrain-list { flex:1 1 auto; min-height:0; overflow:auto; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; padding-right:4px; }
      .terrain-card { width:auto; margin:0; padding:8px; border:1px solid var(--border); border-radius:10px; background:#fff; color:var(--text); text-align:left; font-weight:500; box-shadow:0 4px 14px rgba(15,23,42,.04); }
      .terrain-card:hover { border-color:#93c5fd; background:#f2f7ff; color:var(--text); }
      .terrain-card.active { border-color:var(--blue); background:var(--blue-soft); box-shadow:0 0 0 3px rgba(37,99,235,.10); }
      .terrain-card-id { color:#1e3a8a; font-weight:800; font-size:13px; }
      .terrain-card-meta { margin-top:3px; color:var(--muted); font-size:11px; line-height:1.35; }
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
      radio.addEventListener("change", () => { if (radio.checked) setMouseMode(radio.value); });
    }

    const toggle = document.getElementById("blackGridToggle");
    if (toggle) toggle.addEventListener("change", async () => { if (currentMap) await renderMap(currentMap, currentEvents); });
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
      panel.innerHTML = `<div class="terrain-paint-header"><h2 class="terrain-paint-title">地形绘制</h2><div class="terrain-paint-tip">选择一个地形后点击地图格子应用。</div></div><div id="terrainSelectedInfo" class="terrain-selected">未选择地形。</div><div id="terrainList" class="terrain-list"></div>`;
      rightPanel.appendChild(panel);
    }

    panel.classList.toggle("active", enabled);
    if (enabled) refreshTerrainPanel();
  }

  function refreshTerrainPanel() {
    if (!currentMap || currentMouseMode !== "paint") return;

    const list = document.getElementById("terrainList");
    list.innerHTML = "";
    const uniqueBlocks = getUniqueBlockIdsForCurrentMap();
    if (!uniqueBlocks.length) return;

    if (selectedPaintBlockId === null || !uniqueBlocks.some(x=>x.blockId===selectedPaintBlockId)) selectedPaintBlockId = uniqueBlocks[0].blockId;

    for (const item of uniqueBlocks) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "terrain-card";
      card.dataset.blockId = String(item.blockId);
      card.innerHTML = `<div class="terrain-card-id">${hex(item.blockId,4)}</div><div class="terrain-card-meta">${item.blockId>=512?"secondary":"primary"} / used ${item.count}</div>`;
      card.onclick = ()=>{selectedPaintBlockId=item.blockId; refreshTerrainSelectionState();};
      list.appendChild(card);
    }

    refreshTerrainSelectionState();
  }

  function refreshTerrainSelectionState() {
    const info = document.getElementById("terrainSelectedInfo");
    if (info) info.textContent = selectedPaintBlockId===null?"未选择地形":`当前选择 blockId=${selectedPaintBlockId}`;
    for (const card of document.querySelectorAll(".terrain-card")) card.classList.toggle("active", Number(card.dataset.blockId)===selectedPaintBlockId);
  }

  function paintMapCell(x,y){
    if (!currentMap||currentMouseMode!=='paint'||selectedPaintBlockId===null) return;
    const w=currentMap.layout.width,h=currentMap.layout.height;
    if(x<0||y<0||x>=w||y>=h) return;
    const mapOff=ptrToOffset(currentMap.layout.mapPtr);
    if(mapOff===null||!isValidOffset(mapOff+(y*w+x)*2,2)) return;
    const oldRaw=readU16(mapOff+(y*w+x)*2);
    const newRaw=(oldRaw&0xFC00)|(selectedPaintBlockId&0x03FF);
    rom[mapOff+(y*w+x)*2]=newRaw&0xFF; rom[mapOff+(y*w+x)*2+1]=(newRaw>>8)&0xFF;
    renderMap(currentMap,currentEvents);
  }

  canvas.addEventListener("click",async e=>{if(currentMouseMode==='paint'){const cell=getMapCellFromMouseEvent(e);if(cell)paintMapCell(cell.x,cell.y);}},true);

  ensureMapToolbar();
  wrapRenderMapForGridToggle();
})();
