// ============================================================
// Wild Pokémon encounter parsing
// ============================================================
// 根据 ROM 中 0x00625D7C~0x0062863C 数据区和 Header 表解析每张地图的野生宝可梦

(function wildEncountersModule() {
  const WILD_DATA_START = 0x00625D7C;
  const WILD_HEADER_TABLE_START = 0x0062863C;
  const WILD_HEADER_SIZE = 0x14;
  const WILD_INFO_SIZE = 0x08;
  const WILD_MON_SIZE = 0x04;

  const WILD_GROUPS = [
    { key: "land", label: "陆地", offset: 0x04, count: 12 },
    { key: "water", label: "水面", offset: 0x08, count: 5 },
    { key: "rockSmash", label: "碎岩", offset: 0x0C, count: 5 },
    { key: "fishing", label: "钓鱼", offset: 0x10, count: 10 },
  ];

  function parseWildPokemonEntry(off, slot) {
    return {
      slot,
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
    const def = WILD_GROUPS.find(g => g.key === kind);
    if (!def || monsOffset === null) return null;
    const entries = [];
    for (let i = 0; i < def.count; i++) {
      entries.push(parseWildPokemonEntry(monsOffset + i * WILD_MON_SIZE, i));
    }
    return {
      kind,
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

  window.RBEditorWildEncounters = {
    loadWildEncounterHeaders,
    findWildEncounterForMap,
  };
})();