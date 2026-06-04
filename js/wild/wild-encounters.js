// ============================================================
// Wild Pokémon encounter parsing / writing / creation
// ============================================================
// 通过 ROM 中多处 gWildMonHeaders 引用指针动态定位 Header 表。
// 后续迁移 gWildMonHeaders 到新区域时，只要同步这些引用指针，读取逻辑无需再改。
// 支持写回 WildPokemon：minLevel / maxLevel / species。
// 支持给没有野生遭遇表的新地图创建默认遭遇表。

// struct WildPokemonHeader
// {
//     u8 mapGroup;
//     u8 mapNum;
//     const struct WildPokemonInfo *landMonsInfo;
//     const struct WildPokemonInfo *waterMonsInfo;
//     const struct WildPokemonInfo *rockSmashMonsInfo;
//     const struct WildPokemonInfo *fishingMonsInfo;
// };

// struct WildPokemonInfo
// {
//     u8 encounterRate;
//     const struct WildPokemon *wildPokemon;
// };

// struct WildPokemon
// {
//     u8 minLevel;
//     u8 maxLevel;
//     u16 species;
// };

(function wildEncountersModule() {
  const WILD_HEADER_TABLE_PTR_OFFSETS = [
    0x000D31D8,
    0x000D39DC,
    0x000D3A34,
    0x000D3ADC,
    0x000D3BA8,
    0x000D3CC4,
    0x000D3D24,
    0x000D3D70,
    0x000D3DEC,
    0x000D3E30,
    0x000D3EB8,
    0x0016CEDC,
    0x0016CF18,
    0x001C8058,
  ];
  const WILD_HEADER_TABLE_PTR_OFFSET = WILD_HEADER_TABLE_PTR_OFFSETS[0];
  const WILD_HEADER_TABLE_SCAN_LIMIT = 0x800;
  const WILD_HEADER_SIZE = 0x14;
  const WILD_INFO_SIZE = 0x08;
  const WILD_MON_SIZE = 0x04;

  // Run&Bun 1.07 项目里约定的空闲区。只在这里写新增 WildMonInfo / WildPokemon 数据。
  const WILD_FREE_SPACE_START = 0x01900000;

  const WILD_GROUPS = [
    { key: "land", label: "陆地", offset: 0x04, count: 12, defaultRate: 20, rates: [20, 10, 10, 10, 10, 10, 10, 5, 5, 5, 4, 1] },
    { key: "water", label: "水面", offset: 0x08, count: 5, defaultRate: 20, rates: [30, 30, 20, 10, 10] },
    { key: "rockSmash", label: "碎岩", offset: 0x0C, count: 5, defaultRate: 20, rates: [60, 30, 5, 4, 1] },
    { key: "fishing", label: "钓鱼", offset: 0x10, count: 10, defaultRate: 20, rates: [20, 20, 10, 10, 10, 10, 10, 5, 4, 1] },
  ];

  function getWildGroupDef(kind) {
    return WILD_GROUPS.find(g => g.key === kind) || null;
  }

  function isValidWildPokemonInfoPtr(infoPtr, def) {
    const infoOffset = ptrToOffset(infoPtr);
    if (infoOffset === null || !isValidOffset(infoOffset, WILD_INFO_SIZE)) return false;

    const monsPtr = readPtr(infoOffset + 0x04);
    const monsOffset = ptrToOffset(monsPtr);
    return monsOffset !== null && isValidOffset(monsOffset, def.count * WILD_MON_SIZE);
  }

  function isLikelyWildHeaderTableOffset(start) {
    if (start === null || !isValidOffset(start, WILD_HEADER_SIZE)) return false;

    let headerCount = 0;
    for (let i = 0; i < WILD_HEADER_TABLE_SCAN_LIMIT; i++) {
      const off = start + i * WILD_HEADER_SIZE;
      if (!isValidOffset(off, WILD_HEADER_SIZE)) return false;

      const mapGroup = readU8(off + 0x00);
      const mapNum = readU8(off + 0x01);
      if (mapGroup === 0xFF && mapNum === 0xFF) return headerCount > 0;

      let hasEncounterGroup = false;
      for (const def of WILD_GROUPS) {
        const ptr = readPtr(off + def.offset);
        if (!ptr) continue;
        hasEncounterGroup = true;
        if (!isValidWildPokemonInfoPtr(ptr, def)) return false;
      }
      if (!hasEncounterGroup) return false;
      headerCount++;
    }
    return false;
  }

  function getWildHeaderTableCandidates() {
    const candidates = [];
    for (const ptrOffset of WILD_HEADER_TABLE_PTR_OFFSETS) {
      if (!isValidOffset(ptrOffset, 4)) continue;
      const ptr = readPtr(ptrOffset);
      const offset = ptrToOffset(ptr);
      if (!isLikelyWildHeaderTableOffset(offset)) continue;
      candidates.push({ ptrOffset, ptr, offset });
    }
    return candidates;
  }

  function getWildHeaderTableRef() {
    const candidates = getWildHeaderTableCandidates();
    if (!candidates.length) {
      const offsets = WILD_HEADER_TABLE_PTR_OFFSETS.map(off => hex(off)).join(", ");
      throw new Error(`没有从 gWildMonHeaders 引用指针读取到有效 Header 表：${offsets}`);
    }
    return candidates[0];
  }

  function getWildHeaderTablePtr() {
    return getWildHeaderTableRef().ptr;
  }

  function getWildHeaderTableStart() {
    return getWildHeaderTableRef().offset;
  }

  function getWildHeaderTableInfo() {
    const ref = getWildHeaderTableRef();
    return {
      ptrOffset: ref.ptrOffset,
      ptrOffsets: WILD_HEADER_TABLE_PTR_OFFSETS.slice(),
      ptr: ref.ptr,
      offset: ref.offset,
      candidates: getWildHeaderTableCandidates(),
    };
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

  function findWildHeaderTerminatorOffset() {
    const start = getWildHeaderTableStart();
    for (let off = start; isValidOffset(off, WILD_HEADER_SIZE); off += WILD_HEADER_SIZE) {
      const mapGroup = readU8(off + 0x00);
      const mapNum = readU8(off + 0x01);
      if (mapGroup === 0xFF && mapNum === 0xFF) return off;
    }
    return null;
  }

  function loadWildEncounterHeaders() {
    const headers = [];
    const start = getWildHeaderTableStart();
    for (let off = start; isValidOffset(off, WILD_HEADER_SIZE); off += WILD_HEADER_SIZE) {
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
    if (!isValidOffset(off, 2)) throw new Error(`ROM 写入范围无效：${hex(off)} size=2`);
    const v = Number(value) || 0;
    writeU8(off, v & 0xFF);
    writeU8(off + 1, (v >> 8) & 0xFF);
    return true;
  }

  function writeU32LE(off, value) {
    if (!isValidOffset(off, 4)) throw new Error(`ROM 写入范围无效：${hex(off)} size=4`);
    const v = Number(value) >>> 0;
    writeU8(off, v & 0xFF);
    writeU8(off + 1, (v >> 8) & 0xFF);
    writeU8(off + 2, (v >> 16) & 0xFF);
    writeU8(off + 3, (v >> 24) & 0xFF);
    return true;
  }

  function clampInt(value, min, max) {
    const n = Number.parseInt(String(value), 10);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function align4(value) {
    return (value + 3) & ~3;
  }

  function isFreeByte(value) {
    return value === 0x00 || value === 0xFF;
  }

  function isFreeRange(off, size) {
    if (!isValidOffset(off, size)) return false;
    for (let i = 0; i < size; i++) {
      if (!isFreeByte(readU8(off + i))) return false;
    }
    return true;
  }

  function findFreeSpace(size, start = WILD_FREE_SPACE_START) {
    if (!rom) throw new Error("尚未加载 ROM。无法分配野生遭遇数据。旧 ROM 需要先导入。 ");
    const begin = align4(Math.max(0, start));
    const end = rom.length - size;
    for (let off = begin; off <= end; off += 4) {
      if (isFreeRange(off, size)) return off;
    }
    throw new Error(`没有找到可用空闲区：需要 ${size} 字节，起始 ${hex(begin)}。`);
  }

  function clearRange(off, size, value = 0x00) {
    if (!isValidOffset(off, size)) throw new Error(`ROM 写入范围无效：${hex(off)} size=${size}`);
    for (let i = 0; i < size; i++) writeU8(off + i, value);
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

  function makeDefaultEntry(kind, slot, offset, defaults = {}) {
    const species = clampInt(defaults.species ?? 1, 0, 0xFFFF);
    const minLevel = clampInt(defaults.minLevel ?? 2, 1, 100);
    const maxLevel = clampInt(defaults.maxLevel ?? minLevel, 1, 100);
    writeU8(offset + 0x00, minLevel);
    writeU8(offset + 0x01, maxLevel);
    writeU16LE(offset + 0x02, species);
    return parseWildPokemonEntry(offset, slot, kind);
  }

  function allocateWildGroup(kind, options = {}) {
    const def = getWildGroupDef(kind);
    if (!def) throw new Error(`未知野生遭遇类型：${kind}`);

    const totalSize = WILD_INFO_SIZE + def.count * WILD_MON_SIZE;
    const base = findFreeSpace(totalSize, options.freeStart ?? WILD_FREE_SPACE_START);
    clearRange(base, totalSize, 0x00);

    const infoOffset = base;
    const monsOffset = base + WILD_INFO_SIZE;
    const encounterRate = clampInt(options.encounterRate ?? def.defaultRate ?? 20, 0, 255);

    writeU8(infoOffset + 0x00, encounterRate);
    writeU8(infoOffset + 0x01, 0);
    writeU8(infoOffset + 0x02, 0);
    writeU8(infoOffset + 0x03, 0);
    writeU32LE(infoOffset + 0x04, offsetToPtr(monsOffset));

    const entries = [];
    for (let i = 0; i < def.count; i++) {
      entries.push(makeDefaultEntry(kind, i, monsOffset + i * WILD_MON_SIZE, options.defaultEntry || {}));
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

  function canAppendWildHeaderInPlace() {
    const term = findWildHeaderTerminatorOffset();
    if (term === null) return { ok: false, reason: "没有找到野生遭遇 Header 表结束标记 FF FF。" };
    if (!isValidOffset(term, WILD_HEADER_SIZE * 2)) {
      return { ok: false, reason: "Header 表结束位置后没有足够空间追加新 Header。" };
    }
    const next = term + WILD_HEADER_SIZE;
    if (!isFreeRange(next, WILD_HEADER_SIZE)) {
      return { ok: false, reason: `Header 表结束标记后空间不是空闲区，不能安全追加：${hex(next)}。` };
    }
    return { ok: true, headerOffset: term, nextTerminatorOffset: next };
  }

  function writeTerminatorHeader(off) {
    clearRange(off, WILD_HEADER_SIZE, 0x00);
    writeU8(off + 0x00, 0xFF);
    writeU8(off + 0x01, 0xFF);
  }

  function writeWildHeader(off, mapGroup, mapNum, groups) {
    clearRange(off, WILD_HEADER_SIZE, 0x00);
    writeU8(off + 0x00, clampInt(mapGroup, 0, 0xFF));
    writeU8(off + 0x01, clampInt(mapNum, 0, 0xFF));
    writeU8(off + 0x02, 0);
    writeU8(off + 0x03, 0);

    for (const def of WILD_GROUPS) {
      const group = groups?.[def.key] || null;
      writeU32LE(off + def.offset, group ? offsetToPtr(group.infoOffset) : 0);
    }
  }

  function createWildEncounterForMap(mapGroup, mapNum, options = {}) {
    if (findWildEncounterForMap(mapGroup, mapNum)) {
      throw new Error(`当前地图已经存在野生遭遇表：group=${mapGroup} map=${mapNum}`);
    }

    const append = canAppendWildHeaderInPlace();
    if (!append.ok) throw new Error(append.reason);

    const enabled = new Set(options.enabledGroups || WILD_GROUPS.map(g => g.key));
    const groups = {};
    for (const def of WILD_GROUPS) {
      groups[def.key] = enabled.has(def.key)
        ? allocateWildGroup(def.key, {
            encounterRate: options.encounterRate?.[def.key] ?? def.defaultRate,
            defaultEntry: options.defaultEntry || {},
            freeStart: options.freeStart ?? WILD_FREE_SPACE_START,
          })
        : null;
    }

    writeWildHeader(append.headerOffset, mapGroup, mapNum, groups);
    writeTerminatorHeader(append.nextTerminatorOffset);

    return findWildEncounterForMap(mapGroup, mapNum);
  }

  function addWildGroupToExistingHeader(mapGroup, mapNum, kind, options = {}) {
    const wild = findWildEncounterForMap(mapGroup, mapNum);
    if (!wild) throw new Error("当前地图没有 Header，请先创建野生遭遇表。 ");
    if (wild.groups?.[kind]) throw new Error(`${getWildGroupDef(kind)?.label || kind} 已经存在。`);

    const def = getWildGroupDef(kind);
    if (!def) throw new Error(`未知野生遭遇类型：${kind}`);

    const group = allocateWildGroup(kind, {
      encounterRate: options.encounterRate ?? def.defaultRate,
      defaultEntry: options.defaultEntry || {},
      freeStart: options.freeStart ?? WILD_FREE_SPACE_START,
    });
    writeU32LE(wild.headerOffset + def.offset, offsetToPtr(group.infoOffset));
    return findWildEncounterForMap(mapGroup, mapNum);
  }

  window.RBEditorWildEncounters = {
    WILD_HEADER_TABLE_PTR_OFFSETS,
    WILD_HEADER_TABLE_PTR_OFFSET,
    WILD_FREE_SPACE_START,
    WILD_GROUPS,
    getWildHeaderTablePtr,
    getWildHeaderTableStart,
    getWildHeaderTableCandidates,
    getWildHeaderTableInfo,
    loadWildEncounterHeaders,
    findWildEncounterForMap,
    findWildHeaderTerminatorOffset,
    getWildGroupDef,
    writeWildPokemonEntry,
    writeWildEncounterRate,
    canAppendWildHeaderInPlace,
    createWildEncounterForMap,
    addWildGroupToExistingHeader,
  };
})();
