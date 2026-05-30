// ============================================================
// Unified editor mode and tab controller
// ============================================================
// 统一管理：
// - 顶层编辑模式 terrain/events/connections/metadata
// - 鼠标模式 view/paint
// - 地形子 tab tiles/collision
// - 非地形模式右侧面板显示

(function modeController() {
  const state = window.RBEditorState || (window.RBEditorState = {});

  function injectStyle() {
    if (document.getElementById("modeControllerStyle")) return;

    const style = document.createElement("style");
    style.id = "modeControllerStyle";
    style.textContent = `
      .metadata-panel.active {
        display: flex !important;
        align-items: flex-start;
        justify-content: center;
        padding: 24px 32px !important;
      }

      .metadata-panel.active .metadata-card {
        width: min(1120px, 100%);
        max-width: none !important;
        min-height: auto !important;
      }

      .metadata-panel.active .metadata-card h3 {
        display: none !important;
      }

      .metadata-panel.active .metadata-form-row {
        grid-template-columns: 140px minmax(0, 1fr);
      }

      .metadata-panel #metadataMapInfoBox,
      .metadata-panel .metadata-map-info {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function removeCenterMetadataMapInfo() {
    document.getElementById("metadataMapInfoBox")?.remove();
    for (const el of document.querySelectorAll("#mapMetadataPanel .metadata-map-info")) {
      el.remove();
    }
  }

  function getCurrentMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || state.mode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || state.mouseMode || "view";
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || state.terrainTab || "tiles";
  }

  function syncMouseMode() {
    const mouseMode = getMouseMode() === "paint" ? "paint" : "view";
    state.mouseMode = mouseMode;
    return mouseMode;
  }

  function setEditorMode(mode) {
    const nextMode = ["terrain", "events", "connections", "metadata"].includes(mode) ? mode : "terrain";
    state.mode = nextMode;

    document.querySelectorAll(".editor-mode-option").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.editorMode === nextMode);
    });

    applyModeState();
    return nextMode;
  }

  function setTerrainTab(tab) {
    const nextTab = tab === "collision" ? "collision" : "tiles";
    state.terrainTab = nextTab;

    document.querySelectorAll(".terrain-editor-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.terrainTab === nextTab);
    });
    document.getElementById("terrainEditorTilesHost")?.classList.toggle("active", nextTab === "tiles");
    document.getElementById("terrainEditorCollisionHost")?.classList.toggle("active", nextTab === "collision");

    if (window.RBEditorTerrainPanel?.setTerrainTab) {
      window.RBEditorTerrainPanel.setTerrainTab(nextTab);
    }
    return nextTab;
  }

  function hideTerrainPanel() {
    const terrainPanel = document.getElementById("terrainEditorPanel");
    if (terrainPanel) {
      terrainPanel.classList.remove("active");
      terrainPanel.style.display = "none";
    }
  }

  function showEventsMode() {
    hideTerrainPanel();
    if (window.RBEditorRightPanel?.showEventsOnly) {
      window.RBEditorRightPanel.showEventsOnly();
      return;
    }

    const panel = document.querySelector(".panel.right");
    const title = panel?.querySelector(":scope > h2");
    const eventTab = document.getElementById("eventTab");
    if (title) title.textContent = "地图事件";
    if (panel && eventTab) {
      for (const child of Array.from(panel.children)) child.style.display = child === title || child === eventTab ? "block" : "none";
    }
  }

  function showMetadataMode() {
    hideTerrainPanel();
    removeCenterMetadataMapInfo();
    if (window.RBEditorRightPanel?.showMapInfoOnly) {
      window.RBEditorRightPanel.showMapInfoOnly();
      return;
    }

    const panel = document.querySelector(".panel.right");
    const title = panel?.querySelector(":scope > h2");
    const mapInfoTab = document.getElementById("mapInfoTab");
    if (title) title.textContent = "地图信息";
    if (panel && mapInfoTab) {
      for (const child of Array.from(panel.children)) child.style.display = child === title || child === mapInfoTab ? "block" : "none";
    }
  }

  function showTerrainMode() {
    removeCenterMetadataMapInfo();
    if (window.RBEditorTerrainPanel?.applyTerrainEditorState) {
      window.RBEditorTerrainPanel.applyTerrainEditorState();
      return;
    }
  }

  function showConnectionsMode() {
    hideTerrainPanel();
    const panel = document.querySelector(".panel.right");
    if (panel && window.RBEditorRightPanel?.setModeClass) {
      window.RBEditorRightPanel.setModeClass("mode-connections");
    }
    // connector-display-fix.js 负责真正渲染连接器面板，这里只同步状态，避免重复实现。
  }

  function applyModeState() {
    injectStyle();
    syncMouseMode();
    state.terrainTab = getTerrainTab();

    const mode = getCurrentMode();
    state.mode = mode;

    if (mode === "terrain") showTerrainMode();
    else if (mode === "events") showEventsMode();
    else if (mode === "metadata") showMetadataMode();
    else if (mode === "connections") showConnectionsMode();
  }

  document.addEventListener("click", (e) => {
    const modeBtn = e.target.closest(".editor-mode-option");
    if (modeBtn && modeBtn.dataset.editorMode) {
      setEditorMode(modeBtn.dataset.editorMode);
      setTimeout(applyModeState, 80);
      return;
    }

    const tabBtn = e.target.closest(".terrain-editor-tab-btn");
    if (tabBtn && tabBtn.dataset.terrainTab) {
      setTerrainTab(tabBtn.dataset.terrainTab);
      setTimeout(applyModeState, 80);
    }
  }, true);

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="mouseMode"]')) {
      syncMouseMode();
      setTimeout(applyModeState, 0);
    }
  }, true);

  const observer = new MutationObserver(() => {
    setTimeout(applyModeState, 0);
  });

  function install() {
    injectStyle();
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
    setTimeout(applyModeState, 0);
    setTimeout(applyModeState, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorSetMode = setEditorMode;
  window.RBEditorSetTerrainTab = setTerrainTab;
  window.RBEditorApplyModeState = applyModeState;
})();
