// ============================================================
// Event toolbar mode
// ============================================================
// 地图事件模式下，顶部工具栏只显示“网格”开关。

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

    if (!toolbar) return;

    if (mode === "events") {
      setDisplay(title, "none");
      setDisplay(mouseModeGroup, "none");
      toolbar.style.display = "flex";
      return;
    }

    setDisplay(title, "");
    setDisplay(mouseModeGroup, "");
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
