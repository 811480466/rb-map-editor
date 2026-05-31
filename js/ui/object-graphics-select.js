// ============================================================
// Object graphics select
// ============================================================
// 将对象事件参数里的 graphicsId 输入框改成中文下拉框。
// 数据来自 data/object-event-graphics-data.js。
// select 保留 data-event-field="graphicsId"，应用修改逻辑可直接读取数字并写回。

(function objectGraphicsSelectModule() {
  function injectStyle() {
    if (document.getElementById("objectGraphicsSelectStyle")) return;
    const style = document.createElement("style");
    style.id = "objectGraphicsSelectStyle";
    style.textContent = `
      #eventTab select.event-edit-input[data-event-field="graphicsId"] {
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 28px !important;
        padding: 3px 7px !important;
        border: 1px solid #cbd9ed !important;
        border-radius: 6px !important;
        background: #f8fbff !important;
        color: #172033 !important;
        font-size: 12px !important;
        box-sizing: border-box !important;
      }

      #eventTab select.event-edit-input[data-event-field="graphicsId"]:focus {
        outline: none !important;
        border-color: #1f5fbf !important;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function parseValue(value) {
    const text = String(value ?? "").trim();
    if (!text) return 0;
    if (/^[-+]?0x/i.test(text)) return Number.parseInt(text, 16) || 0;
    return Number.parseInt(text, 10) || 0;
  }

  function formatHex(value) {
    return `0x${Number(value).toString(16).toUpperCase().padStart(2, "0")}`;
  }

  function getGraphicsList() {
    const list = window.RBEditorObjectEventGraphicsData;
    return Array.isArray(list) ? list : [];
  }

  function buildSelect(currentValue) {
    const select = document.createElement("select");
    select.className = "event-edit-input";
    select.dataset.eventField = "graphicsId";
    select.title = "图形";

    let hasCurrent = false;
    for (const item of getGraphicsList()) {
      const value = Number(item.id);
      if (!Number.isInteger(value)) continue;

      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${formatHex(value)} ${item.name || item.macro || "对象"}${item.macro ? ` / ${item.macro}` : ""}`;
      if (value === currentValue) {
        option.selected = true;
        hasCurrent = true;
      }
      select.appendChild(option);
    }

    if (!hasCurrent) {
      const option = document.createElement("option");
      option.value = String(currentValue);
      option.textContent = `${formatHex(currentValue)} 未知对象图形`;
      option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener("change", () => {
      const status = document.getElementById("eventEditStatus");
      if (status) {
        status.className = "event-edit-status";
        status.textContent = "未应用修改。";
      }
    });

    return select;
  }

  function enhanceObjectGraphicsSelect() {
    injectStyle();
    const input = document.querySelector('#eventTab input[data-event-field="graphicsId"]');
    if (!input || input.dataset.objectGraphicsSelectDone === "1") return;

    const currentValue = parseValue(input.value);
    const select = buildSelect(currentValue);
    input.dataset.objectGraphicsSelectDone = "1";
    input.replaceWith(select);
  }

  const observer = new MutationObserver(() => enhanceObjectGraphicsSelect());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceObjectGraphicsSelect();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorObjectGraphicsSelect = {
    enhanceObjectGraphicsSelect,
  };
})();
