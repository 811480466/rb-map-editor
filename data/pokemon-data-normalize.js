// ============================================================
// Pokémon data normalizer
// ============================================================
// data/pokemon-data.js 应提供 window.RBEditorPokemonData 数组。
// 为了避免手动迁移时出现 [[...]] 这种嵌套数组，这里统一拍平成一层，
// 然后重新生成 window.RBEditorPokemonDataById。

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
        // 兼容旧对象写法：{ 1: {...}, 2: {...} }
        for (const [key, value] of Object.entries(input)) {
          if (value && typeof value === "object") {
            const fallbackId = Number(value.id ?? key);
            if (Number.isInteger(fallbackId)) out.push({ ...value, id: fallbackId });
          }
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
