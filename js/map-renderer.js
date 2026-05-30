// ============================================================
// 渲染
// ============================================================
function renderSimpleMap(header, events) {
  currentCellSize = CELL_SIZE;
  const w = header.layout.width;
  const h = header.layout.height;

  canvas.width = Math.max(w * CELL_SIZE, 600);
  canvas.height = Math.max(h * CELL_SIZE, 600);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#dbe6f3";
  ctx.lineWidth = 1;

  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, h * CELL_SIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(w * CELL_SIZE, y * CELL_SIZE);
    ctx.stroke();
  }

  for (const ev of events) {
    drawEvent(ev);
  }
}

function drawEvent(ev) {
  const cs = getCellSize();
  const px = ev.x * cs;
  const py = ev.y * cs;

  let color = "#2563eb";

  if (ev.type === "warp") color = "#16a34a";
  if (ev.type === "bg") color = "#ea580c";
  if (ev.type === "coord") color = "#9333ea";
  if (ev.type === "object" && ev.trainerBattle) color = "#dc2626";

  if (ev.type === "object" && ev.trainerType > 0 && ev.trainerRange > 0) {
    ctx.strokeStyle = "rgba(220, 38, 38, 0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      px - ev.trainerRange * cs,
      py - ev.trainerRange * cs,
      cs + ev.trainerRange * cs * 2,
      cs + ev.trainerRange * cs * 2
    );
  }

  const pad = Math.max(3, Math.floor(cs * 0.16));
  ctx.fillStyle = color;
  ctx.fillRect(px + pad, py + pad, cs - pad * 2, cs - pad * 2);

  ctx.fillStyle = "#111827";
  ctx.font = `${Math.max(12, Math.floor(cs * 0.45))}px Arial`;
  ctx.fillText(ev.index, px + pad + 1, py + cs - pad);
}

function eventBadge(ev) {
  if (ev.type === "object" && ev.trainerBattle) return `<span class="badge trainer">TRAINER</span>`;
  if (ev.type === "object") return `<span class="badge obj">OBJ</span>`;
  if (ev.type === "warp") return `<span class="badge warp">WARP</span>`;
  if (ev.type === "bg") return `<span class="badge bg">BG</span>`;
  if (ev.type === "coord") return `<span class="badge coord">COORD</span>`;
  return "";
}

function eventKey(ev) {
  return `${ev.type}:${ev.index}:${ev.offset}`;
}

function renderEventSummary(events) {
  const obj = events.filter(e => e.type === "object").length;
  const trainer = events.filter(e => e.type === "object" && e.trainerBattle).length;
  const warp = events.filter(e => e.type === "warp").length;
  const bgCoord = events.filter(e => e.type === "bg" || e.type === "coord").length;

  document.getElementById("eventSummary").innerHTML = `
    <div>OBJ: ${obj}</div>
    <div>TRAINER: ${trainer}</div>
    <div>WARP: ${warp}</div>
    <div>BG/COORD: ${bgCoord}</div>
  `;
}

function renderEventList(events) {
  const div = document.getElementById("eventList");
  div.innerHTML = "";

  renderEventSummary(events);

  for (const ev of events) {
    const row = document.createElement("div");
    row.className = "event-row";
    row.dataset.key = eventKey(ev);

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

    row.innerHTML = title;
    row.onclick = () => showEventDetail(ev);
    div.appendChild(row);
  }
}

function showEventDetail(ev) {
  selectedEventKey = eventKey(ev);

  for (const row of document.querySelectorAll(".event-row")) {
    row.classList.toggle("active", row.dataset.key === selectedEventKey);
  }

  document.getElementById("eventDetail").textContent =
    JSON.stringify(formatEventForDisplay(ev), null, 2);

  renderWarpTools(ev);
}

function renderWarpTools(ev) {
  const box = document.getElementById("warpTools");
  if (!box) return;

  if (!ev || ev.type !== "warp") {
    box.className = "warp-tools empty";
    box.innerHTML = "";
    return;
  }

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

  box.className = "warp-tools";
  box.innerHTML = `
    <div class="warp-tools-title">Warp 跳转 / 反查</div>
    <div>当前：${escapeHtml(getMapDisplayNameWithCode(currentMap))} / warp #${ev.index} (${ev.x}, ${ev.y})</div>
    <div>目标：${targetText}</div>
    <div>目标 warp：${escapeHtml(targetWarpText)}</div>
    <div>反查：${escapeHtml(reverseText)}</div>
    <div>状态：<span class="${statusClass}">${escapeHtml(info?.statusText || "未能判断")}</span></div>
    <div class="warp-tools-actions">
      <button id="jumpWarpTargetBtn" type="button" ${targetMap ? "" : "disabled"}>跳转到目标地图</button>
      <button id="jumpWarpTargetFocusBtn" type="button" ${targetMap && targetWarp ? "" : "disabled"}>跳转并选中目标 Warp</button>
    </div>
  `;

  const jumpBtn = document.getElementById("jumpWarpTargetBtn");
  const jumpFocusBtn = document.getElementById("jumpWarpTargetFocusBtn");
  if (jumpBtn) jumpBtn.onclick = () => jumpToWarpTarget(ev, false);
  if (jumpFocusBtn) jumpFocusBtn.onclick = () => jumpToWarpTarget(ev, true);
}

