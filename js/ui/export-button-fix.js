// ============================================================
// Export ROM button fix
// ============================================================
// 确保导出按钮点击有效。
// main.js 里 rom 是顶层 let 变量，不一定挂在 window 上，所以这里直接读取 rom 绑定。

(function exportButtonFix() {
  function getCurrentRom() {
    try {
      return typeof rom !== "undefined" ? rom : null;
    } catch (err) {
      return null;
    }
  }

  function getCurrentRomFileName() {
    try {
      return typeof romFileName !== "undefined" && romFileName ? romFileName : "Run&Bun.gba";
    } catch (err) {
      return "Run&Bun.gba";
    }
  }

  function exportRomNow() {
    const currentRom = getCurrentRom();
    if (!currentRom || !currentRom.length) {
      alert("请先导入 ROM");
      return;
    }

    const fileName = getCurrentRomFileName();
    const baseName = fileName.replace(/\.(gba|bin)$/i, "");
    const ext = /\.bin$/i.test(fileName) ? ".bin" : ".gba";
    const outName = `${baseName}.modified${ext}`;

    const blob = new Blob([currentRom], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function install() {
    const exportBtn = document.getElementById("exportRomBtn");
    if (!exportBtn || exportBtn.__exportButtonFixInstalled) return;
    exportBtn.__exportButtonFixInstalled = true;

    exportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      exportRomNow();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
