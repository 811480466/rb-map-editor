// ============================================================
// Object event parameter layout
// ============================================================
// 对象 / 训练家详情页：合并基础信息、位置、OBJ 参数为一个“参数”区域。
// 只显示常用字段；未显示但写回需要的 input 会保留到隐藏容器里，避免应用修改失败。

(function eventObjectParamLayoutModule() {
  function injectStyle() {
    if (document.getElementById("eventObjectParamLayoutStyle")) return;
    const style = document.createElement("style");
    style.id = "eventObjectParamLayoutStyle";
    style.textContent = `
      #eventTab .event-object-param-panel {
        border: 0 !important;
        background: transparent !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 8px 0 10px !important;
      }

      #eventTab .event-object-param-panel h3 {
        margin: 0 0 10px !important;
        font-size: 14px !important;
        color: #153b78 !important;
        font-weight: 800 !important;
      }

      #eventTab .event-object-param-grid {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        gap: 10px 12px;
        align-items: center;
      }

      #eventTab .event-object-param-label {
        font-size: 12px;
        color: #2b405f;
        line-height: 1.2;
        white-space: nowrap;
      }

      #eventTab .event-object-param-value {
        min-width: 0;
      }

      #eventTab .event-object-param-value .event-edit-input {
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 28px !important;
        padding: 4px 7px !important;
        box-sizing: border-box !important;
      }

      #eventTab .event-object-xyz-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
      }

      #eventTab .event-object-xyz-field {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
      }

      #eventTab .event-object-xyz-field span {
        font-size: 12px;
        color: #172033;
      }

      #eventTab .event-object-xyz-field .event-edit-input {
        width: 72px !important;
        min-width: 72px !important;
        max-width: 72px !important;
      }

      #eventTab .event-object-hidden-fields {
        display: none !important;
      }

      #eventTab .event-object-param-source-hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getSelectedObjectEvent() {
    try {
      if (typeof selectedEventKey === "undefined" || !selectedEventKey) return null;
      if (!Array.isArray(currentEvents)) return null;
      return currentEvents.find(ev => {
        const key = typeof eventKey === "function" ? eventKey(ev) : `${ev.type}:${ev.index}:${ev.offset}`;
        return key === selectedEventKey && ev.type === "object";
      }) || null;
    } catch (err) {
      return null;
    }
  }

  function findSection(title) {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab) return null;
    return Array.from(eventTab.querySelectorAll(".event-form-section"))
      .find(section => section.querySelector("h3")?.textContent?.trim() === title) || null;
  }

  function takeInput(name) {
    return document.querySelector(`#eventTab input[data-event-field="${name}"]`);
  }

  function normalizeNumberInput(input, min, max) {
    if (!input) return;
    input.type = "number";
    input.step = "1";
    input.min = String(min);
    input.max = String(max);
  }

  function makeRow(label, input) {
    const labelEl = document.createElement("div");
    labelEl.className = "event-object-param-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("div");
    valueEl.className = "event-object-param-value";
    valueEl.appendChild(input);

    return [labelEl, valueEl];
  }

  function makeXyzRow(x, y, z) {
    normalizeNumberInput(x, -32768, 32767);
    normalizeNumberInput(y, -32768, 32767);
    normalizeNumberInput(z, 0, 255);

    const labelEl = document.createElement("div");
    labelEl.className = "event-object-param-label";
    labelEl.textContent = "xyz";

    const row = document.createElement("div");
    row.className = "event-object-param-value event-object-xyz-row";

    for (const [label, input] of [["x", x], ["y", y], ["z", z]]) {
      const field = document.createElement("label");
      field.className = "event-object-xyz-field";
      const text = document.createElement("span");
      text.textContent = label;
      field.appendChild(text);
      field.appendChild(input);
      row.appendChild(field);
    }

    return [labelEl, row];
  }

  function appendPair(grid, pair) {
    grid.appendChild(pair[0]);
    grid.appendChild(pair[1]);
  }

  function moveHiddenInputs(hidden, names) {
    for (const name of names) {
      const input = takeInput(name);
      if (input) hidden.appendChild(input);
    }
  }

  function applyObjectParamLayout() {
    injectStyle();
    const eventTab = document.getElementById("eventTab");
    const ev = getSelectedObjectEvent();
    if (!eventTab || !ev) return;
    if (document.getElementById("eventObjectParamPanel")) return;

    const basicSection = findSection("基础信息");
    const positionSection = findSection("位置");
    const objectSection = findSection("OBJ 参数");
    if (!positionSection || !objectSection) return;

    const inputs = {
      localId: takeInput("localId"),
      x: takeInput("x"),
      y: takeInput("y"),
      z: takeInput("elevation"),
      graphicsId: takeInput("graphicsId"),
      movementType: takeInput("movementType"),
      movementRangeX: takeInput("movementRangeX"),
      movementRangeY: takeInput("movementRangeY"),
      flagId: takeInput("flagId"),
      trainerType: takeInput("trainerType"),
      trainerRange: takeInput("trainerRange"),
    };

    if (Object.values(inputs).some(v => !v)) return;

    normalizeNumberInput(inputs.localId, 0, 255);
    normalizeNumberInput(inputs.graphicsId, 0, 255);
    normalizeNumberInput(inputs.movementType, 0, 255);
    normalizeNumberInput(inputs.movementRangeX, 0, 15);
    normalizeNumberInput(inputs.movementRangeY, 0, 15);
    normalizeNumberInput(inputs.flagId, 0, 65535);
    normalizeNumberInput(inputs.trainerType, 0, 65535);
    normalizeNumberInput(inputs.trainerRange, 0, 65535);

    const panel = document.createElement("div");
    panel.id = "eventObjectParamPanel";
    panel.className = "event-object-param-panel";

    const title = document.createElement("h3");
    title.textContent = "参数";
    panel.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "event-object-param-grid";
    panel.appendChild(grid);

    appendPair(grid, makeRow("对象ID", inputs.localId));
    appendPair(grid, makeXyzRow(inputs.x, inputs.y, inputs.z));
    appendPair(grid, makeRow("图形", inputs.graphicsId));
    appendPair(grid, makeRow("移动类型", inputs.movementType));
    appendPair(grid, makeRow("移动范围 X", inputs.movementRangeX));
    appendPair(grid, makeRow("移动范围 Y", inputs.movementRangeY));
    appendPair(grid, makeRow("事件Flag", inputs.flagId));
    appendPair(grid, makeRow("训练家类型", inputs.trainerType));
    appendPair(grid, makeRow("视野/树果/道具", inputs.trainerRange));

    const hidden = document.createElement("div");
    hidden.className = "event-object-hidden-fields";
    panel.appendChild(hidden);

    // 写回 object 结构时仍然需要这些字段，因此保留 input，只隐藏不展示。
    moveHiddenInputs(hidden, ["kind", "unknownA", "scriptPtr", "unknown16"]);

    const head = eventTab.querySelector(".event-detail-head");
    if (head?.nextSibling) eventTab.insertBefore(panel, head.nextSibling);
    else eventTab.prepend(panel);

    for (const section of [basicSection, positionSection, objectSection]) {
      if (section) section.classList.add("event-object-param-source-hidden");
    }
  }

  const observer = new MutationObserver(() => applyObjectParamLayout());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    applyObjectParamLayout();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorObjectParamLayout = {
    applyObjectParamLayout,
  };
})();
