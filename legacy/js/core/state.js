// ============================================================
// Shared editor state
// ============================================================
// 第一阶段低风险重构：先集中保存 UI / 编辑器状态。
// 旧脚本仍可继续使用自己的局部变量，后续再逐步迁移到这里。

(function initRBEditorState() {
  const existing = window.RBEditorState || {};

  window.RBEditorState = {
    mode: existing.mode || "terrain",              // terrain | events | connections | metadata
    mouseMode: existing.mouseMode || "view",       // view | paint
    terrainTab: existing.terrainTab || "tiles",    // tiles | collision
    selectedBlockId: existing.selectedBlockId || 0,
    collision: {
      elevation: existing.collision?.elevation ?? 3,
      value: existing.collision?.value ?? 1,
      opacity: existing.collision?.opacity ?? 0.42,
    },
  };

  window.RBEditorSetMode = function RBEditorSetMode(mode) {
    if (["terrain", "events", "connections", "metadata"].includes(mode)) {
      window.RBEditorState.mode = mode;
    }
    return window.RBEditorState.mode;
  };

  window.RBEditorSetMouseMode = function RBEditorSetMouseMode(mouseMode) {
    window.RBEditorState.mouseMode = mouseMode === "paint" ? "paint" : "view";
    return window.RBEditorState.mouseMode;
  };

  window.RBEditorSetTerrainTab = function RBEditorSetTerrainTab(tab) {
    window.RBEditorState.terrainTab = tab === "collision" ? "collision" : "tiles";
    return window.RBEditorState.terrainTab;
  };

  window.RBEditorSetCollisionState = function RBEditorSetCollisionState(next = {}) {
    const collision = window.RBEditorState.collision;
    if (Number.isFinite(Number(next.elevation))) {
      collision.elevation = Math.max(0, Math.min(15, Math.trunc(Number(next.elevation))));
    }
    if (Number.isFinite(Number(next.value))) {
      collision.value = Math.max(0, Math.min(3, Math.trunc(Number(next.value))));
    }
    if (Number.isFinite(Number(next.opacity))) {
      collision.opacity = Math.max(0, Math.min(1, Number(next.opacity)));
    }
    return collision;
  };
})();
