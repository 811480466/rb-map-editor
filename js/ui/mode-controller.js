// ============================================================
// Unified editor mode and tab controller
// ============================================================
// 统一管理：
// - 顶层编辑模式 terrain/events/connections/metadata
// - 鼠标模式 view/paint
// - 地形子 tab tiles/collision
// - 非地形模式右侧面板显示
//
// 说明：右侧 panel 不再使用 MutationObserver / 定时器反复刷新，
// 只在点击模式、点击 tab、切换鼠标模式、初始化时主动切换。

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

  function ensureMetadataPanel() {
    let panel = document.getElementById("mapMetadataPanel");
    if (!panel && window.RBEditorAppShell?.ensureMetadataPanel) {
      panel = window.RBEditorAppShell.ensureMetadataPanel();
    }
    return panel;
  }

  function setCenterMetadataVisible(visible) {
    const mapShell = document.querySelector(".map-connection-shell");
    const legend = document.querySelector(".legend-bar");
    const metadataPanel = ensureMetadataPanel();
    const toolbar = document.getElementById("mapToolbar");
    const weather = document.querySelector(".weather-control");
    const metadataWeatherHost = document.getElementById("metadataWeatherHost");
    const currentMapRow = document.querySelector(".current-map-row");

    if (visible) {
      if (metadataWeatherHost && weather && weather.parentElement !== metadataWeatherHost) {
        metadataWeatherHost.appendChild(weather);
      }
      if (mapShell) mapShell.style.display = "none";
      if (legend) legend.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      if (metadataPanel) metadataPanel.classList.add("active");
    } else {
      if (currentMapRow && weather && weather.parentElement !== currentMapRow) {
        currentMapRow.appendChild(weather);
      }
      if (mapShell) mapShell.style.display = "grid";
      if (toolbar) toolbar.style.display = "flex";
      if (metadataPanel) metadataPanel.classList.remove("active");
    }
  }

  function getCurrentMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || state.mode || "terrain";
  }

  function getMouseMode() {
    const checked = document.querySelector('input[name="mouseMode"]:checked')?.value;
    if (checked) return checked;
    if (document.body.classList.contains("paint-mode")) return "paint";
    return state.mouseMode || "view";
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || state.terrainTab || "tiles";
  }

  function syncMouseMode() {
    const mouseMode = getMouseMode() === "paint" ? "paint" : "view";
    state.mouseMode = mouseMode;
    document.body.classList.toggle("paint-mode", state.mode === "terrain" && mouseMode === "paint");
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
    setCenterMetadataVisible(false);
    hideTerrainPanel();
    const legend = document.querySelector(".legend-bar");
    if (legend) legend.style.display = "block";
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
    setCenterMetadataVisible(true);
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
    setCenterMetadataVisible(false);
    removeCenterMetadataMapInfo();
    const legend = document.querySelector(".legend-bar");
    if (legend) legend.style.display = "none";
    if (window.RBEditorTerrainPanel?.applyTerrainEditorState) {
      window.RBEditorTerrainPanel.applyTerrainEditorState();
    }
  }

  function showConnectionsMode() {
    setCenterMetadataVisible(false);
    hideTerrainPanel();
    const legend = document.querySelector(".legend-bar");
    if (legend) legend.style.display = "none";
    const panel = document.querySelector(".panel.right");
    if (panel && window.RBEditorRightPanel?.setModeClass) {
      window.RBEditorRightPanel.setModeClass("mode-connections");
    }
    if (window.RBEditorConnectorPanel?.render) {
      window.RBEditorConnectorPanel.render();
    }
  }

  function applyModeState() {
    injectStyle();
    const mode = getCurrentMode();
    state.mode = mode;
    syncMouseMode();
    state.terrainTab = getTerrainTab();

    if (mode === "terrain") showTerrainMode();
    else if (mode === "events") showEventsMode();
    else if (mode === "metadata") showMetadataMode();
    else if (mode === "connections") showConnectionsMode();
  }

  document.addEventListener("click", (e) => {
    const modeBtn = e.target.closest(".editor-mode-option");
    if (modeBtn && modeBtn.dataset.editorMode) {
      setEditorMode(modeBtn.dataset.editorMode);
      return;
    }

    const tabBtn = e.target.closest(".terrain-editor-tab-btn");
    if (tabBtn && tabBtn.dataset.terrainTab) {
      setTerrainTab(tabBtn.dataset.terrainTab);
      applyModeState();
    }
  }, true);

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="mouseMode"]')) {
      syncMouseMode();
      applyModeState();
    }
  }, true);

  function install() {
    injectStyle();
    applyModeState();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorSetMode = setEditorMode;
  window.RBEditorSetTerrainTab = setTerrainTab;
  window.RBEditorApplyModeState = applyModeState;
})();
