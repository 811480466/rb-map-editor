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
      .event-secondary-btn {
        border: 1px solid #bfd1ec;
        background: #f7fbff;
        color: #16447d;
        border-radius: 7px;
        padding: 5px 9px;
        font-size: 12px;
        cursor: pointer;
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
      .event-readonly-input {
        min-width: 0;
        border: 1px solid #cbd9ed;
        border-radius: 6px;
        background: #f8fbff;
        color: #172033;
        padding: 5px 7px;
        font-size: 12px;
        font-family: Consolas, Monaco, monospace;
      }

      .event-field-value.readonly {
        border-color: transparent;
        background: transparent;
        padding-left: 0;
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
      ["object", `OBJ: ${c.object}`],
      ["trainer", `TRAINER: ${c.trainer}`],
      ["warp", `WARP: ${c.warp}`],
      ["bgCoord", `BG/COORD: ${c.bg + c.coord}`],
    ];

    el.className = "event-summary-filter";
    el.innerHTML = items.map(([key, label]) => {
      const active = key === "bgCoord"
        ? (eventTypeFilter === "bg" || eventTypeFilter === "coord")
        : eventTypeFilter === key;
      return `<button type="button" data-event-summary-filter="${key}" class="${active ? "active" : ""}">${escapeHtml(label)}</button>`;
    }).join("");

    for (const btn of el.querySelectorAll("button[data-event-summary-filter]")) {
      btn.onclick = () => {
        const key = btn.dataset.eventSummaryFilter;
        if (key === "bgCoord") {
          eventTypeFilter = (eventTypeFilter === "bg" || eventTypeFilter === "coord") ? "all" : "bg";
          renderListView(events || []);
          return;
        }
        toggleFilter(key, events);
      };
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

  function field(label, value, options = {}) {
    const text = value === null || value === undefined ? "" : String(value);
    return `
      <div class="event-field-label">${escapeHtml(label)}</div>
      <div class="event-field-value ${options.readonly === false ? "" : "readonly"}">${escapeHtml(text)}</div>
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

  function renderObjectFields(ev) {
    let body = "";
    body += field("localId", ev.localId);
    body += field("graphicsId", `${ev.graphicsId} / ${hex(ev.graphicsId, 2)}`);
    body += field("kind", ev.kind);
    body += field("movementType", ev.movementType);
    body += field("moveRangeX", ev.movementRangeX);
    body += field("moveRangeY", ev.movementRangeY);
    body += field("unknownA", `${ev.unknownA} / ${hex(ev.unknownA, 4)}`);
    body += field("trainerType", ev.trainerType);
    body += field("trainerRange", ev.trainerRange);
    body += field("flagId", `${ev.flagId} / ${hex(ev.flagId, 4)}`);
    body += field("unknown16", `${ev.unknown16} / ${hex(ev.unknown16, 4)}`);
    body += field("scriptPtr", hex(ev.scriptPtr));
    body += field("scriptOff", ev.scriptOff !== null ? hex(ev.scriptOff) : "null");

    if (ev.trainerBattle) {
      body += field("trainerId", ev.trainerBattle.trainerId);
      body += field("battleType", ev.trainerBattle.battleType);
    }

    return section("OBJ 参数", body);
  }

  function renderWarpFields(ev) {
    let body = "";
    body += field("mapGroup", ev.mapGroup);
    body += field("mapNum", ev.mapNum);
    body += field("warpId", ev.warpId);
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
    body += field("kind", ev.kind);
    body += field("data0", `${ev.data0} / ${hex(ev.data0, 4)}`);
    body += field("scriptPtr", hex(ev.scriptPtr));
    body += field("scriptOff", ev.scriptOff !== null ? hex(ev.scriptOff) : "null");
    return section("BG 参数", body);
  }

  function renderCoordFields(ev) {
    let body = "";
    body += field("trigger", `${ev.trigger} / ${hex(ev.trigger, 4)}`);
    body += field("indexValue", `${ev.indexValue} / ${hex(ev.indexValue, 4)}`);
    body += field("scriptPtr", hex(ev.scriptPtr));
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
    basic += field("x", ev.x);
    basic += field("y", ev.y);
    basic += field("elevation", ev.elevation);

    eventTab.innerHTML = `
      <div class="event-detail-head">
        <div class="event-detail-title-row">
          <div class="event-detail-title">${escapeHtml(title)}</div>
          <button id="eventBackToListBtn" class="event-back-btn" type="button">← 返回事件列表</button>
        </div>
        <div class="small">当前是只读属性页；下一步再加“应用修改”。</div>
      </div>
      ${section("基础信息", basic)}
      ${renderTypeFields(ev)}
      <details class="event-debug">
        <summary>调试 JSON</summary>
        <pre id="eventDetail">${escapeHtml(JSON.stringify(formatEventForDisplay(ev), null, 2))}</pre>
      </details>
      <div id="warpTools" class="warp-tools empty" style="display:none;"></div>
    `;

    document.getElementById("eventBackToListBtn")?.addEventListener("click", clearSelectedEvent);
    const jumpBtn = document.getElementById("jumpWarpTargetBtn");
    const jumpFocusBtn = document.getElementById("jumpWarpTargetFocusBtn");
    if (jumpBtn) jumpBtn.onclick = () => jumpToWarpTarget(ev, false);
    if (jumpFocusBtn) jumpFocusBtn.onclick = () => jumpToWarpTarget(ev, true);
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
  };

  window.eventBadge = eventBadge;
  window.eventKey = eventKey;
  window.renderEventSummary = renderEventSummary;
  window.renderEventList = renderEventList;
  window.showEventDetail = showEventDetail;
  window.renderWarpTools = renderWarpTools;
  window.formatEventForDisplay = formatEventForDisplay;
})();
