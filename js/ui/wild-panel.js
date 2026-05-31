// ============================================================
// Wild Pokémon panel
// ============================================================
// 野生宝可梦模式：显示并编辑当前地图野生遭遇数据。
// 宝可梦名称直接从 data/pokemon-data.js 的 window.RBEditorPokemonData 数组读取。

(function wildPanelModule() {
  let activeGroupKey = "land";

  const GROUP_ORDER = [
    { key: "land", label: "陆地" },
    { key: "water", label: "水面" },
    { key: "rockSmash", label: "碎岩" },
    { key: "fishing", label: "钓鱼" },
  ];

  function injectStyle() {
    if (document.getElementById("wildPanelStyle")) return;
    const style = document.createElement("style");
    style.id = "wildPanelStyle";
    style.textContent = `
      .wild-center-panel { flex: 1 1 auto; min-height: 0; display: none; padding: 18px; overflow: auto; background: #f8fbff; }
      .wild-center-panel.active { display: block; }
      .wild-card { width: min(1120px, 100%); margin: 0 auto; border: 1px solid #d4e2f5; border-radius: 14px; background: #ffffff; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05); overflow: visible; }
      .wild-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #e3ecf8; background: #fbfdff; border-radius: 14px 14px 0 0; }
      .wild-card-title { color: #153b78; font-size: 15px; font-weight: 800; }
      .wild-card-subtitle { margin-top: 4px; color: #64748b; font-size: 12px; line-height: 1.4; }
      .wild-tabs { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 16px 0; }
      .wild-tab-btn { width: auto; margin: 0; padding: 7px 12px; border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: transparent; color: #334155; font-size: 13px; font-weight: 700; cursor: pointer; }
      .wild-tab-btn.active { color: #1f5fbf; border-bottom-color: #1f5fbf; }
      .wild-table-wrap { padding: 12px 16px 16px; overflow: visible; }
      .wild-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
      .wild-edit-status { color: #64748b; font-size: 12px; }
      .wild-edit-status.ok { color: #15803d; font-weight: 700; }
      .wild-edit-status.error { color: #dc2626; font-weight: 700; }
      .wild-apply-btn { width: auto; margin: 0; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
      .wild-table { width: 100%; border-collapse: separate; border-spacing: 0 7px; font-size: 12px; }
      .wild-table th { padding: 0 8px 4px; color: #64748b; font-weight: 800; text-align: left; white-space: nowrap; }
      .wild-table td { padding: 7px 8px; border-top: 1px solid #dbe7f6; border-bottom: 1px solid #dbe7f6; background: #fff; color: #172033; white-space: nowrap; vertical-align: middle; }
      .wild-table td:first-child { border-left: 1px solid #dbe7f6; border-radius: 9px 0 0 9px; }
      .wild-table td:last-child { border-right: 1px solid #dbe7f6; border-radius: 0 9px 9px 0; }
      .wild-level-input { width: 62px !important; margin: 0 !important; padding: 5px 7px !important; font-size: 12px !important; }
      .wild-pokemon-select-host { width: 260px; }
      .wild-pokemon-name { font-weight: 800; color: #153b78; }
      .wild-pokemon-code { margin-left: 6px; color: #64748b; font-family: Consolas, Monaco, monospace; }
      .wild-empty { width: min(1120px, 100%); min-height: 220px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 1px dashed #cbd9ed; border-radius: 14px; background: #ffffff; color: #64748b; font-size: 13px; }
      .wild-right-card { padding: 10px; border: 1px solid #d4e2f5; border-radius: 12px; background: #fbfdff; font-size: 12px; line-height: 1.6; }
      .wild-right-row { display: flex; justify-content: space-between; gap: 8px; padding: 4px 0; border-bottom: 1px dashed #dbe7f6; }
      .wild-right-row:last-child { border-bottom: 0; }
      .wild-right-label { color: #64748b; }
      .wild-right-value { color: #153b78; font-weight: 800; }
    `;
    document.head.appendChild(style);
  }

  function escapeText(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function normalizePokemonDataIfNeeded() {
    if (typeof window.RBEditorNormalizePokemonData === "function") window.RBEditorNormalizePokemonData();
  }

  function buildPokemonMapFromData(data) {
    if (data instanceof Map) return data;
    if (Array.isArray(data)) return new Map(data.filter(item => item && Number.isInteger(Number(item.id))).map(item => [Number(item.id), item]));
    if (data && typeof data === "object") return new Map(Object.entries(data).map(([id, item]) => [Number(item?.id ?? id), item]));
    return new Map();
  }

  function getPokemonMap() {
    normalizePokemonDataIfNeeded();
    if (window.RBEditorPokemonDataById instanceof Map) return window.RBEditorPokemonDataById;
    return buildPokemonMapFromData(window.RBEditorPokemonData);
  }

  function getPokemonList() {
    normalizePokemonDataIfNeeded();
    if (Array.isArray(window.RBEditorPokemonData)) return window.RBEditorPokemonData;
    return Array.from(getPokemonMap().values());
  }

  function getPokemonById(speciesId) {
    return getPokemonMap().get(Number(speciesId)) || null;
  }

  function formatPokemonText(speciesId) {
    const id = Number(speciesId);
    const item = getPokemonById(id);
    if (!item) return `#${id}`;
    const name = item.name || item.code || `#${id}`;
    const code = item.code && item.code !== name ? ` / ${item.code}` : "";
    return `${name} #${id}${code}`;
  }

  function pokemonSearchText(item) {
    return `${item.id ?? ""} #${item.id ?? ""} ${item.name || ""} ${item.code || ""} ${item.macro || ""}`;
  }

  function parsePokemonInput(value) {
    const text = String(value ?? "").trim();
    const idMatch = text.match(/#(\d+)/);
    if (idMatch) return Number(idMatch[1]);
    const numeric = Number.parseInt(text, 10);
    if (Number.isInteger(numeric)) return numeric;
    const lower = text.toLowerCase();
    const found = getPokemonList().find(item => {
      const id = String(item.id ?? "");
      const name = String(item.name ?? "").toLowerCase();
      const code = String(item.code ?? "").toLowerCase();
      return name === lower || code === lower || id === text;
    });
    return found ? Number(found.id) : null;
  }

  function setEditStatus(text, type = "") {
    const el = document.getElementById("wildEditStatus");
    if (!el) return;
    el.className = `wild-edit-status ${type}`.trim();
    el.textContent = text;
  }

  function ensureCenterPanel() {
    injectStyle();
    let panel = document.getElementById("wildCenterPanel");
    if (panel) return panel;
    const mapWrap = document.querySelector(".map-wrap");
    if (!mapWrap) return null;
    panel = document.createElement("div");
    panel.id = "wildCenterPanel";
    panel.className = "wild-center-panel";
    mapWrap.appendChild(panel);
    return panel;
  }

  function getWildForCurrentMap() {
    if (!window.RBEditorWildEncounters || !currentMap) return null;
    return window.RBEditorWildEncounters.findWildEncounterForMap(currentMap.mapGroup, currentMap.mapNum);
  }

  function setCenterVisible(visible) {
    const mapShell = document.querySelector(".map-connection-shell");
    const legend = document.querySelector(".legend-bar");
    const toolbar = document.getElementById("mapToolbar");
    const metadataPanel = document.getElementById("mapMetadataPanel");
    const centerPanel = ensureCenterPanel();
    if (visible) {
      if (mapShell) mapShell.style.display = "none";
      if (legend) legend.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      if (metadataPanel) metadataPanel.classList.remove("active");
      if (centerPanel) centerPanel.classList.add("active");
    } else if (centerPanel) centerPanel.classList.remove("active");
  }

  function groupCount(group) {
    return group?.entries?.length || 0;
  }

  function renderTabs(wild) {
    return GROUP_ORDER.map(def => {
      const group = wild?.groups?.[def.key] || null;
      const active = activeGroupKey === def.key;
      return `<button type="button" class="wild-tab-btn ${active ? "active" : ""}" data-wild-group="${def.key}">${def.label} ${groupCount(group)}</button>`;
    }).join("");
  }

  function renderEntriesTable(group) {
    if (!group) return `<div class="wild-empty">当前地图没有这个类型的野生遭遇数据。</div>`;

    const rows = group.entries.map(entry => `
      <tr data-entry-offset="${entry.offset}">
        <td>#${entry.slot + 1}</td>
        <td>${entry.rate ?? "-"}%</td>
        <td><input class="wild-level-input" type="number" min="1" max="100" data-wild-field="minLevel" value="${entry.minLevel}"></td>
        <td><input class="wild-level-input" type="number" min="1" max="100" data-wild-field="maxLevel" value="${entry.maxLevel}"></td>
        <td><div class="wild-pokemon-select-host" data-wild-species-host="1" data-species="${entry.species}"></div></td>
        <td>${escapeText(typeof hex === "function" ? hex(entry.offset) : entry.offset)}</td>
      </tr>
    `).join("");

    return `
      <div class="wild-table-wrap">
        <div class="wild-toolbar">
          <div class="wild-card-subtitle" style="margin:0;">遭遇率：${group.encounterRate}　数据偏移：${escapeText(typeof hex === "function" ? hex(group.monsOffset) : group.monsOffset)}</div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span id="wildEditStatus" class="wild-edit-status">未应用修改。</span>
            <button id="applyWildEditBtn" class="wild-apply-btn" type="button">应用修改</button>
          </div>
        </div>
        <table class="wild-table">
          <thead>
            <tr><th>槽位</th><th>几率</th><th>最低等级</th><th>最高等级</th><th>宝可梦</th><th>偏移</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function enhancePokemonDropdowns() {
    const Dropdown = window.RBEditorSearchableDropdown;
    if (!Dropdown) return;
    const options = getPokemonList();

    for (const host of document.querySelectorAll('#wildCenterPanel [data-wild-species-host="1"]')) {
      if (host.dataset.dropdownDone === "1") continue;
      host.dataset.dropdownDone = "1";
      const value = Number(host.dataset.species || 0);
      new Dropdown({
        container: host,
        value,
        options,
        fieldName: "species",
        hiddenClassName: "wild-pokemon-hidden-input",
        placeholder: "搜索宝可梦 ID / 名称 / 英文",
        getValue: item => Number(item.id),
        getLabel: item => formatPokemonText(item.id),
        getSearchText: item => pokemonSearchText(item),
        onChange: () => setEditStatus("未应用修改。"),
      });
    }
  }

  function bindEditEvents(group) {
    const applyBtn = document.getElementById("applyWildEditBtn");
    if (!applyBtn || !group) return;

    for (const input of document.querySelectorAll("#wildCenterPanel [data-wild-field]")) {
      input.addEventListener("input", () => setEditStatus("未应用修改。"));
      input.addEventListener("change", () => setEditStatus("未应用修改。"));
    }

    applyBtn.onclick = () => {
      try {
        const rows = Array.from(document.querySelectorAll("#wildCenterPanel tr[data-entry-offset]"));
        for (const row of rows) {
          const offset = Number(row.dataset.entryOffset);
          const entry = group.entries.find(e => e.offset === offset);
          if (!entry) continue;
          const minLevel = row.querySelector('[data-wild-field="minLevel"]')?.value;
          const maxLevel = row.querySelector('[data-wild-field="maxLevel"]')?.value;
          const speciesInput = row.querySelector('[data-event-field="species"]');
          const species = parsePokemonInput(speciesInput?.value);
          if (species === null) throw new Error(`无法识别宝可梦：${speciesInput?.value || "空"}`);
          window.RBEditorWildEncounters.writeWildPokemonEntry(entry, { minLevel, maxLevel, species });
        }
        setEditStatus("已应用修改。导出 ROM 后生效。", "ok");
        renderCenterPanel();
        renderRightPanel();
      } catch (err) {
        setEditStatus(err?.message || "应用失败", "error");
      }
    };
  }

  function renderCenterPanel() {
    const centerPanel = ensureCenterPanel();
    if (!centerPanel) return null;
    normalizePokemonDataIfNeeded();

    if (!currentMap) {
      centerPanel.innerHTML = `<div class="wild-empty">请先选择地图。</div>`;
      return centerPanel;
    }

    const wild = getWildForCurrentMap();
    const mapName = typeof getMapDisplayNameWithCode === "function" ? getMapDisplayNameWithCode(currentMap) : "当前地图";
    if (!wild) {
      centerPanel.innerHTML = `<div class="wild-empty">当前地图没有野生宝可梦数据：${escapeText(mapName)} / group=${escapeText(currentMap.mapGroup ?? "?")} map=${escapeText(currentMap.mapNum ?? "?")}</div>`;
      return centerPanel;
    }

    if (!wild.groups?.[activeGroupKey]) {
      const first = GROUP_ORDER.find(def => wild.groups?.[def.key]);
      activeGroupKey = first?.key || "land";
    }

    const activeGroup = wild.groups?.[activeGroupKey] || null;
    const activeDef = GROUP_ORDER.find(def => def.key === activeGroupKey) || GROUP_ORDER[0];

    centerPanel.innerHTML = `
      <div class="wild-card">
        <div class="wild-card-head">
          <div><div class="wild-card-title">野生宝可梦</div><div class="wild-card-subtitle">${escapeText(mapName)} / group=${escapeText(wild.mapGroup)} map=${escapeText(wild.mapNum)} / Header=${escapeText(typeof hex === "function" ? hex(wild.headerOffset) : wild.headerOffset)}</div></div>
          <div class="wild-card-subtitle">当前：${escapeText(activeDef.label)}</div>
        </div>
        <div class="wild-tabs">${renderTabs(wild)}</div>
        ${renderEntriesTable(activeGroup)}
      </div>
    `;

    for (const btn of centerPanel.querySelectorAll("button[data-wild-group]")) {
      btn.onclick = () => {
        activeGroupKey = btn.dataset.wildGroup || "land";
        renderCenterPanel();
        renderRightPanel();
      };
    }
    enhancePokemonDropdowns();
    bindEditEvents(activeGroup);
    return centerPanel;
  }

  function renderRightPanel() {
    injectStyle();
    const right = window.RBEditorRightPanel;
    const panel = right?.getPanel ? right.getPanel() : document.querySelector(".panel.right");
    if (!panel) return null;
    if (right?.setModeClass) right.setModeClass("mode-wild");
    if (right?.clearPanel) right.clearPanel();
    if (right?.ensureTitle) right.ensureTitle("野生宝可梦");
    else {
      let title = panel.querySelector(":scope > h2");
      if (!title) {
        title = document.createElement("h2");
        panel.prepend(title);
      }
      title.textContent = "野生宝可梦";
    }

    const body = document.createElement("div");
    body.id = "wildPanel";
    panel.appendChild(body);

    const wild = getWildForCurrentMap();
    if (!currentMap) {
      body.innerHTML = `<div class="wild-right-card">请先选择地图。</div>`;
      return body;
    }
    const mapName = typeof getMapDisplayNameWithCode === "function" ? getMapDisplayNameWithCode(currentMap) : "当前地图";
    if (!wild) {
      body.innerHTML = `<div class="wild-right-card"><div class="wild-right-row"><span class="wild-right-label">当前地图</span><span class="wild-right-value">${escapeText(mapName)}</span></div><div class="wild-right-row"><span class="wild-right-label">状态</span><span class="wild-right-value">无遭遇表</span></div></div>`;
      return body;
    }
    const rows = GROUP_ORDER.map(def => {
      const group = wild.groups?.[def.key];
      const value = group ? `${group.encounterRate} / ${group.entries.length}` : "无";
      return `<div class="wild-right-row"><span class="wild-right-label">${def.label}</span><span class="wild-right-value">${escapeText(value)}</span></div>`;
    }).join("");
    body.innerHTML = `<div class="wild-right-card"><div class="wild-right-row"><span class="wild-right-label">当前地图</span><span class="wild-right-value">${escapeText(mapName)}</span></div><div class="wild-right-row"><span class="wild-right-label">Header</span><span class="wild-right-value">${escapeText(typeof hex === "function" ? hex(wild.headerOffset) : wild.headerOffset)}</span></div>${rows}</div>`;
    return body;
  }

  function show() {
    setCenterVisible(true);
    renderCenterPanel();
    renderRightPanel();
  }

  function hide() {
    setCenterVisible(false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => ensureCenterPanel());
  else ensureCenterPanel();

  window.RBEditorWildPanel = {
    ensureCenterPanel,
    setCenterVisible,
    renderCenterPanel,
    renderRightPanel,
    getPokemonById,
    buildPokemonMapFromData,
    parsePokemonInput,
    show,
    hide,
  };
})();
