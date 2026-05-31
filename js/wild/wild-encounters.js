// ============================================================
// Wild Pokémon encounter parsing / writing
// ============================================================
// 根据 ROM 中 0x00625D7C~0x0062863C 数据区和 Header 表解析每张地图的野生宝可梦。
// 支持写回 WildPokemon：minLevel / maxLevel / species。

(function wildEncountersModule() {
  const WILD_DATA_START = 0x00625D7C;
  const WILD_DATA_END = 0x0062863C;
  const WILD_HEADER_TABLE_START = 0x0062863C;
  const WILD_HEADER_SIZE = 0x14;
  const WILD_INFO_SIZE = 0x08;
  const WILD_MON_SIZE = 0x04;

  const WILD_GROUPS = [
    { key: "land", label: "陆地", offset: 0x04, count: 12, rates: [20, 10, 10, 10, 10, 10, 10, 5, 5, 5, 4, 1] },
    { key: "water", label: "水面", offset: 0x08, count: 5, rates: [30, 30, 20, 10, 10] },
    { key: "rockSmash", label: "碎岩", offset: 0x0C, count: 5, rates: [60, 30, 5, 4, 1] },
    { key: "fishing", label: "钓鱼", offset: 0x10, count: 10, rates: [20, 20, 10, 10, 10, 10, 10, 5, 4, 1] },
  ];

  function getWildGroupDef(kind) {
    return WILD_GROUPS.find(g => g.key === kind) || null;
  }

  function parseWildPokemonEntry(off, slot, kind) {
    const def = getWildGroupDef(kind);
    return {
      slot,
      kind,
      rate: def?.rates?.[slot] ?? null,
      offset: off,
      minLevel: readU8(off + 0x00),
      maxLevel: readU8(off + 0x01),
      species: readU16(off + 0x02),
    };
  }

  function parseWildPokemonInfo(infoPtr, kind) {
    if (!infoPtr) return null;
    const infoOffset = ptrToOffset(infoPtr);
    if (infoOffset === null || !isValidOffset(infoOffset, WILD_INFO_SIZE)) return null;

    const encounterRate = readU8(infoOffset + 0x00);
    const monsPtr = readPtr(infoOffset + 0x04);
    const monsOffset = ptrToOffset(monsPtr);
    const def = getWildGroupDef(kind);
    if (!def || monsOffset === null || !isValidOffset(monsOffset, def.count * WILD_MON_SIZE)) return null;

    const entries = [];
    for (let i = 0; i < def.count; i++) {
      entries.push(parseWildPokemonEntry(monsOffset + i * WILD_MON_SIZE, i, kind));
    }

    return {
      kind,
      label: def.label,
      infoOffset,
      encounterRate,
      monsOffset,
      entries,
    };
  }

  function loadWildEncounterHeaders() {
    const headers = [];
    for (let off = WILD_HEADER_TABLE_START; isValidOffset(off, WILD_HEADER_SIZE); off += WILD_HEADER_SIZE) {
      const mapGroup = readU8(off + 0x00);
      const mapNum = readU8(off + 0x01);
      if (mapGroup === 0xFF && mapNum === 0xFF) break;

      const groups = {};
      for (const def of WILD_GROUPS) {
        const ptr = readPtr(off + def.offset);
        groups[def.key] = ptr ? parseWildPokemonInfo(ptr, def.key) : null;
      }
      headers.push({ headerOffset: off, mapGroup, mapNum, groups });
    }
    return headers;
  }

  function findWildEncounterForMap(mapGroup, mapNum) {
    const headers = loadWildEncounterHeaders();
    return headers.find(h => h.mapGroup === mapGroup && h.mapNum === mapNum) || null;
  }

  function writeU16LE(off, value) {
    if (!isValidOffset(off, 2)) return false;
    const v = Number(value) || 0;
    writeU8(off, v & 0xFF);
    writeU8(off + 1, (v >> 8) & 0xFF);
    return true;
  }

  function clampInt(value, min, max) {
    const n = Number.parseInt(String(value), 10);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function writeWildPokemonEntry(entry, values) {
    if (!entry || !isValidOffset(entry.offset, WILD_MON_SIZE)) {
      throw new Error("野生宝可梦条目偏移无效");
    }

    const minLevel = clampInt(values.minLevel, 1, 100);
    const maxLevel = clampInt(values.maxLevel, 1, 100);
    const species = clampInt(values.species, 0, 0xFFFF);

    writeU8(entry.offset + 0x00, minLevel);
    writeU8(entry.offset + 0x01, maxLevel);
    writeU16LE(entry.offset + 0x02, species);

    entry.minLevel = minLevel;
    entry.maxLevel = maxLevel;
    entry.species = species;
    return entry;
  }

  function writeWildEncounterRate(group, encounterRate) {
    if (!group || !isValidOffset(group.infoOffset, 1)) {
      throw new Error("野生遭遇率偏移无效");
    }
    const rate = clampInt(encounterRate, 0, 255);
    writeU8(group.infoOffset, rate);
    group.encounterRate = rate;
    return rate;
  }

  window.RBEditorWildEncounters = {
    WILD_DATA_START,
    WILD_DATA_END,
    WILD_HEADER_TABLE_START,
    WILD_GROUPS,
    loadWildEncounterHeaders,
    findWildEncounterForMap,
    getWildGroupDef,
    writeWildPokemonEntry,
    writeWildEncounterRate,
  };
})();
