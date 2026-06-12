// ============================================================
// Event badge localization + event list card style
// ============================================================
// 将事件列表前置标签从 OBJ/TRAINER/WARP/BG/COORD 改成更友好的中文含义。
// 同时给事件列表每一项加卡片框。

(function eventBadgeLocalizeModule() {
  const LABELS = {
    obj: "NPC",
    trainer: "训练家",
    warp: "传送点",
    bg: "背景事件",
    coord: "触发事件",
  };

  function injectStyle() {
    if (document.getElementById("eventListCardStyle")) return;
    const style = document.createElement("style");
    style.id = "eventListCardStyle";
    style.textContent = `
      #eventList {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #eventList .event-row {
        display: block;
        box-sizing: border-box;
        width: 100%;
        margin: 0 !important;
        padding: 8px 9px !important;
        border: 1px solid #d4e2f5 !important;
        border-radius: 10px !important;
        background: #ffffff !important;
        box-shadow: 0 3px 10px rgba(15, 23, 42, 0.035);
        cursor: pointer;
        transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease;
      }

      #eventList .event-row:hover {
        border-color: #9fc3f3 !important;
        background: #f8fbff !important;
        box-shadow: 0 5px 14px rgba(31, 95, 191, 0.10);
        transform: translateY(-1px);
      }

      #eventList .event-row.active {
        border-color: #1f5fbf !important;
        background: #eef6ff !important;
        box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.12);
      }

      #eventList .event-row .small {
        margin-top: 4px;
        line-height: 1.35;
      }
    `;
    document.head.appendChild(style);
  }

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
    injectStyle();
    const eventList = document.getElementById("eventList");
    if (!eventList) return;
    for (const badge of eventList.querySelectorAll(".badge")) {
      localizeBadge(badge);
    }
  }

  const observer = new MutationObserver(() => localizeEventBadges());

  function install() {
    injectStyle();
    observer.observe(document.body, { childList: true, subtree: true });
    localizeEventBadges();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorEventBadgeLocalize = {
    localizeEventBadges,
  };
})();
