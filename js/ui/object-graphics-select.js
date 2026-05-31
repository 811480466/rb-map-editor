// ============================================================
// Object graphics searchable dropdown
// ============================================================
// 将对象事件参数里的 graphicsId 字段改成“输入搜索 + 下拉勾选列表”。
// 数据来自 data/object-event-graphics-data.js。
// 隐藏 input 保留 data-event-field="graphicsId"，应用修改逻辑可直接读取数字并写回。

(function objectGraphicsSelectModule() {
  let openDropdown = null;

  function injectStyle() {
    if (document.getElementById("objectGraphicsSelectStyle")) return;
    const style = document.createElement("style");
    style.id = "objectGraphicsSelectStyle";
    style.textContent = `
      #eventTab .object-graphics-combo {
        position: relative;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
      #eventTab .object-graphics-hidden-input { display: none !important; }
      #eventTab .object-graphics-trigger {
        width: 100%;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 0;
        padding: 3px 8px;
        border: 1px solid #cbd9ed;
        border-radius: 6px;
        background: #f8fbff;
        color: #172033;
        font-size: 12px;
        font-weight: 500;
        box-sizing: border-box;
        cursor: pointer;
      }
      #eventTab .object-graphics-trigger:hover {
        background: #f2f7ff;
        border-color: #b6cef0;
      }
      #eventTab .object-graphics-trigger-text {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
      }
      #eventTab .object-graphics-trigger-arrow {
        flex: 0 0 auto;
        color: #64748b;
        font-size: 10px;
      }
      #eventTab .object-graphics-dropdown {
        position: absolute;
        z-index: 3000;
        top: calc(100% + 5px);
        left: 0;
        right: 0;
        display: none;
        padding: 8px;
        border: 1px solid #d7e3f4;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
      }
      #eventTab .object-graphics-combo.open .object-graphics-dropdown { display: block; }
      #eventTab .object-graphics-search {
        width: 100% !important;
        height: 28px !important;
        margin: 0 0 8px !important;
        padding: 4px 7px !important;
        border: 1px solid #d7e3f4 !important;
        border-radius: 4px !important;
        background: #fff !important;
        color: #172033 !important;
        font-size: 12px !important;
        box-sizing: border-box !important;
      }
      #eventTab .object-graphics-search:focus {
        outline: none !important;
        border-color: #1f5fbf !important;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12) !important;
      }
      #eventTab .object-graphics-options {
        max-height: 240px;
        overflow: auto;
        padding-right: 2px;
      }
      #eventTab .object-graphics-option {
        display: flex;
        align-items: center;
        gap: 7px;
        min-height: 26px;
        padding: 3px 2px;
        color: #2b405f;
        font-size: 12px;
        line-height: 1.3;
        cursor: pointer;
        user-select: none;
      }
      #eventTab .object-graphics-option:hover { background: #f4f8ff; }
      #eventTab .object-graphics-option input {
        width: 14px !important;
        height: 14px !important;
        margin: 0 !important;
        flex: 0 0 auto;
        accent-color: #1f8fe5;
        cursor: pointer;
      }
      #eventTab .object-graphics-option-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #eventTab .object-graphics-empty {
        padding: 8px 2px;
        color: #64748b;
        font-size: 12px;
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

  function getGraphicsItem(id) {
    const map = window.RBEditorObjectEventGraphicsDataById;
    if (map instanceof Map) return map.get(Number(id)) || null;
    return getGraphicsList().find(item => Number(item.id) === Number(id)) || null;
  }

  function optionLabel(itemOrId) {
    const item = typeof itemOrId === "object" ? itemOrId : getGraphicsItem(itemOrId);
    const id = Number(item?.id ?? itemOrId);
    if (!item) return `${formatHex(id)} 未知对象图形`;
    return `${formatHex(id)} ${item.name || item.macro || "对象"}${item.macro ? ` / ${item.macro}` : ""}`;
  }

  function markDirty() {
    const status = document.getElementById("eventEditStatus");
    if (status) {
      status.className = "event-edit-status";
      status.textContent = "未应用修改。";
    }
  }

  function closeOpenDropdown(except = null) {
    if (openDropdown && openDropdown !== except) openDropdown.classList.remove("open");
    openDropdown = except;
  }

  function buildCombo(currentValue) {
    const wrapper = document.createElement("div");
    wrapper.className = "object-graphics-combo";
    wrapper.dataset.objectGraphicsSelectDone = "1";

    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.className = "event-edit-input object-graphics-hidden-input";
    hidden.dataset.eventField = "graphicsId";
    hidden.value = String(currentValue);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "object-graphics-trigger";
    trigger.innerHTML = `<span class="object-graphics-trigger-text"></span><span class="object-graphics-trigger-arrow">▼</span>`;

    const dropdown = document.createElement("div");
    dropdown.className = "object-graphics-dropdown";

    const search = document.createElement("input");
    search.type = "text";
    search.className = "object-graphics-search";
    search.placeholder = "搜索对象 ID / 名称 / 宏名";

    const options = document.createElement("div");
    options.className = "object-graphics-options";

    dropdown.appendChild(search);
    dropdown.appendChild(options);
    wrapper.appendChild(hidden);
    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);

    function updateTrigger() {
      const text = trigger.querySelector(".object-graphics-trigger-text");
      if (text) text.textContent = optionLabel(hidden.value);
    }

    function selectValue(value) {
      hidden.value = String(value);
      updateTrigger();
      renderOptions(search.value);
      markDirty();
      wrapper.classList.remove("open");
      closeOpenDropdown(null);
    }

    function matchItem(item, query) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) return true;
      const text = [String(item.id ?? ""), formatHex(item.id), item.name || "", item.macro || ""].join(" ").toLowerCase();
      return text.includes(q);
    }

    function renderOptions(query = "") {
      const selectedValue = Number(hidden.value);
      const filtered = getGraphicsList().filter(item => Number.isInteger(Number(item.id)) && matchItem(item, query));
      options.innerHTML = "";

      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "object-graphics-empty";
        empty.textContent = "没有匹配的对象图形。";
        options.appendChild(empty);
        return;
      }

      for (const item of filtered) {
        const value = Number(item.id);
        const label = document.createElement("label");
        label.className = "object-graphics-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = value === selectedValue;
        checkbox.tabIndex = -1;

        const text = document.createElement("span");
        text.className = "object-graphics-option-text";
        text.textContent = optionLabel(item);

        label.appendChild(checkbox);
        label.appendChild(text);
        label.addEventListener("click", (e) => {
          e.preventDefault();
          selectValue(value);
        });
        options.appendChild(label);
      }
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !wrapper.classList.contains("open");
      closeOpenDropdown(willOpen ? wrapper : null);
      wrapper.classList.toggle("open", willOpen);
      if (willOpen) {
        search.value = "";
        renderOptions("");
        setTimeout(() => search.focus(), 0);
      }
    });

    search.addEventListener("input", () => renderOptions(search.value));
    dropdown.addEventListener("click", (e) => e.stopPropagation());

    updateTrigger();
    renderOptions("");
    return wrapper;
  }

  function findGraphicsField() {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab) return null;

    const direct = eventTab.querySelector(':is(input, select)[data-event-field="graphicsId"]');
    if (direct && !direct.closest(".object-graphics-combo")) return direct;

    const valueRows = Array.from(eventTab.querySelectorAll(".event-object-param-label"));
    const graphicsLabel = valueRows.find(el => el.textContent.trim() === "图形");
    const valueEl = graphicsLabel?.nextElementSibling;
    const fallback = valueEl?.querySelector(':is(input, select)[data-event-field="graphicsId"]');
    if (fallback && !fallback.closest(".object-graphics-combo")) return fallback;

    return null;
  }

  function enhanceObjectGraphicsSelect() {
    injectStyle();
    const field = findGraphicsField();
    if (!field || field.dataset.objectGraphicsSelectDone === "1") return;

    const currentValue = parseValue(field.value);
    const combo = buildCombo(currentValue);
    field.dataset.objectGraphicsSelectDone = "1";
    field.replaceWith(combo);
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".object-graphics-combo")) closeOpenDropdown(null);
  }, true);

  const observer = new MutationObserver(() => enhanceObjectGraphicsSelect());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceObjectGraphicsSelect();
    setTimeout(enhanceObjectGraphicsSelect, 0);
    setTimeout(enhanceObjectGraphicsSelect, 100);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorObjectGraphicsSelect = { enhanceObjectGraphicsSelect };
})();
