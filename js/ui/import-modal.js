// ============================================================
// Import modal
// ============================================================
// 负责导入设置弹窗的打开、关闭和显示层级。

(function importModal() {
  function injectStyle() {
    if (document.getElementById("importModalStyle")) return;

    const style = document.createElement("style");
    style.id = "importModalStyle";
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

    if (openBtn && !openBtn.__importModalInstalled) {
      openBtn.__importModalInstalled = true;
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }, true);
    }

    if (closeBtn && !closeBtn.__importModalInstalled) {
      closeBtn.__importModalInstalled = true;
      closeBtn.addEventListener("click", closeModal, true);
    }

    if (doneBtn && !doneBtn.__importModalInstalled) {
      doneBtn.__importModalInstalled = true;
      doneBtn.addEventListener("click", closeModal, true);
    }

    if (modal && !modal.__importModalInstalled) {
      modal.__importModalInstalled = true;
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      }, true);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorImportModal = { open: openModal, close: closeModal };
})();