function renderConnectionTools(header) {
  const box = document.getElementById("connectionTools");
  if (!box) return;

  if (!header) {
    box.className = "warp-tools empty";
    box.innerHTML = "";
    return;
  }

  const parsed = parseMapConnections(header.connectionsPtr);
  header.connectionsParsed = parsed;
  const connections = parsed.list || [];

  if (!connections.length) {
    box.className = "warp-tools";
    box.innerHTML = `
      <div class="warp-tools-title">Connections 解析</div>
      <div>当前地图没有有效连接。connectionsPtr=${escapeHtml(hex(header.connectionsPtr))}，status=${escapeHtml(parsed.status)}</div>
    `;
    return;
  }

  const rows = connections.map(conn => {
    const info = getConnectionDestinationInfo(conn, header);
    const targetMap = info?.targetMap;
    const statusClass = info?.status === "ok" ? "warp-ok" : (info?.status === "bad" ? "warp-bad" : "warp-warn");
    const targetText = targetMap
      ? `${escapeHtml(getMapDisplayNameWithCode(targetMap))} / group=${targetMap.mapGroup}, map=${targetMap.mapNum}`
      : `group=${conn.mapGroup}, map=${conn.mapNum}`;
    const reverseText = info?.exactReverseConnection
      ? `反向：${connectionDirectionName(info.exactReverseConnection.direction)} offset=${info.exactReverseConnection.connectionOffset}`
      : (info?.reverseConnections?.length
        ? `返回候选：${info.reverseConnections.map(c => `${connectionDirectionName(c.direction)} offset=${c.connectionOffset}`).join("；")}`
        : "无返回连接");

    return `
      <div class="event-row" style="cursor:default; margin-bottom:8px;">
        <div><b>#${conn.index} ${escapeHtml(connectionDirectionName(conn.direction))}</b> offset=${conn.connectionOffset}</div>
        <div class="small">目标：${targetText}</div>
        <div class="small">${escapeHtml(reverseText)}</div>
        <div class="small">状态：<span class="${statusClass}">${escapeHtml(info?.statusText || "未能判断")}</span></div>
        <div class="warp-tools-actions">
          <button type="button" data-conn-index="${conn.index}" ${targetMap ? "" : "disabled"}>跳转到连接地图</button>
        </div>
      </div>
    `;
  }).join("");

  box.className = "warp-tools";
  box.innerHTML = `
    <div class="warp-tools-title">Connections 解析 / 跳转</div>
    <div>当前：${escapeHtml(getMapDisplayNameWithCode(header))} / group=${header.mapGroup ?? "?"}, map=${header.mapNum ?? "?"}</div>
    <div class="small">connectionsHeader=${escapeHtml(hex(parsed.offset ?? 0))}，connectionsData=${escapeHtml(parsed.dataOff !== null ? hex(parsed.dataOff) : "null")}，count=${parsed.count}</div>
    <div style="margin-top:8px;">${rows}</div>
  `;

  for (const btn of box.querySelectorAll("button[data-conn-index]")) {
    btn.onclick = () => {
      const idx = Number(btn.dataset.connIndex);
      const conn = connections.find(c => c.index === idx);
      if (conn) jumpToConnectionTarget(conn);
    };
  }
}


const CONNECTION_EDGE_BUTTONS = [
  { id: "connNorth", direction: 2, label: "上" },
  { id: "connSouth", direction: 1, label: "下" },
  { id: "connWest", direction: 3, label: "左" },
  { id: "connEast", direction: 4, label: "右" },
  { id: "connDive", direction: 5, label: "潜水" },
  { id: "connEmerge", direction: 6, label: "上浮" },
];

function clearConnectionEdgeNav() {
  for (const item of CONNECTION_EDGE_BUTTONS) {
    const btn = document.getElementById(item.id);
    if (!btn) continue;
    btn.className = `connection-edge ${item.id === "connNorth" ? "connection-north" : item.id === "connSouth" ? "connection-south" : item.id === "connWest" ? "connection-west" : item.id === "connEast" ? "connection-east" : ""} empty`;
    btn.innerHTML = "";
    btn.title = "";
    btn.onclick = null;
  }
}

function renderConnectionEdgeNav(header) {
  clearConnectionEdgeNav();
  if (!header) return;

  const connections = getConnectionsForMap(header);
  if (!connections.length) return;

  for (const item of CONNECTION_EDGE_BUTTONS) {
    const btn = document.getElementById(item.id);
    if (!btn) continue;

    const sameDirection = connections.filter(c => c.direction === item.direction);
    if (!sameDirection.length) continue;

    const conn = sameDirection[0];
    const info = getConnectionDestinationInfo(conn, header);
    const targetMap = info?.targetMap;
    const targetName = targetMap ? getMapDisplayNameWithSuffix(targetMap) : `group=${conn.mapGroup}, map=${conn.mapNum}`;
    const more = sameDirection.length > 1 ? ` +${sameDirection.length - 1}` : "";
    const statusClass = info?.status === "ok" ? "conn-ok" : (info?.status === "bad" ? "conn-bad" : "conn-warn");
    const baseClass = item.id === "connNorth" ? "connection-north" : item.id === "connSouth" ? "connection-south" : item.id === "connWest" ? "connection-west" : item.id === "connEast" ? "connection-east" : "";

    btn.className = `connection-edge ${baseClass} ${statusClass}`;
    btn.innerHTML = `
      <span class="connection-edge-main">${escapeHtml(item.label)} → ${escapeHtml(targetName)}${escapeHtml(more)}</span>
      <span class="connection-edge-sub">Group ${conn.mapGroup} / Map ${conn.mapNum}　offset ${conn.connectionOffset}</span>
    `;
    btn.title = `${connectionDirectionName(conn.direction)} -> ${targetName}\n${info?.statusText || "未能判断"}\n点击跳转到连接地图`;
    btn.onclick = () => jumpToConnectionTarget(conn);
  }
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
