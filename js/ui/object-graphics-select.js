// ============================================================
// Object graphics searchable dropdown
// ============================================================
// 使用通用 RBEditorSearchableDropdown 组件，将 graphicsId 改成可搜索下拉。
// 隐藏 input 保留 data-event-field="graphicsId"，应用修改逻辑可直接读取数字并写回。

(function objectGraphicsSelectModule() {
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

  function optionLabel(itemOrId) {
    const item = typeof itemOrId === "object"
      ? itemOrId
      : getGraphicsList().find(v => Number(v.id) === Number(itemOrId));
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

  function findGraphicsField() {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab) return null;

    const direct = eventTab.querySelector(':is(input, select)[data-event-field="graphicsId"]');
    if (direct && !direct.closest(".rb-searchable-dropdown")) return direct;

    const labels = Array.from(eventTab.querySelectorAll(".event-object-param-label"));
    const graphicsLabel = labels.find(el => el.textContent.trim() === "图形");
    const valueEl = graphicsLabel?.nextElementSibling;
    const fallback = valueEl?.querySelector(':is(input, select)[data-event-field="graphicsId"]');
    if (fallback && !fallback.closest(".rb-searchable-dropdown")) return fallback;

    return null;
  }

  function enhanceObjectGraphicsSelect() {
    const Dropdown = window.RBEditorSearchableDropdown;
    if (!Dropdown) return;

    const field = findGraphicsField();
    if (!field || field.dataset.objectGraphicsSelectDone === "1") return;

    const currentValue = parseValue(field.value);
    const host = document.createElement("div");
    host.className = "object-graphics-select-host";
    field.dataset.objectGraphicsSelectDone = "1";
    field.replaceWith(host);

    new Dropdown({
      container: host,
      value: currentValue,
      options: getGraphicsList(),
      fieldName: "graphicsId",
      hiddenClassName: "event-edit-input",
      placeholder: "搜索对象 ID / 名称 / 宏名",
      getValue: item => Number(item.id),
      getLabel: item => optionLabel(item),
      getSearchText: item => `${item.id} ${formatHex(item.id)} ${item.name || ""} ${item.macro || ""}`,
      onChange: () => markDirty(),
    });
  }

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
