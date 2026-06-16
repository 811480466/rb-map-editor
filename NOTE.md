我在迁移 rb-map-editor：目标是把 legacy 原生 HTML/JS 项目迁到 Vue 3 + Electron。

当前结构：
- legacy/：旧版完整实现
- desktop/：Vue 3 新版
- electron/：Electron 壳
- desktop/src/core/：ROM 领域模型和解析逻辑迁移目标

当前进度：
- Electron 壳已搭好
- Vue Home 已有导入/导出、地图列表、模式切换
- 地图列表通过 RomImportService -> RomProject -> MapRepository 生成
- map-edit/map-event/map-connection/map-metadata/wild-pokemon 组件基本还是空壳

重要状态：
- MapRepository 已迁移部分 map header/layout/region name 扫描
- Event/Connection/Tileset/Wild/Script 多数只有类骨架，旧逻辑还没接入
- legacy 中主要逻辑：
  - map-header.js：地图/布局/事件头解析
  - map-events.js：Object/Warp/Coord/BG 事件解析
  - tileset-renderer.js/map-renderer.js：地图渲染
  - warp.js：warp/connection 跳转和反查
  - wild-encounters.js：野生遭遇读写创建
  - terrain-editor.js/collision-editor.js：地形和碰撞编辑
  - connector-panel.js：连接器编辑和写回

已知问题：
- npm run lint 当前有少量 semi 风格错误
- vite.config.mjs 使用 __dirname，ESM 下会报错，需要改为基于 fileURLToPath 的路径