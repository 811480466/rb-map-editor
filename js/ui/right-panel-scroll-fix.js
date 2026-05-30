// ============================================================
// Right panel scroll layout fix
// ============================================================
// 右侧 panel 不再整体滚动，标题和 tab 固定，只让下面内容区域滚动。

(function rightPanelScrollFix() {
  function injectStyle() {
    if (document.getElementById("rightPanelScrollFixStyle")) return;

    const style = document.createElement("style");
    style.id = "rightPanelScrollFixStyle";
    style.textContent = `
      .panel.right {
        height: 100vh !important;
        min-height: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .panel.right > h2 {
        flex: 0 0 auto !important;
        margin-bottom: 12px !important;
      }

      .panel.right > .tabs,
      .panel.right .terrain-editor-tabs,
      .panel.right .final-terrain-tabs {
        flex: 0 0 auto !important;
      }

      .panel.right #eventTab,
      .panel.right #mapInfoTab,
      .panel.right #mapConnectorPanel,
      .panel.right #terrainEditorPanel,
      .panel.right #finalTerrainEditorPanel,
      .panel.right #terrainPaintPanel {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      .panel.right #eventTab.active,
      .panel.right #mapInfoTab.active {
        overflow: auto !important;
      }

      .panel.right #mapConnectorPanel.active,
      .panel.right #mapConnectorPanel[style*="block"] {
        overflow: auto !important;
      }

      .panel.right #terrainEditorPanel.active,
      .panel.right #finalTerrainEditorPanel.active,
      .panel.right #terrainPaintPanel.active {
        overflow: hidden !important;
      }

      .panel.right .terrain-editor-tab-content,
      .panel.right .final-terrain-tab-content {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      .panel.right .tile-library-wrap,
      .panel.right .final-tile-library-wrap,
      .panel.right .terrain-library-wrap,
      .panel.right .collision-editor-body,
      .panel.right .final-collision-body {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: auto !important;
      }

      .panel.right #mapInfoTab pre,
      .panel.right #eventDetail {
        max-height: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    injectStyle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
