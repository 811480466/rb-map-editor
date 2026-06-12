// ============================================================
// Terrain panel
// ============================================================
// 负责地图编辑右侧面板的基础 DOM / 样式 / 瓦片库渲染 / 碰撞叠加层。
// 地形绘制逻辑在 js/editor/terrain-editor.js。
// 碰撞选择和绘制逻辑在 js/editor/collision-editor.js。

(function terrainPanel() {
  let originalRenderMap = null;
  let renderingTiles = false;
  let tileLibraryKey = "";
  let tileLibraryInitialized = false;

  function injectStyle() {
    if (document.getElementById("terrainPanelStyle")) return;

    const style = document.createElement("style");
    style.id = "terrainPanelStyle";
    style.textContent = `
      .panel.right.mode-terrain-editor > h2 { display:block !important; flex:0 0 auto; }
      .panel.right.mode-terrain-editor > .tabs,
      .panel.right.mode-terrain-editor #eventTab,
      .panel.right.mode-terrain-editor #mapInfoTab,
      .panel.right.mode-terrain-editor #connectionTools,
      .panel.right.mode-terrain-editor #warpTools,
      .panel.right.mode-terrain-editor #eventDetail,
      .panel.right.mode-terrain-editor > h3,
      .panel.right.mode-terrain-editor #terrainPaintPanel { display:none !important; }

      .terrain-editor-panel { display:none; height:100%; min-height:0; flex-direction:column; overflow:hidden; }
      .terrain-editor-panel.active { display:flex; }

      .terrain-editor-tabs { flex:0 0 auto; display:flex; gap:12px; margin-bottom:10px; border-bottom:1px solid var(--border); }
      .terrain-editor-tab-btn {
        width:auto; margin:0; padding:8px 12px; border:0 !important; border-bottom:2px solid transparent !important;
        border-radius:0 !important; background:transparent !important; color:var(--blue-dark) !important;
        box-shadow:none !important; font-size:13px; font-weight:700;
      }
      .terrain-editor-tab-btn:hover { background:transparent !important; color:var(--blue-dark) !important; box-shadow:none !important; }
      .terrain-editor-tab-btn.active { border-bottom-color:var(--blue) !important; font-weight:900; }

      .terrain-editor-tab-content { flex:1 1 auto; min-height:0; display:none; overflow:hidden; }
      .terrain-editor-tab-content.active { display:flex; flex-direction:column; }

      .tile-title { flex:0 0 auto; margin:0 0 6px; color:#334155; font-size:12px; font-weight:800; }
      .tile-selection-box { flex:0 0 auto; min-height:78px; margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:10px; background:#f8fafc; display:flex; align-items:center; justify-content:center; }
      .tile-selection-box canvas { width:64px; height:64px; image-rendering:pixelated; border:1px solid #94a3b8; background:#fff; }
      .tile-library-wrap { flex:1 1 auto; min-height:0; overflow:auto; border:1px solid var(--border); border-radius:10px; background:#f8fafc; padding:8px; }
      .tile-library-grid { display:grid; grid-template-columns:repeat(8, 36px); grid-auto-rows:36px; gap:2px; align-content:start; justify-content:start; }
      .tile-card { width:36px; height:36px; margin:0; padding:2px; border:1px solid #cbd5e1; border-radius:4px; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:none; }
      .tile-card:hover { background:#fff !important; border-color:#94a3b8; box-shadow:none !important; }
      .tile-card.active { border-color:var(--blue); background:#dbeafe; box-shadow:0 0 0 2px rgba(37,99,235,.2); }
      .tile-card canvas { width:32px; height:32px; image-rendering:pixelated; border:0; background:transparent; }

      .collision-editor-body { flex:1 1 auto; min-height:0; overflow:auto; padding-right:4px; }
      .collision-controls { padding:10px; border:1px solid var(--border); border-radius:10px; background:#f8fbff; margin-bottom:10px; }
      .collision-control-row { display:grid; grid-template-columns:84px minmax(0,1fr); gap:8px; align-items:center; margin-bottom:8px; }
      .collision-control-row label { color:var(--muted); font-size:12px; font-weight:800; }
      .collision-control-row input, .collision-control-row select { width:100%; margin:0; padding:7px 8px; font-size:12px; }
    `;
    document.head.appendChild(style);
  }

  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || window.RBEditorState?.mode || "terrain";
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || window.RBEditorState?.terrainTab || "tiles";
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.trunc(n))) : fallback;
  }

  function ensureTerrainEditorPanel() {
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return null;

    let panel = document.getElementById("terrainEditorPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "terrainEditorPanel";
      panel.className = "terrain-editor-panel";
      panel.innerHTML = `
        <div class="terrain-editor-tabs">
          <button type="button" class="terrain-editor-tab-btn active" data-terrain-tab="tiles">地形瓦片</button>
          <button type="button" class="terrain-editor-tab-btn" data-terrain-tab="collision">地图碰撞</button>
        </div>
        <div id="terrainEditorTilesHost" class="terrain-editor-tab-content active">
          <div class="tile-title">当前瓦片</div>
          <div class="tile-selection-box"><canvas id="currentTileCanvas" width="32" height="32"></canvas></div>
          <div class="tile-title">瓦片库</div>
          <div class="tile-library-wrap"><div id="tileLibraryGrid" class="tile-library-grid"></div></div>
        </div>
        <div id="terrainEditorCollisionHost" class="terrain-editor-tab-content">
          <div class="collision-editor-body">
            <div class="collision-controls">
              <div class="collision-control-row"><label>高度</label><input id="collisionElevationInput" type="number" min="0" max="15" value="3" /></div>
              <div class="collision-control-row"><label>碰撞</label><select id="collisionValueInput"><option value="0">0 - 可通行</option><option value="1" selected>1 - 阻挡</option><option value="2">2</option><option value="3">3</option></select></div>
              <div class="collision-control-row"><label>透明度</label><input id="collisionOpacityInput" type="range" min="0" max="100" value="42" /></div>
            </div>
          </div>
        </div>`;
      rightPanel.appendChild(panel);
      tileLibraryInitialized = false;
      tileLibraryKey = "";
    }

    return panel;
  }

  function setTerrainTab(tab) {
    const activeTab = tab === "collision" ? "collision" : "tiles";
    const previousTab = window.RBEditorState?.terrainTab;
    if (window.RBEditorState) window.RBEditorState.terrainTab = activeTab;

    for (const btn of document.querySelectorAll(".terrain-editor-tab-btn")) {
      btn.classList.toggle("active", btn.dataset.terrainTab === activeTab);
    }
    document.getElementById("terrainEditorTilesHost")?.classList.toggle("active", activeTab === "tiles");
    document.getElementById("terrainEditorCollisionHost")?.classList.toggle("active", activeTab === "collision");

    if (activeTab === "tiles") refreshTileLibrary(false);
    if (activeTab === "collision" || previousTab !== activeTab) rerenderMap();
  }

  function getAvailableBlocks() {
    if (!currentMap || !rom) return [];
    const blocks = [];

    if (typeof loadRomTilesetAsset === "function") {
      const primary = loadRomTilesetAsset(currentMap.layout.primaryTilesetPtr);
      const secondary = loadRomTilesetAsset(currentMap.layout.secondaryTilesetPtr);
      if (primary?.metatiles?.length) {
        const count = Math.min(512, Math.floor(primary.metatiles.length / 16));
        for (let i = 0; i < count; i++) blocks.push({ blockId: i, source: "primary" });
      }
      if (secondary?.metatiles?.length) {
        const count = Math.min(512, Math.floor(secondary.metatiles.length / 16));
        for (let i = 0; i < count; i++) blocks.push({ blockId: 512 + i, source: "secondary" });
      }
    }

    if (blocks.length) return blocks;

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

  function getTileLibraryKey() {
    if (!currentMap) return "no-map";
    return [
      currentMap.offset,
      currentMap.layout?.primaryTilesetPtr,
      currentMap.layout?.secondaryTilesetPtr,
      currentMap.layout?.mapPtr,
    ].join(":");
  }

  function fillImageDataWhite(imageData) {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }
  }

  function drawFallback(blockId, iconCanvas) {
    const iconCtx = iconCanvas.getContext("2d");
    iconCtx.clearRect(0, 0, iconCanvas.width, iconCanvas.height);
    iconCtx.fillStyle = "#f8fbff";
    iconCtx.fillRect(0, 0, iconCanvas.width, iconCanvas.height);
    iconCtx.fillStyle = "#1e3a8a";
    iconCtx.font = "10px Arial";
    iconCtx.textAlign = "center";
    iconCtx.textBaseline = "middle";
    iconCtx.fillText(typeof hex === "function" ? hex(blockId, 3) : String(blockId), iconCanvas.width / 2, iconCanvas.height / 2);
  }

  function drawTileIcon(blockId, iconCanvas) {
    const iconCtx = iconCanvas.getContext("2d");
    iconCtx.imageSmoothingEnabled = false;
    iconCtx.clearRect(0, 0, iconCanvas.width, iconCanvas.height);

    if (!currentMap || typeof loadRomTilesetAsset !== "function" || typeof drawRomMetatileToImage !== "function") {
      drawFallback(blockId, iconCanvas);
      return;
    }

    const primary = loadRomTilesetAsset(currentMap.layout.primaryTilesetPtr);
    const secondary = loadRomTilesetAsset(currentMap.layout.secondaryTilesetPtr);
    const useSecondary = blockId >= 512;
    const asset = useSecondary ? secondary : primary;
    const localId = useSecondary ? blockId - 512 : blockId;
    if (!asset) {
      drawFallback(blockId, iconCanvas);
      return;
    }

    const imageData = iconCtx.createImageData(32, 32);
    fillImageDataWhite(imageData);
    drawRomMetatileToImage(imageData, 0, 0, asset, localId, primary, secondary, null);
    iconCtx.putImageData(imageData, 0, 0);
  }

  function refreshTileSelection() {
    const selectedBlockId = window.RBEditorState?.selectedBlockId ?? Number(document.querySelector(".tile-card.active")?.dataset.blockId) ?? 0;
    const active = document.querySelector(".tile-card.active");
    const next = document.querySelector(`.tile-card[data-block-id="${selectedBlockId}"]`);
    if (active && active !== next) active.classList.remove("active");
    if (next) next.classList.add("active");
    const current = document.getElementById("currentTileCanvas");
    if (current) drawTileIcon(selectedBlockId, current);
  }

  function refreshTileLibrary(force = false) {
    if (renderingTiles || getEditorMode() !== "terrain") return;
    const grid = document.getElementById("tileLibraryGrid");
    if (!grid) return;

    const nextKey = getTileLibraryKey();
    if (!force && tileLibraryInitialized && tileLibraryKey === nextKey && grid.children.length) {
      refreshTileSelection();
      return;
    }

    renderingTiles = true;
    try {
      const blocks = getAvailableBlocks();
      tileLibraryKey = nextKey;
      tileLibraryInitialized = true;

      if (!blocks.length) {
        grid.innerHTML = `<div class="empty-tip">当前地图没有读取到可用瓦片。</div>`;
        return;
      }

      let selectedBlockId = window.RBEditorState?.selectedBlockId ?? blocks[0].blockId;
      if (!blocks.some(x => x.blockId === selectedBlockId)) selectedBlockId = blocks[0].blockId;
      if (window.RBEditorState) window.RBEditorState.selectedBlockId = selectedBlockId;

      const fragment = document.createDocumentFragment();
      for (const item of blocks) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tile-card";
        btn.dataset.blockId = String(item.blockId);
        btn.title = `${item.source} blockId=${hex(item.blockId, 4)}`;

        const icon = document.createElement("canvas");
        icon.width = 32;
        icon.height = 32;
        drawTileIcon(item.blockId, icon);

        btn.appendChild(icon);
        fragment.appendChild(btn);
      }

      grid.replaceChildren(fragment);
      refreshTileSelection();
    } finally {
      renderingTiles = false;
    }
  }

  function getCollisionOpacity() {
    const input = document.getElementById("collisionOpacityInput");
    const value = clampNumber(input?.value, 0, 100, Math.round((window.RBEditorState?.collision?.opacity ?? 0.42) * 100));
    if (window.RBEditorState?.collision) window.RBEditorState.collision.opacity = value / 100;
    return value / 100;
  }

  function drawCollisionOverlay() {
    if (getEditorMode() !== "terrain" || getTerrainTab() !== "collision" || !currentMap || !rom) return;
    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return;

    const opacity = getCollisionOpacity();
    const cs = getCellSize();
    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    ctx.save();
    ctx.font = `${Math.max(10, Math.floor(cs * 0.42))}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cellOff = mapOff + (y * w + x) * 2;
        if (!isValidOffset(cellOff, 2)) continue;
        const raw = readU16(cellOff);
        const collision = (raw >> 10) & 0x03;
        const elevation = (raw >> 12) & 0x0F;
        const px = x * cs;
        const py = y * cs;
        if (collision > 0) {
          ctx.fillStyle = `rgba(239,68,68,${opacity})`;
          ctx.fillRect(px, py, cs, cs);
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = `rgba(34,197,94,${opacity * 0.45})`;
          ctx.fillRect(px, py, cs, cs);
          ctx.fillStyle = "#14532d";
        }
        ctx.fillText(String(elevation), px + cs / 2, py + cs / 2);
      }
    }
    ctx.restore();
  }

  function wrapRenderMap() {
    if (originalRenderMap) return;
    originalRenderMap = window.renderMap || (typeof renderMap === "function" ? renderMap : null);
    if (!originalRenderMap) return;
    const wrapped = async function renderMapWithTerrainPanel(...args) {
      const result = await originalRenderMap.apply(this, args);
      drawCollisionOverlay();
      if (!tileLibraryInitialized || tileLibraryKey !== getTileLibraryKey()) {
        refreshTileLibrary(false);
      }
      return result;
    };
    try { renderMap = wrapped; } catch (err) { window.renderMap = wrapped; }
    window.renderMap = wrapped;
  }

  function rerenderMap() {
    if (currentMap && typeof renderMap === "function") renderMap(currentMap, currentEvents);
  }

  function applyTerrainEditorState() {
    injectStyle();
    const rightPanel = document.querySelector(".panel.right");
    const panel = ensureTerrainEditorPanel();
    if (!rightPanel || !panel) return;

    const isTerrain = getEditorMode() === "terrain";
    rightPanel.classList.toggle("mode-terrain-editor", isTerrain);
    rightPanel.classList.remove("mode-terrain-view", "mode-terrain-paint");

    if (!isTerrain) {
      panel.classList.remove("active");
      return;
    }

    const title = rightPanel.querySelector(":scope > h2");
    if (title) {
      title.textContent = "地图编辑";
      title.style.display = "block";
    }

    for (const child of Array.from(rightPanel.children)) {
      child.style.display = child === title ? "block" : (child === panel ? "flex" : "none");
    }

    panel.classList.add("active");
    setTerrainTab(getTerrainTab());
  }

  function install() {
    injectStyle();
    wrapRenderMap();

    document.addEventListener("click", (e) => {
      if (e.target.closest(".editor-mode-option") || e.target.closest('input[name="mouseMode"]') || e.target.closest(".terrain-editor-tab-btn")) {
        applyTerrainEditorState();
      }
    }, true);

    document.addEventListener("input", (e) => {
      if (e.target.matches("#collisionOpacityInput")) rerenderMap();
    }, true);

    applyTerrainEditorState();
  }

  install();

  window.RBEditorTerrainPanel = {
    ensureTerrainEditorPanel,
    applyTerrainEditorState,
    refreshTileLibrary,
    drawCollisionOverlay,
    setTerrainTab,
  };
})();
