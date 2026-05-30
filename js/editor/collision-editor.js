// ============================================================
// Collision editor unified module
// ============================================================
// 整合原 collision-panel-layout-fix.js 和 collision-click-fix.js：
// - 负责地图碰撞 tab 的右侧布局
// - 负责查看模式点击格子读取高度/碰撞
// - 负责绘制模式点击格子只写 collision/elevation，并阻止旧瓦片绘制逻辑继续执行

(function collisionEditor() {
  const state = window.RBEditorState || { collision: {} };

  function injectStyle() {
    if (document.getElementById("collisionEditorStyle")) return;

    const style = document.createElement("style");
    style.id = "collisionEditorStyle";
    style.textContent = `
      #terrainEditorCollisionHost .collision-editor-layout {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        height: 100%;
      }

      .collision-opacity-card,
      .collision-current-card,
      .collision-choice-card {
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: #f8fbff;
      }

      .collision-opacity-card label,
      .collision-choice-title {
        display: block;
        margin-bottom: 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 800;
      }

      .collision-opacity-card input[type="range"] {
        width: 100%;
        margin: 0;
      }

      .collision-current-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .collision-current-value {
        padding: 9px 10px;
        border: 1px solid #cfe0fb;
        border-radius: 8px;
        background: #fff;
        color: var(--blue-dark);
        font-size: 13px;
        font-weight: 900;
        text-align: center;
      }

      .collision-choice-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .collision-choice-btn {
        margin: 0 !important;
        min-height: 44px;
        padding: 8px 6px !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 9px !important;
        box-shadow: none !important;
        font-size: 13px !important;
        font-weight: 900 !important;
        cursor: pointer;
      }

      .collision-choice-btn.passable {
        background: #fff !important;
        color: #0f172a !important;
      }

      .collision-choice-btn.blocked {
        background: #ef4444 !important;
        border-color: #dc2626 !important;
        color: #fff !important;
      }

      .collision-choice-btn.active {
        outline: 3px solid rgba(37, 99, 235, .35);
        border-color: var(--blue) !important;
      }

      .collision-choice-btn:hover {
        box-shadow: 0 0 0 2px rgba(37, 99, 235, .14) !important;
      }

      .collision-hidden-inputs {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function getTerrainTab() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab || state.terrainTab || "tiles";
  }

  function getEditorMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || state.mode || "terrain";
  }

  function getMouseMode() {
    return document.querySelector('input[name="mouseMode"]:checked')?.value || state.mouseMode || "view";
  }

  function isCollisionTab() {
    return getEditorMode() === "terrain" && getTerrainTab() === "collision";
  }

  function collisionText(collision) {
    return collision === 0 ? "0 可通行" : `${collision} 不可通行`;
  }

  function updateState(elevation, collision, opacity = null) {
    state.terrainTab = "collision";
    state.collision = state.collision || {};
    state.collision.elevation = elevation;
    state.collision.value = collision;
    if (opacity !== null) state.collision.opacity = opacity;
  }

  function getInputs() {
    return {
      host: document.getElementById("terrainEditorCollisionHost"),
      elevationInput: document.getElementById("collisionElevationInput"),
      collisionInput: document.getElementById("collisionValueInput"),
      opacityInput: document.getElementById("collisionOpacityInput"),
    };
  }

  function updateCurrentDisplay(host = document.getElementById("terrainEditorCollisionHost")) {
    const { elevationInput, collisionInput, opacityInput } = getInputs();
    if (!host || !elevationInput || !collisionInput) return;

    const elevation = clampNumber(elevationInput.value, 0, 15, 3);
    const collision = clampNumber(collisionInput.value, 0, 3, 1);
    const opacity = opacityInput ? clampNumber(opacityInput.value, 0, 100, 42) / 100 : null;
    updateState(elevation, collision, opacity);

    const elevationText = host.querySelector("#collisionCurrentElevationText");
    const collisionValueText = host.querySelector("#collisionCurrentValueText");
    if (elevationText) elevationText.textContent = `当前高度：${elevation}`;
    if (collisionValueText) collisionValueText.textContent = `当前碰撞：${collisionText(collision)}`;

    for (const btn of host.querySelectorAll(".collision-choice-btn")) {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.elevation) === elevation && Number(btn.dataset.collision) === collision
      );
    }
  }

  function rerenderMap() {
    if (currentMap && typeof renderMap === "function") renderMap(currentMap, currentEvents);
  }

  function setCollisionValue(elevation, collision, { rerender = true } = {}) {
    const { host, elevationInput, collisionInput, opacityInput } = getInputs();
    if (!host || !elevationInput || !collisionInput) return;

    const opacityValue = opacityInput ? opacityInput.value : null;
    elevationInput.value = String(clampNumber(elevation, 0, 15, 3));
    collisionInput.value = String(clampNumber(collision, 0, 3, 1));
    if (opacityInput && opacityValue !== null) opacityInput.value = opacityValue;

    updateCurrentDisplay(host);
    if (rerender) rerenderMap();
  }

  function getCellOffset(cell) {
    if (!cell || !currentMap || !rom) return null;
    const mapOff = ptrToOffset(currentMap.layout.mapPtr);
    if (mapOff === null) return null;
    const w = currentMap.layout.width;
    const h = currentMap.layout.height;
    if (cell.x < 0 || cell.y < 0 || cell.x >= w || cell.y >= h) return null;
    const cellOff = mapOff + (cell.y * w + cell.x) * 2;
    return isValidOffset(cellOff, 2) ? cellOff : null;
  }

  function readCollisionFromCell(cell) {
    const cellOff = getCellOffset(cell);
    if (cellOff === null) return false;

    const raw = readU16(cellOff);
    const collision = (raw >> 10) & 0x03;
    const elevation = (raw >> 12) & 0x0F;
    setCollisionValue(elevation, collision, { rerender: false });
    return true;
  }

  function paintCollisionToCell(cell) {
    const cellOff = getCellOffset(cell);
    if (cellOff === null) return false;

    const { elevationInput, collisionInput } = getInputs();
    const elevation = clampNumber(elevationInput?.value, 0, 15, state.collision?.elevation ?? 3);
    const collision = clampNumber(collisionInput?.value, 0, 3, state.collision?.value ?? 1);

    const raw = readU16(cellOff);
    const blockId = raw & 0x03FF;
    const newRaw = blockId | ((collision & 0x03) << 10) | ((elevation & 0x0F) << 12);
    rom[cellOff] = newRaw & 0xFF;
    rom[cellOff + 1] = (newRaw >> 8) & 0xFF;

    updateState(elevation, collision);
    rerenderMap();
    updateCurrentDisplay();
    return true;
  }

  function enhancePanel() {
    injectStyle();

    const { host, elevationInput, collisionInput, opacityInput } = getInputs();
    if (!host || !elevationInput || !collisionInput || !opacityInput) return;

    if (host.dataset.collisionEditorReady === "1") {
      updateCurrentDisplay(host);
      return;
    }

    const opacityValue = opacityInput.value;

    const layout = document.createElement("div");
    layout.className = "collision-editor-layout";

    const opacityCard = document.createElement("div");
    opacityCard.className = "collision-opacity-card";
    opacityCard.innerHTML = `<label>透明度</label>`;
    opacityCard.appendChild(opacityInput);
    opacityInput.value = opacityValue;

    const currentCard = document.createElement("div");
    currentCard.className = "collision-current-card";
    currentCard.innerHTML = `
      <div class="collision-current-grid">
        <div id="collisionCurrentElevationText" class="collision-current-value">当前高度：3</div>
        <div id="collisionCurrentValueText" class="collision-current-value">当前碰撞：1 不可通行</div>
      </div>
    `;

    const choiceCard = document.createElement("div");
    choiceCard.className = "collision-choice-card";
    choiceCard.innerHTML = `
      <span class="collision-choice-title">碰撞/高度方块</span>
      <div class="collision-choice-grid" id="collisionChoiceGrid"></div>
    `;

    const grid = choiceCard.querySelector("#collisionChoiceGrid");
    for (let elevation = 0; elevation <= 15; elevation++) {
      const passable = document.createElement("button");
      passable.type = "button";
      passable.className = "collision-choice-btn passable";
      passable.dataset.elevation = String(elevation);
      passable.dataset.collision = "0";
      passable.textContent = String(elevation);
      passable.title = `高度 ${elevation} / 碰撞 0 / 可通行`;
      passable.onclick = () => setCollisionValue(elevation, 0);
      grid.appendChild(passable);

      const blocked = document.createElement("button");
      blocked.type = "button";
      blocked.className = "collision-choice-btn blocked";
      blocked.dataset.elevation = String(elevation);
      blocked.dataset.collision = "1";
      blocked.textContent = String(elevation);
      blocked.title = `高度 ${elevation} / 碰撞 1 / 不可通行`;
      blocked.onclick = () => setCollisionValue(elevation, 1);
      grid.appendChild(blocked);
    }

    const hidden = document.createElement("div");
    hidden.className = "collision-hidden-inputs";
    hidden.appendChild(elevationInput);
    hidden.appendChild(collisionInput);

    host.innerHTML = "";
    layout.appendChild(opacityCard);
    layout.appendChild(currentCard);
    layout.appendChild(choiceCard);
    layout.appendChild(hidden);
    host.appendChild(layout);

    elevationInput.addEventListener("change", () => updateCurrentDisplay(host));
    collisionInput.addEventListener("change", () => updateCurrentDisplay(host));

    host.dataset.collisionEditorReady = "1";
    updateCurrentDisplay(host);
  }

  function scheduleEnhance() {
    setTimeout(enhancePanel, 0);
    setTimeout(enhancePanel, 80);
    setTimeout(enhancePanel, 200);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".terrain-editor-tab-btn") || e.target.closest(".editor-mode-option")) {
      scheduleEnhance();
    }
  }, true);

  document.addEventListener("change", (e) => {
    if (e.target.matches("#collisionElevationInput, #collisionValueInput, #collisionOpacityInput")) {
      updateCurrentDisplay();
    }
  }, true);

  window.addEventListener("click", (e) => {
    if (!isCollisionTab()) return;
    if (!e.target || e.target.id !== "mapCanvas") return;
    if (typeof getMapCellFromMouseEvent !== "function") return;

    const cell = getMapCellFromMouseEvent(e);
    if (!cell) return;

    if (getMouseMode() === "paint") {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      paintCollisionToCell(cell);
    } else {
      readCollisionFromCell(cell);
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (isCollisionTab()) scheduleEnhance();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { subtree: true, childList: true });
      scheduleEnhance();
    });
  } else {
    observer.observe(document.body, { subtree: true, childList: true });
    scheduleEnhance();
  }
})();
