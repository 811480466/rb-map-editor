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
    "mode-wild",
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
    const eventPanel = window.RBEditorEventPanel;
    const eventTab = eventPanel?.ensurePanel ? eventPanel.ensurePanel() : document.getElementById("eventTab");
    if (typeof currentEvents !== "undefined" && typeof renderEventList === "function") {
      renderEventList(currentEvents);
    }
    showOnly([eventTab]);
  }

  function showWildOnly() {
    if (window.RBEditorWildPanel?.show) {
      window.RBEditorWildPanel.show();
      return;
    }

    const panel = clearPanel();
    if (!panel) return;
    setModeClass("mode-wild");
    ensureTitle("野生宝可梦");
    const body = document.createElement("div");
    body.id = "wildPanel";
    panel.appendChild(body);
  }

  window.RBEditorRightPanel = {
    getPanel,
    clearPanel,
    getTitle,
    ensureTitle,
    setTitle,
    setModeClass,
    ensureMapInfoPanel,
    ensureConnectionToolsPanel,
    getDirectChild,
    setDisplay,
    showOnly,
    showMapInfoOnly,
    showEventsOnly,
    showWildOnly,
  };
})();
