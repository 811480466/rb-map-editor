// ============================================================
// Shared right panel helpers
// ============================================================
// 右侧面板只保留当前模式需要的 DOM，不再在 HTML 里预置一堆隐藏元素。

(function rightPanelModule() {
  const MODE_CLASSES = [
    "mode-terrain-view",
    "mode-terrain-paint",
    "mode-terrain-editor",
    "mode-events",
    "mode-metadata",
    "mode-connections",
  ];

  function getPanel() {
    return document.querySelector(".panel.right");
  }

  function clearPanel() {
    const panel = getPanel();
    if (panel) panel.innerHTML = "";
    return panel;
  }

  function getTitle(panel = getPanel()) {
    return panel?.querySelector(":scope > h2") || null;
  }

  function ensureTitle(text = "") {
    const panel = getPanel();
    if (!panel) return null;
    let title = getTitle(panel);
    if (!title) {
      title = document.createElement("h2");
      panel.prepend(title);
    }
    title.textContent = text;
    title.style.display = "block";
    return title;
  }

  function setTitle(text) {
    return ensureTitle(text);
  }

  function setModeClass(className = "") {
    const panel = getPanel();
    if (!panel) return null;
    panel.classList.remove(...MODE_CLASSES);
    if (className) panel.classList.add(className);
    return panel;
  }

  function ensureEventsPanel() {
    const panel = getPanel();
    if (!panel) return null;

    setModeClass("mode-events");
    clearPanel();
    ensureTitle("地图事件");

    const eventTab = document.createElement("div");
    eventTab.id = "eventTab";
    eventTab.className = "tab-panel active";
    eventTab.innerHTML = `
      <div class="summary" id="eventSummary">
        <div>OBJ: 0</div>
        <div>TRAINER: 0</div>
        <div>WARP: 0</div>
        <div>BG/COORD: 0</div>
      </div>
      <div id="eventList"></div>
      <h3>事件详情</h3>
      <pre id="eventDetail">点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。</pre>
      <div id="warpTools" class="warp-tools empty"></div>
    `;
    panel.appendChild(eventTab);
    return eventTab;
  }

  function ensureMapInfoPanel() {
    const panel = getPanel();
    if (!panel) return null;

    setModeClass("mode-metadata");
    clearPanel();
    ensureTitle("地图信息");

    const mapInfoTab = document.createElement("div");
    mapInfoTab.id = "mapInfoTab";
    mapInfoTab.className = "tab-panel active";
    mapInfoTab.innerHTML = `<pre id="mapInfo">未加载地图。</pre>`;
    panel.appendChild(mapInfoTab);
    return mapInfoTab;
  }

  function ensureConnectionToolsPanel() {
    const panel = getPanel();
    if (!panel) return null;
    let box = document.getElementById("connectionTools");
    if (!box) {
      box = document.createElement("div");
      box.id = "connectionTools";
      box.className = "warp-tools empty";
      panel.appendChild(box);
    }
    return box;
  }

  function getDirectChild(id) {
    const panel = getPanel();
    if (!panel) return null;
    return Array.from(panel.children).find(el => el.id === id) || document.getElementById(id);
  }

  function setDisplay(selectorOrElement, display) {
    const el = typeof selectorOrElement === "string"
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;
    if (el) el.style.display = display;
    return el || null;
  }

  function showOnly(allowed = [], options = {}) {
    const panel = getPanel();
    if (!panel) return null;

    const allowedSet = new Set(allowed.filter(Boolean));
    const title = getTitle(panel);
    if (title && options.keepTitle !== false) allowedSet.add(title);

    for (const child of Array.from(panel.children)) {
      const shouldShow = allowedSet.has(child);
      child.style.display = shouldShow ? (child === title ? "block" : (options.display || "block")) : "none";
    }

    return panel;
  }

  function showMapInfoOnly() {
    const mapInfoTab = ensureMapInfoPanel();
    if (typeof currentMap !== "undefined" && currentMap && typeof buildMapInfoText === "function") {
      const mapInfo = document.getElementById("mapInfo");
      if (mapInfo) mapInfo.textContent = buildMapInfoText(currentMap);
    }
    showOnly([mapInfoTab]);
  }

  function showEventsOnly() {
    const eventTab = ensureEventsPanel();
    if (typeof currentEvents !== "undefined" && typeof renderEventList === "function") {
      renderEventList(currentEvents);
    }
    showOnly([eventTab]);
  }

  window.RBEditorRightPanel = {
    getPanel,
    clearPanel,
    getTitle,
    ensureTitle,
    setTitle,
    setModeClass,
    ensureEventsPanel,
    ensureMapInfoPanel,
    ensureConnectionToolsPanel,
    getDirectChild,
    setDisplay,
    showOnly,
    showMapInfoOnly,
    showEventsOnly,
  };
})();
