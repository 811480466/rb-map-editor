// ============================================================
// Right panel mode cleanup
// ============================================================
// 修复：不同模式之间切换后，右侧残留其他模式内容的问题。
// - 地图事件：只显示地图事件列表。
// - 地图连接器：只显示地图连接器信息，不显示事件 tab / 地图信息 tab。

(function rightPanelModeCleanup() {
  function getMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function hideTerrainPanels() {
    const terrainEditorPanel = document.getElementById("terrainEditorPanel");
    if (terrainEditorPanel) {
      terrainEditorPanel.classList.remove("active");
      terrainEditorPanel.style.display = "none";
    }

    const terrainPaintPanel = document.getElementById("terrainPaintPanel");
    if (terrainPaintPanel) {
      terrainPaintPanel.classList.remove("active");
      terrainPaintPanel.style.display = "none";
    }
  }

  function getRightPanelTitle(rightPanel) {
    return rightPanel.querySelector(":scope > h2");
  }

  function hideCommonRightPanelChildren(rightPanel, keepPanel) {
    const title = getRightPanelTitle(rightPanel);

    for (const child of Array.from(rightPanel.children)) {
      if (child === title || child === keepPanel) {
        child.style.display = child === keepPanel ? "block" : "block";
      } else {
        child.style.display = "none";
      }
    }
  }

  function showEventPanelOnly(rightPanel) {
    const title = getRightPanelTitle(rightPanel);
    if (title) {
      title.textContent = "地图事件";
      title.style.display = "block";
    }

    const eventTab = document.getElementById("eventTab");
    if (eventTab) {
      eventTab.classList.add("active");
      eventTab.style.display = "block";
    }

    hideCommonRightPanelChildren(rightPanel, eventTab);
  }

  function ensureConnectorPanel(rightPanel) {
    let panel = document.getElementById("mapConnectorPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "mapConnectorPanel";
      panel.className = "connector-panel";
      rightPanel.appendChild(panel);
    }
    return panel;
  }

  function writeS32LE(off, value) {
    const v = Number(value) | 0;
    rom[off] = v & 0xFF;
    rom[off + 1] = (v >> 8) & 0xFF;
    rom[off + 2] = (v >> 16) & 0xFF;
    rom[off + 3] = (v >> 24) & 0xFF;
  }

  function readNumber(id, fallback, min, max) {
    const n = Number(document.getElementById(id)?.value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function saveConnection(index) {
    if (!currentMap || !rom || typeof parseMapConnections !== "function") return;

    const parsed = parseMapConnections(currentMap.connectionsPtr);
    const conn = parsed.list.find(c => c.index === Number(index));
    if (!conn || !isValidOffset(conn.offset, MAP_CONNECTION_SIZE)) return;

    const direction = readNumber(`cleanupConnDirection_${index}`, conn.direction, 0, 255);
    const offset = readNumber(`cleanupConnOffset_${index}`, conn.connectionOffset, -2147483648, 2147483647);
    const mapGroup = readNumber(`cleanupConnGroup_${index}`, conn.mapGroup, 0, 255);
    const mapNum = readNumber(`cleanupConnMap_${index}`, conn.mapNum, 0, 255);

    rom[conn.offset + 0x00] = direction & 0xFF;
    writeS32LE(conn.offset + 0x04, offset);
    rom[conn.offset + 0x08] = mapGroup & 0xFF;
    rom[conn.offset + 0x09] = mapNum & 0xFF;

    currentMap.connectionsParsed = parseMapConnections(currentMap.connectionsPtr);
    if (typeof renderConnectionEdgeNav === "function") renderConnectionEdgeNav(currentMap);
    if (currentMap && typeof renderMap === "function") renderMap(currentMap, currentEvents);
    scheduleCleanup();
  }

  function renderConnectorPanel(panel) {
    if (!currentMap) {
      panel.innerHTML = `<div class="empty-tip">请先选择地图。</div>`;
      return;
    }

    if (typeof parseMapConnections !== "function") {
      panel.innerHTML = `<div class="empty-tip">连接器解析函数未加载。</div>`;
      return;
    }

    const parsed = parseMapConnections(currentMap.connectionsPtr);
    currentMap.connectionsParsed = parsed;
    const connections = parsed.list || [];

    let html = `
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
      const info = typeof getConnectionDestinationInfo === "function" ? getConnectionDestinationInfo(conn, currentMap) : null;
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
            <select id="cleanupConnDirection_${conn.index}">
              ${[1, 2, 3, 4, 5, 6].map(d => `<option value="${d}" ${conn.direction === d ? "selected" : ""}>${escapeHtml(connectionDirectionName(d))}</option>`).join("")}
            </select>
            <label>偏移</label>
            <input id="cleanupConnOffset_${conn.index}" type="number" value="${conn.connectionOffset}" />
            <label>目标Group</label>
            <input id="cleanupConnGroup_${conn.index}" type="number" min="0" max="255" value="${conn.mapGroup}" />
            <label>目标Map</label>
            <input id="cleanupConnMap_${conn.index}" type="number" min="0" max="255" value="${conn.mapNum}" />
          </div>
          <div class="connector-info">
            <div>目标：${escapeHtml(targetName)}</div>
            <div>结构 offset=${escapeHtml(hex(conn.offset))}</div>
          </div>
          <div class="connector-actions">
            <button type="button" data-cleanup-action="save" data-index="${conn.index}">保存修改</button>
            <button type="button" class="secondary-btn" data-cleanup-action="jump" data-index="${conn.index}" ${info?.targetMap ? "" : "disabled"}>跳转目标地图</button>
          </div>
        </div>`;
    }).join("");

    panel.innerHTML = html;

    for (const btn of panel.querySelectorAll("button[data-cleanup-action='save']")) {
      btn.onclick = () => saveConnection(btn.dataset.index);
    }

    for (const btn of panel.querySelectorAll("button[data-cleanup-action='jump']")) {
      btn.onclick = () => {
        const parsedNow = parseMapConnections(currentMap.connectionsPtr);
        const conn = parsedNow.list.find(c => c.index === Number(btn.dataset.index));
        if (conn && typeof jumpToConnectionTarget === "function") jumpToConnectionTarget(conn);
      };
    }
  }

  function showConnectorPanelOnly(rightPanel) {
    const title = getRightPanelTitle(rightPanel);
    if (title) {
      title.textContent = "地图连接器";
      title.style.display = "block";
    }

    const panel = ensureConnectorPanel(rightPanel);
    panel.classList.add("active");
    panel.style.display = "block";
    hideCommonRightPanelChildren(rightPanel, panel);
    renderConnectorPanel(panel);
  }

  function cleanup() {
    const mode = getMode();
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return;

    if (mode !== "terrain") {
      rightPanel.classList.remove("mode-terrain-editor", "mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
      hideTerrainPanels();
    }

    if (mode === "events") {
      showEventPanelOnly(rightPanel);
    } else if (mode === "connections") {
      showConnectorPanelOnly(rightPanel);
    }
  }

  function scheduleCleanup() {
    setTimeout(cleanup, 0);
    setTimeout(cleanup, 60);
    setTimeout(cleanup, 160);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".editor-mode-option")) scheduleCleanup();
  }, true);

  const observer = new MutationObserver(scheduleCleanup);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  scheduleCleanup();
})();
