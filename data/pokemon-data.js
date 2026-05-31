// ============================================================
// Pokémon data
// ============================================================
// 本文件使用 JS 数组提供 Species ID -> 宝可梦名称映射。
// 这样即使直接用 file:// 打开 index.html，也不需要 fetch JSON 文件。
// 后续追加数据时，直接往 RBEditorPokemonData 数组里添加对象即可：
// { id: 1, code: "Bulbasaur", name: "妙蛙种子" }

window.RBEditorPokemonData = [
  { id: 270, code: "Lotad", name: "莲叶童子" },
  { id: 283, code: "Surskit", name: "溜溜糖球" },
  { id: 422, code: "Shellos", name: "无壳海兔" },
  { id: 453, code: "Croagunk", name: "不良蛙" },
  { id: 535, code: "Tympole", name: "圆蝌蚪" },
  { id: 1062, code: "Shellos", name: "无壳海兔-南海", encAble: false },
];

window.RBEditorPokemonDataById = new Map(
  window.RBEditorPokemonData.map(item => [Number(item.id), item])
);
