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

  const importBtn = document.getElementById("openSetupModal");
  if (importBtn) importBtn.textContent = "导入";
})();
