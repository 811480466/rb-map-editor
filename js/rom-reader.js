let rom = null;
let romFileName = "";
let mapHeaders = [];
let filteredHeaders = [];
let currentEvents = [];
let currentMap = null;
let selectedEventKey = null;

let tilesetZip = null;
let tilesetCatalog = [];
let tilesetAssets = new Map();
let tilesetAutoMatchCache = new Map();
let romTilesetAssetCache = new Map();
let mapGroupIndex = new Map();
let mapHeaderByOffset = new Map();
let currentCellSize = 22;
let renderSerial = 0;
const TILE_RENDER_SCALE = 2;
const TILE_CELL_SIZE = 16 * TILE_RENDER_SCALE;

const GBA_BASE = 0x08000000;

// Pokémon Run&Bun 1.07：gMapGroups 表。
// 来自 map_group.py 的定位结果，用于把 warp 的 mapGroup/mapNum 解析成具体 MapHeader。
const GMAPGROUPS_OFFSET = 0x00552AB4;
const MAP_GROUP_COUNT = 34;

// ============================================================
// ROM 读取器
// 说明：所有底层 ROM 字节读取、指针转换、偏移校验都集中在这个类里。
// 外部旧代码仍可继续使用 readU8/readU16/readPtr 等函数；这些函数只是兼容包装。
// ============================================================
class RomReader {
  constructor(bytes = null, gbaBase = GBA_BASE) {
    this.bytes = bytes;
    this.gbaBase = gbaBase;
  }

  setBytes(bytes) {
    this.bytes = bytes;
  }

  get size() {
    return this.bytes?.length ?? 0;
  }

  hasRom() {
    return !!this.bytes;
  }

  isValidOffset(off, need = 1) {
    return Number.isInteger(off) && off >= 0 && off + need <= this.size;
  }

  ptrToOffset(ptr) {
    if (!this.hasRom()) return null;
    if (ptr >= this.gbaBase && ptr < this.gbaBase + this.size) {
      return ptr - this.gbaBase;
    }
    return null;
  }

  offsetToPtr(off) {
    return this.gbaBase + off;
  }

  isValidPtr(ptr, need = 1) {
    const off = this.ptrToOffset(ptr);
    return off !== null && this.isValidOffset(off, need);
  }

  u8(off) {
    return this.bytes[off];
  }

  u16(off) {
    return this.bytes[off] | (this.bytes[off + 1] << 8);
  }

  s16(off) {
    const v = this.u16(off);
    return v & 0x8000 ? v - 0x10000 : v;
  }

  u32(off) {
    return (
      this.bytes[off] |
      (this.bytes[off + 1] << 8) |
      (this.bytes[off + 2] << 16) |
      (this.bytes[off + 3] << 24)
    ) >>> 0;
  }

  s32(off) {
    const v = this.u32(off);
    return v & 0x80000000 ? v - 0x100000000 : v;
  }

  ptr(off) {
    return this.u32(off);
  }

  bytesEqual(off, bytes) {
    if (!this.isValidOffset(off, bytes.length)) return false;
    for (let i = 0; i < bytes.length; i++) {
      if (this.bytes[off + i] !== bytes[i]) return false;
    }
    return true;
  }

  slice(off, length) {
    if (!this.isValidOffset(off, length)) return null;
    return this.bytes.slice(off, off + length);
  }

  readBytesFromPtr(ptr, length) {
    const off = this.ptrToOffset(ptr);
    if (off === null) return null;
    return this.slice(off, length);
  }

  writeU8(off, value) {
    if (!this.isValidOffset(off, 1)) return false;
    this.bytes[off] = value & 0xFF;
    return true;
  }
}

let romReader = new RomReader(null);

function getRomReader() {
  // 兼容旧代码中直接给全局 rom 赋值的写法。
  if (romReader.bytes !== rom) {
    romReader.setBytes(rom);
  }
  return romReader;
}

function setRomBytes(bytes, fileName = "") {
  rom = bytes;
  romReader.setBytes(bytes);
  if (fileName) romFileName = fileName;
}

function readU8(off) {
  return getRomReader().u8(off);
}

function readU16(off) {
  return getRomReader().u16(off);
}

function readS16(off) {
  return getRomReader().s16(off);
}

function readS32(off) {
  return getRomReader().s32(off);
}

function readU32(off) {
  return getRomReader().u32(off);
}

function readPtr(off) {
  return getRomReader().ptr(off);
}

function ptrToOffset(ptr) {
  return getRomReader().ptrToOffset(ptr);
}

function offsetToPtr(off) {
  return getRomReader().offsetToPtr(off);
}

function isValidOffset(off, need = 1) {
  return getRomReader().isValidOffset(off, need);
}

function isValidPtr(ptr, need = 1) {
  return getRomReader().isValidPtr(ptr, need);
}

function bytesEqualRom(off, bytes) {
  return getRomReader().bytesEqual(off, bytes);
}

function readRawBytesFromRom(ptr, length) {
  return getRomReader().readBytesFromPtr(ptr, length);
}

function writeU8(off, value) {
  return getRomReader().writeU8(off, value);
}

function hex(value, width = 8) {
  if (value === null || value === undefined || Number.isNaN(value)) return "null";
  return "0x" + value.toString(16).toUpperCase().padStart(width, "0");
}


