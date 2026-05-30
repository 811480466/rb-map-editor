// ============================================================
// Click-driven right panel controller
// ============================================================
// 右侧面板统一由这里动态渲染，不再依赖 index.html 里写死的事件列表 / 地图信息 / 事件详情。

(function rightPanelEventController() {
  let installed = false;

  function mode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function panel() {
    return document.querySelector(".panel.right");
  }

  function ensureNode(tag, id, className, html) {
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement(tag);
    el.id = id;
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  function titleNode(text) {
    const h = document.createElement("h2");
    h.id = "rightPanelTitle";
    h.textContent = text;
    return h;
  }

  function detachKnownPanelNodes() {
    const ids = [
      "eventTab", "mapInfoTab", "connectionTools", "eventDetail", "warpTools",
      "mapConnectorPanel", "terrainEditorPanel", "terrainPaintPanel", "finalTerrainEditorPanel"
    ];
    const detached = new Map();
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        detached.set(id, el);
        el.remove();
      }
    }
    return detached;
  }

  function resetRightPanel(titleText) {
    const p = panel();
    if (!p) return null;
    const detached = detachKnownPanelNodes();
    p.className = "panel right";
    p.innerHTML = "";
    p.appendChild(titleNode(titleText));
    p.__detachedPanelNodes = detached;
    return p;
  }

  function takeDetached(id) {
    const p = panel();
    const node = p?.__detachedPanelNodes?.get(id) || document.getElementById(id);
    if (node) node.remove();
    return node || null;
  }

  function eventPanelNode() {
    const box = takeDetached("eventTab") || ensureNode("div", "eventTab", "tab-panel active", `
      <div class="summary" id="eventSummary">
        <div>OBJ: 0</div>
        <div>TRAINER: 0</div>
        <div>WARP: 0</div>
        <div>BG/COORD: 0</div>
      </div>
      <div id="eventList"></div>
    `);
    box.className = "tab-panel active";
    box.style.display = "block";
    box.style.overflow = "auto";
    return box;
  }

  function mapInfoPanelNode() {
    const box = takeDetached("mapInfoTab") || ensureNode("div", "mapInfoTab", "tab-panel active", `<pre id="mapInfo">未加载地图。</pre>`);
    box.className = "tab-panel active";
    box.style.display = "block";
    box.style.overflow = "auto";
    const pre = box.querySelector("#mapInfo") || ensureNode("pre", "mapInfo", "", "未加载地图。");
    if (!pre.parentElement) box.appendChild(pre);
    pre.style.maxHeight = "none";
    pre.style.height = "auto";
    return box;
  }

  function appendHiddenCompatNodes(p) {
    const nodes = [
      takeDetached("connectionTools") || ensureNode("div", "connectionTools", "warp-tools empty", ""),
      takeDetached("eventDetail") || ensureNode("pre", "eventDetail", "", "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。"),
      takeDetached("warpTools") || ensureNode("div", "warpTools", "warp-tools empty", ""),
    ];
    for (const el of nodes) {
      el.style.display = "none";
      p.appendChild(el);
    }
  }

  function hideCenterMetadataInfo() {
    const box = document.getElementById("metadataMapInfoBox");
    if (box) box.remove();
  }

  function showEvents() {
    hideCenterMetadataInfo();
    const p = resetRightPanel("地图事件");
    if (!p) return;
    p.appendChild(eventPanelNode());
    appendHiddenCompatNodes(p);
  }

  function showMetadata() {
    hideCenterMetadataInfo();
    const p = resetRightPanel("地图信息");
    if (!p) return;
    p.appendChild(mapInfoPanelNode());
    appendHiddenCompatNodes(p);
  }

  function showConnector() {
    hideCenterMetadataInfo();
    const p = resetRightPanel("地图连接器");
    if (!p) return;
    const connector = takeDetached("mapConnectorPanel") || document.createElement("div");
    connector.id = "mapConnectorPanel";
    connector.className = "connector-panel active";
    connector.style.display = "block";
    connector.style.overflow = "auto";
    p.appendChild(connector);
    appendHiddenCompatNodes(p);
    if (typeof window.renderConnectorPanel === "function") window.renderConnectorPanel();
  }

  function showTerrain() {
    hideCenterMetadataInfo();
    const p = resetRightPanel("地图编辑");
    if (!p) return;
    p.classList.add("mode-terrain-editor");
    const editor = takeDetached("terrainEditorPanel") || document.getElementById("terrainEditorPanel");
    if (editor) {
      editor.classList.add("active");
      editor.style.display = "flex";
      p.appendChild(editor);
    }
    appendHiddenCompatNodes(p);
  }

  function renderRightPanel() {
    const m = mode();
    if (m === "events") showEvents();
    else if (m === "connections") showConnector();
    else if (m === "metadata") showMetadata();
    else showTerrain();
  }

  function wrapSelectMap() {
    const oldSelectMap = window.selectMap || (typeof selectMap === "function" ? selectMap : null);
    if (!oldSelectMap || oldSelectMap.__rightPanelEventWrapped) return;
    const wrapped = function selectMapRightPanelEventWrapper(...args) {
      const result = oldSelectMap.apply(this, args);
      renderRightPanel();
      return result;
    };
    wrapped.__rightPanelEventWrapped = true;
    try { selectMap = wrapped; } catch (err) { window.selectMap = wrapped; }
    window.selectMap = wrapped;
  }

  function wrapRenderMap() {
    const oldRenderMap = window.renderMap || (typeof renderMap === "function" ? renderMap : null);
    if (!oldRenderMap || oldRenderMap.__rightPanelEventWrapped) return;
    const wrapped = async function renderMapRightPanelEventWrapper(...args) {
      const result = await oldRenderMap.apply(this, args);
      renderRightPanel();
      return result;
    };
    wrapped.__rightPanelEventWrapped = true;
    try { renderMap = wrapped; } catch (err) { window.renderMap = wrapped; }
    window.renderMap = wrapped;
  }

  function install() {
    if (installed) return;
    installed = true;
    wrapSelectMap();
    wrapRenderMap();
    document.addEventListener("click", (e) => {
      if (e.target.closest(".editor-mode-option") || e.target.closest(".terrain-editor-tab-btn")) renderRightPanel();
    }, true);
    document.addEventListener("change", (e) => {
      if (e.target.matches('input[name="mouseMode"]')) renderRightPanel();
    }, true);
    renderRightPanel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
  window.renderRightPanel = renderRightPanel;
})();
