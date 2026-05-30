// ============================================================
// Collision panel layout fix
// ============================================================
// 地图碰撞页右侧布局：
// - 透明度放最上面
// - 当前高度 / 当前碰撞属性只显示，不作为输入控件
// - 下方按“可通行 / 不可通行”一行两个方块选择

(function collisionPanelLayoutFix() {
  function injectStyle() {
    if (document.getElementById("collisionPanelLayoutFixStyle")) return;

    const style = document.createElement("style");
    style.id = "collisionPanelLayoutFixStyle";
    style.textContent = `
      #terrainEditorCollisionHost .collision-layout-fix {
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
      .collision-current-label,
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

  function isCollisionTabVisible() {
    return document.querySelector(".terrain-editor-tab-btn.active")?.dataset.terrainTab === "collision";
  }

  function updateCurrentDisplay(host) {
    const elevationInput = document.getElementById("collisionElevationInput");
    const collisionInput = document.getElementById("collisionValueInput");
    const elevation = clampNumber(elevationInput?.value, 0, 15, 3);
    const collision = clampNumber(collisionInput?.value, 0, 3, 1);

    const elevationText = host.querySelector("#collisionCurrentElevationText");
    const collisionText = host.querySelector("#collisionCurrentValueText");
    if (elevationText) elevationText.textContent = `当前高度：${elevation}`;
    if (collisionText) collisionText.textContent = `当前碰撞：${collision === 0 ? "0 可通行" : `${collision} 不可通行`}`;

    for (const btn of host.querySelectorAll(".collision-choice-btn")) {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.elevation) === elevation && Number(btn.dataset.collision) === collision
      );
    }
  }

  function setCollisionValue(host, elevation, collision) {
    const elevationInput = document.getElementById("collisionElevationInput");
    const collisionInput = document.getElementById("collisionValueInput");

    if (elevationInput) {
      elevationInput.value = String(elevation);
      elevationInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (collisionInput) {
      collisionInput.value = String(collision);
      collisionInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    updateCurrentDisplay(host);
  }

  function enhancePanel() {
    injectStyle();

    const host = document.getElementById("terrainEditorCollisionHost");
    if (!host) return;

    const elevationInput = document.getElementById("collisionElevationInput");
    const collisionInput = document.getElementById("collisionValueInput");
    const opacityInput = document.getElementById("collisionOpacityInput");
    if (!elevationInput || !collisionInput || !opacityInput) return;

    if (host.dataset.collisionLayoutFix === "1") {
      updateCurrentDisplay(host);
      return;
    }

    const layout = document.createElement("div");
    layout.className = "collision-layout-fix";

    const opacityCard = document.createElement("div");
    opacityCard.className = "collision-opacity-card";
    opacityCard.innerHTML = `<label>透明度</label>`;
    opacityCard.appendChild(opacityInput);

    const currentCard = document.createElement("div");
    currentCard.className = "collision-current-card";
    currentCard.innerHTML = `
      <span class="collision-current-label">当前选择</span>
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
      passable.onclick = () => setCollisionValue(host, elevation, 0);
      grid.appendChild(passable);

      const blocked = document.createElement("button");
      blocked.type = "button";
      blocked.className = "collision-choice-btn blocked";
      blocked.dataset.elevation = String(elevation);
      blocked.dataset.collision = "1";
      blocked.textContent = String(elevation);
      blocked.title = `高度 ${elevation} / 碰撞 1 / 不可通行`;
      blocked.onclick = () => setCollisionValue(host, elevation, 1);
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

    host.dataset.collisionLayoutFix = "1";
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
    if (e.target.matches("#collisionElevationInput, #collisionValueInput")) {
      const host = document.getElementById("terrainEditorCollisionHost");
      if (host) updateCurrentDisplay(host);
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (isCollisionTabVisible()) scheduleEnhance();
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
