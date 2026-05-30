// ============================================================
// Right panel observer optimization
// ============================================================
// 合并并优化现有 MutationObservers 和 setTimeout 调用，减少刷新频率，提高性能

(function optimizeRightPanelObserver() {
  let pending = false;
  const rightPanel = document.querySelector('.panel.right');

  if (!rightPanel) return;

  function cleanup() {
    // 原来的 cleanup 逻辑直接调用即可
    if (typeof window.cleanupRightPanel === 'function') {
      window.cleanupRightPanel();
    }
    pending = false;
  }

  const observer = new MutationObserver(() => {
    if (!pending) {
      pending = true;
      // 使用 requestAnimationFrame 或 100ms 延迟刷新，避免过多连续刷新
      setTimeout(cleanup, 100);
    }
  });

  observer.observe(rightPanel, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
})();