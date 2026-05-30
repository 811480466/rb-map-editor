// ============================================================
// Disable broad UI MutationObservers
// ============================================================
// 之前右侧面板补丁脚本使用 MutationObserver 监听整页 DOM，
// 会被自身 style/class 修改反复触发，导致页面卡顿。
// 这里在这些补丁脚本加载前，把 MutationObserver 临时替换为 no-op。
// 后续右侧刷新改为点击/切换地图等明确事件触发。

(function disableUiMutationObservers() {
  if (window.__rbOriginalMutationObserver) return;

  window.__rbOriginalMutationObserver = window.MutationObserver;

  window.MutationObserver = class DisabledUiMutationObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
})();
