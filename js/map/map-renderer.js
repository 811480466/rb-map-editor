function getEventMarkerText(ev) {
  if (ev.type === "object" && ev.trainerBattle) return "B";
  if (ev.type === "object") return "N";
  if (ev.type === "warp") return "W";
  if (ev.type === "bg") return "S";
  if (ev.type === "coord") return "T";
  return "?";
}

function getEventMarkerColor(ev) {
  if (ev.type === "object" && ev.trainerBattle) return "#dc2626";  // B 红色
  if (ev.type === "object") return "#2563eb";                     // N 蓝色
  if (ev.type === "warp") return "#9333ea";                       // W 紫色
  if (ev.type === "bg") return "#ea580c";                         // S 橙色
  if (ev.type === "coord") return "#16a34a";                      // T 绿色
  return "#64748b";
}

function drawEvent(ev) {
  const cs = getCellSize();
  const px = ev.x * cs;
  const py = ev.y * cs;

  // 方块背景
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(px, py, cs, cs);

  // 颜色与字母
  const marker = getEventMarkerText(ev);
  const color = getEventMarkerColor(ev);
  ctx.fillStyle = color;
  ctx.font = `${Math.max(12, Math.floor(cs * 0.5))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(marker, px + cs/2, py + cs/2);

  // 训练家视野
  if (ev.type === "object" && ev.trainerType > 0 && ev.trainerRange > 0) {
    ctx.strokeStyle = "rgba(220, 38, 38, 0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px - ev.trainerRange * cs, py - ev.trainerRange * cs, cs + ev.trainerRange*2*cs, cs + ev.trainerRange*2*cs);
  }
}