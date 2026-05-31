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

function getEventMarkerText(ev) {
  if (ev.type === "object" && ev.trainerBattle) return "B";
  if (ev.type === "object") return "N";
  if (ev.type === "warp") return "W";
  if (ev.type === "bg") return "S";
  if (ev.type === "coord") return "T";
  return "?";
}

function getEventMarkerColor(ev) {
  if (ev.type === "object" && ev.trainerBattle) return "#dc2626"; // B 训练家：红色
  if (ev.type === "object") return "#2563eb";                    // N NPC：蓝色
  if (ev.type === "warp") return "#9333ea";                      // W 传送点：紫色
  if (ev.type === "bg") return "#ea580c";                        // S 背景事件：橙色
  if (ev.type === "coord") return "#16a34a";                     // T 触发事件：绿色
  return "#64748b";
}

function drawObjectMovementRange(ev, px, py, cs) {
  if (ev.type !== "object") return;

  const rangeX = Number(ev.movementRangeX) || 0;
  const rangeY = Number(ev.movementRangeY) || 0;
  if (rangeX <= 0 && rangeY <= 0) return;

  ctx.save();
  ctx.strokeStyle = "rgba(220, 38, 38, 0.62)";
  ctx.lineWidth = Math.max(1, Math.floor(cs * 0.06));
  ctx.strokeRect(
    px - rangeX * cs,
    py - rangeY * cs,
    cs + rangeX * cs * 2,
    cs + rangeY * cs * 2
  );
  ctx.restore();
}

function drawEvent(ev) {
  const cs = getCellSize();
  const px = ev.x * cs;
  const py = ev.y * cs;
  const color = getEventMarkerColor(ev);
  const marker = getEventMarkerText(ev);

  // 对象移动范围：按 ObjectEventTemplate 的 movementRangeX / movementRangeY 绘制。
  // 不区分普通 NPC、训练家、道具球等，只要 X/Y 任一有值就显示范围框。
  drawObjectMovementRange(ev, px, py, cs);

  const pad = Math.max(3, Math.floor(cs * 0.16));
  const size = cs - pad * 2;
  const rx = px + pad;
  const ry = py + pad;

  ctx.fillStyle = color;
  ctx.fillRect(rx, ry, size, size);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1;
  ctx.strokeRect(rx + 0.5, ry + 0.5, size - 1, size - 1);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.max(12, Math.floor(cs * 0.50))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(marker, px + cs / 2, py + cs / 2 + 0.5);

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
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
