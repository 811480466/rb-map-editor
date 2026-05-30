// ============================================================
// Metadata panel cleanup
// ============================================================
// 将地图元数据模式下的地图信息彻底移到右侧面板，并清理中间区域。

(function metadataPanelCleanup() {
  function cleanMetadataPanel() {
    const modeBtn = document.querySelector('.editor-mode-option[data-editor-mode="metadata"]');
    if (!modeBtn) return;

    modeBtn.addEventListener('click', () => {
      // 清理中间区域的地图信息
      const centerInfo = document.getElementById('metadataMapInfoBox');
      if (centerInfo) centerInfo.style.display = 'none';

      // 右侧面板只显示标题和地图信息
      const panel = document.querySelector('.panel.right');
      if (!panel) return;
      const children = Array.from(panel.children);
      children.forEach(el => {
        if (el.tagName === 'H2') {
          el.textContent = '地图信息';
          el.style.display = 'block';
        } else if (el.id === 'mapInfoTab') {
          el.style.display = 'block';
          el.classList.add('active');
        } else {
          el.style.display = 'none';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanMetadataPanel);
  } else {
    cleanMetadataPanel();
  }
})();