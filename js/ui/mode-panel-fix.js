// ============================================================
// Mode panel layout fixes
// ============================================================
// 这里处理模式切换后的右侧标题、右侧内容显示，以及地图元数据页布局。

(function modePanelFix() {
  function injectStyle() {
    if (document.getElementById("modePanelFixStyle")) return;

    const style = document.createElement("style");
    style.id = "modePanelFixStyle";
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
        min-height: calc(100% - 12px);
      }

      .metadata-panel.active .metadata-card h3 {
        font-size: 18px;
      }

      .metadata-panel.active .metadata-form-row {
        grid-template-columns: 140px minmax(0, 1fr);
      }

      .panel.right.mode-terrain-view > h2,
      .panel.right.mode-terrain-paint > h2 {
        display: block !important;
        flex: 0 0 auto;
      }

      .panel.right.mode-terrain-view #mapInfoTab {
        display: block !important;
      }

      .panel.right.mode-terrain-view #eventTab,
      .panel.right.mode-terrain-view .tabs,
      .panel.right.mode-terrain-view #connectionTools,
      .panel.right.mode-terrain-view #warpTools,
      .panel.right.mode-terrain-view #eventDetail,
      .panel.right.mode-terrain-view > h3 {
        display: none !important;
      }

      .panel.right.mode-terrain-paint #terrainPaintPanel {
        display: flex !important;
      }

      .panel.right.mode-terrain-paint #eventTab,
      .panel.right.mode-terrain-paint .tabs,
      .panel.right.mode-terrain-paint #mapInfoTab,
      .panel.right.mode-terrain-paint #connectionTools,
      .panel.right.mode-terrain-paint #warpTools,
      .panel.right.mode-terrain-paint #eventDetail,
      .panel.right.mode-terrain-paint > h3 {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getRightPanel() {
    return document.querySelector(".panel.right");
  }

  function getCurrentMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "paint";
  }

  function setRightPanelClass(panel, className) {
    panel.classList.remove("mode-terrain-view", "mode-terrain-paint");
    if (className) panel.classList.add(className);
  }

  function showMapInfoOnly(panel) {
    const title = panel.querySelector(":scope > h2");
    if (title) {
      title.textContent = "地图信息";
      title.style.display = "block";
    }

    const mapInfoTab = document.getElementById("mapInfoTab");
    const mapInfoBtn = document.getElementById("tabMapInfo");
    const eventBtn = document.getElementById("tabEvents");
    const eventTab = document.getElementById("eventTab");

    mapInfoTab?.classList.add("active");
    eventTab?.classList.remove("active");
    mapInfoBtn?.classList.add("active");
    eventBtn?.classList.remove("active");
  }

  function showPaintPanel(panel) {
    const title = panel.querySelector(":scope > h2");
    if (title) {
      title.textContent = "地图绘制";
      title.style.display = "block";
    }

    const terrainPanel = document.getElementById("terrainPaintPanel");
    if (terrainPanel) {
      terrainPanel.classList.add("active");
      terrainPanel.style.display = "flex";
    }
  }

  function resetRightPanelTitle(panel, mode) {
    const title = panel.querySelector(":scope > h2");
    if (!title) return;

    if (mode === "events") title.textContent = "地图事件";
    else if (mode === "connections") title.textContent = "地图连接器";
    else if (mode === "metadata") title.textContent = "地图元数据";
    else title.textContent = "地图信息";
  }

  function applyModePanelState() {
    injectStyle();

    const panel = getRightPanel();
    if (!panel) return;

    const mode = getCurrentMode();
    const mouseMode = getMouseMode();

    setRightPanelClass(panel, null);

    if (mode === "terrain") {
      if (mouseMode === "paint") {
        setRightPanelClass(panel, "mode-terrain-paint");
        showPaintPanel(panel);
      } else {
        setRightPanelClass(panel, "mode-terrain-view");
        showMapInfoOnly(panel);
      }
      return;
    }

    resetRightPanelTitle(panel, mode);
  }

  function install() {
    injectStyle();

    document.addEventListener("click", (e) => {
      if (e.target.closest(".editor-mode-option") || e.target.closest('input[name="mouseMode"]')) {
        setTimeout(applyModePanelState, 0);
        setTimeout(applyModePanelState, 80);
      }
    }, true);

    document.addEventListener("change", (e) => {
      if (e.target.matches('input[name="mouseMode"]')) {
        setTimeout(applyModePanelState, 0);
        setTimeout(applyModePanelState, 80);
      }
    }, true);

    const observer = new MutationObserver(() => {
      setTimeout(applyModePanelState, 0);
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    setTimeout(applyModePanelState, 0);
    setTimeout(applyModePanelState, 200);
  }

  install();
})();
