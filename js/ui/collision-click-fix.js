// ============================================================
// Collision click isolation
// ============================================================
// 地图碰撞 tab 绘制时，只写 collision/elevation，不允许旧的瓦片绘制事件继续执行。

(function collisionClickFix() {
  let selectedCollision = 1;
  let selectedElevation = 3;

  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "view";
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || "tiles";
  }

  function readCurrentCollisionValues() {
    const collisionInput = document.getElementById("collisionValueInput");
    const elevationInput = document.getElementById("collisionElevationInput");

    const c = Number(collisionInput?.value);
    const e = Number(elevationInput?.value);

    selectedCollision = Number.isFinite(c) ? Math.max(0, Math.min(3, Math.trunc(c))) : selectedCollision;
    selectedElevation = Number.isFinite(e) ? Math.max(0, Math.min(15, Math.trunc(e))) : selectedElevation;
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

  function paintCollisionOnly(cell) {
    const cellOff = getCellOffset(cell.x, cell.y);
    if (cellOff === null) return false;

    readCurrentCollisionValues();

    const raw = readU16(cellOff);
    const blockId = raw & 0x03FF;
    const newRaw = blockId | ((selectedCollision & 0x03) << 10) | ((selectedElevation & 0x0F) << 12);

    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    if (currentMap) renderMap(currentMap, currentEvents);
    return true;
  }

  window.addEventListener("click", e => {
    if (getEditorMode() !== "terrain") return;
    if (getTerrainTab() !== "collision") return;
    if (getMouseMode() !== "paint") return;
    if (!e.target || e.target.id !== "mapCanvas") return;

    const cell = getMapCellFromMouseEvent(e);
    if (!cell) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    paintCollisionOnly(cell);
  }, true);
})();
