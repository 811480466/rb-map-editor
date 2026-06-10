// ============================================================
// Event right panel
// ============================================================
// 事件模式右侧面板：未选中事件时展示列表；选中单个事件时展示属性详情。

(function eventPanelModule() {
  let eventTypeFilter = "object";

  function injectStyle() {
    if (document.getElementById("eventPanelStyle")) return;
    const style = document.createElement("style");
    style.id = "eventPanelStyle";
    style.textContent = `
      .event-type-tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        align-items: center;
        gap: 0;
        border-bottom: 1px solid #d8e4f5;
      }

      .event-type-tabs button {
        display: block !important;
        min-width: 0;
        width: 100%;
        margin: 0 0 -1px;
        border: 0 !important;
        border-bottom: 2px solid transparent !important;
        background: transparent !important;
        color: #16447d !important;
        border-radius: 0;
        padding: 8px 2px;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
        white-space: nowrap;
        cursor: pointer;
      }

      .event-type-tabs button.active {
        border-bottom-color: #1f5fbf !important;
        color: #1f5fbf !important;
      }

      .event-tab-actions {
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 10px 0;
      }

      .event-tab-actions:empty {
        min-height: 0;
        margin: 8px 0 4px;
      }

      .event-warp-capacity {
        color: #566b88;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
      }

      #addWarpEventBtn {
        flex: 0 0 auto;
        width: auto;
        margin: 0;
        padding: 7px 12px;
        white-space: nowrap;
      }

      #addTrainerEventBtn {
        flex: 0 0 auto;
        width: auto;
        margin: 0;
        padding: 7px 12px;
        white-space: nowrap;
      }

      .warp-create-modal {
        max-width: 520px;
      }

      .trainer-create-modal {
        max-width: 560px;
      }

      .warp-create-modal form,
      .trainer-create-modal form {
        min-height: 0;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
      }

      .warp-create-modal .event-field-grid,
      .trainer-create-modal .event-field-grid {
        grid-template-columns: 110px minmax(0, 1fr);
      }

      .trainer-create-modal textarea {
        min-height: 64px;
        resize: vertical;
        font-family: Consolas, Monaco, monospace;
      }

      .warp-create-status,
      .trainer-create-status {
        min-height: 20px;
        margin-top: 10px;
        color: #566b88;
        font-size: 12px;
      }

      .warp-create-status.error,
      .trainer-create-status.error {
        color: #dc2626;
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

      .event-danger-btn {
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #b91c1c;
        border-radius: 7px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
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

  function eventFilterKey(ev) {
    if (ev?.type === "object") return ev.trainerBattle ? "trainer" : "object";
    if (ev?.type === "warp") return "warp";
    if (ev?.type === "bg" || ev?.type === "coord") return "bgCoord";
    return "object";
  }

  function getSelectedEvent() {
    if (typeof selectedEventKey === "undefined" || !selectedEventKey) return null;
    if (typeof currentEvents === "undefined" || !Array.isArray(currentEvents)) return null;
    return currentEvents.find(ev => eventKey(ev) === selectedEventKey) || null;
  }

  function countEvents(events) {
    return {
      all: events.length,
      object: events.filter(e => e.type === "object" && !e.trainerBattle).length,
      trainer: events.filter(e => e.type === "object" && e.trainerBattle).length,
      warp: events.filter(e => e.type === "warp").length,
      bg: events.filter(e => e.type === "bg").length,
      coord: events.filter(e => e.type === "coord").length,
    };
  }

  function filterEvents(events) {
    if (eventTypeFilter === "trainer") return events.filter(e => e.type === "object" && e.trainerBattle);
    if (eventTypeFilter === "object") return events.filter(e => e.type === "object" && !e.trainerBattle);
    if (eventTypeFilter === "bgCoord") return events.filter(e => e.type === "bg" || e.type === "coord");
    return events.filter(e => e.type === eventTypeFilter);
  }

  function selectEventType(key, events) {
    eventTypeFilter = key || "object";
    renderListView(events || []);
  }

  function renderEventSummary(events) {
    const el = document.getElementById("eventSummary");
    if (!el) return;
    const items = [
      ["object", "对象"],
      ["trainer", "训练家"],
      ["warp", "传送点"],
      ["bgCoord", "事件"],
    ];

    el.className = "event-type-tabs";
    el.setAttribute("role", "tablist");
    el.innerHTML = "";

    for (const [key, name] of items) {
      const active = eventTypeFilter === key;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.dataset.eventSummaryFilter = key;
      btn.className = active ? "active" : "";
      btn.textContent = name;
      btn.onclick = () => selectEventType(key, events);
      el.appendChild(btn);
    }
  }

  function getWarpCapacityInfo(events) {
    const manager = window.RBEditorWarpEventManager;
    const storage = currentMap && manager?.getStorageInfo ? manager.getStorageInfo(currentMap) : null;
    const count = storage?.count ?? countEvents(events || []).warp;
    const capacity = storage?.capacity ?? (count + (manager?.EXTRA_WARP_CAPACITY ?? 10));
    return { count, capacity };
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
    const warpCapacity = getWarpCapacityInfo(events);
    const warpActions = eventTypeFilter === "warp"
      ? `
        <span class="event-warp-capacity">传送点：${escapeHtml(warpCapacity.count)} / 最大 ${escapeHtml(warpCapacity.capacity)}</span>
        <button id="addWarpEventBtn" class="event-primary-btn" type="button" ${warpCapacity.count >= warpCapacity.capacity ? "disabled" : ""}>新增传送点</button>`
      : "";
    const trainerActions = eventTypeFilter === "trainer"
      ? `<button id="addTrainerEventBtn" class="event-primary-btn" type="button">新增训练家</button>`
      : "";

    eventTab.innerHTML = `
      <div id="eventSummary"></div>
      <div class="event-tab-actions">${warpActions}${trainerActions}</div>
      <div id="eventList"></div>
    `;

    renderEventSummary(events);
    document.getElementById("addWarpEventBtn")?.addEventListener("click", openAddWarpModal);
    document.getElementById("addTrainerEventBtn")?.addEventListener("click", openAddTrainerModal);

    const list = document.getElementById("eventList");
    const rows = filterEvents(events);
    if (!rows.length) {
      list.innerHTML = `<div class="empty-tip">当前分类没有数据。</div>`;
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
      ? `warpId=${info.targetWarpId} (${targetWarp.x}, ${targetWarp.y}) elevation=${targetWarp.elevation}`
      : `未找到目标 Warp warpId=${ev.warpId}`;
    const reverseText = info?.exactReverseWarp
      ? `精确返回 Warp：warpId=${info.exactReverseWarp.warpId} (${info.exactReverseWarp.x}, ${info.exactReverseWarp.y}) -> 当前 Warp 槽位 ${info.sourceWarpSlot}`
      : (info?.reverseWarps?.length
        ? `返回当前地图的候选：${info.reverseWarps.map(w => `Warp(${w.x},${w.y})->warpId=${w.warpId}`).join("，")}`
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

  function enhanceWarpInputs(ev) {
    if (!ev || ev.type !== "warp") return;
    const mapGroupInput = document.querySelector('#eventTab input[data-event-field="mapGroup"]');
    const mapNumInput = document.querySelector('#eventTab input[data-event-field="mapNum"]');
    const warpIdInput = document.querySelector('#eventTab input[data-event-field="warpId"]');
    if (!mapGroupInput || !mapNumInput || !warpIdInput) return;

    for (const input of [mapGroupInput, mapNumInput, warpIdInput]) {
      input.type = "number";
      input.step = "1";
      input.min = "0";
      input.max = "255";
    }

    function updateWarpIdRange() {
      const group = Number(mapGroupInput.value);
      const mapNum = Number(mapNumInput.value);
      const targetMap = Number.isInteger(group) && Number.isInteger(mapNum) ? findMapByGroupNum(group, mapNum) : null;
      const targetWarpCount = targetMap ? loadMapEvents(targetMap).filter(item => item.type === "warp").length : 0;
      const maxWarpId = targetWarpCount > 0 ? targetWarpCount - 1 : 255;
      warpIdInput.max = String(maxWarpId);
      warpIdInput.title = targetMap
        ? `目标地图 Warp 范围：0 ~ ${maxWarpId}`
        : "未找到目标地图，允许临时填写 0 ~ 255";
      warpIdInput.placeholder = targetMap ? `0 ~ ${maxWarpId}` : "0 ~ 255";
    }

    mapGroupInput.addEventListener("input", updateWarpIdRange);
    mapNumInput.addEventListener("input", updateWarpIdRange);
    updateWarpIdRange();
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
        ${ev.type === "warp" ? `<button id="deleteWarpEventBtn" class="event-danger-btn" type="button">删除传送点</button>` : ""}
        ${ev.type === "object" && ev.trainerBattle ? `<button id="deleteTrainerEventBtn" class="event-danger-btn" type="button">删除训练家</button>` : ""}
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
    document.getElementById("deleteWarpEventBtn")?.addEventListener("click", () => deleteWarpEvent(ev));
    document.getElementById("deleteTrainerEventBtn")?.addEventListener("click", () => deleteTrainerEvent(ev));

    for (const input of eventTab.querySelectorAll(".event-edit-input")) {
      input.addEventListener("input", () => setEditStatus("未应用修改。", ""));
    }
    enhanceWarpInputs(ev);

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

  function writeRawBytes(off, bytes) {
    ensureWriteRange(off, bytes.length);
    for (let i = 0; i < bytes.length; i++) writeByte(off + i, bytes[i]);
  }

  function allocateBytes(bytes, tag) {
    const allocator = window.RBEditorFreeSpace;
    if (!allocator?.allocate) throw new Error("空白区管理器不可用。");
    const off = allocator.allocate(bytes.length, { tag }).offset;
    writeRawBytes(off, bytes);
    return off;
  }

  function getManagedObjectStorage(dataOff) {
    if (!window.RBEditorFreeSpace?.isInManagedRegion?.(dataOff, OBJECT_EVENT_SIZE)) {
      return { managed: false, capacity: 0 };
    }

    const range = window.RBEditorFreeSpace?.getState?.().allocated
      ?.find(item => item.offset === dataOff && String(item.tag || "").startsWith("ObjectEvent["));
    if (!range) return { managed: false, capacity: 0 };

    const capacity = Math.floor(range.size / OBJECT_EVENT_SIZE);
    return { managed: capacity > 0, capacity };
  }

  function getObjectWritableCapacity(header, count = 0) {
    const storage = getManagedObjectStorage(header?.events?.objectOff ?? null);
    if (storage.managed) return storage.capacity;
    return Math.min(100, count + 10);
  }

  function normalizeObjectEvent(ev = {}) {
    return {
      localId: parseNum(ev.localId ?? 1, "localId", 0, 0xFF),
      graphicsId: parseNum(ev.graphicsId ?? 0, "graphicsId", 0, 0xFF),
      inConnection: parseNum(ev.inConnection ?? ev.kind ?? 0, "inConnection", 0, 0xFF),
      padding03: parseNum(ev.padding03 ?? 0, "padding03", 0, 0xFF),
      x: parseNum(ev.x ?? 0, "x", -32768, 32767),
      y: parseNum(ev.y ?? 0, "y", -32768, 32767),
      elevation: parseNum(ev.elevation ?? 0, "elevation", 0, 0xFF),
      movementType: parseNum(ev.movementType ?? 0, "movementType", 0, 0xFF),
      movementRangeX: parseNum(ev.movementRangeX ?? 0, "movementRangeX", 0, 0x0F),
      movementRangeY: parseNum(ev.movementRangeY ?? 0, "movementRangeY", 0, 0x0F),
      trainerType: parseNum(ev.trainerType ?? 0, "trainerType", 0, 0xFFFF),
      trainerRange: parseNum(ev.trainerRange ?? 0, "trainerRange", 0, 0xFFFF),
      scriptPtr: parseNum(ev.scriptPtr ?? 0, "scriptPtr", 0, 0xFFFFFFFF),
      flagId: parseNum(ev.flagId ?? 0, "flagId", 0, 0xFFFF),
      padding16: parseNum(ev.padding16 ?? ev.unknown16 ?? 0, "padding16", 0, 0xFFFF),
    };
  }

  function writeObjectEntry(off, object) {
    const ev = normalizeObjectEvent(object);
    const movementRangeRaw = (ev.movementRangeX & 0x0F) | ((ev.movementRangeY & 0x0F) << 4);
    ensureWriteRange(off, OBJECT_EVENT_SIZE);
    writeByte(off + 0x00, ev.localId);
    writeByte(off + 0x01, ev.graphicsId);
    writeByte(off + 0x02, ev.inConnection);
    writeByte(off + 0x03, ev.padding03);
    writeS16(off + 0x04, ev.x);
    writeS16(off + 0x06, ev.y);
    writeByte(off + 0x08, ev.elevation);
    writeByte(off + 0x09, ev.movementType);
    writeWord(off + 0x0A, movementRangeRaw);
    writeWord(off + 0x0C, ev.trainerType);
    writeWord(off + 0x0E, ev.trainerRange);
    writeDword(off + 0x10, ev.scriptPtr);
    writeWord(off + 0x14, ev.flagId);
    writeWord(off + 0x16, ev.padding16);
  }

  function clearObjectSlots(dataOff, capacity) {
    ensureWriteRange(dataOff, capacity * OBJECT_EVENT_SIZE);
    for (let i = 0; i < capacity * OBJECT_EVENT_SIZE; i++) writeByte(dataOff + i, 0);
  }

  function rewriteObjectArray(header, objects, options = {}) {
    if (!header?.events || !isValidOffset(header.events.offset, MAP_EVENTS_SIZE)) {
      throw new Error("MapEvents offset 无效。");
    }

    const requestedCapacity = parseNum(options.capacity ?? 0, "对象容量", 0, 100);
    const storage = getManagedObjectStorage(header.events.objectOff);
    const capacity = requestedCapacity || getObjectWritableCapacity(header, header.events.objectCount ?? objects.length);
    if (objects.length > capacity) throw new Error(`对象数量不能超过 ${capacity}。`);

    const canReuse = storage.managed && storage.capacity === capacity && objects.length <= storage.capacity;
    const dataOff = canReuse
      ? header.events.objectOff
      : window.RBEditorFreeSpace.allocate(capacity * OBJECT_EVENT_SIZE, { tag: `ObjectEvent[capacity=${capacity};extra=10]` }).offset;

    clearObjectSlots(dataOff, capacity);
    objects.forEach((object, index) => writeObjectEntry(dataOff + index * OBJECT_EVENT_SIZE, object));
    writeByte(header.events.offset + 0x00, objects.length);
    writeDword(header.events.offset + 0x04, offsetToPtr(dataOff));
    header.events = parseMapEvents(header.events.offset);
    return header.events;
  }

  function getNextLocalId(objects) {
    const used = new Set(objects.map(ev => Number(ev.localId)).filter(Number.isInteger));
    for (let id = 1; id <= 0xFF; id++) {
      if (!used.has(id)) return id;
    }
    throw new Error("当前地图没有可用 localId。");
  }

  function buildTrainerBattleScript(values, introPtr, defeatPtr, postBattlePtr) {
    const bytes = new Array(23).fill(0);
    bytes[0] = 0x5C;
    bytes[1] = 0;
    const trainerId = values.trainerId & 0xFFFF;
    const localId = values.localId & 0xFFFF;
    bytes[2] = trainerId & 0xFF;
    bytes[3] = (trainerId >> 8) & 0xFF;
    bytes[4] = localId & 0xFF;
    bytes[5] = (localId >> 8) & 0xFF;
    for (const [base, ptr] of [[6, introPtr >>> 0], [10, defeatPtr >>> 0]]) {
      bytes[base] = ptr & 0xFF;
      bytes[base + 1] = (ptr >> 8) & 0xFF;
      bytes[base + 2] = (ptr >> 16) & 0xFF;
      bytes[base + 3] = (ptr >> 24) & 0xFF;
    }
    const postPtr = postBattlePtr >>> 0;
    bytes[14] = 0x0F; // loadword
    bytes[15] = 0x00;
    bytes[16] = postPtr & 0xFF;
    bytes[17] = (postPtr >> 8) & 0xFF;
    bytes[18] = (postPtr >> 16) & 0xFF;
    bytes[19] = (postPtr >> 24) & 0xFF;
    bytes[20] = 0x09; // callstd
    bytes[21] = 0x06; // Std_MsgboxAutoclose
    bytes[22] = 0x02; // end
    return bytes;
  }

  function addTrainerEventToMap(header, values) {
    if (!rom) throw new Error("尚未加载 ROM。");
    if (!header) throw new Error("请先选择地图。");

    const objects = loadMapEvents(header).filter(ev => ev.type === "object").map(normalizeObjectEvent);
    const capacity = getObjectWritableCapacity(header, objects.length);
    if (objects.length >= capacity) throw new Error(`当前地图对象已达最大数量 ${capacity}。`);

    const introBytes = encodePokemonEnglishText(values.introText || "...");
    const defeatBytes = encodePokemonEnglishText(values.defeatText || "...");
    const postBattleBytes = encodePokemonEnglishText(values.postBattleText || values.defeatText || "...");
    const introOff = allocateBytes(introBytes, "TrainerIntroText");
    const defeatOff = allocateBytes(defeatBytes, "TrainerDefeatText");
    const postBattleOff = allocateBytes(postBattleBytes, "TrainerPostBattleText");
    const scriptOff = allocateBytes(
      buildTrainerBattleScript(values, offsetToPtr(introOff), offsetToPtr(defeatOff), offsetToPtr(postBattleOff)),
      "TrainerBattleScript"
    );

    objects.push({
      localId: values.localId,
      graphicsId: values.graphicsId,
      inConnection: 0,
      padding03: 0,
      x: values.x,
      y: values.y,
      elevation: values.elevation,
      movementType: values.movementType,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: values.trainerType,
      trainerRange: values.trainerRange,
      scriptPtr: offsetToPtr(scriptOff),
      flagId: values.flagId,
      padding16: 0,
    });

    rewriteObjectArray(header, objects, { capacity });
    return objects.length - 1;
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

  function refreshAfterWarpArrayChange(focusWarpIndex = null) {
    if (currentMap && typeof loadMapEvents === "function") {
      currentEvents = loadMapEvents(currentMap);
    }

    if (currentMap && typeof renderMap === "function") {
      renderMap(currentMap, currentEvents);
    }

    if (focusWarpIndex !== null) {
      const ev = (currentEvents || []).find(e => e.type === "warp" && e.index === focusWarpIndex);
      if (ev) {
        selectedEventKey = eventKey(ev);
        renderDetailView(ev);
        setEditStatus("已新增传送点。点击左上角“导出”保存到文件。", "ok");
        return;
      }
    }

    selectedEventKey = null;
    renderListView(currentEvents || []);
  }

  function refreshAfterTrainerArrayChange(focusObjectIndex = null) {
    if (currentMap && typeof loadMapEvents === "function") {
      currentEvents = loadMapEvents(currentMap);
    }

    if (currentMap && typeof renderMap === "function") {
      renderMap(currentMap, currentEvents);
    }

    eventTypeFilter = "trainer";
    if (focusObjectIndex !== null) {
      const ev = (currentEvents || []).find(e => e.type === "object" && e.index === focusObjectIndex);
      if (ev) {
        selectedEventKey = eventKey(ev);
        renderDetailView(ev);
        setEditStatus("已新增训练家。点击左上角“导出”保存到文件。", "ok");
        return;
      }
    }

    selectedEventKey = null;
    renderListView(currentEvents || []);
  }

  function renderValueLabelOptions(labels, currentValue = 0) {
    const entries = Object.entries(labels || {});
    const current = Number(currentValue);
    const seen = new Set(entries.map(([raw]) => Number(raw)));
    let html = entries.map(([raw, label]) => {
      const value = Number(raw);
      const selected = value === current ? " selected" : "";
      return `<option value="${value}"${selected}>${escapeHtml(hex(value, 2))} ${escapeHtml(label)}</option>`;
    }).join("");

    if (!seen.has(current)) {
      html += `<option value="${current}" selected>${escapeHtml(hex(current, 2))} 未知类型</option>`;
    }
    return html;
  }

  function renderTrainerMovementOptions(currentValue = 0) {
    return renderValueLabelOptions(window.RBEditorMovementTypeSelect?.MOVEMENT_TYPE_LABELS, currentValue);
  }

  function renderTrainerTypeOptions(currentValue = 1) {
    return renderValueLabelOptions(window.RBEditorTrainerTypeSelect?.TRAINER_TYPE_LABELS, currentValue);
  }

  function getTrainerGraphicsList() {
    const list = window.RBEditorObjectEventGraphicsData;
    return Array.isArray(list) ? list : [];
  }

  function formatObjectGraphicsLabel(itemOrId) {
    const list = getTrainerGraphicsList();
    const item = typeof itemOrId === "object"
      ? itemOrId
      : list.find(v => Number(v.id) === Number(itemOrId));
    const id = Number(item?.id ?? itemOrId);
    if (!item) return `${hex(id, 2)} 未知对象图形`;
    return `${hex(id, 2)} ${item.name || item.macro || "对象"}${item.macro ? ` / ${item.macro}` : ""}`;
  }

  function installAddTrainerGraphicsDropdown(value) {
    const host = document.getElementById("addTrainerGraphicsHost");
    if (!host) return;

    const currentValue = Number(value) || 0;
    const Dropdown = window.RBEditorSearchableDropdown;
    const options = getTrainerGraphicsList();
    host.innerHTML = "";

    if (!Dropdown || !options.length) {
      host.innerHTML = `<input id="addTrainerGraphicsId" class="event-edit-input" type="number" min="0" max="255" step="1" value="${escapeHtml(currentValue)}" />`;
      return;
    }

    const dropdown = new Dropdown({
      container: host,
      value: currentValue,
      options,
      fieldName: "graphicsId",
      hiddenClassName: "event-edit-input",
      placeholder: "搜索对象 ID / 名称 / 宏名",
      getValue: item => Number(item.id),
      getLabel: item => formatObjectGraphicsLabel(item),
      getSearchText: item => `${item.id} ${hex(item.id, 2)} ${item.name || ""} ${item.macro || ""}`,
    });
    dropdown.getHiddenInput().id = "addTrainerGraphicsId";
  }

  function ensureAddTrainerModal() {
    let modal = document.getElementById("addTrainerModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "addTrainerModal";
    modal.className = "modal-backdrop";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal trainer-create-modal" role="dialog" aria-modal="true" aria-labelledby="addTrainerModalTitle">
        <div class="modal-header">
          <div>
            <h2 id="addTrainerModalTitle" class="modal-title">新增训练家</h2>
            <div id="addTrainerModalSubtitle" class="modal-subtitle"></div>
          </div>
          <button type="button" class="modal-close" data-action="close-add-trainer" aria-label="关闭">×</button>
        </div>
        <form id="addTrainerForm">
          <div class="modal-body">
            <div class="event-field-grid">
              <label class="event-field-label" for="addTrainerLocalId">对象ID</label>
              <input id="addTrainerLocalId" class="event-edit-input" type="number" min="0" max="255" step="1" />
              <label class="event-field-label" for="addTrainerX">坐标 X</label>
              <input id="addTrainerX" class="event-edit-input" type="number" min="-32768" max="32767" step="1" />
              <label class="event-field-label" for="addTrainerY">坐标 Y</label>
              <input id="addTrainerY" class="event-edit-input" type="number" min="-32768" max="32767" step="1" />
              <label class="event-field-label" for="addTrainerElevation">高度/层级</label>
              <input id="addTrainerElevation" class="event-edit-input" type="number" min="0" max="255" step="1" />
              <label class="event-field-label" for="addTrainerGraphicsId">图形</label>
              <div id="addTrainerGraphicsHost"></div>
              <label class="event-field-label" for="addTrainerMovementType">移动类型</label>
              <select id="addTrainerMovementType" class="event-edit-input">${renderTrainerMovementOptions(0)}</select>
              <label class="event-field-label" for="addTrainerType">训练家类型</label>
              <select id="addTrainerType" class="event-edit-input">${renderTrainerTypeOptions(1)}</select>
              <label class="event-field-label" for="addTrainerRange">视野/树果</label>
              <input id="addTrainerRange" class="event-edit-input" type="number" min="0" max="65535" step="1" />
              <label class="event-field-label" for="addTrainerId">训练家ID</label>
              <input id="addTrainerId" class="event-edit-input" type="number" min="0" max="65535" step="1" />
              <label class="event-field-label" for="addTrainerFlagId">事件Flag</label>
              <input id="addTrainerFlagId" class="event-edit-input" type="number" min="0" max="65535" step="1" />
              <label class="event-field-label" for="addTrainerIntroText">开战对话</label>
              <textarea id="addTrainerIntroText" class="event-edit-input" spellcheck="false"></textarea>
              <label class="event-field-label" for="addTrainerDefeatText">战败对话</label>
              <textarea id="addTrainerDefeatText" class="event-edit-input" spellcheck="false"></textarea>
              <label class="event-field-label" for="addTrainerPostBattleText">战后对话</label>
              <textarea id="addTrainerPostBattleText" class="event-edit-input" spellcheck="false"></textarea>
            </div>
            <div id="addTrainerStatus" class="trainer-create-status">第一版会绑定已有训练家ID，并创建普通单打训练家战斗脚本。</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="secondary-btn" data-action="cancel-add-trainer">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => closeAddTrainerModal();
    modal.querySelector("[data-action='close-add-trainer']").onclick = close;
    modal.querySelector("[data-action='cancel-add-trainer']").onclick = close;
    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
    modal.querySelector("#addTrainerForm").addEventListener("submit", event => {
      event.preventDefault();
      saveNewTrainerEvent();
    });
    return modal;
  }

  function closeAddTrainerModal() {
    const modal = document.getElementById("addTrainerModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.__sourceMap = null;
  }

  function setAddTrainerStatus(message, isError = false) {
    const status = document.getElementById("addTrainerStatus");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("error", isError);
  }

  function openAddTrainerModal() {
    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!currentMap) throw new Error("请先选择地图。");
      if (!window.RBEditorFreeSpace?.allocate) throw new Error("空白区管理器不可用。");

      const objects = loadMapEvents(currentMap).filter(ev => ev.type === "object");
      const trainers = objects.filter(ev => ev.trainerBattle);
      const capacity = getObjectWritableCapacity(currentMap, objects.length);
      if (objects.length >= capacity) throw new Error(`当前地图对象已达最大数量 ${capacity}。`);

      const previousTrainer = trainers[trainers.length - 1] || {};
      const modal = ensureAddTrainerModal();
      modal.__sourceMap = currentMap;
      modal.querySelector("#addTrainerModalSubtitle").textContent = getMapDisplayNameWithCode(currentMap);
      modal.querySelector("#addTrainerLocalId").value = String(getNextLocalId(objects));
      modal.querySelector("#addTrainerX").value = String(previousTrainer.x ?? Math.floor((currentMap.layout?.width ?? 0) / 2));
      modal.querySelector("#addTrainerY").value = String(previousTrainer.y ?? Math.floor((currentMap.layout?.height ?? 0) / 2));
      modal.querySelector("#addTrainerElevation").value = String(previousTrainer.elevation ?? 0);
      installAddTrainerGraphicsDropdown(previousTrainer.graphicsId ?? 1);
      modal.querySelector("#addTrainerMovementType").value = String(previousTrainer.movementType ?? 0);
      modal.querySelector("#addTrainerType").value = String(previousTrainer.trainerType ?? 1);
      modal.querySelector("#addTrainerRange").value = String(previousTrainer.trainerRange ?? 3);
      modal.querySelector("#addTrainerId").value = String(previousTrainer.trainerBattle?.trainerId ?? 0);
      modal.querySelector("#addTrainerFlagId").value = String(previousTrainer.flagId ?? 0);
      modal.querySelector("#addTrainerIntroText").value = "Let's battle!";
      modal.querySelector("#addTrainerDefeatText").value = "I lost!";
      modal.querySelector("#addTrainerPostBattleText").value = "Let's battle again sometime!";
      setAddTrainerStatus("第一版会绑定已有训练家ID，并创建普通单打训练家战斗脚本。");
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      modal.querySelector("#addTrainerLocalId").focus();
    } catch (err) {
      alert(err?.message || String(err));
    }
  }

  function saveNewTrainerEvent() {
    const modal = document.getElementById("addTrainerModal");
    const sourceMap = modal?.__sourceMap;

    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!modal || !sourceMap || sourceMap !== currentMap) {
        throw new Error("当前地图已经变化，请关闭弹窗后重新新增训练家。");
      }

      const values = {
        localId: parseNum(modal.querySelector("#addTrainerLocalId")?.value, "对象ID", 0, 0xFF),
        x: parseNum(modal.querySelector("#addTrainerX")?.value, "坐标 X", -32768, 32767),
        y: parseNum(modal.querySelector("#addTrainerY")?.value, "坐标 Y", -32768, 32767),
        elevation: parseNum(modal.querySelector("#addTrainerElevation")?.value, "高度/层级", 0, 0xFF),
        graphicsId: parseNum(modal.querySelector("#addTrainerGraphicsId")?.value, "图形", 0, 0xFF),
        movementType: parseNum(modal.querySelector("#addTrainerMovementType")?.value, "移动类型", 0, 0xFF),
        trainerType: parseNum(modal.querySelector("#addTrainerType")?.value, "训练家类型", 0, 0xFFFF),
        trainerRange: parseNum(modal.querySelector("#addTrainerRange")?.value, "视野/树果", 0, 0xFFFF),
        trainerId: parseNum(modal.querySelector("#addTrainerId")?.value, "训练家ID", 0, 0xFFFF),
        flagId: parseNum(modal.querySelector("#addTrainerFlagId")?.value, "事件Flag", 0, 0xFFFF),
        introText: modal.querySelector("#addTrainerIntroText")?.value || "",
        defeatText: modal.querySelector("#addTrainerDefeatText")?.value || "",
        postBattleText: modal.querySelector("#addTrainerPostBattleText")?.value || "",
      };

      const objects = loadMapEvents(sourceMap).filter(ev => ev.type === "object");
      if (objects.some(ev => ev.localId === values.localId)) throw new Error(`对象ID ${values.localId} 已存在。`);

      const index = addTrainerEventToMap(sourceMap, values);
      closeAddTrainerModal();
      refreshAfterTrainerArrayChange(index);
    } catch (err) {
      const message = String(err?.message || err).replace("区域名称包含不支持的字符", "对话文本包含不支持的字符");
      setAddTrainerStatus(message, true);
    }
  }

  function deleteTrainerEvent(ev) {
    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!currentMap) throw new Error("请先选择地图。");
      if (!ev || ev.type !== "object" || !ev.trainerBattle) throw new Error("当前选中的不是训练家。");

      const objectsRaw = loadMapEvents(currentMap).filter(item => item.type === "object");
      const current = objectsRaw[ev.index];
      if (!current || !current.trainerBattle || current.localId !== ev.localId) {
        throw new Error("训练家数据已变化，请重新选择后再删除。");
      }

      if (!confirm(`确定删除训练家 #${ev.index} 吗？\n对象ID ${ev.localId}、训练家ID ${ev.trainerBattle.trainerId} 将从当前地图移除。`)) return;

      const capacity = getObjectWritableCapacity(currentMap, objectsRaw.length);
      const objects = objectsRaw.map(normalizeObjectEvent);
      objects.splice(ev.index, 1);
      rewriteObjectArray(currentMap, objects, { capacity });
      refreshAfterTrainerArrayChange(null);
    } catch (err) {
      setEditStatus(err?.message || String(err), "error");
    }
  }

  function ensureAddWarpModal() {
    let modal = document.getElementById("addWarpModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "addWarpModal";
    modal.className = "modal-backdrop";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal warp-create-modal" role="dialog" aria-modal="true" aria-labelledby="addWarpModalTitle">
        <div class="modal-header">
          <div>
            <h2 id="addWarpModalTitle" class="modal-title">新增传送点</h2>
            <div id="addWarpModalSubtitle" class="modal-subtitle"></div>
          </div>
          <button type="button" class="modal-close" data-action="close-add-warp" aria-label="关闭">×</button>
        </div>
        <form id="addWarpForm">
          <div class="modal-body">
            <div class="event-field-grid">
              <label class="event-field-label" for="addWarpX">x</label>
              <input id="addWarpX" class="event-edit-input" type="number" min="-32768" max="32767" step="1" />
              <label class="event-field-label" for="addWarpY">y</label>
              <input id="addWarpY" class="event-edit-input" type="number" min="-32768" max="32767" step="1" />
              <label class="event-field-label" for="addWarpElevation">elevation</label>
              <input id="addWarpElevation" class="event-edit-input" type="number" min="0" max="255" step="1" />
              <label class="event-field-label" for="addWarpGroup">目标 Group</label>
              <input id="addWarpGroup" class="event-edit-input" type="number" min="0" max="255" step="1" />
              <label class="event-field-label" for="addWarpMap">目标 Map</label>
              <input id="addWarpMap" class="event-edit-input" type="number" min="0" max="255" step="1" />
              <label class="event-field-label" for="addWarpId">目标 warpId</label>
              <input id="addWarpId" class="event-edit-input" type="number" min="0" max="255" step="1" />
            </div>
            <div id="addWarpStatus" class="warp-create-status"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="secondary-btn" data-action="cancel-add-warp">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => closeAddWarpModal();
    modal.querySelector("[data-action='close-add-warp']").onclick = close;
    modal.querySelector("[data-action='cancel-add-warp']").onclick = close;
    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
    modal.querySelector("#addWarpForm").addEventListener("submit", event => {
      event.preventDefault();
      saveNewWarpEvent();
    });
    return modal;
  }

  function closeAddWarpModal() {
    const modal = document.getElementById("addWarpModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.__sourceMap = null;
  }

  function setAddWarpStatus(message, isError = false) {
    const status = document.getElementById("addWarpStatus");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("error", isError);
  }

  function openAddWarpModal() {
    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!currentMap) throw new Error("请先选择地图。");
      const manager = window.RBEditorWarpEventManager;
      if (!manager?.addWarpEvent) throw new Error("Warp 管理器不可用。");

      const storage = manager.getStorageInfo?.(currentMap);
      if ((storage?.count ?? 0) >= (storage?.capacity ?? 10)) {
        throw new Error(`当前地图传送点已达最大数量 ${storage?.capacity ?? 10}。`);
      }

      const events = typeof currentEvents !== "undefined" && Array.isArray(currentEvents) ? currentEvents : [];
      const warps = events.filter(ev => ev.type === "warp");
      const previous = warps[warps.length - 1] || {};
      const modal = ensureAddWarpModal();
      modal.__sourceMap = currentMap;
      modal.querySelector("#addWarpModalSubtitle").textContent = getMapDisplayNameWithCode(currentMap);
      modal.querySelector("#addWarpX").value = String(previous.x ?? 0);
      modal.querySelector("#addWarpY").value = String(previous.y ?? 0);
      modal.querySelector("#addWarpElevation").value = String(previous.elevation ?? 0);
      modal.querySelector("#addWarpGroup").value = String(currentMap.mapGroup ?? 0);
      modal.querySelector("#addWarpMap").value = String(currentMap.mapNum ?? 0);
      modal.querySelector("#addWarpId").value = "0";
      setAddWarpStatus("");
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      modal.querySelector("#addWarpX").focus();
    } catch (err) {
      alert(err?.message || String(err));
    }
  }

  function saveNewWarpEvent() {
    const modal = document.getElementById("addWarpModal");
    const sourceMap = modal?.__sourceMap;

    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!modal || !sourceMap || sourceMap !== currentMap) {
        throw new Error("当前地图已经变化，请关闭弹窗后重新新增传送点。");
      }

      const manager = window.RBEditorWarpEventManager;
      if (!manager?.addWarpEvent) throw new Error("Warp 管理器不可用。");
      const values = {
        x: parseNum(modal.querySelector("#addWarpX")?.value, "x", -32768, 32767),
        y: parseNum(modal.querySelector("#addWarpY")?.value, "y", -32768, 32767),
        elevation: parseNum(modal.querySelector("#addWarpElevation")?.value, "elevation", 0, 0xFF),
        mapGroup: parseNum(modal.querySelector("#addWarpGroup")?.value, "目标 Group", 0, 0xFF),
        mapNum: parseNum(modal.querySelector("#addWarpMap")?.value, "目标 Map", 0, 0xFF),
        warpId: parseNum(modal.querySelector("#addWarpId")?.value, "目标 warpId", 0, 0xFF),
      };
      const index = manager.addWarpEvent(sourceMap, values);
      closeAddWarpModal();
      refreshAfterWarpArrayChange(index);
    } catch (err) {
      setAddWarpStatus(err?.message || String(err), true);
    }
  }

  function deleteWarpEvent(ev) {
    try {
      if (!rom) throw new Error("尚未加载 ROM。");
      if (!currentMap) throw new Error("请先选择地图。");
      if (!ev || ev.type !== "warp") throw new Error("当前选中的不是传送点。");
      const manager = window.RBEditorWarpEventManager;
      if (!manager?.deleteWarpEvent) throw new Error("Warp 管理器不可用。");
      const refs = manager.findIncomingWarpReferences?.(currentMap, ev.index) || [];
      const deletedRefs = refs.filter(ref => ref.relation === "deleted").length;
      const shiftedRefs = refs.filter(ref => ref.relation === "shifted").length;
      const warning = deletedRefs
        ? `\n注意：有 ${deletedRefs} 个传送点正好指向被删除的 Warp，删除后需要重新确认它们的目标。`
        : "";
      if (!confirm(`确定删除传送点 #${ev.index} 吗？\n将自动修正 ${shiftedRefs} 个指向后续 Warp 的 warpId。${warning}`)) return;
      const result = manager.deleteWarpEvent(currentMap, ev.index);
      refreshAfterWarpArrayChange(null);
      if (result?.deletedRefs) {
        alert(`删除完成，并修正了 ${result.shiftedRefs} 个后续 warpId。\n仍有 ${result.deletedRefs} 个引用原本指向被删除的 Warp，请重新检查目标。`);
      }
    } catch (err) {
      setEditStatus(err?.message || String(err), "error");
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
    eventTypeFilter = eventFilterKey(ev);
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
        targetWarpId: warpInfo.targetWarpId,
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
        exactReverseWarpId: warpInfo.exactReverseWarp ? warpInfo.exactReverseWarp.warpId : null,
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
