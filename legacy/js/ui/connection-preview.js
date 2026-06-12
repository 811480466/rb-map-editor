// ============================================================
// Connection preview
// ============================================================
// Read-only Porymap-like preview for cardinal map connections.

(function connectionPreviewModule() {
  const CARDINAL_DIRECTIONS = new Set([1, 2, 3, 4]);
  const CONNECTION_PREVIEW_DEPTH = 8;
  let renderToken = 0;

  function getConnectionPreviewRects(header) {
    const rects = [{
      header,
      x: 0,
      y: 0,
      w: header.layout.width,
      h: header.layout.height,
      cropX: 0,
      cropY: 0,
      cropW: header.layout.width,
      cropH: header.layout.height,
      kind: "current",
      conn: null,
    }];
    const connections = getConnectionsForMap(header).filter(conn => CARDINAL_DIRECTIONS.has(conn.direction));

    for (const conn of connections) {
      const targetMap = findMapByGroupNum(conn.mapGroup, conn.mapNum);
      if (!targetMap) continue;

      let x = 0;
      let y = 0;
      let w = targetMap.layout.width;
      let h = targetMap.layout.height;
      let cropX = 0;
      let cropY = 0;
      let cropW = targetMap.layout.width;
      let cropH = targetMap.layout.height;
      if (conn.direction === 2) {
        h = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.height);
        x = conn.connectionOffset;
        y = -h;
        cropY = targetMap.layout.height - h;
        cropH = h;
      } else if (conn.direction === 1) {
        h = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.height);
        x = conn.connectionOffset;
        y = header.layout.height;
        cropY = 0;
        cropH = h;
      } else if (conn.direction === 3) {
        w = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.width);
        x = -w;
        y = conn.connectionOffset;
        cropX = targetMap.layout.width - w;
        cropW = w;
      } else if (conn.direction === 4) {
        w = Math.min(CONNECTION_PREVIEW_DEPTH, targetMap.layout.width);
        x = header.layout.width;
        y = conn.connectionOffset;
        cropX = 0;
        cropW = w;
      }

      rects.push({ header: targetMap, x, y, w, h, cropX, cropY, cropW, cropH, kind: "connection", conn });
    }

    return rects;
  }

  function getPreviewBounds(rects) {
    const current = rects[0].header;
    const hasNorth = rects.some(rect => rect.conn?.direction === 2);
    const hasSouth = rects.some(rect => rect.conn?.direction === 1);
    const hasWest = rects.some(rect => rect.conn?.direction === 3);
    const hasEast = rects.some(rect => rect.conn?.direction === 4);

    return {
      minX: hasWest ? -CONNECTION_PREVIEW_DEPTH : 0,
      minY: hasNorth ? -CONNECTION_PREVIEW_DEPTH : 0,
      maxX: current.layout.width + (hasEast ? CONNECTION_PREVIEW_DEPTH : 0),
      maxY: current.layout.height + (hasSouth ? CONNECTION_PREVIEW_DEPTH : 0),
    };
  }

  async function captureMapImage(header, token) {
    await renderMap(header, []);
    if (token !== renderToken) return null;

    const cellSize = getCellSize();
    const width = header.layout.width * cellSize;
    const height = header.layout.height * cellSize;
    if (width <= 0 || height <= 0) return null;

    const image = document.createElement("canvas");
    image.width = width;
    image.height = height;
    const imageCtx = image.getContext("2d");
    imageCtx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);

    return { header, image, cellSize };
  }

  function drawPreviewFrame(rect, drawX, drawY, drawW, drawH) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.lineWidth = rect.kind === "current" ? 3 : 2;
    ctx.strokeStyle = rect.kind === "current" ? "#a855f7" : "#0ea5e9";
    if (rect.kind !== "current") ctx.setLineDash([8, 5]);
    ctx.strokeRect(drawX + 0.5, drawY + 0.5, drawW - 1, drawH - 1);

    const name = getMapDisplayNameWithSuffix(rect.header);
    const label = rect.kind === "current"
      ? `当前地图：${name}`
      : `${connectionDirectionName(rect.conn.direction)}：${name} / offset ${rect.conn.connectionOffset}`;
    ctx.font = "700 12px Arial";
    const textWidth = Math.min(ctx.measureText(label).width + 16, drawW - 8);
    ctx.fillStyle = rect.kind === "current" ? "rgba(126, 34, 206, 0.90)" : "rgba(2, 132, 199, 0.84)";
    ctx.fillRect(drawX + 4, drawY + 4, Math.max(80, textWidth), 22);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(label, drawX + 12, drawY + 15, Math.max(64, drawW - 24));
    ctx.restore();
  }

  function drawNoConnectionOverlay() {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(12, 12, 260, 36);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
    ctx.strokeRect(12.5, 12.5, 259, 35);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 12px Arial";
    ctx.textAlign = "start";
    ctx.textBaseline = "middle";
    ctx.fillText("当前地图没有可预览的四向连接。", 24, 30);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }

  async function renderConnectionPreview(header) {
    if (!header) return false;

    const token = ++renderToken;
    const rects = getConnectionPreviewRects(header);
    if (rects.length <= 1) {
      await renderMap(header, currentEvents || []);
      if (token === renderToken) drawNoConnectionOverlay();
      return true;
    }

    const captures = new Map();
    for (const rect of rects) {
      if (captures.has(rect.header.offset)) continue;
      const capture = await captureMapImage(rect.header, token);
      if (token !== renderToken) return false;
      if (capture) captures.set(rect.header.offset, capture);
    }

    const currentCapture = captures.get(header.offset);
    if (!currentCapture) return false;

    const cellSize = currentCapture.cellSize;
    currentCellSize = cellSize;

    const bounds = getPreviewBounds(rects);
    const widthBlocks = bounds.maxX - bounds.minX;
    const heightBlocks = bounds.maxY - bounds.minY;
    canvas.width = Math.max(widthBlocks * cellSize, 600);
    canvas.height = Math.max(heightBlocks * cellSize, 420);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const rect of rects.filter(r => r.kind !== "current")) {
      const capture = captures.get(rect.header.offset);
      if (!capture) continue;
      const drawX = (rect.x - bounds.minX) * cellSize;
      const drawY = (rect.y - bounds.minY) * cellSize;
      const drawW = rect.w * cellSize;
      const drawH = rect.h * cellSize;
      const sourceX = rect.cropX * cellSize;
      const sourceY = rect.cropY * cellSize;
      const sourceW = rect.cropW * cellSize;
      const sourceH = rect.cropH * cellSize;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.drawImage(capture.image, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
      ctx.restore();
      drawPreviewFrame(rect, drawX, drawY, drawW, drawH);
    }

    const currentRect = rects[0];
    const currentX = (currentRect.x - bounds.minX) * cellSize;
    const currentY = (currentRect.y - bounds.minY) * cellSize;
    const currentW = currentRect.w * cellSize;
    const currentH = currentRect.h * cellSize;
    ctx.drawImage(currentCapture.image, currentX, currentY, currentW, currentH);
    drawPreviewFrame(currentRect, currentX, currentY, currentW, currentH);

    return true;
  }

  window.RBEditorConnectionPreview = {
    render: renderConnectionPreview,
    getRects: getConnectionPreviewRects,
  };
})();
