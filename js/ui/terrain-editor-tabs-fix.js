// ============================================================
// Terrain editor tabs + collision editor
// ============================================================
// 地形编辑模式右侧固定为“地图编辑”，通过 tab 切换“地形瓦片 / 地图碰撞”。
// 工具栏的查看/绘制只控制鼠标行为，不再控制右侧显示内容。

(function terrainEditorTabsFix() {
  let activeTerrainTab = "tiles";
  let selectedCollision = 1;
  let selectedElevation = 3;
  let collisionOpacity = 0.42;
  let originalRenderMap = null;

  function injectStyle() {
    if (document.getElementById("terrainEditorTabsFixStyle")) return;

    const style = document.createElement("style");
    style.id = "terrainEditorTabsFixStyle";
    style.textContent = `
      .panel.right.mode-terrain-editor > h2 {
        display: block !important;
        flex: 0 0 auto;
      }

      .panel.right.mode-terrain-editor > .tabs,
      .panel.right.mode-terrain-editor #eventTab,
      .panel.right.mode-terrain-editor #mapInfoTab,
      .panel.right.mode-terrain-editor #connectionTools,
      .panel.right.mode-terrain-editor #warpTools,
      .panel.right.mode-terrain-editor #eventDetail,
      .panel.right.mode-terrain-editor > h3 {
        display: none !important;
      }

      .terrain-editor-panel {
        display: none;
        height: 100%;
        min-height: 0;
        flex-direction: column;
        overflow: hidden;
      }

      .terrain-editor-panel.active {
        display: flex;
      }

      .terrain-editor-tabs {
        flex: 0 0 auto;
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid var(--border);
      }

      .terrain-editor-tab-btn {
        width: auto;
        margin: 0;
        padding: 8px 12px;
        border: 0;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        background: transparent;
        color: var(--blue);
        font-size: 13px;
        font-weight: 600;
      }

      .terrain-editor-tab-btn.active {
        color: var(--blue-dark);
        border-bottom-color: var(--blue);
        font-weight: 800;
      }

      .terrain-editor-tab-content {
        flex: 1 1 auto;
        min-height: 0;
        display: none;
        overflow: hidden;
      }

      .terrain-editor-tab-content.active {
        display: flex;
        flex-direction: column;
      }

      #terrainEditorTilesHost {
        min-height: 0;
      }

      #terrainEditorTilesHost #terrainPaintPanel {
        display: flex !important;
        height: 100%;
      }

      .collision-editor-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding-right: 4px;
      }

      .collision-controls {
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: #f8fbff;
        margin-bottom: 10px;
      }

      .collision-control-row {
        display: grid;
        grid-template-columns: 84px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .collision-control-row label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .collision-control-row input,
      .collision-control-row select {
        width: 100%;
        margin: 0;
        padding: 7px 8px;
        font-size: 12px;
      }

      .collision-palette {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .collision-palette button {
        margin: 0;
        padding: 8px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: #fff;
        color: var(--text);
        font-size: 12px;
      }

      .collision-palette button.active {
        border-color: var(--blue);
        background: var(--blue-soft);
        color: var(--blue-dark);
        box-shadow: 0 0 0 2px rgba(37,99,235,.12);
      }

      .collision-help {
        margin-top: 10px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.55;
      }

      .metadata-panel.active .metadata-map-info {
        margin-top: 18px;
      }

      .metadata-panel.active .metadata-map-info pre {
        max-height: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "view";
  }

  function ensureTerrainEditorPanel() {
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return null;

    let panel = document.getElementById("terrainEditorPanel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "terrainEditorPanel";
    panel.className = "terrain-editor-panel";
    panel.innerHTML = `
      <div class="terrain-editor-tabs">
        <button type="button" class="terrain-editor-tab-btn active" data-terrain-tab="tiles">地形瓦片</button>
        <button type="button" class="terrain-editor-tab-btn" data-terrain-tab="collision">地图碰撞</button>
      </div>
      <div id="terrainEditorTilesHost" class="terrain-editor-tab-content active"></div>
      <div id="terrainEditorCollisionHost" class="terrain-editor-tab-content">
        <div class="collision-editor-body">
          <div class="collision-controls">
            <div class="collision-control-row">
              <label>Elevation</label>
              <input id="collisionElevationInput" type="number" min="0" max="15" value="3" />
            </div>
            <div class="collision-control-row">
              <label>Collision</label>
              <select id="collisionValueInput">
                <option value="0">0 - 可通行</option>
                <option value="1" selected>1 - 阻挡</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div class="collision-control-row">
              <label>透明度</label>
              <input id="collisionOpacityInput" type="range" min="0" max="100" value="42" />
            </div>
            <div class="collision-palette" id="collisionPalette"></div>
            <div class="collision-help">
              切换到“地图碰撞”后，地图会叠加显示碰撞/高度。工具栏切到“绘制”后，点击地图格子会写入当前选择的 collision/elevation。
            </div>
          </div>
        </div>
      </div>`;

    rightPanel.appendChild(panel);

    for (const btn of panel.querySelectorAll("button[data-terrain-tab]")) {
      btn.onclick = () => setTerrainTab(btn.dataset.terrainTab);
    }

    const collisionInput = panel.querySelector("#collisionValueInput");
    const elevationInput = panel.querySelector("#collisionElevationInput");
    const opacityInput = panel.querySelector("#collisionOpacityInput");

    if (collisionInput) collisionInput.onchange = () => {
      selectedCollision = clampNumber(collisionInput.value, 0, 3, 1);
      renderCollisionPalette();
      rerenderMap();
    };

    if (elevationInput) elevationInput.onchange = () => {
      selectedElevation = clampNumber(elevationInput.value, 0, 15, 3);
      elevationInput.value = String(selectedElevation);
      rerenderMap();
    };

    if (opacityInput) opacityInput.oninput = () => {
      collisionOpacity = clampNumber(opacityInput.value, 0, 100, 42) / 100;
      rerenderMap();
    };

    renderCollisionPalette();
    return panel;
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function renderCollisionPalette() {
    const palette = document.getElementById("collisionPalette");
    if (!palette) return;

    const values = [0, 1, 2, 3];
    palette.innerHTML = values.map(v => `
      <button type="button" data-collision-value="${v}" class="${selectedCollision === v ? "active" : ""}">
        Collision ${v}
      </button>`).join("");

    for (const btn of palette.querySelectorAll("button[data-collision-value]")) {
      btn.onclick = () => {
        selectedCollision = Number(btn.dataset.collisionValue);
        const input = document.getElementById("collisionValueInput");
        if (input) input.value = String(selectedCollision);
        renderCollisionPalette();
        rerenderMap();
      };
    }
  }

  function setTerrainTab(tab) {
    activeTerrainTab = tab === "collision" ? "collision" : "tiles";

    for (const btn of document.querySelectorAll(".terrain-editor-tab-btn")) {
      btn.classList.toggle("active", btn.dataset.terrainTab === activeTerrainTab);
    }

    document.getElementById("terrainEditorTilesHost")?.classList.toggle("active", activeTerrainTab === "tiles");
    document.getElementById("terrainEditorCollisionHost")?.classList.toggle("active", activeTerrainTab === "collision");

    moveTerrainPaintPanelIntoEditor();
    rerenderMap();
  }

  function moveTerrainPaintPanelIntoEditor() {
    const host = document.getElementById("terrainEditorTilesHost");
    const terrainPanel = document.getElementById("terrainPaintPanel");
    if (host && terrainPanel && terrainPanel.parentElement !== host) {
      host.appendChild(terrainPanel);
    }

    if (terrainPanel) {
      terrainPanel.classList.add("active");
      terrainPanel.style.display = activeTerrainTab === "tiles" ? "flex" : "none";
    }
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
      if (child === title || child === panel) {
        child.style.display = child === panel ? "flex" : "block";
      } else {
        child.style.display = "none";
      }
    }

    panel.classList.add("active");
    setTerrainTab(activeTerrainTab);
  }

  function getMapCellRawOffset(x, y) {
    if (!currentMap || !rom) return null;
    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return null;

    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return null;
    const cellOff = mapOff + (y * w + x) * 2;
    if (!isValidOffset(cellOff, 2)) return null;
    return cellOff;
  }

  function writeCollisionCell(x, y) {
    if (getEditorMode() !== "terrain" || activeTerrainTab !== "collision" || getMouseMode() !== "paint") return false;

    const cellOff = getMapCellRawOffset(x, y);
    if (cellOff === null) return false;

    const raw = readU16(cellOff);
    const blockId = raw & 0x03FF;
    const newRaw = blockId | ((selectedCollision & 0x03) << 10) | ((selectedElevation & 0x0F) << 12);

    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    rerenderMap();
    return true;
  }

  function drawCollisionOverlay() {
    if (getEditorMode() !== "terrain" || activeTerrainTab !== "collision" || !currentMap || !rom) return;

    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return;

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
          ctx.fillStyle = `rgba(239, 68, 68, ${collisionOpacity})`;
          ctx.fillRect(px, py, cs, cs);
          ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.9, collisionOpacity + 0.25)})`;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + cs, py + cs);
          ctx.moveTo(px + cs, py);
          ctx.lineTo(px, py + cs);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(34, 197, 94, ${collisionOpacity * 0.45})`;
          ctx.fillRect(px, py, cs, cs);
        }

        ctx.fillStyle = collision > 0 ? "#ffffff" : "#14532d";
        ctx.fillText(String(elevation), px + cs / 2, py + cs / 2);
      }
    }

    ctx.restore();
  }

  function wrapRenderMap() {
    if (originalRenderMap) return;
    originalRenderMap = window.renderMap || (typeof renderMap === "function" ? renderMap : null);
    if (!originalRenderMap) return;

    const wrapped = async function renderMapWithCollisionOverlay(...args) {
      const result = await originalRenderMap.apply(this, args);
      drawCollisionOverlay();
      return result;
    };

    try {
      renderMap = wrapped;
    } catch (err) {
      window.renderMap = wrapped;
    }
    window.renderMap = wrapped;
  }

  function rerenderMap() {
    if (currentMap) renderMap(currentMap, currentEvents);
  }

  function syncMetadataMapInfo() {
    const metadataCard = document.querySelector("#mapMetadataPanel .metadata-card");
    const mapInfo = document.getElementById("mapInfo");
    if (!metadataCard || !mapInfo) return;

    let box = document.getElementById("metadataMapInfoBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "metadataMapInfoBox";
      box.className = "metadata-map-info";
      box.innerHTML = `<h3>地图信息</h3><pre id="metadataMapInfoText"></pre>`;
      metadataCard.appendChild(box);
    }

    const text = document.getElementById("metadataMapInfoText");
    if (text) text.textContent = mapInfo.textContent || "未加载地图。";
  }

  function install() {
    injectStyle();
    wrapRenderMap();

    document.addEventListener("click", (e) => {
      if (e.target.closest(".editor-mode-option") || e.target.closest('input[name="mouseMode"]')) {
        setTimeout(applyTerrainEditorState, 0);
        setTimeout(syncMetadataMapInfo, 0);
      }
    }, true);

    document.addEventListener("change", (e) => {
      if (e.target.matches('input[name="mouseMode"]')) {
        setTimeout(applyTerrainEditorState, 0);
      }
    }, true);

    canvas.addEventListener("click", (e) => {
      if (getEditorMode() !== "terrain" || activeTerrainTab !== "collision" || getMouseMode() !== "paint") return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const cell = getMapCellFromMouseEvent(e);
      if (cell) writeCollisionCell(cell.x, cell.y);
    }, true);

    const observer = new MutationObserver(() => {
      setTimeout(applyTerrainEditorState, 0);
      setTimeout(syncMetadataMapInfo, 0);
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
      attributeFilter: ["class", "style"],
    });

    setTimeout(applyTerrainEditorState, 0);
    setTimeout(syncMetadataMapInfo, 0);
    setTimeout(applyTerrainEditorState, 200);
    setTimeout(syncMetadataMapInfo, 200);
  }

  install();
})();
