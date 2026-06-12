# Core Class Design

## 设计原则

- `core` 只处理 ROM 数据、领域对象和业务规则，不依赖 Vue、Element Plus、DOM 或 Canvas。
- `util` 只放无状态通用工具，不保存 ROM 业务数据。
- ROM 中有独立结构、独立地址或独立生命周期的数据使用 Class 表示。
- 不要求每个数字都创建 Class，避免地图格子等高频数据产生过多无意义对象。
- 所有 ROM 结构对象统一保存 `rom`、`offset`、`size`，需要时再保存 `pointer`。
- 成员变量分为：
  - ROM 字段：ROM 中实际存在的数据。
  - 关联对象：由指针解析得到的其他 Class。
  - 派生字段：通过 ROM 字段计算得到，不直接写入 ROM。
- 修改 ROM 的方法同时更新当前对象成员变量。
- Repository 负责扫描、创建、缓存和查找对象，实体对象不扫描整个 ROM。

## 推荐目录

```text
core/
  project/
    RomProject.js
  rom/
    Rom.js
    RomProfile.js
    RomEntity.js
    FreeSpaceManager.js
    AllocationRange.js
  map/
    MapRepository.js
    MapGroupTable.js
    MapGroup.js
    MapHeader.js
    RegionMapSection.js
    MapLayout.js
    MapBlock.js
    MapEventCollection.js
    MapConnectionCollection.js
    MapConnection.js
  event/
    BaseMapEvent.js
    ObjectEvent.js
    WarpEvent.js
    CoordEvent.js
    BgEvent.js
  tileset/
    TilesetRepository.js
    Tileset.js
    Metatile.js
    MetatileAttribute.js
    Palette.js
  wild/
    WildEncounterRepository.js
    WildEncounterTable.js
    WildEncounterHeader.js
    WildEncounterGroup.js
    WildPokemonSlot.js
  script/
    ScriptRepository.js
    Script.js
    ScriptCommand.js
    ScriptArgument.js
    TrainerBattleCommand.js
  text/
    PokemonText.js
    PokemonTextCodec.js
```

## 总体对象关系

```text
RomProject
  ├─ Rom
  ├─ RomProfile
  ├─ FreeSpaceManager
  ├─ MapRepository
  │   └─ MapHeader
  │       ├─ RegionMapSection
  │       ├─ MapLayout
  │       │   ├─ Tileset
  │       │   └─ MapBlock[]
  │       ├─ MapEventCollection
  │       │   ├─ ObjectEvent[]
  │       │   ├─ WarpEvent[]
  │       │   ├─ CoordEvent[]
  │       │   └─ BgEvent[]
  │       └─ MapConnectionCollection
  │           └─ MapConnection[]
  ├─ WildEncounterRepository
  │   └─ WildEncounterTable
  │       └─ WildEncounterHeader[]
  └─ ScriptRepository
      └─ Script[]
```

## 基础对象

### RomProject

整个已加载项目的聚合根。UI 应优先持有这个对象，而不是分别持有多个全局变量。

```js
class RomProject {
  rom
  profile
  freeSpaceManager
  mapRepository
  tilesetRepository
  wildEncounterRepository
  scriptRepository
  textCodec
  loadedAt
  dirty
}
```

主要成员：

| 成员 | 类型 | 说明 |
|---|---|---|
| `rom` | `Rom` | 当前 ROM 数据 |
| `profile` | `RomProfile` | 当前 ROM 版本的地址和结构配置 |
| `freeSpaceManager` | `FreeSpaceManager` | 全局空白区域管理器 |
| `mapRepository` | `MapRepository` | 地图扫描、缓存和查询 |
| `tilesetRepository` | `TilesetRepository` | Tileset 缓存和查询 |
| `wildEncounterRepository` | `WildEncounterRepository` | 野生遭遇表管理 |
| `scriptRepository` | `ScriptRepository` | 脚本解析和缓存 |
| `textCodec` | `PokemonTextCodec` | 游戏文本编码器 |
| `dirty` | `boolean` | 项目是否存在未导出修改 |

