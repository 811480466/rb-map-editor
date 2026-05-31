// ============================================================
// Event right panel
// ============================================================
// 事件模式右侧面板：未选中事件时展示列表；选中单个事件时展示属性详情。

(function eventPanelModule() {
  let eventTypeFilter = "all";

  function injectStyle() {
    if (document.getElementById("eventPanelStyle")) return;
    const style = document.createElement("style");
    style.id = "eventPanelStyle";
    style.textContent = `
      .event-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }

      .event-panel-title {
        font-size: 15px;
        font-weight: 700;
        color: #163c7a;
      }

      .event-summary-filter {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin: 8px 0 12px;
      }

      .event-summary-filter button {
        min-width: 0;
        border: 1px solid #bfd1ec;
        background: #f7fbff;
        color: #16447d;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        text-align: left;
        cursor: pointer;
      }

      .event-summary-filter button.active {
        background: #1f5fbf;
        border-color: #1f5fbf;
        color: #fff;
        font-weight: 700;
      }

      .event-back-btn,
      .event-secondary-btn,
      .event-primary-btn {
        border: 1px solid #bfd1ec;
        background: #f7fbff;
        color: #16447d;
        border-radius: 7px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }

      .event-primary-btn {
        background: #1f5fbf;
        border-color: #1f5fbf;
        color: #fff;
        font-weight: 700;
      }

      .event-primary-btn:disabled,
      .event-secondary-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .event-detail-head {
        border: 1px solid #c9daf3;
        background: #f7fbff;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
      }

      .event-detail-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }

      .event-detail-title {
        font-weight: 700;
        color: #153b78;
      }

      .event-form-section {
        border: 1px solid #d8e4f5;
        background: #fff;
        border-radius: 10px;
        padding: 10px;
        margin: 10px 0;
      }

      .event-form-section h3 {
        margin: 0 0 8px;
        font-size: 13px;
        color: #153b78;
      }

      .event-field-grid {
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 6px 10px;
        align-items: center;
      }

      .event-field-label {
        font-size: 12px;
        color: #566b88;
      }

      .event-field-value,
      .event-readonly-input,
      .event-edit-input {
        min-width: 0;
        border: 1px solid #cbd9ed;
        border-radius: 6px;
        background: #f8fbff;
        color: #172033;
        padding: 5px 7px;
        font-size: 12px;
        font-family: Consolas, Monaco, monospace;
        box-sizing: border-box;
        width: 100%;
      }

      .event-edit-input:focus {
        outline: none;
        border-color: #1f5fbf;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12);
      }

      .event-field-value.readonly {
        border-color: transparent;
        background: transparent;
        padding-left: 0;
      }

      .event-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0;
      }

      .event-edit-status {
        min-height: 18px;
        margin: 8px 0 0;
        font-size: 12px;
        color: #566b88;
        white-space: pre-wrap;
      }

      .event-edit-status.ok {
        color: #15803d;
      }

      .event-edit-status.error {
        color: #dc2626;
      }

      .event-warp-status {
        line-height: 1.6;
        font-size: 12px;
      }

      .event-debug summary {
        cursor: pointer;
        color: #1f5fbf;
        font-weight: 700;
        margin: 8px 0;
      }

      .event-debug pre {
        max-height: 280px;
        overflow: auto;
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    injectStyle();
    const right = window.RBEditorRightPanel;
    const panel = right?.getPanel ? right.getPanel() : document.querySelector(".panel.right");
    if (!panel) return null;

    if (right?.setModeClass) right.setModeClass("mode-events");
    if (right?.clearPanel) right.clearPanel();
    if (right?.ensureTitle) right.ensureTitle("地图事件");

    const eventTab = document.createElement("div");
    eventTab.id = "eventTab";
    eventTab.className = "tab-panel active";
    panel.appendChild(eventTab);
    return eventTab;
  }

  function getEventTab() {
    return document.getElementById("eventTab") || ensurePanel();
  }

  function eventBadge(ev) {
    if (ev.type === "object" && ev.trainerBattle) return `<span class="badge trainer">TRAINER</span>`;
    if (ev.type === "object") return `<span class="badge obj">OBJ</span>`;
    if (ev.type === "warp") return `<span class="badge warp">WARP</span>`;
    if (ev.type === "bg") return `<span class="badge bg">BG</span>`;
    if (ev.type === "coord") return `<span class="badge coord">COORD</span>`;
    return "";
  }

  function eventTypeLabel(ev) {
    if (!ev) return "EVENT";
    if (ev.type === "object" && ev.trainerBattle) return "TRAINER";
    if (ev.type === "object") return "OBJ";
    return ev.type.toUpperCase();
  }

  function eventKey(ev) {
    return `${ev.type}:${ev.index}:${ev.offset}`;
  }

  function getSelectedEvent() {
    if (typeof selectedEventKey === "undefined" || !selectedEventKey) return null;
    if (typeof currentEvents === "undefined" || !Array.isArray(currentEvents)) return null;
    return currentEvents.find(ev => eventKey(ev) === selectedEventKey) || null;
  }

  function countEvents(events) {
    return {
      all: events.length,
      object: events.filter(e => e.type === "object").length,
      trainer: events.filter(e => e.type === "object" && e.trainerBattle).length,
      warp: events.filter(e => e.type === "warp").length,
      bg: events.filter(e => e.type === "bg").length,
      coord: events.filter(e => e.type === "coord").length,
    };
  }

  function filterEvents(events) {
    if (eventTypeFilter === "all") return events;
    if (eventTypeFilter === "trainer") return events.filter(e => e.type === "object" && e.trainerBattle);
    if (eventTypeFilter === "object") return events.filter(e => e.type === "object");
    if (eventTypeFilter === "bgCoord") return events.filter(e => e.type === "bg" || e.type === "coord");
    return events.filter(e => e.type === eventTypeFilter);
  }

  function toggleFilter(key, events) {
    eventTypeFilter = eventTypeFilter === key ? "all" : key;
    renderListView(events || []);
  }

  function renderEventSummary(events) {
    const el = document.getElementById("eventSummary");
    if (!el) return;
    const c = countEvents(events || []);
    const items = [
      ["object", `对象: ${c.object}`],
      ["trainer", `训练家: ${c.trainer}`],
      ["warp", `传送点: ${c.warp}`],
      ["bgCoord", `事件: ${c.bg + c.coord}`],
    ];

    el.className = "event-summary-filter";
    el.innerHTML = items.map(([key, label]) => {
      const active = eventTypeFilter === key;
      return `<button type="button" data-event-summary-filter="${key}" class="${active ? "active" : ""}">${escapeHtml(label)}</button>`;
    }).join("");

    for (const btn of el.querySelectorAll("button[data-event-summary-filter]")) {
      btn.onclick = () => toggleFilter(btn.dataset.eventSummaryFilter || "all", events);
    }
  }

  function eventRowHtml(ev) {
    let title = `${eventBadge(ev)} #${ev.index} (${ev.x}, ${ev.y})`;

    if (ev.type === "object") {
      title += `<div class="small">localId=${ev.localId}, graphicsId=${hex(ev.graphicsId, 2)}, script=${hex(ev.scriptPtr)}</div>`;
      title += `<div class="small">trainerType=${ev.trainerType}, range=${ev.trainerRange}, flag=${ev.flagId}</div>`;
      if (ev.trainerBattle) {
        title += `<div class="small">trainerId=${ev.trainerBattle.trainerId}, battleType=${ev.trainerBattle.battleType}</div>`;
      }
    } else if (ev.type === "warp") {
      const targetMap = findMapByGroupNum(ev.mapGroup, ev.mapNum);
      const targetName = targetMap ? getMapDisplayNameWithCode(targetMap) : "未匹配地图";
      title += `<div class="small">to group=${ev.mapGroup}, map=${ev.mapNum}, warp=${ev.warpId}</div>`;
      title += `<div class="small">目标：${escapeHtml(targetName)}</div>`;
    } else if (ev.type === "bg") {
      title += `<div class="small">kind=${ev.kind}, script=${hex(ev.scriptPtr)}</div>`;
    } else if (ev.type === "coord") {
      title += `<div class="small">trigger=${ev.trigger}, script=${hex(ev.scriptPtr)}</div>`;
    }

    return title;
  }

  function renderEventList(events) {
    if (typeof selectedEventKey !== "undefined" && selectedEventKey) {
      const selected = getSelectedEvent();
      if (selected) {
        renderDetailView(selected);
        return;
      }
      selectedEventKey = null;
    }
    renderListView(events || []);
  }

  function renderListView(events) {
    const eventTab = getEventTab();
    if (!eventTab) return;

    eventTab.innerHTML = `
      <div class="event-panel-header">
        <div class="event-panel-title">事件列表</div>
      </div>
      <div id="eventSummary"></div>
      <div id="eventList"></div>
    `;

    renderEventSummary(events);

    const list = document.getElementById("eventList");
    const rows = filterEvents(events);
    if (!rows.length) {
      list.innerHTML = `<div class="empty-tip">当前筛选没有事件。</div>`;
    } else {
      for (const ev of rows) {
        const row = document.createElement("div");
        row.className = "event-row";
        row.dataset.key = eventKey(ev);
        row.innerHTML = eventRowHtml(ev);
        row.onclick = () => showEventDetail(ev);
        list.appendChild(row);
      }
    }
  }

  function field(label, value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `
      <div class="event-field-label">${escapeHtml(label)}</div>
      <div class="event-field-value readonly">${escapeHtml(text)}</div>
    `;
  }

  function inputField(label, name, value, options = {}) {
    const text = value === null || value === undefined ? "" : String(value);
    const hint = options.hint ? ` title="${escapeHtml(options.hint)}"` : "";
    return `
      <div class="event-field-label">${escapeHtml(label)}</div>
      <input class="event-edit-input" data-event-field="${escapeHtml(name)}" value="${escapeHtml(text)}"${hint} />
    `;
  }

  function section(title, body) {
    return `
      <div class="event-form-section">
        <h3>${escapeHtml(title)}</h3>
        <div class="event-field-grid">${body}</div>
      </div>
    `;
  }

  function renderPositionFields(ev) {
    let body = "";
    body += inputField("x", "x", ev.x, { hint: "s16" });
    body += inputField("y", "y", ev.y, { hint: "s16" });
    body += inputField("elevation", "elevation", ev.elevation, { hint: "u8" });
    return section("位置", body);
  }

  function renderObjectFields(ev) {
    let body = "";
    body += inputField("localId", "localId", ev.localId, { hint: "u8" });
    body += inputField("graphicsId", "graphicsId", ev.graphicsId, { hint: "u8，可填十进制或 0xXX" });
    body += inputField("kind", "kind", ev.kind, { hint: "u8" });
    body += inputField("movementType", "movementType", ev.movementType, { hint: "u8" });
    body += inputField("moveRangeX", "movementRangeX", ev.movementRangeX, { hint: "0-15" });
    body += inputField("moveRangeY", "movementRangeY", ev.movementRangeY, { hint: "0-15" });
    body += inputField("unknownA", "unknownA", hex(ev.unknownA, 4), { hint: "u16" });
    body += inputField("trainerType", "trainerType", ev.trainerType, { hint: "u16" });
    body += inputField("trainerRange", "trainerRange", ev.trainerRange, { hint: "u16" });
    body += inputField("scriptPtr", "scriptPtr", hex(ev.scriptPtr), { hint: "GBA ptr，例如 0x08210C46" });
    body += inputField("flagId", "flagId", ev.flagId, { hint: "u16" });
    body += inputField("unknown16", "unknown16", hex(ev.unknown16, 4), { hint: "u16" });

    if (ev.trainerBattle) {
      body += field("trainerId", ev.trainerBattle.trainerId);
      body += field("battleType", ev.trainerBattle.battleType);
    }

    return section("OBJ 参数", body);
  }

  function renderWarpFields(ev) {
    let body = "";
    body += inputField("mapGroup", "mapGroup", ev.mapGroup, { hint: "u8" });
    body += inputField("mapNum", "mapNum", ev.mapNum, { hint: "u8" });
    body += inputField("warpId", "warpId", ev.warpId, { hint: "u8" });
    return section("WARP 目标", body) + renderWarpCheck(ev);
  }

  function renderWarpCheck(ev) {
    const info = getWarpDestinationInfo(ev);
    const targetMap = info?.targetMap;
    const targetWarp = info?.targetWarp;
    const statusClass = info?.status === "ok" ? "warp-ok" : (info?.status === "bad" ? "warp-bad" : "warp-warn");
    const targetText = targetMap
      ? `${escapeHtml(getMapDisplayNameWithCode(targetMap))} / group=${targetMap.mapGroup}, map=${targetMap.mapNum}`
      : `group=${ev.mapGroup}, map=${ev.mapNum}`;
    const targetWarpText = targetWarp
      ? `#${targetWarp.index} (${targetWarp.x}, ${targetWarp.y}) elevation=${targetWarp.elevation}`
      : `未找到目标 warp index=${ev.warpId}`;
    const reverseText = info?.exactReverseWarp
      ? `精确返回 warp：#${info.exactReverseWarp.index} (${info.exactReverseWarp.x}, ${info.exactReverseWarp.y}) -> 当前 #${ev.index}`
      : (info?.reverseWarps?.length
        ? `返回当前地图的候选：${info.reverseWarps.map(w => `#${w.index}(${w.x},${w.y})->warpId=${w.warpId}`).join("，")}`
        : "没有找到返回当前地图的 warp");

    return `
      <div class="event-form-section">
        <h3>目标检查</h3>
        <div class="event-warp-status">
          <div>目标：${targetText}</div>
          <div>目标 warp：${escapeHtml(targetWarpText)}</div>
          <div>反查：${escapeHtml(reverseText)}</div>
          <div>状态：<span class="${statusClass}">${escapeHtml(info?.statusText || "未能判断")}</span></div>
          <div class="warp-tools-actions">
            <button id="jumpWarpTargetBtn" type="button" ${targetMap ? "" : "disabled"}>跳转到目标地图</button>
            <button id="jumpWarpTargetFocusBtn" type="button" ${targetMap && targetWarp ? "" : "disabled"}>跳转并选中目标 Warp</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderBgFields(ev) {
    let body = "";
    body += inputField("kind", "kind", ev.kind, { hint: "u8" });
    body += inputField("data0", "data0", hex(ev.data0, 4), { hint: "u16" });
    body += inputField("scriptPtr", "scriptPtr", hex(ev.scriptPtr), { hint: "GBA ptr" });
    body += field("scriptOff", ev.scriptOff !== null ? hex(ev.scriptOff) : "null");
    return section("BG 参数", body);
  }

  function renderCoordFields(ev) {
    let body = "";
    body += inputField("trigger", "trigger", hex(ev.trigger, 4), { hint: "u16" });
    body += inputField("indexValue", "indexValue", hex(ev.indexValue, 4), { hint: "u16" });
    body += inputField("scriptPtr", "scriptPtr", hex(ev.scriptPtr), { hint: "GBA ptr" });
    body += field("scriptOff", ev.scriptOff !== null ? hex(ev.scriptOff) : "null");
    return section("COORD 参数", body);
  }

  function renderTypeFields(ev) {
    if (ev.type === "object") return renderObjectFields(ev);
    if (ev.type === "warp") return renderWarpFields(ev);
    if (ev.type === "bg") return renderBgFields(ev);
    if (ev.type === "coord") return renderCoordFields(ev);
    return "";
  }

  function renderDetailView(ev) {
    const eventTab = getEventTab();
    if (!eventTab) return;

    selectedEventKey = eventKey(ev);
    const title = `${eventTypeLabel(ev)} #${ev.index}`;
    let basic = "";
    basic += field("type", eventTypeLabel(ev));
    basic += field("index", `#${ev.index}`);
    basic += field("offset", hex(ev.offset));

    eventTab.innerHTML = `
      <div class="event-detail-head">
        <div class="event-detail-title-row">
          <div class="event-detail-title">${escapeHtml(title)}</div>
          <button id="eventBackToListBtn" class="event-back-btn" type="button">← 返回事件列表</button>
        </div>
        <div class="small">修改后点击“应用修改”，会直接写入当前内存中的 ROM；最后仍需要点页面左上角“导出”。</div>
      </div>
      ${section("基础信息", basic)}
      ${renderPositionFields(ev)}
      ${renderTypeFields(ev)}
      <div class="event-actions">
        <button id="applyEventEditBtn" class="event-primary-btn" type="button">应用修改</button>
        <button id="resetEventEditBtn" class="event-secondary-btn" type="button">撤销修改</button>
      </div>
      <div id="eventEditStatus" class="event-edit-status"></div>
      <details class="event-debug">
        <summary>调试 JSON</summary>
        <pre id="eventDetail">${escapeHtml(JSON.stringify(formatEventForDisplay(ev), null, 2))}</pre>
      </details>
      <div id="warpTools" class="warp-tools empty" style="display:none;"></div>
    `;

    document.getElementById("eventBackToListBtn")?.addEventListener("click", clearSelectedEvent);
    document.getElementById("applyEventEditBtn")?.addEventListener("click", () => applyEventEdit(ev));
    document.getElementById("resetEventEditBtn")?.addEventListener("click", () => renderDetailView(ev));

    for (const input of eventTab.querySelectorAll(".event-edit-input")) {
      input.addEventListener("input", () => setEditStatus("未应用修改。", ""));
    }

    const jumpBtn = document.getElementById("jumpWarpTargetBtn");
    const jumpFocusBtn = document.getElementById("jumpWarpTargetFocusBtn");
    if (jumpBtn) jumpBtn.onclick = () => jumpToWarpTarget(ev, false);
    if (jumpFocusBtn) jumpFocusBtn.onclick = () => jumpToWarpTarget(ev, true);
  }

  function setEditStatus(text, cls = "") {
    const el = document.getElementById("eventEditStatus");
    if (!el) return;
    el.className = `event-edit-status ${cls}`.trim();
    el.textContent = text || "";
  }

  function parseNum(raw, name, min, max) {
    const text = String(raw ?? "").trim();
    if (!text) throw new Error(`${name} 不能为空`);
    const value = /^[-+]?0x/i.test(text) ? Number.parseInt(text, 16) : Number(text);
    if (!Number.isInteger(value)) throw new Error(`${name} 必须是整数`);
    if (value < min || value > max) throw new Error(`${name} 超出范围：${min} ~ ${max}`);
    return value;
  }

  function getInputMap() {
    const map = {};
    for (const input of document.querySelectorAll("[data-event-field]")) {
      map[input.dataset.eventField] = input.value;
    }
    return map;
  }

  function collectCommonValues(input) {
    return {
      x: parseNum(input.x, "x", -32768, 32767),
      y: parseNum(input.y, "y", -32768, 32767),
      elevation: parseNum(input.elevation, "elevation", 0, 0xFF),
    };
  }

  function collectEventValues(ev) {
    const input = getInputMap();
    const values = collectCommonValues(input);

    if (ev.type === "object") {
      values.localId = parseNum(input.localId, "localId", 0, 0xFF);
      values.graphicsId = parseNum(input.graphicsId, "graphicsId", 0, 0xFF);
      values.kind = parseNum(input.kind, "kind", 0, 0xFF);
      values.movementType = parseNum(input.movementType, "movementType", 0, 0xFF);
      values.movementRangeX = parseNum(input.movementRangeX, "moveRangeX", 0, 0x0F);
      values.movementRangeY = parseNum(input.movementRangeY, "moveRangeY", 0, 0x0F);
      values.unknownA = parseNum(input.unknownA, "unknownA", 0, 0xFFFF);
      values.trainerType = parseNum(input.trainerType, "trainerType", 0, 0xFFFF);
      values.trainerRange = parseNum(input.trainerRange, "trainerRange", 0, 0xFFFF);
      values.scriptPtr = parseNum(input.scriptPtr, "scriptPtr", 0, 0xFFFFFFFF);
      values.flagId = parseNum(input.flagId, "flagId", 0, 0xFFFF);
      values.unknown16 = parseNum(input.unknown16, "unknown16", 0, 0xFFFF);
    } else if (ev.type === "warp") {
      values.warpId = parseNum(input.warpId, "warpId", 0, 0xFF);
      values.mapNum = parseNum(input.mapNum, "mapNum", 0, 0xFF);
      values.mapGroup = parseNum(input.mapGroup, "mapGroup", 0, 0xFF);
    } else if (ev.type === "bg") {
      values.kind = parseNum(input.kind, "kind", 0, 0xFF);
      values.data0 = parseNum(input.data0, "data0", 0, 0xFFFF);
      values.scriptPtr = parseNum(input.scriptPtr, "scriptPtr", 0, 0xFFFFFFFF);
    } else if (ev.type === "coord") {
      values.trigger = parseNum(input.trigger, "trigger", 0, 0xFFFF);
      values.indexValue = parseNum(input.indexValue, "indexValue", 0, 0xFFFF);
      values.scriptPtr = parseNum(input.scriptPtr, "scriptPtr", 0, 0xFFFFFFFF);
    }

    return values;
  }

  function ensureWriteRange(off, size) {
    if (!rom || !isValidOffset(off, size)) {
      throw new Error(`ROM 写入范围无效：${hex(off)} size=${size}`);
    }
  }

  function writeByte(off, value) {
    ensureWriteRange(off, 1);
    rom[off] = value & 0xFF;
  }

  function writeWord(off, value) {
    ensureWriteRange(off, 2);
    rom[off] = value & 0xFF;
    rom[off + 1] = (value >> 8) & 0xFF;
  }

  function writeDword(off, value) {
    ensureWriteRange(off, 4);
    const v = value >>> 0;
    rom[off] = v & 0xFF;
    rom[off + 1] = (v >> 8) & 0xFF;
    rom[off + 2] = (v >> 16) & 0xFF;
    rom[off + 3] = (v >> 24) & 0xFF;
  }

  function writeS16(off, value) {
    writeWord(off, value < 0 ? value + 0x10000 : value);
  }

  function writeCommonEventFields(ev, values) {
    writeS16(ev.offset + 0x00, values.x);
    writeS16(ev.offset + 0x02, values.y);
    writeByte(ev.offset + 0x04, values.elevation);
  }

  function writeObjectEvent(ev, values) {
    ensureWriteRange(ev.offset, 0x18);
    writeByte(ev.offset + 0x00, values.localId);
    writeByte(ev.offset + 0x01, values.graphicsId);
    writeByte(ev.offset + 0x02, values.kind);
    writeByte(ev.offset + 0x03, values.movementType);
    writeS16(ev.offset + 0x04, values.x);
    writeS16(ev.offset + 0x06, values.y);
    writeByte(ev.offset + 0x08, values.elevation);
    writeByte(ev.offset + 0x09, (values.movementRangeX & 0x0F) | ((values.movementRangeY & 0x0F) << 4));
    writeWord(ev.offset + 0x0A, values.unknownA);
    writeWord(ev.offset + 0x0C, values.trainerType);
    writeWord(ev.offset + 0x0E, values.trainerRange);
    writeDword(ev.offset + 0x10, values.scriptPtr);
    writeWord(ev.offset + 0x14, values.flagId);
    writeWord(ev.offset + 0x16, values.unknown16);
  }

  function writeWarpEvent(ev, values) {
    ensureWriteRange(ev.offset, 0x08);
    writeCommonEventFields(ev, values);
    writeByte(ev.offset + 0x05, values.warpId);
    writeByte(ev.offset + 0x06, values.mapNum);
    writeByte(ev.offset + 0x07, values.mapGroup);
  }

  function writeBgEvent(ev, values) {
    ensureWriteRange(ev.offset, 0x0C);
    writeCommonEventFields(ev, values);
    writeByte(ev.offset + 0x05, values.kind);
    writeWord(ev.offset + 0x06, values.data0);
    writeDword(ev.offset + 0x08, values.scriptPtr);
  }

  function writeCoordEvent(ev, values) {
    ensureWriteRange(ev.offset, 0x10);
    writeCommonEventFields(ev, values);
    writeWord(ev.offset + 0x06, values.trigger);
    writeWord(ev.offset + 0x08, values.indexValue);
    writeDword(ev.offset + 0x0C, values.scriptPtr);
  }

  function writeEventToRom(ev, values) {
    if (ev.type === "object") writeObjectEvent(ev, values);
    else if (ev.type === "warp") writeWarpEvent(ev, values);
    else if (ev.type === "bg") writeBgEvent(ev, values);
    else if (ev.type === "coord") writeCoordEvent(ev, values);
    else throw new Error(`未知事件类型：${ev.type}`);
  }

  function findEventAfterReload(oldKey) {
    if (!Array.isArray(currentEvents)) return null;
    return currentEvents.find(e => eventKey(e) === oldKey) || null;
  }

  function refreshAfterWrite(oldKey) {
    if (currentMap && typeof loadMapEvents === "function") {
      currentEvents = loadMapEvents(currentMap);
    }

    if (currentMap && typeof renderMap === "function") {
      renderMap(currentMap, currentEvents);
    }

    const next = findEventAfterReload(oldKey);
    if (next) {
      selectedEventKey = eventKey(next);
      renderDetailView(next);
      setEditStatus("已应用修改。点击左上角“导出”保存到文件。", "ok");
    } else {
      selectedEventKey = null;
      renderListView(currentEvents || []);
    }
  }

  function applyEventEdit(ev) {
    try {
      if (!rom) throw new Error("尚未加载 ROM。无法写入。“应用修改”只修改内存中的 ROM，最后仍需导出文件。");
      const key = eventKey(ev);
      const values = collectEventValues(ev);
      writeEventToRom(ev, values);
      refreshAfterWrite(key);
    } catch (err) {
      setEditStatus(err?.message || String(err), "error");
    }
  }

  function showEventDetail(ev) {
    selectedEventKey = eventKey(ev);
    renderDetailView(ev);
  }

  function clearSelectedEvent() {
    selectedEventKey = null;
    renderListView(typeof currentEvents !== "undefined" ? currentEvents : []);
    renderWarpTools(null);
  }

  function renderWarpTools(ev) {
    // 新事件面板里 warp 检查直接显示在详情页；保留旧全局函数名，兼容 main/block-info 旧调用。
    const box = document.getElementById("warpTools");
    if (!box) return;
    box.className = "warp-tools empty";
    box.innerHTML = "";
  }

  function formatEventForDisplay(ev) {
    const copy = { ...ev };
    copy.offsetHex = hex(ev.offset);

    if (ev.scriptPtr !== undefined) copy.scriptPtrHex = hex(ev.scriptPtr);
    if (ev.scriptOff !== undefined && ev.scriptOff !== null) copy.scriptOffHex = hex(ev.scriptOff);

    if (ev.trainerBattle) {
      copy.trainerBattle = {
        ...ev.trainerBattle,
        introPtrHex: hex(ev.trainerBattle.introPtr),
        introOffHex: ev.trainerBattle.introOff !== null ? hex(ev.trainerBattle.introOff) : null,
        defeatPtrHex: hex(ev.trainerBattle.defeatPtr),
        defeatOffHex: ev.trainerBattle.defeatOff !== null ? hex(ev.trainerBattle.defeatOff) : null,
        afterPtrHex: hex(ev.trainerBattle.afterPtr),
        afterOffHex: ev.trainerBattle.afterOff !== null ? hex(ev.trainerBattle.afterOff) : null,
      };

      if (ev.trainerBattle.introOff !== null) {
        copy.trainerBattle.introText = decodePokemonText(ev.trainerBattle.introOff, 240);
      }

      if (ev.trainerBattle.defeatOff !== null) {
        copy.trainerBattle.defeatText = decodePokemonText(ev.trainerBattle.defeatOff, 240);
      }
    }

    const scriptAnalysis = getEventScriptAnalysis(ev);
    if (scriptAnalysis) {
      copy.scriptAnalysis = scriptAnalysis;
    }

    if (copy.trainerBattle?.afterOff !== null && copy.trainerBattle?.afterOff !== undefined) {
      copy.trainerBattle.afterScriptAnalysis = parseScriptBasic(copy.trainerBattle.afterOff, { maxCommands: 60, maxBytes: 360 });
    }

    if (ev.type === "warp") {
      const warpInfo = getWarpDestinationInfo(ev);
      copy.targetMap = warpInfo?.targetMap ? {
        mapGroup: warpInfo.targetMap.mapGroup,
        mapNum: warpInfo.targetMap.mapNum,
        mapId: warpInfo.targetMap.id,
        name: getMapDisplayNameWithCode(warpInfo.targetMap),
        headerOffHex: hex(warpInfo.targetMap.offset),
        size: `${warpInfo.targetMap.layout.width}x${warpInfo.targetMap.layout.height}`,
      } : null;
      copy.targetWarp = warpInfo?.targetWarp ? {
        index: warpInfo.targetWarp.index,
        x: warpInfo.targetWarp.x,
        y: warpInfo.targetWarp.y,
        elevation: warpInfo.targetWarp.elevation,
        offsetHex: hex(warpInfo.targetWarp.offset),
        mapGroup: warpInfo.targetWarp.mapGroup,
        mapNum: warpInfo.targetWarp.mapNum,
        warpId: warpInfo.targetWarp.warpId,
      } : null;
      copy.reverseCheck = warpInfo ? {
        status: warpInfo.status,
        statusText: warpInfo.statusText,
        reverseWarpCount: warpInfo.reverseWarps.length,
        exactReverseWarpIndex: warpInfo.exactReverseWarp ? warpInfo.exactReverseWarp.index : null,
      } : null;
    }

    return copy;
  }

  window.RBEditorEventPanel = {
    ensurePanel,
    render: () => renderEventList(typeof currentEvents !== "undefined" ? currentEvents : []),
    renderListView,
    renderDetailView,
    showEventDetail,
    clearSelectedEvent,
    renderEventSummary,
    applyEventEdit,
  };

  window.eventBadge = eventBadge;
  window.eventKey = eventKey;
  window.renderEventSummary = renderEventSummary;
  window.renderEventList = renderEventList;
  window.showEventDetail = showEventDetail;
  window.renderWarpTools = renderWarpTools;
  window.formatEventForDisplay = formatEventForDisplay;
})();
