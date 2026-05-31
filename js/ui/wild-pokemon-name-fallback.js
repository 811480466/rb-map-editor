// ============================================================
// Wild Pokémon name fallback
// ============================================================
// 使用 data/pokemon-data.js 里的 window.RBEditorPokemonDataById 翻译 Species ID。
// 不依赖 fetch，所以直接用 file:// 打开 index.html 也能显示中文宝可梦名。

(function wildPokemonNameFallbackModule() {
  const FALLBACK_POKEMON = {
    270: { id: 270, code: "Lotad", name: "莲叶童子" },
    283: { id: 283, code: "Surskit", name: "溜溜糖球" },
    422: { id: 422, code: "Shellos", name: "无壳海兔" },
    453: { id: 453, code: "Croagunk", name: "不良蛙" },
    535: { id: 535, code: "Tympole", name: "圆蝌蚪" },
    1062: { id: 1062, code: "Shellos", name: "无壳海兔-南海" },
  };

  function getPokemonMap() {
    if (window.RBEditorPokemonDataById instanceof Map) {
      return window.RBEditorPokemonDataById;
    }

    if (window.RBEditorPokemonData && typeof window.RBEditorPokemonData === "object") {
      return new Map(
        Object.entries(window.RBEditorPokemonData).map(([id, item]) => [Number(id), item])
      );
    }

    return new Map(Object.entries(FALLBACK_POKEMON).map(([id, item]) => [Number(id), item]));
  }

  function escapeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

    const pokemonMap = getPokemonMap();

    for (const el of center.querySelectorAll(".wild-pokemon-name")) {
      if (el.dataset.translated === "1") continue;
      const id = parseSpeciesIdFromText(el.textContent);
      if (!id) continue;
      const item = pokemonMap.get(id) || FALLBACK_POKEMON[id];
      if (!item) continue;
      const td = el.closest("td");
      if (!td) continue;
      td.innerHTML = formatPokemonHtml(id, item);
    }
  }

  const observer = new MutationObserver(() => translateWildPokemonCells());

  function install() {
    translateWildPokemonCells();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();

  window.RBEditorWildPokemonNameFallback = {
    translateWildPokemonCells,
    getPokemonMap,
  };
})();