### Rom

最底层二进制读写对象，不了解地图、事件等业务结构。

```js
class Rom {
  name
  bytes
  size
  gbaBase
  dirtyRanges
}
```

主要成员：

| 成员 | 类型 | 说明 |
|---|---|---|
| `name` | `string` | ROM 文件名 |
| `bytes` | `Uint8Array` | 可修改字节数组 |
| `size` | `number` | ROM 字节长度 |
| `gbaBase` | `number` | 默认 `0x08000000` |
| `dirtyRanges` | `AllocationRange[]` | 被修改的范围，可用于撤销和状态显示 |

### RomProfile

描述特定 ROM 版本的固定地址、数量和限制。Run&Bun 1.07 使用一个 Profile，未来可以扩展其他版本。

```js
class RomProfile {
  id
  name
  version
  gbaBase
  addresses
  counts
  structureSizes
  limits
  freeSpaceStart
}
```

主要成员：

| 成员 | 类型 | 说明 |
|---|---|---|
| `addresses` | `object` | `gMapGroups`、区域表、野生表引用地址等 |
| `counts` | `object` | 地图组数量等固定数量 |
| `structureSizes` | `object` | MapHeader、Event、Connection 等结构大小 |
| `limits` | `object` | 地图宽高、事件数量等合法范围 |
| `freeSpaceStart` | `number` | 默认空白区域起始地址 |

### RomEntity

所有直接映射到 ROM 结构的对象基类。

```js
class RomEntity {
  rom
  profile
  offset
  size
  initialized
}
```

主要成员：

| 成员 | 类型 | 说明 |
|---|---|---|
| `rom` | `Rom` | 所属 ROM |
| `profile` | `RomProfile` | ROM 配置 |
| `offset` | `number` | 结构在 ROM 中的偏移 |
| `size` | `number` | 结构大小 |
| `initialized` | `boolean` | 是否完成解析 |

### FreeSpaceManager

统一负责空白区域查找、预留和分配。

```js
class FreeSpaceManager {
  rom
  startOffset
  cursorOffset
  blankByte
  defaultAlignment
  allocations
}
```

### AllocationRange

```js
class AllocationRange {
  offset
  size
  tag
  alignment
  reserveValue
}
```

## 地图对象

### MapRepository

负责地图扫描、gMapGroups 索引和 MapHeader 缓存。

```js
class MapRepository {
  project
  rom
  profile
  groupTable
  headers
  headerByOffset
  headerByGroupKey
  regionSections
}
```

### MapGroupTable

对应 `gMapGroups`。

```js
class MapGroupTable extends RomEntity {
  groupCount
  groupPointers
  groups
}
```

### MapGroup

```js
class MapGroup {
  repository
  index
  pointer
  offset
  mapCount
  mapHeaderPointers
  maps
}
```

### MapHeader

对应 ROM 中的 `struct MapHeader`。

```js
class MapHeader extends RomEntity {
  id
  mapGroup
  mapNum
  mapGroupKey

  layoutPointer
  eventsPointer
  scriptsPointer
  connectionsPointer

  layout
  events
  connections
  regionSection

  music
  mapLayoutId
  regionMapSectionId
  cave
  weather
  mapType
  filler18
  mapFlags
  battleType

  allowCycling
  allowEscaping
  allowRunning
  showMapName
}
```

说明：

- `layoutPointer` 等是 ROM 实际字段。
- `layout`、`events`、`connections` 是解析后的关联对象。
- `allowCycling` 等是 `mapFlags` 的派生字段。

### RegionMapSection

对应区域地图名称表中的一个条目。

```js
class RegionMapSection extends RomEntity {
  id
  x
  y
  width
  height
  namePointer
  nameOffset
  name
  suffixCode
}
```

### MapLayout

对应 `struct MapLayout`。

