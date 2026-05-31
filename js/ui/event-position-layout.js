// ============================================================
// Event position layout patch
// ============================================================
// 将事件详情里的“位置”区域改成紧凑横排：x [ ] y [ ] z [ ]。
// 只移动现有 input，不改 data-event-field，因此事件写回逻辑保持不变。

(function eventPositionLayoutModule() {
  function injectStyle() {
    if (document.getElementById("eventPositionLayoutStyle")) return;
    const style = document.createElement("style");
    style.id = "eventPositionLayoutStyle";
    style.textContent = `
      .event-position-grid {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: nowrap;
        width: 100%;
        min-width: 0;
        overflow: visible;
      }

      .event-position-field {
        flex: 0 0 auto;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .event-position-field span {
        flex: 0 0 auto;
        font-size: 12px;
        color: #172033;
        line-height: 1;
        text-transform: lowercase;
      }

      .event-position-field .event-edit-input {
        flex: 0 0 72px;
        width: 72px !important;
        min-width: 72px !important;
        max-width: 72px !important;
        height: 26px;
        padding: 2px 4px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  function findPositionSection() {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab) return null;
    return Array.from(eventTab.querySelectorAll(".event-form-section"))
      .find(section => section.querySelector("h3")?.textContent?.trim() === "位置") || null;
  }

  function takeInput(section, fieldName) {
    return section.querySelector(`input[data-event-field="${fieldName}"]`);
  }

  function normalizeNumberInput(input, min, max) {
    input.type = "number";
    input.step = "1";
    input.min = String(min);
    input.max = String(max);
  }

  function makeField(label, input) {
    const box = document.createElement("label");
    box.className = "event-position-field";

    const text = document.createElement("span");
    text.textContent = label;

    box.appendChild(text);
    box.appendChild(input);
    return box;
  }

  function enhancePositionSection() {
    injectStyle();
    const section = findPositionSection();
    if (!section || section.dataset.xyzLayout === "1") return;

    const x = takeInput(section, "x");
    const y = takeInput(section, "y");
    const z = takeInput(section, "elevation");
    if (!x || !y || !z) return;

    normalizeNumberInput(x, -32768, 32767);
    normalizeNumberInput(y, -32768, 32767);
    normalizeNumberInput(z, 0, 255);

    const grid = section.querySelector(".event-field-grid");
    if (!grid) return;

    const xyz = document.createElement("div");
    xyz.className = "event-position-grid";
    xyz.appendChild(makeField("x", x));
    xyz.appendChild(makeField("y", y));
    xyz.appendChild(makeField("z", z));

    grid.replaceChildren(xyz);
    section.dataset.xyzLayout = "1";
  }

  const observer = new MutationObserver(() => enhancePositionSection());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
      enhancePositionSection();
    });
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
    enhancePositionSection();
  }

  window.RBEditorEventPositionLayout = {
    enhancePositionSection,
  };
})();
