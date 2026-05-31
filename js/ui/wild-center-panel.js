// ============================================================
// Wild Pokémon center panel
// ============================================================
// 中间地图区域：野生宝可梦模式下先显示空白面板，后续再显示数据

(function wildCenterPanelModule() {
  function injectStyle() {
    if (document.getElementById("wildCenterPanelStyle")) return;
    const style = document.createElement("style");
    style.id = "wildCenterPanelStyle";
    style.textContent = `
      .wild-center-empty {
        width: min(1120px, 100%);
        min-height: 220px;
        margin: 0 auto;
        border: 1px dashed #cbd9ed;
        border-radius: 14px;
        background: #ffffff;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCenterPanel() {
    injectStyle();
    let panel = document.getElementById("wildCenterPanel");
    if (!panel) {
      const mapWrap = document.querySelector(".map-wrap");
      if (!mapWrap) return null;
      panel = document.createElement("div");
      panel.id = "wildCenterPanel";
      panel.className = "wild-center-empty";
      mapWrap.appendChild(panel);
    }
    return panel;
  }

  function show() {
    const panel = ensureCenterPanel();
    if (panel) panel.style.display = "block";
  }

  function hide() {
    const panel = document.getElementById("wildCenterPanel");
    if (panel) panel.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureCenterPanel);
  } else {
    ensureCenterPanel();
  }

  window.RBEditorWildCenterPanel = { ensureCenterPanel, show, hide };
})();