```js
class MapLayout extends RomEntity {
  width
  height
  borderPointer
  mapPointer
  primaryTilesetPointer
  secondaryTilesetPointer

  borderOffset
  mapOffset
  primaryTileset
  secondaryTileset

  borderBlocks
  blocks
}
```

### MapBlock

地图中的一个 block。为了避免初始化时创建大量对象，建议由 `MapLayout.getBlock(x, y)` 按需创建。

```js
class MapBlock {
  layout
  index
  offset
  x
  y
  rawValue
  metatileId
  collision
  elevation
}
```

## 地图事件对象

### MapEventCollection

对应 `struct MapEvents`。

```js
class MapEventCollection extends RomEntity {
  objectCount
  warpCount
  coordCount
  bgCount

  objectPointer
  warpPointer
  coordPointer
  bgPointer

  objectOffset
  warpOffset
  coordOffset
  bgOffset

  objects
  warps
  coords
  backgrounds
}
```

### BaseMapEvent

地图事件基类。

```js
class BaseMapEvent extends RomEntity {
  collection
  mapHeader
  index
  type
  x
  y
  elevation
}
```

### ObjectEvent

对应 `struct ObjectEventTemplate`。

```js
class ObjectEvent extends BaseMapEvent {
  localId
  graphicsId
  inConnection
  padding03
  movementType
  movementRangeRaw
  movementRangeX
  movementRangeY
  trainerType
  trainerRange
  scriptPointer
  scriptOffset
  flagId
  padding16

  script
  trainerBattle
}
```

说明：

- 训练家本质上仍是 `ObjectEvent`。
- 当 `script` 首条命令是 `trainerbattle` 时，`trainerBattle` 保存 `TrainerBattleCommand`。
- 不单独创建 `TrainerEvent`，避免同一 ROM 结构出现两个实体类型。

### WarpEvent

```js
class WarpEvent extends BaseMapEvent {
  warpId
  targetMapNum
  targetMapGroup
  targetMapKey
}
```

目标地图和目标 Warp 建议通过 Repository 查询，不在对象中永久保存，避免循环引用和缓存失效。

### CoordEvent

```js
class CoordEvent extends BaseMapEvent {
  trigger
  indexValue
  scriptPointer
  scriptOffset
  script
}
```

### BgEvent

```js
class BgEvent extends BaseMapEvent {
  kind
  data0
  scriptPointer
  scriptOffset
  script
}
```

## 地图连接对象

### MapConnectionCollection

对应 `struct MapConnections`。

```js
class MapConnectionCollection extends RomEntity {
  mapHeader
  pointer
  count
  dataPointer
  dataOffset
  capacity
  managed
  status
  connections
}
```

### MapConnection

```js
class MapConnection extends RomEntity {
  collection
  index
  direction
  connectionOffset
  targetMapGroup
  targetMapNum
  targetMapKey
}
```

## Tileset 对象

### TilesetRepository

```js
class TilesetRepository {
  project
  rom
  cacheByPointer
}
```

### Tileset

对应 ROM 中的 Tileset 结构。

```js
class Tileset extends RomEntity {
  pointer
  isCompressed
  isSecondary
  tilesPointer
  palettesPointer
  metatilesPointer
  metatileAttributesPointer
  callbackPointer

  tilesOffset
  palettesOffset
  metatilesOffset
  metatileAttributesOffset

  tileBytes
  palettes
  metatiles
  attributes
}
```

### Palette

```js
class Palette {
  tileset
  index
  offset
  rawColors
  rgbColors
}
```

### Metatile

```js
class Metatile {
  tileset
  id
  offset
  rawEntries
  tileIds
  paletteIds
  horizontalFlips
  verticalFlips
  attribute
}
```

### MetatileAttribute

```js
class MetatileAttribute {
  tileset
  metatileId
  offset
  rawValue
  behavior
  layerType
  terrainType
}
```

## 野生遭遇对象

### WildEncounterRepository

