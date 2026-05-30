// ============================================================
// Connection edge style fix
// ============================================================
// 修复左右地图连接按钮文字过长时挤出按钮的问题。
// 左右连接按钮固定显示两行：第一行方向和目标地图，第二行 Group / Map / offset。

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
        padding: 8px 6px !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        gap: 4px !important;
        overflow: hidden !important;
        line-height: 1.3 !important;
      }

      .connection-edge {
        white-space: normal !important;
        word-break: keep-all !important;
        overflow-wrap: normal !important;
      }

      .connection-edge-main,
      .connection-edge-sub {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        text-align: center !important;
        white-space: normal !important;
        word-break: keep-all !important;
        overflow-wrap: anywhere !important;
      }

      .connection-edge-main {
        font-size: 12px !important;
        font-weight: 800 !important;
        line-height: 1.25 !important;
      }

      .connection-edge-sub {
        font-size: 11px !important;
        font-weight: 600 !important;
        line-height: 1.25 !important;
        opacity: 0.82 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectStyle);
  else injectStyle();
})();
