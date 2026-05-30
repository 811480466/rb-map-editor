// ============================================================
// Import button fix
// ============================================================
// 修复导入按钮点击无效问题，确保点击显示 setupModal

(function importButtonFix() {
  function openModal() {
    const modal = document.getElementById('setupModal');
    if (!modal) return;
    modal.classList.add('open', 'show');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.zIndex = 300;
  }

  const btn = document.getElementById('openSetupModal');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    }, true);
  }

  const closeBtn = document.getElementById('closeSetupModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const modal = document.getElementById('setupModal');
      if (!modal) return;
      modal.classList.remove('open', 'show');
      modal.setAttribute('aria-hidden', 'true');
    }, true);
  }
})();