负责定位 `gWildMonHeaders`、读取所有 Header 和按地图查询。

```js
class WildEncounterRepository {
  project
  rom
  profile
  table
  headersByMapKey
}
```

### WildEncounterTable

```js
class WildEncounterTable extends RomEntity {
  pointerReferenceOffsets
  pointer
  terminatorOffset
  headers
}
```

### WildEncounterHeader

对应 `struct WildPokemonHeader`。

```js
class WildEncounterHeader extends RomEntity {
  table
  index
  mapGroup
  mapNum
  mapKey

  landPointer
  waterPointer
  rockSmashPointer
  fishingPointer

  land
  water
  rockSmash
  fishing
}
```

### WildEncounterGroup

对应 `struct WildPokemonInfo`。

```js
class WildEncounterGroup extends RomEntity {
  header
  kind
  label
  encounterRate
  pokemonPointer
  pokemonOffset
  slotCount
  rates
  slots
}
```

### WildPokemonSlot

对应 `struct WildPokemon`。

```js
class WildPokemonSlot extends RomEntity {
  group
  index
  rate
  minLevel
  maxLevel
  speciesId
}
```

## 脚本和文本对象

### ScriptRepository

```js
class ScriptRepository {
  project
  rom
  textCodec
  scriptsByOffset
}
```

### Script

```js
class Script extends RomEntity {
  pointer
  commands
  byteLength
  terminated
  terminationReason
  referencedScripts
  referencedTexts
}
```

### ScriptCommand

```js
class ScriptCommand extends RomEntity {
  script
  index
  opcode
  name
  arguments
  byteLength
  nextOffset
  summary
}
```

### ScriptArgument

```js
class ScriptArgument {
  command
  index
  name
  type
  value
  pointer
  offset
}
```

### TrainerBattleCommand

继承 `ScriptCommand`，对应动态参数的 `trainerbattle` 命令。

```js
class TrainerBattleCommand extends ScriptCommand {
  battleType
  battleTypeName
  trainerId
  localId
  pointerLayout
  introPointer
  introOffset
  defeatPointer
  defeatOffset
  cannotBattlePointer
  cannotBattleOffset
  afterScriptPointer
  afterScriptOffset
}
```

### PokemonText

```js
class PokemonText extends RomEntity {
  pointer
  maxLength
  encodedBytes
  value
}
```

### PokemonTextCodec

这是业务相关编码器，所以放在 `core/text`，而不是通用 `util`。

```js
class PokemonTextCodec {
  characterTable
  reverseCharacterTable
  terminator
  newlineCode
}
```

## Util 建议

`util` 使用纯函数即可，不需要强制 Class。

```text
util/
  pointer.js       pointerToOffset、offsetToPointer
  binary.js        align、clamp、位运算、大小端转换
  hex.js           toHex
  range.js         rangesOverlap
  validation.js    数值和范围校验
```

## 实现顺序

建议按依赖关系逐步实现：

1. `RomProfile`
2. `RomEntity`
3. 扩展现有 `Rom`
4. `AllocationRange`、`FreeSpaceManager`
5. `RegionMapSection`、`MapLayout`、`MapHeader`
6. `MapEventCollection` 和四种 Event
7. `MapGroupTable`、`MapGroup`、`MapRepository`
8. `MapConnectionCollection`、`MapConnection`
9. `Tileset` 相关对象
10. `Script`、`ScriptCommand`、`TrainerBattleCommand`
11. `WildEncounter` 相关对象
12. `RomProject`

## 暂不创建的 Class

第一阶段不建议创建以下对象：

- UI 状态 Class：由 Vue 页面管理，不属于 Core。
- `TrainerEvent`：训练家仍然是 `ObjectEvent + TrainerBattleCommand`。
- 每个 8x8 Tile 的 Class：数量太多，优先使用原始数组和按需读取。
- 每个脚本 opcode 一个 Class：只有结构明显特殊的命令单独继承，例如 `TrainerBattleCommand`。
