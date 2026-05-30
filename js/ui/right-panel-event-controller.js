// ============================================================
// Click-driven right panel controller
// ============================================================
// 不使用定时器 / MutationObserver。
// 只在模式切换、鼠标模式切换、地图选择、地图渲染结束这些明确动作后刷新右侧。

(function rightPanelEventController() {
  let installed = false;

  function mode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function mouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "view";
  }

  function title() {
    return document.querySelector(".panel.right > h2");
  }

  function rightPanel() {
    return document.querySelector(".panel.right");
  }

  function setVisible(el, display) {
    if (el) el.style.display = display;
  }

  function hideAllDynamicPanels() {
    setVisible(document.getElementById("terrainEditorPanel"), "none");
    setVisible(document.getElementById("terrainPaintPanel"), "none");
    setVisible(document.getElementById("mapConnectorPanel"), "none");
  }

  function hideBaseRightPanelParts() {
    const panel = rightPanel();
    if (!panel) return;
    for (const selector of [".tabs", "#eventTab", "#mapInfoTab", "#connectionTools", "#warpTools", "#eventDetail", ":scope > h3"]) {
      for (const el of panel.querySelectorAll(selector)) el.style.display = "none";
    }
  }

  function hideCenterMetadataMapInfo() {
    const box = document.getElementById("metadataMapInfoBox");
    if (box) box.style.display = "none";
  }

  function showCenterMetadataMapInfoIfNeeded() {
    const box = document.getElementById("metadataMapInfoBox");
    if (box) box.style.display = "";
  }

  function showEvents() {
    const panel = rightPanel();
    if (!panel) return;
    showCenterMetadataMapInfoIfNeeded();
    panel.classList.remove("mode-terrain-editor", "mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
    const t = title();
    if (t) t.textContent = "地图事件";
    hideAllDynamicPanels();
    hideBaseRightPanelParts();
    const eventTab = document.getElementById("eventTab");
    if (eventTab) {
      eventTab.classList.add("active");
      eventTab.style.display = "block";
    }
  }

  function showConnector() {
    const panel = rightPanel();
    if (!panel) return;
    showCenterMetadataMapInfoIfNeeded();
    panel.classList.remove("mode-terrain-editor", "mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
    const t = title();
    if (t) t.textContent = "地图连接器";
    hideAllDynamicPanels();
    hideBaseRightPanelParts();
    const connector = document.getElementById("mapConnectorPanel");
    if (connector) {
      connector.classList.add("active");
      connector.style.display = "block";
    }
  }

  function showMetadata() {
    const panel = rightPanel();
    if (!panel) return;

    panel.classList.remove("mode-terrain-editor", "mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
    const t = title();
    if (t) t.textContent = "地图信息";

    hideAllDynamicPanels();
    hideBaseRightPanelParts();
    hideCenterMetadataMapInfo();

    const mapInfoTab = document.getElementById("mapInfoTab");
    const mapInfo = document.getElementById("mapInfo");
    if (mapInfoTab) {
      mapInfoTab.classList.add("active");
      mapInfoTab.style.display = "block";
      mapInfoTab.style.overflow = "auto";
    }
    if (mapInfo) {
      mapInfo.style.maxHeight = "none";
      mapInfo.style.height = "auto";
    }
  }

  function showTerrain() {
    const panel = rightPanel();
    if (!panel) return;
    showCenterMetadataMapInfoIfNeeded();
    panel.classList.add("mode-terrain-editor");
    panel.classList.remove("mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
    const t = title();
    if (t) t.textContent = "地图编辑";
    hideBaseRightPanelParts();
    setVisible(document.getElementById("mapConnectorPanel"), "none");
    setVisible(document.getElementById("terrainPaintPanel"), "none");
    const editor = document.getElementById("terrainEditorPanel");
    if (editor) {
      editor.classList.add("active");
      editor.style.display = "flex";
    }
  }

  function renderRightPanel() {
    const m = mode();
    if (m === "events") showEvents();
    else if (m === "connections") showConnector();
    else if (m === "metadata") showMetadata();
    else showTerrain();
  }

  function wrapSelectMap() {
    const oldSelectMap = window.selectMap || (typeof selectMap === "function" ? selectMap : null);
    if (!oldSelectMap || oldSelectMap.__rightPanelEventWrapped) return;

    const wrapped = function selectMapRightPanelEventWrapper(...args) {
      const result = oldSelectMap.apply(this, args);
      renderRightPanel();
      return result;
    };
    wrapped.__rightPanelEventWrapped = true;

    try { selectMap = wrapped; } catch (err) { window.selectMap = wrapped; }
    window.selectMap = wrapped;
  }

  function wrapRenderMap() {
    const oldRenderMap = window.renderMap || (typeof renderMap === "function" ? renderMap : null);
    if (!oldRenderMap || oldRenderMap.__rightPanelEventWrapped) return;

    const wrapped = async function renderMapRightPanelEventWrapper(...args) {
      const result = await oldRenderMap.apply(this, args);
      renderRightPanel();
      return result;
    };
    wrapped.__rightPanelEventWrapped = true;

    try { renderMap = wrapped; } catch (err) { window.renderMap = wrapped; }
    window.renderMap = wrapped;
  }

  function install() {
    if (installed) return;
    installed = true;

    wrapSelectMap();
    wrapRenderMap();

    document.addEventListener("click", (e) => {
      if (e.target.closest(".editor-mode-option") || e.target.closest(".terrain-editor-tab-btn")) {
        renderRightPanel();
      }
    }, true);

    document.addEventListener("change", (e) => {
      if (e.target.matches('input[name="mouseMode"]')) renderRightPanel();
    }, true);

    renderRightPanel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.renderRightPanel = renderRightPanel;
})();
