// ============================================================
// Collision editor unified module
// ============================================================
// 低风险重构：整合原 collision-panel-layout-fix.js 和 collision-click-fix.js
// 使用统一状态 RBEditorState 和 tooltip 模块

(function collisionEditor() {
  const state = window.RBEditorState;
  const panel = document.getElementById("terrainEditorCollisionHost");
  if (!panel) return;

  function updateCurrentDisplay() {
    const elevationInput = document.getElementById("collisionElevationInput");
    const collisionInput = document.getElementById("collisionValueInput");
    const elevation = parseInt(elevationInput.value, 10) || 0;
    const collision = parseInt(collisionInput.value, 10) || 0;

    state.collision.elevation = elevation;
    state.collision.value = collision;

    const elevationText = panel.querySelector("#collisionCurrentElevationText");
    const collisionTextEl = panel.querySelector("#collisionCurrentValueText");
    if (elevationText) elevationText.textContent = `当前高度：${elevation}`;
    if (collisionTextEl) collisionTextEl.textContent = `当前碰撞：${collision === 0 ? '0 可通行' : collision + ' 不可通行'}`;

    for (const btn of panel.querySelectorAll(".collision-choice-btn")) {
      btn.classList.toggle("active", Number(btn.dataset.elevation) === elevation && Number(btn.dataset.collision) === collision);
    }
  }

  function setCollision(elevation, collision) {
    const elevationInput = document.getElementById("collisionElevationInput");
    const collisionInput = document.getElementById("collisionValueInput");
    if (!elevationInput || !collisionInput) return;

    elevationInput.value = elevation;
    collisionInput.value = collision;
    updateCurrentDisplay();
    if (typeof renderMap === "function" && currentMap) renderMap(currentMap, currentEvents);
  }

  function setDisplayFromMapCell(cell) {
    if (!cell || !currentMap || !rom) return;
    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return;
    const w = currentMap.layout.width;
    const cellOff = mapOff + (cell.y * w + cell.x) * 2;
    if (!isValidOffset(cellOff, 2)) return;

    const raw = readU16(cellOff);
    const elevation = (raw >> 12) & 0x0F;
    const collision = (raw >> 10) & 0x03;
    setCollision(elevation, collision);
  }

  // 点击地图格子，绘制或查看模式
  canvas.addEventListener("click", (e) => {
    if (!currentMap || state.mode !== "terrain" || !panel) return;
    const cell = getMapCellFromMouseEvent(e);
    if (!cell) return;

    if (state.mouseMode === "paint") {
      const mapOff = ptrToOffset(currentMap.layout.mapPtr);
      const w = currentMap.layout.width;
      const cellOff = mapOff + (cell.y * w + cell.x) * 2;
      if (!isValidOffset(cellOff, 2)) return;

      let raw = readU16(cellOff);
      raw = (raw & 0x0FFF) | ((state.collision.value & 0x03) << 10) | ((state.collision.elevation & 0x0F) << 12);
      writeU16(cellOff, raw);
      renderMap(currentMap, currentEvents);
      setCollision(state.collision.elevation, state.collision.value);
    } else {
      setDisplayFromMapCell(cell);
    }
  });

  // 鼠标移动显示 tooltip
  canvas.addEventListener("mousemove", (e) => {
    if (!currentMap) { window.RBEditorTooltip.hideTip(); return; }
    const cell = getMapCellFromMouseEvent(e);
    if (!cell) { window.RBEditorTooltip.hideTip(); return; }
    const info = getMapCellInfo(cell.x, cell.y);
    window.RBEditorTooltip.showTip(formatCellTooltip(info), e.clientX, e.clientY);
  });
  canvas.addEventListener("mouseleave", () => { window.RBEditorTooltip.hideTip(); });

  // 方块选择按钮事件
  panel.querySelectorAll(".collision-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const elevation = parseInt(btn.dataset.elevation, 10);
      const collision = parseInt(btn.dataset.collision, 10);
      setCollision(elevation, collision);
    });
  });

  updateCurrentDisplay();
})();