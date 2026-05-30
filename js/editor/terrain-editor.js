// ============================================================
// Terrain editor unified module
// ============================================================
// 低风险重构：将原 terrain-editor-tabs-fix.js 功能迁移
// 负责地形 tab 的显示和瓦片绘制管理

(function terrainEditor() {
  const state = window.RBEditorState;
  const panel = document.getElementById("terrainEditorTilesHost");
  if (!panel) return;

  function getActiveTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || state.terrainTab || "tiles";
  }

  function setActiveTab(tab) {
    state.terrainTab = tab === "collision" ? "collision" : "tiles";
    document.querySelectorAll(".terrain-editor-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.terrainTab === tab);
    });
  }

  // TODO: 将 tile 绘制逻辑整合进这里
  // paint / view 模式控制
  // 选择方块 / 吸管工具 / 填充工具 / 批量操作

  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".terrain-editor-tab-btn");
    if (tabBtn && tabBtn.dataset.terrainTab) {
      setActiveTab(tabBtn.dataset.terrainTab);
    }
  });

  window.RBEditorTerrain = {
    getActiveTab,
    setActiveTab,
  };
})();