// ============================================================
// Pokémon data normalizer
// ============================================================
// data/pokemon-data.js 应提供 window.RBEditorPokemonData 数组。
// 这里兼容手动迁移时出现的 [[...]] 嵌套数组，并重新生成 RBEditorPokemonDataById。

(function pokemonDataNormalizeModule() {
  function flattenPokemonData(input, out = []) {
    if (!input) return out;

    if (Array.isArray(input)) {
      for (const item of input) flattenPokemonData(item, out);
      return out;
    }

    if (typeof input === "object") {
      const id = Number(input.id);
      if (Number.isInteger(id)) {
        out.push({ ...input, id });
      } else {
        for (const [key, value] of Object.entries(input)) {
          if (!value || typeof value !== "object") continue;
          const fallbackId = Number(value.id ?? key);
          if (Number.isInteger(fallbackId)) out.push({ ...value, id: fallbackId });
        }
      }
    }

    return out;
  }

  function normalizePokemonData() {
    const list = flattenPokemonData(window.RBEditorPokemonData || []);
    window.RBEditorPokemonData = list;
    window.RBEditorPokemonDataById = new Map(list.map(item => [Number(item.id), item]));
    return window.RBEditorPokemonDataById;
  }

  normalizePokemonData();
  window.RBEditorNormalizePokemonData = normalizePokemonData;
})();
