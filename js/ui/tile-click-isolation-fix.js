// ============================================================
// Tile click isolation fix
// ============================================================
// 修复：当前选中的瓦片和实际绘制结果不一致。
// 原因：旧的 ui-overrides.js 里还有一个 canvas 点击绘制逻辑，
// 会在新的“地形瓦片”逻辑之外再次写入 blockId，导致最终被旧选中值覆盖。
// 这里在 window 捕获阶段拦截“地形瓦片 + 绘制”的点击，只执行新的瓦片写入。

(function tileClickIsolationFix() {
  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "view";
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || "tiles";
  }

  function getSelectedBlockId() {
    const active = document.querySelector(".tile-card.active");
    if (!active) return null;

    const blockId = Number(active.dataset.blockId);
    if (!Number.isFinite(blockId)) return null;
    return blockId & 0x03FF;
  }

  function getCellOffset(x, y) {
    if (!currentMap || !rom) return null;

    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return null;

    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return null;

    const cellOff = mapOff + (y * w + x) * 2;
    return isValidOffset(cellOff, 2) ? cellOff : null;
  }

  function paintTileOnly(cell) {
    const selectedBlockId = getSelectedBlockId();
    if (selectedBlockId === null) return false;

    const cellOff = getCellOffset(cell.x, cell.y);
    if (cellOff === null) return false;

    const raw = readU16(cellOff);
    const newRaw = (raw & 0xFC00) | selectedBlockId;

    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    if (currentMap) renderMap(currentMap, currentEvents);
    return true;
  }

  window.addEventListener("click", e => {
    if (getEditorMode() !== "terrain") return;
    if (getTerrainTab() !== "tiles") return;
    if (getMouseMode() !== "paint") return;
    if (!e.target || e.target.id !== "mapCanvas") return;

    const cell = getMapCellFromMouseEvent(e);
    if (!cell) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    paintTileOnly(cell);
  }, true);
})();
