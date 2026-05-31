// ============================================================
// Wild Pokémon panel
// ============================================================
// 野生宝可梦模式占位面板：中间空面板 + 右侧空面板。

(function wildPanelModule() {
  function injectStyle() {
    if (document.getElementById("wildPanelStyle")) return;
    const style = document.createElement("style");
    style.id = "wildPanelStyle";
    style.textContent = `
      .wild-center-panel {
        flex: 1 1 auto;
        min-height: 0;
        display: none;
        padding: 18px;
        overflow: auto;
        background: #f8fbff;
      }

      .wild-center-panel.active {
        display: block;
      }

      .wild-center-empty {
        width: min(1120px, 100%);
        min-height: 220px;
        margin: 0 auto;
        border: 1px dashed #cbd9ed;
        border-radius: 14px;
        background: #ffffff;
      }

      .wild-right-empty {
        min-height: 160px;
        border: 1px dashed #d4e2f5;
        border-radius: 12px;
        background: #fbfdff;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCenterPanel() {
    injectStyle();
    let panel = document.getElementById("wildCenterPanel");
    if (panel) return panel;

    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap) return null;

    panel = document.createElement("div");
    panel.id = "wildCenterPanel";
    panel.className = "wild-center-panel";
    panel.innerHTML = `<div class="wild-center-empty"></div>`;
    mapWrap.appendChild(panel);
    return panel;
  }

  function setCenterVisible(visible) {
    const mapShell = document.querySelector(".map-connection-shell");
    const legend = document.querySelector(".legend-bar");
    const toolbar = document.getElementById("mapToolbar");
    const metadataPanel = document.getElementById("mapMetadataPanel");
    const centerPanel = ensureCenterPanel();

    if (visible) {
      if (mapShell) mapShell.style.display = "none";
      if (legend) legend.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      if (metadataPanel) metadataPanel.classList.remove("active");
      if (centerPanel) centerPanel.classList.add("active");
    } else {
      if (centerPanel) centerPanel.classList.remove("active");
    }
  }

  function renderRightPanel() {
    injectStyle();
    const right = window.RBEditorRightPanel;
    const panel = right?.getPanel ? right.getPanel() : document.querySelector(".panel.right");
    if (!panel) return null;

    if (right?.setModeClass) right.setModeClass("mode-wild");
    if (right?.clearPanel) right.clearPanel();
    if (right?.ensureTitle) right.ensureTitle("野生宝可梦");
    else {
      let title = panel.querySelector(":scope > h2");
      if (!title) {
        title = document.createElement("h2");
        panel.prepend(title);
      }
      title.textContent = "野生宝可梦";
    }

    const body = document.createElement("div");
    body.id = "wildPanel";
    body.className = "wild-right-empty";
    panel.appendChild(body);
    return body;
  }

  function show() {
    setCenterVisible(true);
    renderRightPanel();
  }

  function hide() {
    setCenterVisible(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensureCenterPanel());
  } else {
    ensureCenterPanel();
  }

  window.RBEditorWildPanel = {
    ensureCenterPanel,
    setCenterVisible,
    renderRightPanel,
    show,
    hide,
  };
})();
