// ============================================================
// Mode panel layout fixes
// ============================================================
// 这里处理模式切换后的右侧标题、右侧内容显示，以及地图元数据页布局。

(function modePanelFix() {
  let userTouchedMouseMode = false;

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

      .panel.right.mode-terrain-view > h2,
      .panel.right.mode-terrain-paint > h2,
      .panel.right.mode-events > h2,
      .panel.right.mode-metadata > h2 {
        display: block !important;
        flex: 0 0 auto;
      }

      .panel.right.mode-terrain-view #mapInfoTab,
      .panel.right.mode-metadata #mapInfoTab {
        display: block !important;
      }

      .panel.right.mode-terrain-view #eventTab,
      .panel.right.mode-terrain-view .tabs,
      .panel.right.mode-terrain-view #connectionTools,
      .panel.right.mode-terrain-view #warpTools,
      .panel.right.mode-terrain-view #eventDetail,
      .panel.right.mode-terrain-view > h3,
      .panel.right.mode-metadata #eventTab,
      .panel.right.mode-metadata .tabs,
      .panel.right.mode-metadata #connectionTools,
      .panel.right.mode-metadata #warpTools,
      .panel.right.mode-metadata #eventDetail,
      .panel.right.mode-metadata #mapConnectorPanel,
      .panel.right.mode-metadata #terrainPaintPanel,
      .panel.right.mode-metadata #terrainEditorPanel,
      .panel.right.mode-metadata > h3 {
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

      .panel.right.mode-events #eventTab {
        display: block !important;
      }

      .panel.right.mode-events .tabs,
      .panel.right.mode-events #mapInfoTab,
      .panel.right.mode-events #connectionTools,
      .panel.right.mode-events #warpTools,
      .panel.right.mode-events #eventDetail,
      .panel.right.mode-events > h3 {
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
    return document.querySelector('input[name="mouseMode"]:checked')?.value || "view";
  }

  function setRightPanelClass(panel, className) {
    panel.classList.remove("mode-terrain-view", "mode-terrain-paint", "mode-events", "mode-metadata");
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

  function showEventOnly(panel) {
    const title = panel.querySelector(":scope > h2");
    if (title) {
      title.textContent = "地图事件";
      title.style.display = "block";
    }

    const eventTab = document.getElementById("eventTab");
    const mapInfoTab = document.getElementById("mapInfoTab");
    const eventBtn = document.getElementById("tabEvents");
    const mapInfoBtn = document.getElementById("tabMapInfo");

    eventTab?.classList.add("active");
    mapInfoTab?.classList.remove("active");
    eventBtn?.classList.add("active");
    mapInfoBtn?.classList.remove("active");
  }

  function resetRightPanelTitle(panel, mode) {
    const title = panel.querySelector(":scope > h2");
    if (!title) return;

    if (mode === "events") title.textContent = "地图事件";
    else if (mode === "connections") title.textContent = "地图连接器";
    else title.textContent = "地图信息";
  }

  function removeCenterMetadataMapInfo() {
    document.getElementById("metadataMapInfoBox")?.remove();
    for (const el of document.querySelectorAll("#mapMetadataPanel .metadata-map-info")) {
      el.remove();
    }
  }

  function applyModePanelState() {
    injectStyle();
    removeCenterMetadataMapInfo();

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

    if (mode === "events") {
      setRightPanelClass(panel, "mode-events");
      showEventOnly(panel);
      return;
    }

    if (mode === "metadata") {
      setRightPanelClass(panel, "mode-metadata");
      showMapInfoOnly(panel);
      return;
    }

    resetRightPanelTitle(panel, mode);
  }

  function setMouseModeViewOnce() {
    if (userTouchedMouseMode) return;

    const viewRadio = document.querySelector('input[name="mouseMode"][value="view"]');
    const paintRadio = document.querySelector('input[name="mouseMode"][value="paint"]');
    if (!viewRadio || !paintRadio) return;

    viewRadio.checked = true;
    paintRadio.checked = false;
    viewRadio.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function install() {
    injectStyle();

    document.addEventListener("click", (e) => {
      if (e.target.closest('input[name="mouseMode"]')) {
        userTouchedMouseMode = true;
      }

      if (e.target.closest(".editor-mode-option") || e.target.closest('input[name="mouseMode"]')) {
        setTimeout(applyModePanelState, 0);
        setTimeout(applyModePanelState, 80);
      }
    }, true);

    document.addEventListener("change", (e) => {
      if (e.target.matches('input[name="mouseMode"]')) {
        userTouchedMouseMode = true;
        setTimeout(applyModePanelState, 0);
        setTimeout(applyModePanelState, 80);
      }
    }, true);

    const observer = new MutationObserver(() => {
      setTimeout(setMouseModeViewOnce, 0);
      setTimeout(applyModePanelState, 0);
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    setTimeout(setMouseModeViewOnce, 0);
    setTimeout(setMouseModeViewOnce, 200);
    setTimeout(applyModePanelState, 0);
    setTimeout(applyModePanelState, 200);
  }

  install();
})();
