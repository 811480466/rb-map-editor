// ============================================================
// Terrain editor unified module
// ============================================================
// 接管地形瓦片选择和绘制：
// - 点击瓦片库只更新当前选择，不重建瓦片库，不重绘整张地图
// - 绘制模式 + 地形瓦片 tab 点击地图时，只写当前 active 瓦片 blockId

(function terrainEditor() {
  const state = window.RBEditorState || (window.RBEditorState = {});
  let lastSelectedBlockId = Number.isFinite(Number(state.selectedBlockId)) ? Number(state.selectedBlockId) & 0x03FF : null;
  let lastActiveTileCard = null;

  function getActiveTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || state.terrainTab || "tiles";
  }

  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || state.mode || "terrain";
  }

  function getMouseMode() {
    const checked = document.querySelector('input[name="mouseMode"]:checked')?.value;
    if (checked) return checked;
    if (document.body.classList.contains("paint-mode")) return "paint";
    return state.mouseMode || "view";
  }

  function isMapCanvasEvent(e) {
    if (e.target?.id === "mapCanvas") return true;
    return typeof e.composedPath === "function" && e.composedPath().some(el => el?.id === "mapCanvas");
  }

  function setActiveTab(tab) {
    const nextTab = tab === "collision" ? "collision" : "tiles";
    state.terrainTab = nextTab;
    document.querySelectorAll(".terrain-editor-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.terrainTab === nextTab);
    });
    document.getElementById("terrainEditorTilesHost")?.classList.toggle("active", nextTab === "tiles");
    document.getElementById("terrainEditorCollisionHost")?.classList.toggle("active", nextTab === "collision");
  }

  function normalizeBlockId(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return n & 0x03FF;
  }

  function getSelectedBlockId() {
    const active = lastActiveTileCard?.isConnected ? lastActiveTileCard : document.querySelector(".tile-card.active");
    const fromActive = normalizeBlockId(active?.dataset.blockId);
    if (fromActive !== null) return fromActive;

    if (lastSelectedBlockId !== null) return lastSelectedBlockId;

    const fromState = normalizeBlockId(state.selectedBlockId);
    if (fromState !== null) return fromState;

    const first = document.querySelector(".tile-card");
    return normalizeBlockId(first?.dataset.blockId);
  }

  function drawCurrentTilePreview(blockId, sourceCard = null) {
    const current = document.getElementById("currentTileCanvas");
    if (!current || blockId === null || blockId === undefined) return;

    const ctx2 = current.getContext("2d");
    ctx2.imageSmoothingEnabled = false;
    ctx2.clearRect(0, 0, current.width, current.height);

    const sourceCanvas = sourceCard?.querySelector("canvas") || document.querySelector(`.tile-card[data-block-id="${blockId}"] canvas`);
    if (sourceCanvas) {
      ctx2.drawImage(sourceCanvas, 0, 0, current.width, current.height);
      return;
    }

    ctx2.fillStyle = "#f8fbff";
    ctx2.fillRect(0, 0, current.width, current.height);
    ctx2.fillStyle = "#1e3a8a";
    ctx2.font = "10px Arial";
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    ctx2.fillText(typeof hex === "function" ? hex(blockId, 3) : String(blockId), current.width / 2, current.height / 2);
  }

  function selectBlock(blockId, sourceCard = null) {
    const id = normalizeBlockId(blockId);
    if (id === null) return;

    lastSelectedBlockId = id;
    state.selectedBlockId = id;
    window.__rbSelectedBlockId = id;

    const nextActive = sourceCard || document.querySelector(`.tile-card[data-block-id="${id}"]`);

    // 关键优化：不要每次选择都遍历整个瓦片库，只更新上一个和当前两个按钮。
    if (lastActiveTileCard && lastActiveTileCard !== nextActive && lastActiveTileCard.isConnected) {
      lastActiveTileCard.classList.remove("active");
    }

    const domActive = document.querySelector(".tile-card.active");
    if (domActive && domActive !== nextActive) domActive.classList.remove("active");

    if (nextActive) {
      nextActive.classList.add("active");
      lastActiveTileCard = nextActive;
    }

    drawCurrentTilePreview(id, nextActive);
  }

  function ensureInitialSelection() {
    if (getActiveTab() !== "tiles") return;
    const active = document.querySelector(".tile-card.active");
    if (active) {
      lastActiveTileCard = active;
      const id = normalizeBlockId(active.dataset.blockId);
      if (id !== null) {
        lastSelectedBlockId = id;
        state.selectedBlockId = id;
        drawCurrentTilePreview(id, active);
      }
      return;
    }

    const first = document.querySelector(".tile-card");
    if (first) selectBlock(first.dataset.blockId, first);
  }

  function getCellOffset(cell) {
    if (!cell || !currentMap || !rom) return null;
    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return null;
    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    if (cell.x < 0 || cell.y < 0 || cell.x >= w || cell.y >= h) return null;
    const cellOff = mapOff + (cell.y * w + cell.x) * 2;
    return isValidOffset(cellOff, 2) ? cellOff : null;
  }

  function paintTileToCell(cell) {
    const selectedBlockId = getSelectedBlockId();
    if (selectedBlockId === null) return false;

    const cellOff = getCellOffset(cell);
    if (cellOff === null) return false;

    const oldRaw = readU16(cellOff);
    const newRaw = (oldRaw & 0xFC00) | (selectedBlockId & 0x03FF);
    if (newRaw === oldRaw) return true;

    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    if (currentMap && typeof renderMap === "function") renderMap(currentMap, currentEvents);
    return true;
  }

  function syncStateFromUi() {
    state.mode = getEditorMode();
    state.mouseMode = getMouseMode();
    state.terrainTab = getActiveTab();
    ensureInitialSelection();
  }

  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".terrain-editor-tab-btn");
    if (tabBtn && tabBtn.dataset.terrainTab) {
      setActiveTab(tabBtn.dataset.terrainTab);
      syncStateFromUi();
      return;
    }

    const tileCard = e.target.closest(".tile-card");
    if (tileCard) {
      e.preventDefault();
      selectBlock(tileCard.dataset.blockId, tileCard);
    }
  }, true);

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="mouseMode"]')) syncStateFromUi();
  }, true);

  window.addEventListener("click", (e) => {
    if (getEditorMode() !== "terrain") return;
    if (getActiveTab() !== "tiles") return;
    if (getMouseMode() !== "paint") return;
    if (!isMapCanvasEvent(e)) return;
    if (typeof getMapCellFromMouseEvent !== "function") return;

    const cell = getMapCellFromMouseEvent(e);
    if (!cell) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    paintTileToCell(cell);
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncStateFromUi);
  } else {
    syncStateFromUi();
  }

  window.RBEditorTerrain = {
    getActiveTab,
    setActiveTab,
    getSelectedBlockId,
    selectBlock,
    paintTileToCell,
    syncStateFromUi,
  };
})();
