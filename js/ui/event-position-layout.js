// ============================================================
// Event position layout patch
// ============================================================
// 将事件详情里的“位置”区域从竖排 x/y/elevation 改成一行 X/Y/Z。
// 只移动现有 input，不改 data-event-field，因此事件写回逻辑保持不变。

(function eventPositionLayoutModule() {
  function injectStyle() {
    if (document.getElementById("eventPositionLayoutStyle")) return;
    const style = document.createElement("style");
    style.id = "eventPositionLayoutStyle";
    style.textContent = `
      .event-position-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        align-items: end;
      }

      .event-position-field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .event-position-field span {
        font-size: 12px;
        color: #566b88;
        line-height: 1.2;
      }

      .event-position-field .event-edit-input {
        width: 100%;
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

    const grid = section.querySelector(".event-field-grid");
    if (!grid) return;

    const xyz = document.createElement("div");
    xyz.className = "event-position-grid";
    xyz.appendChild(makeField("X", x));
    xyz.appendChild(makeField("Y", y));
    xyz.appendChild(makeField("Z", z));

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