// ============================================================
// 地图名称中文翻译
// 说明：ROM 里读出的名称仍保留英文，这里只负责界面显示中文。
// 没有命中的名称会原样显示，Route XXX 会自动规则翻译。
// ============================================================
const MAP_NAME_CN = {
  "Abandoned Ship": "废弃船",
  "Altering Cave": "变化洞窟",
  "Ancient Tomb": "古代坟墓",
  "Aqua Hideout": "海洋队基地",
  "ARTISAN CAVE": "工匠洞穴",
  "Artisan Cave": "工匠洞穴",
  "Battle Frontier": "对战开拓区",
  "Birth Island": "诞生之岛",
  "Cave of Origin": "觉醒祠堂",
  "Desert Ruins": "沙漠遗迹",
  "Desert Underpass": "沙漠地下道",
  "Dewford Town": "武斗镇",
  "Ever Grande City": "彩幽市",
  "Fallarbor Town": "秋叶镇",
  "FARAWAY ISLAND": "边境的小岛",
  "Faraway Island": "边境的小岛",
  "Fiery Path": "热焰小径",
  "Fortree City": "茵郁市",
  "Granite Cave": "石之洞窟",
  "Inside of Truck": "卡车内部",
  "Island Cave": "小岛横穴",
  "Jagged Pass": "凹凸山道",
  "Lavaridge Town": "釜炎镇",
  "Lilycove City": "水静市",
  "Littleroot Town": "未白镇",
  "Magma Hideout": "熔岩队基地",
  "MARINE CAVE": "海之洞窟",
  "Marine Cave": "海之洞窟",
  "Mauville City": "紫堇市",
  "Meteor Falls": "流星瀑布",
  "Mirage Tower": "幻影之塔",
  "Mossdeep City": "绿岭市",
  "Mt. Chimney": "烟囱山",
  "Mt. Pyre": "送神山",
  "Navel Rock": "肚脐岩",
  "New Mauville": "新紫堇",
  "Oldale Town": "古辰镇",
  "Pacifidlog Town": "暮水镇",
  "Petalburg City": "橙华市",
  "Petalburg Woods": "橙华森林",
  "Rustboro City": "卡那兹市",
  "Rusturf Tunnel": "卡绿隧道",
  "Safari Zone": "狩猎地带",
  "Scorched Slab": "日照岩窟",
  "Seafloor Cavern": "海底洞窟",
  "Seafloor Cavern Underwater": "海底洞窟（水下）",
  "Sealed Chamber": "布告石室",
  "Sealed Chamber Underwater": "布告石室（水下）",
  "Secret Base": "秘密基地",
  "Shoal Cave": "浅滩洞穴",
  "Sky Pillar": "天空之柱",
  "Slateport City": "凯那市",
  "Sootopolis City": "琉璃市",
  "Sootopolis Underwater": "琉璃市（水下）",
  "Southern Island": "南方孤岛",
  "TERRA CAVE": "陆之窟",
  "Terra Cave": "陆之窟",
  "Trainer Hill": "训练家之丘",
  "UNDERWATER": "水下",
  "Underwater": "水下",
  "Verdanturf Town": "绿荫镇",
  "Victory Road": "冠军之路",
};

function normalizeMapNameForTranslate(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ");
}

function translateMapName(name) {
  const raw = normalizeMapNameForTranslate(name);
  if (!raw) return "";

  if (MAP_NAME_CN[raw]) return MAP_NAME_CN[raw];

  // 兼容用户列表里出现的拼写：Rote 105 Underwater
  const routeMatch = raw.match(/^(Route|Rote)\s+(\d+)(?:\s+Underwater)?$/i);
  if (routeMatch) {
    const num = routeMatch[2];
    const underwater = /Underwater/i.test(raw);
    return `${num}号${underwater ? "水下" : ""}道路`;
  }

  const underwaterMatch = raw.match(/^(.+)\s+Underwater$/i);
  if (underwaterMatch) {
    const baseName = underwaterMatch[1].trim();
    const baseCn = translateMapName(baseName);
    return `${baseCn}（水下）`;
  }

  return raw;
}

function getMapDisplayName(header) {
  const enName = header?.regionMap?.name || `Section ${header?.regionMapSectionId ?? "?"}`;
  return translateMapName(enName) || enName;
}

function getMapDisplayNameWithSuffix(header) {
  const mapName = getMapDisplayName(header);
  const suffixCode = header?.regionMap?.suffixCode ?? 0;
  const suffixText = suffixCode > 0 ? `#${suffixCode}` : "";
  return `${mapName}${suffixText}`;
}

function getMapDisplayNameWithCode(header) {
  const mapName = getMapDisplayNameWithSuffix(header);
  const mapId = header?.id ?? "?";
  return `${mapName}(地图编码:${mapId})`;
}

function getMapEnglishName(header) {
  return header?.regionMap?.name || `Section ${header?.regionMapSectionId ?? "?"}`;
}

// 区域地图名称表
const G_REGION_MAP_ENTRIES = 0x006A1960;
const REGION_MAP_ENTRY_SIZE = 8;

// 结构大小
const MAP_HEADER_SIZE = 0x1C;
const MAP_EVENTS_SIZE = 0x14;
const MAP_CONNECTIONS_SIZE = 0x08;
const MAP_CONNECTION_SIZE = 0x0C;

const OBJECT_EVENT_SIZE = 0x18;
const WARP_EVENT_SIZE = 0x08;
const COORD_EVENT_SIZE = 0x10;
const BG_EVENT_SIZE = 0x0C;

// 格子大小
const CELL_SIZE = 22;

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const cellTooltip = document.createElement("div");
cellTooltip.className = "cell-tooltip";
document.body.appendChild(cellTooltip);
