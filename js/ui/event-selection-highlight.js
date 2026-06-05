// ============================================================
// Event selection highlight
// ============================================================
// 地图事件模式下，选中的事件在地图上绘制大红色高亮边框。

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
    const pad = Math.max(1, Math.floor(cs * 0.06));
    const x = px + pad;
    const y = py + pad;
    const size = cs - pad * 2;

    ctx.save();

    // 大红色半透明底，先把选中的格子整体托出来。
    ctx.fillStyle = "rgba(255, 0, 0, 0.22)";
    ctx.fillRect(px, py, cs, cs);

    // 外扩红色光晕。
    ctx.strokeStyle = "rgba(255, 0, 0, 0.45)";
    ctx.lineWidth = Math.max(7, Math.floor(cs * 0.24));
    ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);

    // 白色隔离边，保证红框不会和事件本身颜色混在一起。
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = Math.max(4, Math.floor(cs * 0.13));
    ctx.strokeRect(x, y, size, size);

    // 主红色边框。
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = Math.max(3, Math.floor(cs * 0.10));
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // 内侧深红边，让高亮更扎眼。
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, Math.max(1, size - 8), Math.max(1, size - 8));

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

      if (typeof currentMap !== "undefined" && currentMap && window.RBEditorState?.mode === "connections" && window.RBEditorConnectionPreview?.render) {
        window.RBEditorConnectionPreview.render(currentMap);
      } else if (typeof currentMap !== "undefined" && currentMap && typeof renderMap === "function") {
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
