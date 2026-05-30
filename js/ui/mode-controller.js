// ============================================================
// Unified editor mode and tab controller
// ============================================================

(function modeController() {
  const state = window.RBEditorState;

  function setEditorMode(mode) {
    if (["terrain", "events", "connections", "metadata"].includes(mode)) {
      state.mode = mode;
      document.querySelectorAll(".editor-mode-option").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.editorMode === mode);
      });
    }
  }

  function setTerrainTab(tab) {
    state.terrainTab = tab === "collision" ? "collision" : "tiles";
    document.querySelectorAll(".terrain-editor-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.terrainTab === tab);
    });
  }

  document.addEventListener("click", (e) => {
    const modeBtn = e.target.closest(".editor-mode-option");
    if (modeBtn && modeBtn.dataset.editorMode) {
      setEditorMode(modeBtn.dataset.editorMode);
    }

    const tabBtn = e.target.closest(".terrain-editor-tab-btn");
    if (tabBtn && tabBtn.dataset.terrainTab) {
      setTerrainTab(tabBtn.dataset.terrainTab);
    }
  });

  // Expose for other modules
  window.RBEditorSetMode = setEditorMode;
  window.RBEditorSetTerrainTab = setTerrainTab;
})();