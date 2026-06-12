// ============================================================
// Event detail header cleanup
// ============================================================
// 事件详情页顶部只保留：左侧 TYPE #index，右侧“返回”按钮。

(function eventDetailHeaderCleanupModule() {
  function injectStyle() {
    if (document.getElementById("eventDetailHeaderCleanupStyle")) return;
    const style = document.createElement("style");
    style.id = "eventDetailHeaderCleanupStyle";
    style.textContent = `
      #eventTab .event-detail-head {
        border: 0 !important;
        background: transparent !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 0 0 10px !important;
      }

      #eventTab .event-detail-head > .small {
        display: none !important;
      }

      #eventTab .event-detail-title-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        margin: 0 !important;
      }

      #eventTab .event-detail-title {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        color: #153b78 !important;
        font-size: 15px !important;
        font-weight: 800 !important;
        line-height: 1.2 !important;
      }

      #eventTab #eventBackToListBtn.event-back-btn {
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: 58px !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 5px 10px !important;
        border: 1px solid #bfd1ec !important;
        border-radius: 7px !important;
        background: #f7fbff !important;
        color: #16447d !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
      }

      #eventTab #eventBackToListBtn.event-back-btn:hover {
        background: #eef6ff !important;
        border-color: #9fc3f3 !important;
        color: #1f5fbf !important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanupHeader() {
    injectStyle();
    const head = document.querySelector("#eventTab .event-detail-head");
    if (!head) return;

    const small = head.querySelector(":scope > .small");
    if (small) small.remove();

    const backBtn = document.getElementById("eventBackToListBtn");
    if (backBtn && backBtn.textContent.trim() !== "返回") {
      backBtn.textContent = "返回";
      backBtn.title = "返回事件列表";
    }
  }

  const observer = new MutationObserver(() => cleanupHeader());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    cleanupHeader();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventDetailHeaderCleanup = {
    cleanupHeader,
  };
})();
