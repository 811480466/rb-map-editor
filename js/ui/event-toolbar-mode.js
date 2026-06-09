// ============================================================
// Event toolbar mode
// ============================================================
// 地图事件模式隐藏鼠标模式；地图连接器模式只显示“网格”开关。

(function eventToolbarModeModule() {
  function getActiveMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || window.RBEditorState?.mode || "terrain";
  }

  function setDisplay(el, display) {
    if (el) el.style.display = display;
  }

  function applyEventToolbarMode() {
    const mode = getActiveMode();
    const toolbar = document.getElementById("mapToolbar");
    const title = toolbar?.querySelector(".map-toolbar-title");
    const mouseModeGroup = document.getElementById("mouseModeGroup");
    const movementRangeOption = document.getElementById("movementRangeToggle")?.closest(".map-toolbar-option");

    if (!toolbar) return;

    if (mode === "connections") {
      setDisplay(title, "none");
      setDisplay(mouseModeGroup, "none");
      setDisplay(movementRangeOption, "none");
      toolbar.style.display = "flex";
      return;
    }

    if (mode === "events") {
      setDisplay(title, "none");
      setDisplay(mouseModeGroup, "none");
      setDisplay(movementRangeOption, "");
      toolbar.style.display = "flex";
      return;
    }

    setDisplay(title, "");
    setDisplay(mouseModeGroup, "");
    setDisplay(movementRangeOption, "none");
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".editor-mode-option")) {
      setTimeout(applyEventToolbarMode, 0);
    }
  }, true);

  document.addEventListener("change", (e) => {
    if (e.target.matches('input[name="mouseMode"]')) {
      setTimeout(applyEventToolbarMode, 0);
    }
  }, true);

  const observer = new MutationObserver(() => applyEventToolbarMode());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    applyEventToolbarMode();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventToolbarMode = {
    applyEventToolbarMode,
  };
})();
