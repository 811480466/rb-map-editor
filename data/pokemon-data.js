// ============================================================
// Pokémon data
// ============================================================
// 本文件使用 JS 全局对象提供 Species ID -> 宝可梦名称映射。
// 这样即使直接用 file:// 打开 index.html，也不需要 fetch JSON 文件。

window.RBEditorPokemonData = {
  270: { id: 270, code: "Lotad", name: "莲叶童子" },
  283: { id: 283, code: "Surskit", name: "溜溜糖球" },
  422: { id: 422, code: "Shellos", name: "无壳海兔" },
  453: { id: 453, code: "Croagunk", name: "不良蛙" },
  535: { id: 535, code: "Tympole", name: "圆蝌蚪" },
  1062: { id: 1062, code: "Shellos", name: "无壳海兔-南海", encAble: false },
};

window.RBEditorPokemonDataById = new Map(
  Object.entries(window.RBEditorPokemonData).map(([id, item]) => [Number(id), item])
);
