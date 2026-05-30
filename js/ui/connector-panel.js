// ============================================================
// Connector panel
// ============================================================
// 地图连接器模式右侧面板。
// 不依赖定时器和内部 active 标记；mode-controller 点击地图连接器时直接调用 render() 即显示。

(function connectorPanelModule() {
  function writeS32LE(off, value) {
    const v = Number(value) | 0;
    rom[off] = v & 0xFF;
    rom[off + 1] = (v >> 8) & 0xFF;
    rom[off + 2] = (v >> 16) & 0xFF;
    rom[off + 3] = (v >> 24) & 0xFF;
  }

  function normalizeByte(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(255, Math.trunc(n)));
  }

  function normalizeS32(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(-2147483648, Math.min(2147483647, Math.trunc(n)));
  }

  function ensurePanel() {
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return null;

    let panel = document.getElementById("mapConnectorPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "mapConnectorPanel";
      panel.className = "connector-panel";
      rightPanel.appendChild(panel);
    }
    return panel;
  }

  function setRightPanelConnectorOnly() {
    const rightPanel = document.querySelector(".panel.right");
    const panel = ensurePanel();
    if (!rightPanel || !panel) return;

    for (const child of Array.from(rightPanel.children)) {
      child.style.display = child === panel ? "block" : "none";
    }
    panel.classList.add("active");
  }

  function restoreRightPanel() {
    const rightPanel = document.querySelector(".panel.right");
    const panel = document.getElementById("mapConnectorPanel");
    if (!rightPanel || !panel) return;
    panel.classList.remove("active");
    panel.style.display = "none";
  }

  function updateConnection(index) {
    if (!currentMap) return;

    const parsed = parseMapConnections(currentMap.connectionsPtr);
    const conn = parsed.list.find(c => c.index === Number(index));
    if (!conn || !isValidOffset(conn.offset, MAP_CONNECTION_SIZE)) return;

    const direction = normalizeByte(document.getElementById(`fixConnDirection_${index}`)?.value);
    const offset = normalizeS32(document.getElementById(`fixConnOffset_${index}`)?.value);
    const mapGroup = normalizeByte(document.getElementById(`fixConnGroup_${index}`)?.value);
    const mapNum = normalizeByte(document.getElementById(`fixConnMap_${index}`)?.value);

    if (direction === null || offset === null || mapGroup === null || mapNum === null) {
      alert("连接参数格式不正确。");
      return;
    }

    rom[conn.offset + 0x00] = direction & 0xFF;
    writeS32LE(conn.offset + 0x04, offset);
    rom[conn.offset + 0x08] = mapGroup & 0xFF;
    rom[conn.offset + 0x09] = mapNum & 0xFF;

    currentMap.connectionsParsed = parseMapConnections(currentMap.connectionsPtr);
    renderConnectionEdgeNav(currentMap);
    if (currentMap) renderMap(currentMap, currentEvents);
    renderConnectorPanel();
  }

  function renderConnectorPanel() {
    const panel = ensurePanel();
    if (!panel) return;

    setRightPanelConnectorOnly();

    if (!currentMap) {
      panel.innerHTML = `<h2>地图连接器</h2><div class="empty-tip">请先选择地图。</div>`;
      return;
    }

    const parsed = parseMapConnections(currentMap.connectionsPtr);
    currentMap.connectionsParsed = parsed;
    const connections = parsed.list || [];

    let html = `
      <h2>地图连接器</h2>
      <div class="connector-head">
        <div><b>当前地图：</b>${escapeHtml(getMapDisplayNameWithCode(currentMap))}</div>
        <div>mapGroup=${currentMap.mapGroup ?? "?"} / mapNum=${currentMap.mapNum ?? "?"}</div>
        <div>connectionsPtr=${escapeHtml(hex(currentMap.connectionsPtr))}</div>
        <div>header=${parsed.offset !== null && parsed.offset !== undefined ? escapeHtml(hex(parsed.offset)) : "null"} / data=${parsed.dataOff !== null && parsed.dataOff !== undefined ? escapeHtml(hex(parsed.dataOff)) : "null"} / count=${parsed.count} / status=${escapeHtml(parsed.status)}</div>
      </div>`;

    if (!connections.length) {
      panel.innerHTML = html + `<div class="empty-tip">当前地图没有连接信息。</div>`;
      return;
    }

    html += connections.map(conn => {
      const info = getConnectionDestinationInfo(conn, currentMap);
      const targetName = info?.targetMap ? getMapDisplayNameWithCode(info.targetMap) : "未匹配地图";
      const statusClass = info?.status === "ok" ? "warp-ok" : (info?.status === "bad" ? "warp-bad" : "warp-warn");
      return `
        <div class="connector-card" data-conn-index="${conn.index}">
          <div class="connector-card-title">
            <span>#${conn.index} ${escapeHtml(connectionDirectionName(conn.direction))}</span>
            <span class="${statusClass}">${escapeHtml(info?.statusText || "未能判断")}</span>
          </div>
          <div class="connector-grid">
            <label>方向</label>
            <select id="fixConnDirection_${conn.index}">
              ${[1,2,3,4,5,6].map(d => `<option value="${d}" ${conn.direction === d ? "selected" : ""}>${escapeHtml(connectionDirectionName(d))}</option>`).join("")}
            </select>
            <label>偏移</label>
            <input id="fixConnOffset_${conn.index}" type="number" value="${conn.connectionOffset}" />
            <label>目标Group</label>
            <input id="fixConnGroup_${conn.index}" type="number" min="0" max="255" value="${conn.mapGroup}" />
            <label>目标Map</label>
            <input id="fixConnMap_${conn.index}" type="number" min="0" max="255" value="${conn.mapNum}" />
          </div>
          <div class="connector-info">
            <div>目标：${escapeHtml(targetName)}</div>
            <div>结构 offset=${escapeHtml(hex(conn.offset))}</div>
          </div>
          <div class="connector-actions">
            <button type="button" data-action="save-connector" data-index="${conn.index}">保存修改</button>
            <button type="button" class="secondary-btn" data-action="jump-connector" data-index="${conn.index}" ${info?.targetMap ? "" : "disabled"}>跳转目标地图</button>
          </div>
        </div>`;
    }).join("");

    panel.innerHTML = html;

    for (const btn of panel.querySelectorAll("button[data-action='save-connector']")) {
      btn.onclick = () => updateConnection(btn.dataset.index);
    }

    for (const btn of panel.querySelectorAll("button[data-action='jump-connector']")) {
      btn.onclick = () => {
        const parsedNow = parseMapConnections(currentMap.connectionsPtr);
        const conn = parsedNow.list.find(c => c.index === Number(btn.dataset.index));
        if (conn) jumpToConnectionTarget(conn);
      };
    }
  }

  function install() {
    const oldSelectMap = window.selectMap || (typeof selectMap === "function" ? selectMap : null);
    if (oldSelectMap && !oldSelectMap.__connectorPanelWrapped) {
      const wrapped = function selectMapConnectorPanel(...args) {
        const result = oldSelectMap.apply(this, args);
        if ((window.RBEditorState?.mode || "") === "connections") renderConnectorPanel();
        return result;
      };
      wrapped.__connectorPanelWrapped = true;
      try { selectMap = wrapped; } catch (err) { window.selectMap = wrapped; }
      window.selectMap = wrapped;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorConnectorPanel = {
    render: renderConnectorPanel,
    restore: restoreRightPanel,
  };
})();
