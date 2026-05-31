// ============================================================
// Event selection highlight
// ============================================================
// 地图事件模式下，选中的事件在地图上绘制高亮边框。

(function eventSelectionHighlightModule() {
  let originalDrawEvent = null;
  let lastSelectedKey = null;
  let rerenderTimer = null;

  function getSelectedKey() {
    try {
      return typeof selectedEventKey !== "undefined" ? selectedEventKey : null;
    } catch (err) {
      return null;
    }
  }

  function isSelectedEvent(ev) {
    const key = getSelectedKey();
    if (!key || !ev) return false;
    if (typeof eventKey === "function") return eventKey(ev) === key;
    return `${ev.type}:${ev.index}:${ev.offset}` === key;
  }

  function drawSelectedEventHighlight(ev) {
    if (!window.__rbEditorShowEvents || !isSelectedEvent(ev)) return;
    if (typeof getCellSize !== "function" || typeof ctx === "undefined") return;

    const cs = getCellSize();
    const px = ev.x * cs;
    const py = ev.y * cs;
    const pad = Math.max(2, Math.floor(cs * 0.10));
    const x = px + pad;
    const y = py + pad;
    const size = cs - pad * 2;

    ctx.save();

    // 外圈白边，保证在深色/复杂地图上也看得清。
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = Math.max(3, Math.floor(cs * 0.12));
    ctx.strokeRect(x, y, size, size);

    // 内圈主题蓝高亮。
    ctx.strokeStyle = "#1f5fbf";
    ctx.lineWidth = Math.max(2, Math.floor(cs * 0.08));
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // 轻微外扩光晕。
    ctx.strokeStyle = "rgba(31, 95, 191, 0.35)";
    ctx.lineWidth = Math.max(5, Math.floor(cs * 0.18));
    ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);

    ctx.restore();
  }

  function wrapDrawEvent() {
    if (originalDrawEvent) return;
    const current = window.drawEvent || (typeof drawEvent === "function" ? drawEvent : null);
    if (!current) return;

    originalDrawEvent = current;
    const wrapped = function selectedEventDrawWrapper(ev) {
      const result = originalDrawEvent.call(this, ev);
      drawSelectedEventHighlight(ev);
      return result;
    };

    wrapped.__selectedEventHighlightWrapped = true;
    window.drawEvent = wrapped;
    try { drawEvent = wrapped; } catch (err) {}
  }

  function scheduleRerender(force = false) {
    if (rerenderTimer) clearTimeout(rerenderTimer);
    rerenderTimer = setTimeout(() => {
      rerenderTimer = null;
      const key = getSelectedKey();
      if (!force && key === lastSelectedKey) return;
      lastSelectedKey = key;

      if (typeof currentMap !== "undefined" && currentMap && typeof renderMap === "function") {
        renderMap(currentMap, typeof currentEvents !== "undefined" ? currentEvents : []);
      }
    }, 0);
  }

  function install() {
    wrapDrawEvent();
    lastSelectedKey = getSelectedKey();

    document.addEventListener("click", (e) => {
      if (
        e.target.closest("#eventTab") ||
        e.target.closest("#mapCanvas") ||
        e.target.closest("#eventBackToListBtn")
      ) {
        scheduleRerender(true);
      }
    }, true);

    document.addEventListener("change", (e) => {
      if (e.target.matches("#blackGridToggle")) scheduleRerender(true);
    }, true);

    setInterval(() => scheduleRerender(false), 180);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventSelectionHighlight = {
    scheduleRerender,
    drawSelectedEventHighlight,
  };
})();
