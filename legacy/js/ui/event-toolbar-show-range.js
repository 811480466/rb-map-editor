// ============================================================
// Event toolbar movement range toggle
// ============================================================
// 地图事件模式下，工具栏增加“移动范围”开关。默认关闭。
// 同时包装 map-renderer.js 里的 drawObjectMovementRange，让范围框受开关控制。

(function eventToolbarShowRangeModule() {
  let showMovementRange = false;
  let originalDrawObjectMovementRange = null;

  function isEnabled() {
    return showMovementRange;
  }

  function refreshMap() {
    if (typeof currentEvents !== "undefined" && typeof renderMap === "function" && currentMap) {
      renderMap(currentMap, currentEvents);
    }
  }

  function syncButton() {
    const input = document.getElementById("movementRangeToggle");
    if (input) input.checked = showMovementRange;
  }

  function setShowMovementRange(value) {
    showMovementRange = !!value;
    syncButton();
    refreshMap();
  }

  function toggleMovementRange() {
    setShowMovementRange(!showMovementRange);
  }

  function ensureToolbarButton() {
    const toolbar = document.getElementById("mapToolbar");
    if (!toolbar || document.getElementById("movementRangeToggle")) return;

    const label = document.createElement("label");
    label.className = "map-toolbar-option event-movement-range-option";
    label.innerHTML = `<input id="movementRangeToggle" type="checkbox"/><span>移动范围</span>`;

    const grid = document.getElementById("blackGridToggle")?.closest(".map-toolbar-option");
    if (grid) grid.insertAdjacentElement("afterend", label);
    else toolbar.appendChild(label);

    const input = document.getElementById("movementRangeToggle");
    if (input) {
      input.checked = showMovementRange;
      input.addEventListener("change", () => setShowMovementRange(input.checked));
    }
  }

  function patchDrawObjectMovementRange() {
    const current = window.drawObjectMovementRange || (typeof drawObjectMovementRange === "function" ? drawObjectMovementRange : null);
    if (!current || current.__movementRangeToggleWrapped) return;

    originalDrawObjectMovementRange = current;
    const wrapped = function movementRangeToggleWrapper(ev, px, py, cs) {
      if (!showMovementRange) return;
      return originalDrawObjectMovementRange.call(this, ev, px, py, cs);
    };
    wrapped.__movementRangeToggleWrapped = true;

    window.drawObjectMovementRange = wrapped;
    try { drawObjectMovementRange = wrapped; } catch (err) {}
  }

  function install() {
    patchDrawObjectMovementRange();
    ensureToolbarButton();
    syncButton();
  }

  const observer = new MutationObserver(() => install());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
      install();
    });
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
    install();
  }

  window.RBEditorEventToolbarShowRange = {
    toggleMovementRange,
    setShowMovementRange,
    get showMovementRange() { return showMovementRange; },
    isEnabled,
    ensureToolbarButton,
  };
})();
