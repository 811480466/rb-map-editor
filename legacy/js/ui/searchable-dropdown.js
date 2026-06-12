// ============================================================
// Reusable searchable dropdown
// ============================================================
// 普通全局脚本，不使用 import/export，直接通过 window.RBEditorSearchableDropdown 使用。
// 用途：对象图形、野生宝可梦等单选搜索下拉。
// 性能优化：默认不预渲染选项，只有展开时才渲染；无搜索时最多展示前 80 条。

(function searchableDropdownModule() {
  let activeDropdown = null;
  let uid = 1;

  const DEFAULT_RENDER_LIMIT = 80;

  function injectStyle() {
    if (document.getElementById("searchableDropdownStyle")) return;
    const style = document.createElement("style");
    style.id = "searchableDropdownStyle";
    style.textContent = `
      .rb-searchable-dropdown {
        position: relative;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
      .rb-searchable-dropdown-hidden { display: none !important; }
      .rb-searchable-dropdown-trigger {
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
      .rb-searchable-dropdown-trigger:hover {
        background: #f2f7ff;
        border-color: #b6cef0;
      }
      .rb-searchable-dropdown.open .rb-searchable-dropdown-trigger {
        border-color: #1f5fbf;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12);
      }
      .rb-searchable-dropdown-text {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
      }
      .rb-searchable-dropdown-arrow {
        flex: 0 0 auto;
        color: #64748b;
        font-size: 10px;
      }
      .rb-searchable-dropdown-menu {
        position: absolute;
        z-index: 5000;
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
      .rb-searchable-dropdown.open .rb-searchable-dropdown-menu { display: block; }
      .rb-searchable-dropdown-search {
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
      .rb-searchable-dropdown-search:focus {
        outline: none !important;
        border-color: #1f5fbf !important;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12) !important;
      }
      .rb-searchable-dropdown-options {
        max-height: 240px;
        overflow: auto;
        padding-right: 2px;
      }
      .rb-searchable-dropdown-option {
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
      .rb-searchable-dropdown-option:hover { background: #f4f8ff; }
      .rb-searchable-dropdown-option input {
        width: 14px !important;
        height: 14px !important;
        margin: 0 !important;
        flex: 0 0 auto;
        accent-color: #1f8fe5;
        cursor: pointer;
      }
      .rb-searchable-dropdown-option-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rb-searchable-dropdown-empty,
      .rb-searchable-dropdown-more {
        padding: 8px 2px;
        color: #64748b;
        font-size: 12px;
      }
      .rb-searchable-dropdown-more {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function defaultGetValue(item) {
    return item?.id;
  }

  function defaultGetLabel(item) {
    return String(item?.name ?? item?.label ?? item?.id ?? "");
  }

  function closeActive(except = null) {
    if (activeDropdown && activeDropdown !== except) activeDropdown.close();
    activeDropdown = except;
  }

  class SearchableDropdown {
    constructor(options = {}) {
      injectStyle();
      this.container = options.container;
      this.options = Array.isArray(options.options) ? options.options : [];
      this.value = options.value;
      this.getValue = options.getValue || defaultGetValue;
      this.getLabel = options.getLabel || defaultGetLabel;
      this.getSearchText = options.getSearchText || this.getLabel;
      this.onChange = options.onChange || (() => {});
      this.placeholder = options.placeholder || "搜索...";
      this.fieldName = options.fieldName || "";
      this.hiddenClassName = options.hiddenClassName || "";
      this.extraClassName = options.className || "";
      this.renderLimit = Math.max(1, Number.isInteger(options.renderLimit) ? options.renderLimit : DEFAULT_RENDER_LIMIT);
      this.currentQuery = "";
      this.filteredOptions = [];
      this.visibleLimit = this.renderLimit;
      this.moreEl = null;
      this.id = uid++;
      this.render();
    }

    valueToString(value) {
      return String(value ?? "");
    }

    findSelected() {
      const current = this.valueToString(this.value);
      return this.options.find(item => this.valueToString(this.getValue(item)) === current) || null;
    }

    render() {
      if (!this.container) return;
      this.container.innerHTML = "";

      this.root = document.createElement("div");
      this.root.className = `rb-searchable-dropdown ${this.extraClassName}`.trim();

      this.hidden = document.createElement("input");
      this.hidden.type = "hidden";
      this.hidden.className = `rb-searchable-dropdown-hidden ${this.hiddenClassName}`.trim();
      this.hidden.value = this.valueToString(this.value);
      if (this.fieldName) this.hidden.dataset.eventField = this.fieldName;

      this.trigger = document.createElement("button");
      this.trigger.type = "button";
      this.trigger.className = "rb-searchable-dropdown-trigger";
      this.trigger.innerHTML = `<span class="rb-searchable-dropdown-text"></span><span class="rb-searchable-dropdown-arrow">▼</span>`;

      this.menu = document.createElement("div");
      this.menu.className = "rb-searchable-dropdown-menu";

      this.search = document.createElement("input");
      this.search.type = "text";
      this.search.className = "rb-searchable-dropdown-search";
      this.search.placeholder = this.placeholder;

      this.optionBox = document.createElement("div");
      this.optionBox.className = "rb-searchable-dropdown-options";

      this.menu.appendChild(this.search);
      this.menu.appendChild(this.optionBox);
      this.root.appendChild(this.hidden);
      this.root.appendChild(this.trigger);
      this.root.appendChild(this.menu);
      this.container.appendChild(this.root);

      this.updateTrigger();
      this.optionBox.innerHTML = "";

      this.trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
      this.search.addEventListener("input", () => this.renderOptions(this.search.value));
      this.optionBox.addEventListener("scroll", () => this.maybeLoadMoreOptions());
      this.menu.addEventListener("click", (e) => e.stopPropagation());
    }

    updateTrigger() {
      const text = this.trigger?.querySelector(".rb-searchable-dropdown-text");
      if (!text) return;
      const item = this.findSelected();
      text.textContent = item ? this.getLabel(item) : this.valueToString(this.value);
    }

    matches(item, query) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) return true;
      return String(this.getSearchText(item) || this.getLabel(item) || "").toLowerCase().includes(q);
    }

    createOptionElement(item, selected) {
      const value = this.getValue(item);
      const label = document.createElement("label");
      label.className = "rb-searchable-dropdown-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = this.valueToString(value) === selected;
      checkbox.tabIndex = -1;

      const text = document.createElement("span");
      text.className = "rb-searchable-dropdown-option-text";
      text.textContent = this.getLabel(item);

      label.appendChild(checkbox);
      label.appendChild(text);
      label.addEventListener("click", (e) => {
        e.preventDefault();
        this.select(value, item);
      });
      return label;
    }

    appendOptions(items, selected) {
      for (const item of items) {
        this.optionBox.appendChild(this.createOptionElement(item, selected));
      }
    }

    updateMoreIndicator() {
      this.moreEl?.remove();
      this.moreEl = null;

      const remaining = this.filteredOptions.length - this.visibleLimit;
      if (remaining <= 0) return;

      const more = document.createElement("div");
      more.className = "rb-searchable-dropdown-more";
      more.textContent = `还有 ${remaining} 项，向下滚动加载更多。`;
      more.addEventListener("click", () => this.loadMoreOptions());
      this.moreEl = more;
      this.optionBox.appendChild(more);
    }

    loadMoreOptions() {
      if (!this.optionBox || this.visibleLimit >= this.filteredOptions.length) return;
      const selected = this.valueToString(this.value);
      const nextLimit = Math.min(this.visibleLimit + this.renderLimit, this.filteredOptions.length);
      const nextItems = this.filteredOptions.slice(this.visibleLimit, nextLimit);

      this.moreEl?.remove();
      this.moreEl = null;
      this.appendOptions(nextItems, selected);
      this.visibleLimit = nextLimit;
      this.updateMoreIndicator();
    }

    maybeLoadMoreOptions() {
      if (!this.optionBox || this.visibleLimit >= this.filteredOptions.length) return;
      const distanceToBottom = this.optionBox.scrollHeight - this.optionBox.scrollTop - this.optionBox.clientHeight;
      if (distanceToBottom > 32) return;
      this.loadMoreOptions();
    }

    renderOptions(query = "") {
      if (!this.optionBox) return;
      const selected = this.valueToString(this.value);
      const q = String(query || "").trim();
      this.currentQuery = q;
      this.filteredOptions = this.options.filter(item => this.matches(item, q));
      this.visibleLimit = Math.min(this.renderLimit, this.filteredOptions.length);
      const shown = this.filteredOptions.slice(0, this.visibleLimit);
      this.optionBox.innerHTML = "";
      this.moreEl = null;
      this.optionBox.scrollTop = 0;

      if (!this.filteredOptions.length) {
        const empty = document.createElement("div");
        empty.className = "rb-searchable-dropdown-empty";
        empty.textContent = "无匹配项";
        this.optionBox.appendChild(empty);
        return;
      }

      this.appendOptions(shown, selected);
      this.updateMoreIndicator();
    }

    select(value, item = null) {
      this.value = value;
      this.hidden.value = this.valueToString(value);
      this.updateTrigger();
      this.onChange(value, item);
      this.close();
    }

    open() {
      closeActive(this);
      this.root?.classList.add("open");
      this.search.value = "";
      this.renderOptions("");
      setTimeout(() => this.search?.focus(), 0);
    }

    close() {
      this.root?.classList.remove("open");
      if (activeDropdown === this) activeDropdown = null;
    }

    toggle() {
      if (this.root?.classList.contains("open")) this.close();
      else this.open();
    }

    getHiddenInput() {
      return this.hidden;
    }
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".rb-searchable-dropdown")) closeActive(null);
  }, true);

  window.RBEditorSearchableDropdown = SearchableDropdown;
})();
