# rb-map-editor

Pokémon Run&Bun 1.07 ROM 地图查看与分析工具。

## 当前功能

- 导入 `.gba/.bin` ROM
- 扫描并显示 MapHeader / MapLayout / MapEvents
- 地图 tileset 渲染
- OBJ / TRAINER / WARP / BG / COORD 事件查看
- Warp 跳转与反查
- Connections 四方向跳转与反查
- 鼠标悬停查看 blockId / behavior / collision
- NPC / BG / COORD 基础脚本解析
- 天气下拉修改并导出修改后的 ROM

## 文件结构

```text
index.html
css/style.css
js/rom-reader.js
js/text-codec.js
js/map-header.js
js/warp.js
js/script-parser.js
js/map-events.js
js/tileset-renderer.js
js/map-renderer.js
js/block-info.js
js/main.js
```

## 注意

不要把商业 ROM、改版 ROM、存档等文件提交到仓库。`.gitignore` 已默认忽略常见 ROM/存档后缀。
