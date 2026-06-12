// ============================================================
// Event list title order
// ============================================================
// 地图事件列表页：统计筛选在上，"事件列表"标题在统计下面。

(function eventListTitleOrderModule() {
  function applyOrder() {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab) return;

    const summary = document.getElementById("eventSummary");
    const header = eventTab.querySelector(".event-panel-header");
    const list = document.getElementById("eventList");
    if (!summary || !header || !list) return;

    if (summary.nextElementSibling !== header) {
      eventTab.insertBefore(header, list);
    }
  }

  const observer = new MutationObserver(() => applyOrder());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    applyOrder();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventListTitleOrder = {
    applyOrder,
  };
})();
