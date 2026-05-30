// ============================================================
// UI overrides
// ============================================================
// 这个文件只处理界面微调，不改 ROM 解析逻辑。

(function applyUiOverrides() {
  const originalRefreshMapList = window.refreshMapList || refreshMapList;

  window.refreshMapList = function refreshMapListOverride() {
    const list = document.getElementById("mapList");
    const query = document.getElementById("mapSearch").value.trim().toLowerCase();

    filteredHeaders = mapHeaders.filter(h => {
      const enName = getMapEnglishName(h);
      const cnName = getMapDisplayName(h);
      const text = [
        enName,
        cnName,
        String(h.id ?? ""),
        String(h.regionMapSectionId),
        h.mapGroup !== undefined ? `mapGroup=${h.mapGroup}` : "",
        h.mapNum !== undefined ? `mapNum=${h.mapNum}` : "",
        h.mapGroup !== undefined ? `${h.mapGroup}:${h.mapNum}` : "",
      ].join(" ").toLowerCase();

      return !query || text.includes(query);
    });

    list.innerHTML = "";

    if (!filteredHeaders.length) {
      list.innerHTML = `<div class="empty-tip">没有匹配的地图。</div>`;
      document.getElementById("scanInfo").textContent =
        `MapHeader 候选数量：${mapHeaders.length}\n` +
        `当前筛选数量：0\n\n` +
        `可以尝试搜索地图名 / mapNum / mapGroup / 地图编码 / 区域编码`;
      return;
    }

    for (let i = 0; i < filteredHeaders.length; i++) {
      const h = filteredHeaders[i];
      const mapName = getMapDisplayNameWithSuffix(h);

      const item = document.createElement("div");
      item.className = "map-option";
      item.dataset.index = String(i);
      item.title =
        `name=${mapName}\n` +
        `mapNum=${h.mapNum ?? "?"}\n` +
        `mapGroup=${h.mapGroup ?? "?"}\n` +
        `map id=${h.id ?? "?"}\n` +
        `section=${h.regionMapSectionId}\n` +
        `header=${hex(h.offset)}\n` +
        `size=${h.layout.width}x${h.layout.height}\n` +
        `obj=${h.events.objectCount}, warp=${h.events.warpCount}, bg=${h.events.bgCount}, coord=${h.events.coordCount}`;

      item.innerHTML = `
        <div class="map-option-name">${escapeHtml(mapName)}</div>
        <div class="map-option-meta">
          <span class="map-meta-chip">mapNum:${escapeHtml(h.mapNum ?? "?")}</span>
          <span class="map-meta-chip">mapGroup:${escapeHtml(h.mapGroup ?? "?")}</span>
          <span class="map-meta-chip">地图编码:${escapeHtml(h.id ?? "?")}</span>
          <span class="map-meta-chip">区域编码:${escapeHtml(h.regionMap?.id ?? "?")}</span>
        </div>
      `;
      item.onclick = () => selectMap(i, true);

      list.appendChild(item);
    }

    document.getElementById("scanInfo").textContent =
      `MapHeader 候选数量：${mapHeaders.length}\n` +
      `当前筛选数量：${filteredHeaders.length}\n\n` +
      `说明：地图列表显示顺序为 mapNum、mapGroup、地图编码、区域编码。`;
  };

  function ensureMapToolbar() {
    if (document.getElementById("mapToolbar")) return;

    const style = document.createElement("style");
    style.textContent = `
      .map-toolbar {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 14px;
        border-bottom: 1px solid var(--border);
        background: rgba(255, 255, 255, .94);
      }

      .map-toolbar-title {
        color: var(--blue-dark);
        font-size: 13px;
        font-weight: 700;
      }

      .map-toolbar-option {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text);
        font-size: 13px;
        cursor: pointer;
        user-select: none;
      }

      .map-toolbar-option input {
        width: auto;
        margin: 0;
        padding: 0;
      }
    `;
    document.head.appendChild(style);

    const toolbar = document.createElement("div");
    toolbar.id = "mapToolbar";
    toolbar.className = "map-toolbar";
    toolbar.innerHTML = `
      <span class="map-toolbar-title">工具栏</span>
      <label class="map-toolbar-option">
        <input id="blackGridToggle" type="checkbox" />
        <span>网格</span>
      </label>
    `;

    const currentMapBar = document.querySelector(".current-map-bar");
    if (currentMapBar) {
      currentMapBar.insertAdjacentElement("afterend", toolbar);
    }

    const toggle = document.getElementById("blackGridToggle");
    if (toggle) {
      toggle.addEventListener("change", async () => {
        if (!currentMap) return;
        await renderMap(currentMap, currentEvents);
      });
    }
  }

  function isBlackGridEnabled() {
    return !!document.getElementById("blackGridToggle")?.checked;
  }

  function drawBlackGridOverlay(header) {
    if (!header || !isBlackGridEnabled()) return;

    const cs = getCellSize();
    const w = header.layout.width;
    const h = header.layout.height;
    const maxX = w * cs;
    const maxY = h * cs;

    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    for (let x = 0; x <= w; x++) {
      const px = x * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, maxY);
      ctx.stroke();
    }

    for (let y = 0; y <= h; y++) {
      const py = y * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(maxX, py);
      ctx.stroke();
    }

    ctx.restore();
  }

  function wrapRenderMapForGridToggle() {
    const originalRenderMap = window.renderMap || renderMap;
    if (!originalRenderMap || originalRenderMap.__gridToolbarWrapped) return;

    const wrappedRenderMap = async function renderMapWithGridToolbar(header, events) {
      const result = await originalRenderMap.call(this, header, events);
      drawBlackGridOverlay(header);
      return result;
    };

    wrappedRenderMap.__gridToolbarWrapped = true;
    window.renderMap = wrappedRenderMap;

    try {
      renderMap = wrappedRenderMap;
    } catch (err) {
      // 部分浏览器不允许改写全局函数绑定时，保留 window.renderMap 包装即可。
    }
  }

  ensureMapToolbar();
  wrapRenderMapForGridToggle();

  const importBtn = document.getElementById("openSetupModal");
  if (importBtn) importBtn.textContent = "导入";
})();
