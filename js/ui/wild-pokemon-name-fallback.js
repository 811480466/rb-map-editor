// ============================================================
// Wild Pokémon name fallback
// ============================================================
// wild-panel.js 内部会尝试 fetch json/pokemon.json。
// 但如果用户直接用 file:// 打开 index.html，浏览器可能会拦截 fetch。
// 这个脚本作为后处理兜底：扫描表格中的 #SpeciesID，替换成中文宝可梦名称。

(function wildPokemonNameFallbackModule() {
  const FALLBACK_POKEMON = {
    270: { code: "Lotad", name: "莲叶童子" },
    283: { code: "Surskit", name: "溜溜糖球" },
    422: { code: "Shellos", name: "无壳海兔" },
    453: { code: "Croagunk", name: "不良蛙" },
    535: { code: "Tympole", name: "圆蝌蚪" },
    1062: { code: "Shellos", name: "无壳海兔-南海" },
  };

  let pokemonMap = new Map(Object.entries(FALLBACK_POKEMON).map(([id, item]) => [Number(id), item]));
  let loadStarted = false;

  function escapeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadPokemonJson() {
    if (loadStarted) return;
    loadStarted = true;
    try {
      const res = await fetch("json/pokemon.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      if (!Array.isArray(list)) return;
      for (const item of list) {
        const id = Number(item.id);
        if (Number.isInteger(id)) pokemonMap.set(id, item);
      }
      translateWildPokemonCells();
    } catch (err) {
      // file:// 打开页面时经常会进这里；保留内置兜底映射即可。
      translateWildPokemonCells();
    }
  }

  function parseSpeciesIdFromText(text) {
    const m = String(text || "").match(/#(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function formatPokemonHtml(id, item) {
    const name = item?.name || item?.code || `#${id}`;
    const code = item?.code && item.code !== name ? item.code : "";
    return `<span class="wild-pokemon-name" data-translated="1">${escapeText(name)}</span><span class="wild-pokemon-code">#${escapeText(id)}${code ? ` / ${escapeText(code)}` : ""}</span>`;
  }

  function translateWildPokemonCells() {
    const center = document.getElementById("wildCenterPanel");
    if (!center) return;

    for (const el of center.querySelectorAll(".wild-pokemon-name")) {
      if (el.dataset.translated === "1") continue;
      const id = parseSpeciesIdFromText(el.textContent);
      if (!id) continue;
      const item = pokemonMap.get(id);
      if (!item) continue;
      const td = el.closest("td");
      if (!td) continue;
      td.innerHTML = formatPokemonHtml(id, item);
    }
  }

  const observer = new MutationObserver(() => translateWildPokemonCells());

  function install() {
    loadPokemonJson();
    translateWildPokemonCells();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorWildPokemonNameFallback = {
    loadPokemonJson,
    translateWildPokemonCells,
  };
})();
