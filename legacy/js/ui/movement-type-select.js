// ============================================================
// Movement type select
// ============================================================
// 将对象事件参数里的 movementType 输入框改成中文下拉框。
// select 仍然保留 data-event-field="movementType"，因此原应用修改逻辑可直接读取并写回。

(function movementTypeSelectModule() {
  const MOVEMENT_TYPE_LABELS = {
    0x00: "无",
    0x01: "环顾四周",
    0x02: "随机游走",
    0x03: "上下游走",
    0x04: "下上游走",
    0x05: "左右游走",
    0x06: "右左游走",
    0x07: "面朝上",
    0x08: "面朝下",
    0x09: "面朝左",
    0x0A: "面朝右",
    0x0B: "玩家",
    0x0C: "树果树生长",
    0x0D: "朝下/朝上",
    0x0E: "朝左/朝右",
    0x0F: "朝上/朝左",
    0x10: "朝上/朝右",
    0x11: "朝下/朝左",
    0x12: "朝下/朝右",
    0x13: "朝下/朝上/朝左",
    0x14: "朝下/朝上/朝右",
    0x15: "朝上/朝左/朝右",
    0x16: "朝下/朝左/朝右",
    0x17: "逆时针转向",
    0x18: "顺时针转向",
    0x19: "上下行走",
    0x1A: "下上行走",
    0x1B: "左右行走",
    0x1C: "右左行走",
    0x1D: "按序行走：上右左下",
    0x1E: "按序行走：右左下上",
    0x1F: "按序行走：下上右左",
    0x20: "按序行走：左下上右",
    0x21: "按序行走：上左右下",
    0x22: "按序行走：左右下上",
    0x23: "按序行走：下上左右",
    0x24: "按序行走：右下上左",
    0x25: "按序行走：左上下右",
    0x26: "按序行走：上下右左",
    0x27: "按序行走：右左上下",
    0x28: "按序行走：下右左上",
    0x29: "按序行走：右上下左",
    0x2A: "按序行走：上下左右",
    0x2B: "按序行走：左右上下",
    0x2C: "按序行走：下左右上",
    0x2D: "按序行走：上左下右",
    0x2E: "按序行走：下右上左",
    0x2F: "按序行走：左下右上",
    0x30: "按序行走：右上左下",
    0x31: "按序行走：上右下左",
    0x32: "按序行走：下左上右",
    0x33: "按序行走：左上右下",
    0x34: "按序行走：右下左上",
    0x35: "复制玩家移动",
    0x36: "反向复制玩家移动",
    0x37: "逆时针复制玩家移动",
    0x38: "顺时针复制玩家移动",
    0x39: "伪装成树",
    0x3A: "伪装成山",
    0x3B: "草丛中复制玩家移动",
    0x3C: "草丛中反向复制玩家移动",
    0x3D: "草丛中逆时针复制玩家移动",
    0x3E: "草丛中顺时针复制玩家移动",
    0x3F: "埋藏",
    0x40: "原地走动：朝下",
    0x41: "原地走动：朝上",
    0x42: "原地走动：朝左",
    0x43: "原地走动：朝右",
    0x44: "原地慢跑：朝下",
    0x45: "原地慢跑：朝上",
    0x46: "原地慢跑：朝左",
    0x47: "原地慢跑：朝右",
    0x48: "原地奔跑：朝下",
    0x49: "原地奔跑：朝上",
    0x4A: "原地奔跑：朝左",
    0x4B: "原地奔跑：朝右",
    0x4C: "不可见",
    0x4D: "原地慢走：朝下",
    0x4E: "原地慢走：朝上",
    0x4F: "原地慢走：朝左",
    0x50: "原地慢走：朝右",
  };

  function injectStyle() {
    if (document.getElementById("movementTypeSelectStyle")) return;
    const style = document.createElement("style");
    style.id = "movementTypeSelectStyle";
    style.textContent = `
      #eventTab select.event-edit-input[data-event-field="movementType"] {
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

      #eventTab select.event-edit-input[data-event-field="movementType"]:focus {
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
    select.dataset.eventField = "movementType";
    select.title = "移动类型";

    for (const [raw, label] of Object.entries(MOVEMENT_TYPE_LABELS)) {
      const value = Number(raw);
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${formatHex(value)} ${label}`;
      if (value === currentValue) option.selected = true;
      select.appendChild(option);
    }

    if (!Object.prototype.hasOwnProperty.call(MOVEMENT_TYPE_LABELS, currentValue)) {
      const option = document.createElement("option");
      option.value = String(currentValue);
      option.textContent = `${formatHex(currentValue)} 未知移动类型`;
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

  function enhanceMovementTypeSelect() {
    injectStyle();
    const input = document.querySelector('#eventTab input[data-event-field="movementType"]');
    if (!input || input.dataset.movementTypeSelectDone === "1") return;

    const currentValue = parseValue(input.value);
    const select = buildSelect(currentValue);
    input.dataset.movementTypeSelectDone = "1";
    input.replaceWith(select);
  }

  const observer = new MutationObserver(() => enhanceMovementTypeSelect());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceMovementTypeSelect();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorMovementTypeSelect = {
    MOVEMENT_TYPE_LABELS,
    enhanceMovementTypeSelect,
  };
})();
