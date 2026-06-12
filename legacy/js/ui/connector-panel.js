// ============================================================
// Connector panel
// ============================================================
// 地图连接器模式右侧面板。
// 不依赖定时器和内部 active 标记；mode-controller 点击地图连接器时直接调用 render() 即显示。

(function connectorPanelModule() {
  const MANAGED_CONNECTION_CAPACITY = 6;
  const MANAGED_CONNECTION_BYTES = MANAGED_CONNECTION_CAPACITY * MAP_CONNECTION_SIZE;

  function writeS32LE(off, value) {
    const v = Number(value) | 0;
    rom[off] = v & 0xFF;
    rom[off + 1] = (v >> 8) & 0xFF;
    rom[off + 2] = (v >> 16) & 0xFF;
    rom[off + 3] = (v >> 24) & 0xFF;
  }

  function writeU32LE(off, value) {
    const v = Number(value) >>> 0;
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

  function parseIntegerInRange(value, min, max) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) return null;
    return n;
  }

  function normalizeConnection(conn, fallbackIndex = 0) {
    return {
      index: fallbackIndex,
      direction: normalizeByte(conn?.direction) ?? 4,
      connectionOffset: normalizeS32(conn?.connectionOffset ?? conn?.offset) ?? 0,
      mapGroup: normalizeByte(conn?.mapGroup) ?? 0,
      mapNum: normalizeByte(conn?.mapNum) ?? 0,
    };
  }

  function writeConnectionEntry(off, conn) {
    if (!isValidOffset(off, MAP_CONNECTION_SIZE)) {
      throw new Error(`MapConnection 写入范围无效：${hex(off)}`);
    }

    rom[off + 0x00] = conn.direction & 0xFF;
    rom[off + 0x01] = 0;
    rom[off + 0x02] = 0;
    rom[off + 0x03] = 0;
    writeS32LE(off + 0x04, conn.connectionOffset);
    rom[off + 0x08] = conn.mapGroup & 0xFF;
    rom[off + 0x09] = conn.mapNum & 0xFF;
    rom[off + 0x0A] = 0;
    rom[off + 0x0B] = 0;
  }

  function clearConnectionSlots(dataOff) {
    for (let i = 0; i < MANAGED_CONNECTION_BYTES; i++) {
      rom[dataOff + i] = 0;
    }
  }

  function isManagedConnectionArray(dataOff) {
    return window.RBEditorFreeSpace?.isInManagedRegion?.(dataOff, MANAGED_CONNECTION_BYTES) === true;
  }

  function allocateConnectionArray() {
    const allocator = window.RBEditorFreeSpace;
    if (!allocator?.allocate) throw new Error("空白区管理器不可用。");
    return allocator.allocate(MANAGED_CONNECTION_BYTES, { tag: "MapConnection[6]" }).offset;
  }

  function allocateConnectionsHeader() {
    const allocator = window.RBEditorFreeSpace;
    if (!allocator?.allocate) throw new Error("空白区管理器不可用。");
    return allocator.allocate(MAP_CONNECTIONS_SIZE, { tag: "MapConnections" }).offset;
  }

  function ensureConnectionsHeader(header, parsed) {
    if (parsed.offset !== null && parsed.offset !== undefined && isValidOffset(parsed.offset, MAP_CONNECTIONS_SIZE)) {
      return parsed.offset;
    }

    const headerOff = allocateConnectionsHeader();
    writeS32LE(headerOff + 0x00, 0);
    writeU32LE(headerOff + 0x04, 0);
    writeU32LE(header.offset + 0x0C, offsetToPtr(headerOff));
    header.connectionsPtr = offsetToPtr(headerOff);
    return headerOff;
  }

  function rewriteConnectionsToManagedArray(header, connections) {
    if (!header) return null;
    if (connections.length > MANAGED_CONNECTION_CAPACITY) {
      throw new Error(`连接数量不能超过 ${MANAGED_CONNECTION_CAPACITY} 条。`);
    }

    const parsed = parseMapConnections(header.connectionsPtr);
    const headerOff = ensureConnectionsHeader(header, parsed);
    const dataOff = isManagedConnectionArray(parsed.dataOff)
      ? parsed.dataOff
      : allocateConnectionArray();

    clearConnectionSlots(dataOff);
    connections.forEach((conn, index) => {
      writeConnectionEntry(dataOff + index * MAP_CONNECTION_SIZE, normalizeConnection(conn, index));
    });

    writeS32LE(headerOff + 0x00, connections.length);
    writeU32LE(headerOff + 0x04, offsetToPtr(dataOff));
    header.connectionsPtr = offsetToPtr(headerOff);
    header.connectionsParsed = parseMapConnections(header.connectionsPtr);
    return header.connectionsParsed;
  }

  function refreshConnectorViews() {
    if (!currentMap) return;
    currentMap.connectionsParsed = parseMapConnections(currentMap.connectionsPtr);
    renderConnectionEdgeNav(currentMap);
    if (window.RBEditorState?.mode === "connections" && window.RBEditorConnectionPreview?.render) {
      window.RBEditorConnectionPreview.render(currentMap);
    } else {
      renderMap(currentMap, currentEvents);
    }
    renderConnectorPanel();
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

  function ensureAddConnectionModal() {
    let modal = document.getElementById("addConnectionModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "addConnectionModal";
    modal.className = "modal-backdrop";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal connector-create-modal" role="dialog" aria-modal="true" aria-labelledby="addConnectionModalTitle">
        <div class="modal-header">
          <div>
            <h2 id="addConnectionModalTitle" class="modal-title">新增连接</h2>
            <div id="addConnectionModalSubtitle" class="modal-subtitle"></div>
          </div>
          <button type="button" class="modal-close" data-action="close-add-connection" aria-label="关闭">×</button>
        </div>
        <form id="addConnectionForm">
          <div class="modal-body">
            <div class="connector-grid">
              <label for="addConnDirection">方向</label>
              <select id="addConnDirection">
                ${[1,2,3,4,5,6].map(d => `<option value="${d}">${escapeHtml(connectionDirectionName(d))}</option>`).join("")}
              </select>
              <label for="addConnOffset">偏移</label>
              <input id="addConnOffset" type="number" value="0" />
              <label for="addConnGroup">目标 Group</label>
              <input id="addConnGroup" type="number" min="0" max="255" value="0" />
              <label for="addConnMap">目标 Map</label>
              <input id="addConnMap" type="number" min="0" max="255" value="0" />
            </div>
            <div id="addConnectionStatus" class="connector-create-status"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="secondary-btn" data-action="cancel-add-connection">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => closeAddConnectionModal();
    modal.querySelector("[data-action='close-add-connection']").onclick = close;
    modal.querySelector("[data-action='cancel-add-connection']").onclick = close;
    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
    modal.querySelector("#addConnectionForm").addEventListener("submit", event => {
      event.preventDefault();
      saveNewConnection();
    });
    return modal;
  }

  function closeAddConnectionModal() {
    const modal = document.getElementById("addConnectionModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.__sourceMap = null;
  }

  function setAddConnectionStatus(message, isError = false) {
    const status = document.getElementById("addConnectionStatus");
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("error", isError);
  }

  function openAddConnectionModal() {
    if (!currentMap) return;

    const parsed = parseMapConnections(currentMap.connectionsPtr);
    if ((parsed.list || []).length >= MANAGED_CONNECTION_CAPACITY) {
      alert(`连接数量不能超过 ${MANAGED_CONNECTION_CAPACITY} 条。`);
      return;
    }

    const modal = ensureAddConnectionModal();
    modal.__sourceMap = currentMap;
    modal.querySelector("#addConnectionModalSubtitle").textContent = getMapDisplayNameWithCode(currentMap);
    modal.querySelector("#addConnDirection").value = "4";
    modal.querySelector("#addConnOffset").value = "0";
    modal.querySelector("#addConnGroup").value = String(currentMap.mapGroup ?? 0);
    modal.querySelector("#addConnMap").value = String(currentMap.mapNum ?? 0);
    setAddConnectionStatus("");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector("#addConnDirection").focus();
  }

  function saveNewConnection() {
    const modal = document.getElementById("addConnectionModal");
    const sourceMap = modal?.__sourceMap;
    if (!modal || !sourceMap || sourceMap !== currentMap) {
      setAddConnectionStatus("当前地图已经变化，请关闭弹窗后重新新增连接。", true);
      return;
    }

    const parsed = parseMapConnections(sourceMap.connectionsPtr);
    const connections = (parsed.list || []).map(normalizeConnection);
    if (connections.length >= MANAGED_CONNECTION_CAPACITY) {
      setAddConnectionStatus(`连接数量不能超过 ${MANAGED_CONNECTION_CAPACITY} 条。`, true);
      return;
    }

    const direction = parseIntegerInRange(modal.querySelector("#addConnDirection")?.value, 1, 6);
    const connectionOffset = parseIntegerInRange(modal.querySelector("#addConnOffset")?.value, -2147483648, 2147483647);
    const mapGroup = parseIntegerInRange(modal.querySelector("#addConnGroup")?.value, 0, 255);
    const mapNum = parseIntegerInRange(modal.querySelector("#addConnMap")?.value, 0, 255);
    if (![1, 2, 3, 4, 5, 6].includes(direction) || connectionOffset === null || mapGroup === null || mapNum === null) {
      setAddConnectionStatus("连接参数格式不正确。", true);
      return;
    }

    connections.push({ direction, connectionOffset, mapGroup, mapNum });

    try {
      rewriteConnectionsToManagedArray(sourceMap, connections);
      closeAddConnectionModal();
      refreshConnectorViews();
    } catch (err) {
      setAddConnectionStatus(err?.message || String(err), true);
    }
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

    refreshConnectorViews();
  }

  function addConnection() {
    openAddConnectionModal();
  }

  function deleteConnection(index) {
    if (!currentMap) return;
    const parsed = parseMapConnections(currentMap.connectionsPtr);
    const idx = Number(index);
    const connections = (parsed.list || []).filter(conn => conn.index !== idx).map(normalizeConnection);

    if (!confirm(`确定删除连接 #${idx} 吗？`)) return;

    try {
      rewriteConnectionsToManagedArray(currentMap, connections);
      refreshConnectorViews();
    } catch (err) {
      alert(err?.message || String(err));
    }
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
    const freeState = window.RBEditorFreeSpace?.getState?.();
    const managedText = isManagedConnectionArray(parsed.dataOff) ? `managed capacity=${MANAGED_CONNECTION_CAPACITY}` : "not migrated";
    const largestText = freeState?.largest?.offset !== null && freeState?.largest?.offset !== undefined
      ? `${hex(freeState.largest.offset)} / ${freeState.largest.size} bytes`
      : "null";

    let html = `
      <h2>地图连接器</h2>
      <div class="connector-head">
        <div><b>当前地图：</b>${escapeHtml(getMapDisplayNameWithCode(currentMap))}</div>
        <div>mapGroup=${currentMap.mapGroup ?? "?"} / mapNum=${currentMap.mapNum ?? "?"}</div>
        <div>connectionsPtr=${escapeHtml(hex(currentMap.connectionsPtr))}</div>
        <div>header=${parsed.offset !== null && parsed.offset !== undefined ? escapeHtml(hex(parsed.offset)) : "null"} / data=${parsed.dataOff !== null && parsed.dataOff !== undefined ? escapeHtml(hex(parsed.dataOff)) : "null"} / count=${parsed.count} / status=${escapeHtml(parsed.status)}</div>
        <div>storage=${escapeHtml(managedText)} / freeStart=${escapeHtml(hex(freeState?.start ?? 0))} / largest=${escapeHtml(largestText)}</div>
      </div>
      <div class="connector-actions">
        <button type="button" data-action="add-connector" ${connections.length >= MANAGED_CONNECTION_CAPACITY ? "disabled" : ""}>新增连接</button>
      </div>`;

    if (!connections.length) {
      panel.innerHTML = html + `<div class="empty-tip">当前地图没有连接信息。</div>`;
      const addBtn = panel.querySelector("button[data-action='add-connector']");
      if (addBtn) addBtn.onclick = addConnection;
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
            <button type="button" class="secondary-btn" data-action="delete-connector" data-index="${conn.index}">删除</button>
          </div>
        </div>`;
    }).join("");

    panel.innerHTML = html;

    const addBtn = panel.querySelector("button[data-action='add-connector']");
    if (addBtn) addBtn.onclick = addConnection;

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

    for (const btn of panel.querySelectorAll("button[data-action='delete-connector']")) {
      btn.onclick = () => deleteConnection(btn.dataset.index);
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
    addConnection,
    deleteConnection,
    rewriteConnectionsToManagedArray,
  };
})();
