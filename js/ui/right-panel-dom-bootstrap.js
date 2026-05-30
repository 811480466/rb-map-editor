// ============================================================
// Right panel DOM bootstrap
// ============================================================
// 右侧面板只在 HTML 保留一个空容器，这里在 main.js 加载前动态创建
// main.js 仍然需要的兼容节点，避免把事件列表/地图信息/事件详情写死在 HTML 里。

(function rightPanelDomBootstrap() {
  function ensureElement(parent, tag, id, className, html) {
    let el = document.getElementById(id);
    if (el) return el;

    el = document.createElement(tag);
    el.id = id;
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    parent.appendChild(el);
    return el;
  }

  const panel = document.querySelector(".panel.right");
  if (!panel) return;

  panel.innerHTML = "";

  const title = document.createElement("h2");
  title.id = "rightPanelTitle";
  title.textContent = "地图信息";
  panel.appendChild(title);

  const tabs = document.createElement("div");
  tabs.className = "tabs";
  tabs.style.display = "none";
  tabs.innerHTML = `
    <button id="tabEvents" class="tab-btn active" type="button">事件列表</button>
    <button id="tabMapInfo" class="tab-btn" type="button">地图信息</button>
  `;
  panel.appendChild(tabs);

  ensureElement(panel, "div", "eventTab", "tab-panel active", `
    <div class="summary" id="eventSummary">
      <div>OBJ: 0</div>
      <div>TRAINER: 0</div>
      <div>WARP: 0</div>
      <div>BG/COORD: 0</div>
    </div>
    <div id="eventList"></div>
  `);

  ensureElement(panel, "div", "mapInfoTab", "tab-panel", `<pre id="mapInfo">未加载地图。</pre>`);
  ensureElement(panel, "div", "connectionTools", "warp-tools empty", "");

  const detailTitle = document.createElement("h3");
  detailTitle.textContent = "事件详情";
  detailTitle.style.display = "none";
  panel.appendChild(detailTitle);

  ensureElement(panel, "pre", "eventDetail", "", "点击地图格子查看 blockId / behavior / collision；点击事件列表查看事件详情。");
  ensureElement(panel, "div", "warpTools", "warp-tools empty", "");
})();
