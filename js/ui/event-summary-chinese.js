// ============================================================
// Event summary localization
// ============================================================
// 将右侧事件汇总统计：OBJ / TRAINER / WARP / BG/COORD 转为中文显示

(function eventSummaryChineseModule() {
  function localizeSummary() {
    const summary = document.getElementById('eventSummary');
    if (!summary) return;

    const divs = summary.querySelectorAll('div');
    if (divs.length < 4) return;

    // 对应映射
    const mapping = [
      {key:'OBJ', label:'对象'},
      {key:'TRAINER', label:'训练家'},
      {key:'WARP', label:'传送点'},
      {key:'BG/COORD', label:'事件'}
    ];

    divs.forEach((div,i) => {
      const count = div.textContent.split(':')[1].trim();
      div.textContent = `${mapping[i].label}: ${count}`;
    });
  }

  const observer = new MutationObserver(() => localizeSummary());

  function install() {
    observer.observe(document.body, { childList: true, subtree: true });
    localizeSummary();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();

  window.RBEditorEventSummaryChinese = {
    localizeSummary
  };
})();