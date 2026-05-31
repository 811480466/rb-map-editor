// ============================================================
// Event badge localization
// ============================================================
// 将事件列表前置标签从 OBJ/TRAINER/WARP/BG/COORD 改成更友好的中文含义。

(function eventBadgeLocalizeModule() {
  const LABELS = {
    obj: "NPC",
    trainer: "训练家",
    warp: "传送点",
    bg: "背景事件",
    coord: "触发事件",
  };

  function localizeBadge(badge) {
    if (!badge || !badge.classList) return;
    for (const [cls, label] of Object.entries(LABELS)) {
      if (badge.classList.contains(cls) && badge.textContent.trim() !== label) {
        badge.textContent = label;
        badge.title = label;
        return;
      }
    }
  }

  function localizeEventBadges() {
    const eventList = document.getElementById("eventList");
    if (!eventList) return;
    for (const badge of eventList.querySelectorAll(".badge")) {
      localizeBadge(badge);
    }
  }

  const observer = new MutationObserver(() => localizeEventBadges());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    localizeEventBadges();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventBadgeLocalize = {
    localizeEventBadges,
  };
})();
