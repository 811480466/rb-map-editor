// ============================================================
// Trainer type select
// ============================================================
// 将对象事件参数里的 trainerType 输入框改成中文下拉框。
// select 保留 data-event-field="trainerType"，应用修改逻辑可直接读取并写回。

(function trainerTypeSelectModule() {
  const TRAINER_TYPE_LABELS = {
    0: "无训练家类型",
    1: "普通训练家",
    2: "可观察所有方向",
    3: "埋地训练家",
  };

  function injectStyle() {
    if (document.getElementById("trainerTypeSelectStyle")) return;
    const style = document.createElement("style");
    style.id = "trainerTypeSelectStyle";
    style.textContent = `
      #eventTab select.event-edit-input[data-event-field="trainerType"] {
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

      #eventTab select.event-edit-input[data-event-field="trainerType"]:focus {
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

  function buildSelect(currentValue) {
    const select = document.createElement("select");
    select.className = "event-edit-input";
    select.dataset.eventField = "trainerType";
    select.title = "训练家类型";

    for (const [raw, label] of Object.entries(TRAINER_TYPE_LABELS)) {
      const value = Number(raw);
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${formatHex(value)} ${label}`;
      if (value === currentValue) option.selected = true;
      select.appendChild(option);
    }

    if (!Object.prototype.hasOwnProperty.call(TRAINER_TYPE_LABELS, currentValue)) {
      const option = document.createElement("option");
      option.value = String(currentValue);
      option.textContent = `${formatHex(currentValue)} 未知训练家类型`;
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

  function enhanceTrainerTypeSelect() {
    injectStyle();
    const input = document.querySelector('#eventTab input[data-event-field="trainerType"]');
    if (!input || input.dataset.trainerTypeSelectDone === "1") return;

    const currentValue = parseValue(input.value);
    const select = buildSelect(currentValue);
    input.dataset.trainerTypeSelectDone = "1";
    input.replaceWith(select);
  }

  const observer = new MutationObserver(() => enhanceTrainerTypeSelect());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceTrainerTypeSelect();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorTrainerTypeSelect = {
    TRAINER_TYPE_LABELS,
    enhanceTrainerTypeSelect,
  };
})();
