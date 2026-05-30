// ============================================================
// Right panel mode cleanup
// ============================================================
// 修复：从“地形编辑”切到“地图事件”等模式后，地形瓦片/地图碰撞面板仍残留显示的问题。

(function rightPanelModeCleanup() {
  function getMode() {
    return document.querySelector(".editor-mode-option.active")?.dataset.editorMode || "terrain";
  }

  function hideTerrainPanels() {
    const terrainEditorPanel = document.getElementById("terrainEditorPanel");
    if (terrainEditorPanel) {
      terrainEditorPanel.classList.remove("active");
      terrainEditorPanel.style.display = "none";
    }

    const terrainPaintPanel = document.getElementById("terrainPaintPanel");
    if (terrainPaintPanel) {
      terrainPaintPanel.classList.remove("active");
      terrainPaintPanel.style.display = "none";
    }
  }

  function showEventPanelOnly(rightPanel) {
    const title = rightPanel.querySelector(":scope > h2");
    if (title) {
      title.textContent = "地图事件";
      title.style.display = "block";
    }

    const eventTab = document.getElementById("eventTab");
    if (eventTab) {
      eventTab.classList.add("active");
      eventTab.style.display = "block";
    }

    const hiddenSelectors = [
      ".tabs",
      "#mapInfoTab",
      "#connectionTools",
      "#warpTools",
      "#eventDetail",
      "#mapConnectorPanel",
      "#terrainEditorPanel",
      "#terrainPaintPanel",
      ":scope > h3",
    ];

    for (const selector of hiddenSelectors) {
      for (const el of rightPanel.querySelectorAll(selector)) {
        el.style.display = "none";
      }
    }
  }

  function cleanup() {
    const mode = getMode();
    const rightPanel = document.querySelector(".panel.right");
    if (!rightPanel) return;

    if (mode !== "terrain") {
      rightPanel.classList.remove("mode-terrain-editor", "mode-terrain-view", "mode-terrain-paint", "final-terrain-editor");
      hideTerrainPanels();
    }

    if (mode === "events") {
      showEventPanelOnly(rightPanel);
    }
  }

  function scheduleCleanup() {
    setTimeout(cleanup, 0);
    setTimeout(cleanup, 60);
    setTimeout(cleanup, 160);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".editor-mode-option")) scheduleCleanup();
  }, true);

  const observer = new MutationObserver(scheduleCleanup);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  scheduleCleanup();
})();
