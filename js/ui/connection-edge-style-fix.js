// ============================================================
// Connection edge style fix
// ============================================================
// 修复左右地图连接按钮文字被挤压换行，和最早样式不一致的问题。

(function connectionEdgeStyleFix() {
  function injectStyle() {
    if (document.getElementById("connectionEdgeStyleFixStyle")) return;

    const style = document.createElement("style");
    style.id = "connectionEdgeStyleFixStyle";
    style.textContent = `
      .map-connection-middle {
        grid-template-columns: 150px minmax(0, 1fr) 150px !important;
      }

      .connection-west,
      .connection-east {
        width: 150px !important;
        min-width: 150px !important;
        max-width: 150px !important;
        min-height: 120px !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
        line-height: 1.45 !important;
      }

      .connection-edge {
        white-space: nowrap !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectStyle);
  else injectStyle();
})();
