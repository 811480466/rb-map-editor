// ============================================================
// Tile empty placeholder style fix
// ============================================================
// 修复瓦片库为空时提示文字被挤成竖排的问题。
// 注意：之前新增的 css/ui/tile-empty-fix.css 没有被 index.html 加载，所以这里用 JS 注入样式。

(function tileEmptyStyleFix() {
  function injectStyle() {
    if (document.getElementById("tileEmptyStyleFixStyle")) return;

    const style = document.createElement("style");
    style.id = "tileEmptyStyleFixStyle";
    style.textContent = `
      .tile-library-grid:has(> .empty-tip),
      .final-tile-library-grid:has(> .empty-tip),
      .terrain-library-grid:has(> .empty-tip) {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      .tile-library-grid > .empty-tip,
      .final-tile-library-grid > .empty-tip,
      .terrain-library-grid > .empty-tip,
      #tileLibraryGrid > .empty-tip,
      #finalTileLibrary > .empty-tip,
      #terrainList > .empty-tip {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        min-width: 220px !important;
        min-height: 88px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 12px 14px !important;
        box-sizing: border-box !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        white-space: normal !important;
        word-break: normal !important;
        overflow-wrap: break-word !important;
        text-align: center !important;
        line-height: 1.5 !important;
        border: 1px dashed var(--border) !important;
        border-radius: 10px !important;
        background: #fbfdff !important;
        color: var(--muted) !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectStyle);
  else injectStyle();
})();
