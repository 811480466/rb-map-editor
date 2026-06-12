// ============================================================
// Central tooltip module for map cell hover
// ============================================================
// 低风险重构：单独管理 tooltip，其他模块通过接口调用显示

(function tooltipModule() {
  const tooltip = document.createElement("div");
  tooltip.id = "cellTooltip";
  tooltip.className = "cell-tooltip";
  Object.assign(tooltip.style, {
    position: "fixed",
    display: "none",
    zIndex: 99999,
    pointerEvents: "none",
    maxWidth: "320px",
    padding: "7px 9px",
    borderRadius: "8px",
    background: "rgba(15,23,42,0.92)",
    color: "#fff",
    fontSize: "12px",
    lineHeight: "1.45",
    whiteSpace: "pre",
    boxShadow: "0 8px 24px rgba(15,23,42,0.25)",
  });
  document.body.appendChild(tooltip);

  function showTip(info, x, y) {
    tooltip.textContent = info;
    tooltip.style.left = x + 14 + "px";
    tooltip.style.top = y + 14 + "px";
    tooltip.style.display = "block";
  }

  function hideTip() {
    tooltip.style.display = "none";
  }

  window.RBEditorTooltip = { showTip, hideTip };
})();
