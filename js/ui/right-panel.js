// ============================================================
// Shared right panel helpers
// ============================================================
// 低风险重构：先把右侧面板的常用操作集中成统一接口。
// 旧脚本仍可直接操作 DOM，后续逐步迁移到这里。

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

  function getTitle(panel = getPanel()) {
    return panel?.querySelector(":scope > h2") || null;
  }

  function setTitle(text) {
    const title = getTitle();
    if (!title) return null;
    title.textContent = text;
    title.style.display = "block";
    return title;
  }

  function setModeClass(className = "") {
    const panel = getPanel();
    if (!panel) return null;
    panel.classList.remove(...MODE_CLASSES);
    if (className) panel.classList.add(className);
    return panel;
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
      if (!shouldShow) {
        child.style.display = "none";
        continue;
      }

      if (child === title) child.style.display = "block";
      else child.style.display = options.display || "block";
    }

    return panel;
  }

  function showMapInfoOnly() {
    setModeClass("mode-metadata");
    setTitle("地图信息");
    const mapInfoTab = document.getElementById("mapInfoTab");
    const eventTab = document.getElementById("eventTab");
    const mapInfoBtn = document.getElementById("tabMapInfo");
    const eventBtn = document.getElementById("tabEvents");

    mapInfoTab?.classList.add("active");
    eventTab?.classList.remove("active");
    mapInfoBtn?.classList.add("active");
    eventBtn?.classList.remove("active");
    showOnly([mapInfoTab]);
  }

  function showEventsOnly() {
    setModeClass("mode-events");
    setTitle("地图事件");
    const eventTab = document.getElementById("eventTab");
    const mapInfoTab = document.getElementById("mapInfoTab");
    const eventBtn = document.getElementById("tabEvents");
    const mapInfoBtn = document.getElementById("tabMapInfo");

    eventTab?.classList.add("active");
    mapInfoTab?.classList.remove("active");
    eventBtn?.classList.add("active");
    mapInfoBtn?.classList.remove("active");
    showOnly([eventTab]);
  }

  window.RBEditorRightPanel = {
    getPanel,
    getTitle,
    setTitle,
    setModeClass,
    getDirectChild,
    setDisplay,
    showOnly,
    showMapInfoOnly,
    showEventsOnly,
  };
})();
