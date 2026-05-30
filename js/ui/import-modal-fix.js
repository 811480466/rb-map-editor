// ============================================================
// Import modal fix
// ============================================================
// main.js 使用 open 类名，CSS 之前只支持 show，导致点击“导入”后弹窗不显示。

(function importModalFix() {
  function injectStyle() {
    if (document.getElementById("importModalFixStyle")) return;

    const style = document.createElement("style");
    style.id = "importModalFixStyle";
    style.textContent = `
      .modal-backdrop.open,
      .modal-backdrop.show {
        display: flex !important;
        z-index: 1000 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function openModal() {
    const modal = document.getElementById("setupModal");
    if (!modal) return;
    modal.classList.add("open", "show");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    const modal = document.getElementById("setupModal");
    if (!modal) return;
    modal.classList.remove("open", "show");
    modal.setAttribute("aria-hidden", "true");
  }

  function install() {
    injectStyle();

    const openBtn = document.getElementById("openSetupModal");
    const closeBtn = document.getElementById("closeSetupModal");
    const doneBtn = document.getElementById("doneSetupModal");
    const modal = document.getElementById("setupModal");

    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, true);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal, true);
    if (doneBtn) doneBtn.addEventListener("click", closeModal, true);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      }, true);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
