// ============================================================
// App shell UI
// ============================================================
// 只保留基础 UI：地图列表、顶部模式栏、工具栏、元数据面板、事件显示开关、网格叠加。
// 地形/碰撞/右侧面板逻辑已经迁移到独立模块：
// - js/ui/mode-controller.js
// - js/ui/terrain-panel.js
// - js/editor/terrain-editor.js
// - js/editor/collision-editor.js
// - js/ui/connector-display-fix.js

(function appShellUi() {
  let originalDrawEvent = null;
  let originalRenderMap = null;

  window.__rbEditorShowEvents = false;

  window.refreshMapList = function refreshMapListOverride() {
    const list = document.getElementById("mapList");
    if (!list) return;

    const search = document.getElementById("mapSearch");
    const query = (search?.value || "").trim().toLowerCase();

    filteredHeaders = mapHeaders.filter(h => {
      const enName = getMapEnglishName(h);
      const cnName = getMapDisplayName(h);
      const text = [
        enName,
        cnName,
        String(h.id ?? ""),
        String(h.regionMapSectionId ?? ""),
        h.mapGroup !== undefined ? `mapGroup=${h.mapGroup}` : "",
        h.mapNum !== undefined ? `mapNum=${h.mapNum}` : "",
        h.mapGroup !== undefined ? `${h.mapGroup}:${h.mapNum}` : "",
      ].join(" ").toLowerCase();
      return !query || text.includes(query);
    });

    list.innerHTML = "";

    if (!filteredHeaders.length) {
      list.innerHTML = `<div class="empty-tip">没有匹配的地图。</div>`;
      const scanInfo = document.getElementById("scanInfo");
      if (scanInfo) {
        scanInfo.textContent =
          `MapHeader 候选数量：${mapHeaders.length}\n当前筛选数量：0\n\n可以尝试搜索地图名 / mapNum / mapGroup / 地图编码 / 区域编码`;
      }
      return;
    }

    for (let i = 0; i < filteredHeaders.length; i++) {
      const h = filteredHeaders[i];
      const mapName = getMapDisplayNameWithSuffix(h);
      const item = document.createElement("div");
      item.className = "map-option";
      item.dataset.index = String(i);
      item.title =
        `name=${mapName}\nmapNum=${h.mapNum ?? "?"}\nmapGroup=${h.mapGroup ?? "?"}\nmap id=${h.id ?? "?"}\nsection=${h.regionMapSectionId}\nheader=${hex(h.offset)}\nsize=${h.layout.width}x${h.layout.height}\nobj=${h.events.objectCount}, warp=${h.events.warpCount}, bg=${h.events.bgCount}, coord=${h.events.coordCount}`;
      item.innerHTML = `
        <div class="map-option-name">${escapeHtml(mapName)}</div>
        <div class="map-option-meta">
          <span class="map-meta-chip">mapNum:${escapeHtml(h.mapNum ?? "?")}</span>
          <span class="map-meta-chip">mapGroup:${escapeHtml(h.mapGroup ?? "?")}</span>
          <span class="map-meta-chip">地图编码:${escapeHtml(h.id ?? "?")}</span>
          <span class="map-meta-chip">区域编码:${escapeHtml(h.regionMap?.id ?? "?")}</span>
        </div>`;
      item.onclick = () => selectMap(i, true);
      list.appendChild(item);
    }

    const scanInfo = document.getElementById("scanInfo");
    if (scanInfo) {
      scanInfo.textContent =
        `MapHeader 候选数量：${mapHeaders.length}\n当前筛选数量：${filteredHeaders.length}\n\n说明：地图列表显示顺序为 mapNum、mapGroup、地图编码、区域编码。`;
    }
  };

  function injectUiStyle() {
    if (document.getElementById("appShellUiStyle")) return;

    const style = document.createElement("style");
    style.id = "appShellUiStyle";
    style.textContent = `
      .map-canvas-scroll { overflow:auto !important; }
      .map-canvas-scroll canvas { max-width:none; max-height:none; }

      .editor-mode-bar { flex:0 0 auto; display:flex; align-items:center; gap:8px; padding:8px 14px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.96); }
      .editor-mode-title { flex:0 0 auto; color:var(--muted); font-size:12px; font-weight:700; }
      .editor-mode-options { display:flex; gap:8px; flex-wrap:wrap; }
      .editor-mode-option { width:auto; margin:0; padding:7px 12px; border:1px solid #cfe0fb; border-radius:999px; background:#fff; color:var(--blue-dark); font-size:12px; font-weight:700; }
      .editor-mode-option.active { background:var(--blue); border-color:var(--blue); color:#fff; }
      .editor-mode-option:hover { background:#e8f1ff; color:var(--blue-dark); }
      .editor-mode-option.active:hover { background:var(--blue-dark); color:#fff; }

      .map-toolbar { flex:0 0 auto; display:flex; align-items:center; gap:14px; padding:8px 14px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.94); }
      .map-toolbar-title { color:var(--blue-dark); font-size:13px; font-weight:700; }
      .map-toolbar-group { display:inline-flex; align-items:center; gap:8px; }
      .map-toolbar-option { display:inline-flex; align-items:center; gap:5px; color:var(--text); font-size:13px; cursor:pointer; user-select:none; }
      .map-toolbar-option input { width:auto; margin:0; padding:0; }
      body.paint-mode #mapCanvas { cursor:crosshair; }

      .metadata-panel { flex:1 1 auto; min-height:0; display:none; padding:18px; overflow:auto; background:#f8fbff; }
      .metadata-panel.active { display:block; }
      .metadata-card { max-width:720px; margin:0 auto; padding:18px; border:1px solid var(--border); border-radius:14px; background:#fff; box-shadow:var(--shadow); }
      .metadata-card h3 { margin:0 0 14px; }
      .metadata-form-row { display:grid; grid-template-columns:120px minmax(0, 1fr); gap:12px; align-items:center; margin-bottom:12px; }
      .metadata-form-row label { color:var(--muted); font-size:13px; font-weight:700; }
      .metadata-weather-host .weather-control { display:flex; width:100%; flex:1 1 auto; }
      .metadata-weather-host .weather-control label { display:none; }
      .metadata-weather-host .weather-control select { width:100%; }

      .connector-panel { display:none; height:100%; min-height:0; overflow:auto; padding-right:4px; }
      .connector-panel.active { display:block; }
      .connector-head { margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:10px; background:#f8fbff; font-size:12px; line-height:1.55; color:var(--text); }
      .connector-card { margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:10px; background:#fff; box-shadow:0 4px 14px rgba(15,23,42,.04); }
      .connector-card-title { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; color:var(--blue-dark); font-size:13px; font-weight:800; }
      .connector-grid { display:grid; grid-template-columns:90px minmax(0,1fr); gap:8px; align-items:center; }
      .connector-grid label { color:var(--muted); font-size:12px; font-weight:700; }
      .connector-grid input, .connector-grid select { width:100%; margin:0; padding:7px 8px; font-size:12px; }
      .connector-info { margin-top:8px; color:var(--muted); font-size:12px; line-height:1.45; }
      .connector-actions { display:flex; gap:8px; margin-top:10px; }
      .connector-actions button { margin:0; padding:7px 9px; font-size:12px; }

      .tile-library-grid:has(> .empty-tip),
      .terrain-library-grid:has(> .empty-tip) {
        display:block !important;
        width:100% !important;
        min-width:0 !important;
      }
      .tile-library-grid > .empty-tip,
      #tileLibraryGrid > .empty-tip {
        grid-column:1 / -1 !important;
        width:100% !important;
        min-width:220px !important;
        min-height:88px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        padding:12px 14px !important;
        box-sizing:border-box !important;
        writing-mode:horizontal-tb !important;
        text-orientation:mixed !important;
        white-space:normal !important;
        word-break:normal !important;
        overflow-wrap:break-word !important;
        text-align:center !important;
        line-height:1.5 !important;
        border:1px dashed var(--border) !important;
        border-radius:10px !important;
        background:#fbfdff !important;
        color:var(--muted) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureEditorModeBar() {
    if (document.getElementById("editorModeBar")) return;

    const bar = document.createElement("div");
    bar.id = "editorModeBar";
    bar.className = "editor-mode-bar";
    bar.innerHTML = `
      <span class="editor-mode-title">模式</span>
      <div class="editor-mode-options">
        <button type="button" class="editor-mode-option active" data-editor-mode="terrain">地形编辑</button>
        <button type="button" class="editor-mode-option" data-editor-mode="events">地图事件</button>
        <button type="button" class="editor-mode-option" data-editor-mode="connections">地图连接器</button>
        <button type="button" class="editor-mode-option" data-editor-mode="metadata">地图元数据</button>
        <button type="button" class="editor-mode-option" data-editor-mode="wild">野生宝可梦</button>
      </div>`;

    const currentMapBar = document.querySelector(".current-map-bar");
    if (currentMapBar) currentMapBar.insertAdjacentElement("afterend", bar);
  }

  function ensureMapToolbar() {
    if (document.getElementById("mapToolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.id = "mapToolbar";
    toolbar.className = "map-toolbar";
    toolbar.innerHTML = `
      <span class="map-toolbar-title">工具栏</span>
      <span id="mouseModeGroup" class="map-toolbar-group" role="radiogroup" aria-label="鼠标模式">
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="view" checked/><span>查看</span></label>
        <label class="map-toolbar-option"><input type="radio" name="mouseMode" value="paint"/><span>绘制</span></label>
      </span>
      <label class="map-toolbar-option"><input id="blackGridToggle" type="checkbox"/><span>网格</span></label>
    `;

    const modeBar = document.getElementById("editorModeBar");
    if (modeBar) modeBar.insertAdjacentElement("afterend", toolbar);

    const toggle = document.getElementById("blackGridToggle");
    if (toggle) {
      toggle.addEventListener("change", async () => {
        if (currentMap && window.RBEditorState?.mode !== "metadata") await renderMap(currentMap, currentEvents);
      });
    }
  }

  function ensureMetadataPanel() {
    let panel = document.getElementById("mapMetadataPanel");
    if (panel) return panel;

    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap) return null;

    panel = document.createElement("div");
    panel.id = "mapMetadataPanel";
    panel.className = "metadata-panel";
    panel.innerHTML = `
      <div class="metadata-card">
        <h3>地图元数据</h3>
        <div class="metadata-form-row">
          <label>天气</label>
          <div id="metadataWeatherHost" class="metadata-weather-host"></div>
        </div>
      </div>`;

    mapWrap.appendChild(panel);

    const weather = document.querySelector(".weather-control");
    const host = document.getElementById("metadataWeatherHost");
    if (weather && host) host.appendChild(weather);

    return panel;
  }

  function ensureConnectorPanel() {
    let panel = document.getElementById("mapConnectorPanel");
    if (panel) return panel;

    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return null;

    panel = document.createElement("div");
    panel.id = "mapConnectorPanel";
    panel.className = "connector-panel";
    rightPanel.appendChild(panel);
    return panel;
  }

  function patchDrawEventVisibility() {
    if (originalDrawEvent || typeof drawEvent !== "function") return;

    originalDrawEvent = drawEvent;
    const wrapped = function drawEventVisibilityWrapper(ev) {
      if (!window.__rbEditorShowEvents) return;
      return originalDrawEvent(ev);
    };

    try {
      drawEvent = wrapped;
      window.drawEvent = wrapped;
    } catch (err) {
      window.drawEvent = wrapped;
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
    originalRenderMap = window.renderMap || (typeof renderMap === "function" ? renderMap : null);
    if (!originalRenderMap || originalRenderMap.__appShellGridWrapped) return;

    const wrappedRenderMap = async function renderMapWithGridToolbar(header, events) {
      const result = await originalRenderMap.call(this, header, events);
      drawBlackGridOverlay(header);
      return result;
    };

    wrappedRenderMap.__appShellGridWrapped = true;
    window.renderMap = wrappedRenderMap;
    try { renderMap = wrappedRenderMap; } catch (err) {}
  }

  function install() {
    injectUiStyle();
    patchDrawEventVisibility();
    ensureEditorModeBar();
    ensureMapToolbar();
    ensureMetadataPanel();
    ensureConnectorPanel();
    wrapRenderMapForGridToggle();

    if (window.RBEditorApplyModeState) window.RBEditorApplyModeState();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorAppShell = {
    ensureEditorModeBar,
    ensureMapToolbar,
    ensureMetadataPanel,
    ensureConnectorPanel,
    drawBlackGridOverlay,
  };
})();
