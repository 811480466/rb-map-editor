// ============================================================
// Export ROM button fix
// ============================================================
// 确保导出按钮点击有效
(function exportButtonFix() {
  const exportBtn = document.getElementById('exportRomBtn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    if (!window.rom) {
      alert('请先导入 ROM');
      return;
    }

    const blob = new Blob([window.rom], {type: 'application/octet-stream'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Run&Bun_Modified.gba';
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();