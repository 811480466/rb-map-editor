// ============================================================
// Warp event manager
// ============================================================
// Keep MapEvents in place, migrate only WarpEvent[] to managed free space,
// reserve 10 extra slots, append new warps, and repair shifted warpId
// references when deleting a middle warp.

(function warpEventManagerModule() {
  const EXTRA_WARP_CAPACITY = 10;

  function ensureWriteRange(off, size) {
    if (!rom || !isValidOffset(off, size)) {
      throw new Error(`ROM write range invalid: ${hex(off)} size=${size}`);
    }
  }

  function writeS16LE(off, value) {
    ensureWriteRange(off, 2);
    const v = Number(value) < 0 ? Number(value) + 0x10000 : Number(value);
    writeU8(off, v & 0xFF);
    writeU8(off + 1, (v >> 8) & 0xFF);
  }

  function writeU32LE(off, value) {
    ensureWriteRange(off, 4);
    const v = Number(value) >>> 0;
    writeU8(off, v & 0xFF);
    writeU8(off + 1, (v >> 8) & 0xFF);
    writeU8(off + 2, (v >> 16) & 0xFF);
    writeU8(off + 3, (v >> 24) & 0xFF);
  }

  function clampInt(value, min, max, fallback = min) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  function normalizeWarp(warp = {}) {
    return {
      x: clampInt(warp.x, -32768, 32767, 0),
      y: clampInt(warp.y, -32768, 32767, 0),
      elevation: clampInt(warp.elevation, 0, 0xFF, 0),
      warpId: clampInt(warp.warpId, 0, 0xFF, 0),
      mapNum: clampInt(warp.mapNum, 0, 0xFF, 0),
      mapGroup: clampInt(warp.mapGroup, 0, 0xFF, 0),
    };
  }

  function writeWarpEntry(off, warp) {
    const ev = normalizeWarp(warp);
    ensureWriteRange(off, WARP_EVENT_SIZE);
    writeS16LE(off + 0x00, ev.x);
    writeS16LE(off + 0x02, ev.y);
    writeU8(off + 0x04, ev.elevation);
    writeU8(off + 0x05, ev.warpId);
    writeU8(off + 0x06, ev.mapNum);
    writeU8(off + 0x07, ev.mapGroup);
  }

  function clearWarpSlots(dataOff, capacity) {
    const bytes = capacity * WARP_EVENT_SIZE;
    ensureWriteRange(dataOff, bytes);
    for (let i = 0; i < bytes; i++) writeU8(dataOff + i, 0);
  }

  function getManagedWarpStorage(dataOff) {
    if (!window.RBEditorFreeSpace?.isInManagedRegion?.(dataOff, WARP_EVENT_SIZE)) {
      return { managed: false, capacity: 0, bytes: 0, legacyFixed: false };
    }

    const range = window.RBEditorFreeSpace?.getState?.().allocated
      ?.find(item => item.offset === dataOff && String(item.tag || "").startsWith("WarpEvent["));
    if (!range) return { managed: false, capacity: 0, bytes: 0, legacyFixed: false };

    const capacity = Math.floor(range.size / WARP_EVENT_SIZE);
    return {
      managed: capacity > 0,
      capacity,
      bytes: capacity * WARP_EVENT_SIZE,
      legacyFixed: range.tag === "WarpEvent[10]",
    };
  }

  function getWritableCapacity(header, count = 0) {
    const storage = getManagedWarpStorage(header?.events?.warpOff ?? null);
    const expandedCapacity = Math.min(0xFF, count + EXTRA_WARP_CAPACITY);
    if (!storage.managed) return expandedCapacity;
    if (storage.legacyFixed && storage.capacity < count + EXTRA_WARP_CAPACITY) {
      return expandedCapacity;
    }
    return storage.capacity;
  }

  function allocateWarpArray(capacity) {
    const allocator = window.RBEditorFreeSpace;
    if (!allocator?.allocate) throw new Error("Free-space manager is not available.");
    return allocator.allocate(capacity * WARP_EVENT_SIZE, { tag: `WarpEvent[capacity=${capacity};extra=${EXTRA_WARP_CAPACITY}]` }).offset;
  }

  function getWarps(header) {
    if (!header) return [];
    return loadMapEvents(header).filter(ev => ev.type === "warp").map(normalizeWarp);
  }

  function isSameMap(a, b) {
    return a?.mapGroup === b?.mapGroup && a?.mapNum === b?.mapNum;
  }

  function getWarpEvents(header) {
    if (!header) return [];
    return loadMapEvents(header).filter(ev => ev.type === "warp");
  }

  function getStorageInfo(header) {
    const events = header?.events || null;
    const dataOff = events?.warpOff ?? null;
    const count = events?.warpCount ?? 0;
    const storage = getManagedWarpStorage(dataOff);
    return {
      capacity: getWritableCapacity(header, count),
      count,
      dataOff,
      managed: storage.managed,
      extraCapacity: EXTRA_WARP_CAPACITY,
    };
  }

  function rewriteWarpArray(header, warps, options = {}) {
    if (!header?.events || !isValidOffset(header.events.offset, MAP_EVENTS_SIZE)) {
      throw new Error("MapEvents offset is invalid.");
    }

    const requestedCapacity = clampInt(options.capacity, 0, 0xFF, 0);
    const storage = getManagedWarpStorage(header.events.warpOff);
    const capacity = requestedCapacity || getWritableCapacity(header, header.events.warpCount ?? warps.length);
    if (warps.length > capacity) {
      throw new Error(`Warp count cannot exceed ${capacity}.`);
    }

    const oldDataOff = header.events.warpOff;
    const canReuse = storage.managed
      && !storage.legacyFixed
      && storage.capacity === capacity
      && warps.length <= storage.capacity;
    const dataOff = canReuse ? oldDataOff : allocateWarpArray(capacity);
    clearWarpSlots(dataOff, capacity);
    warps.forEach((warp, index) => writeWarpEntry(dataOff + index * WARP_EVENT_SIZE, warp));

    writeU8(header.events.offset + 0x01, warps.length);
    writeU32LE(header.events.offset + 0x08, offsetToPtr(dataOff));

    header.events = parseMapEvents(header.events.offset);
    return header.events;
  }

  function findIncomingWarpReferences(targetHeader, deletedIndex = null) {
    if (!targetHeader || !Array.isArray(mapHeaders)) return [];
    const refs = [];
    for (const header of mapHeaders) {
      const warps = getWarpEvents(header);
      for (const warp of warps) {
        if (warp.mapGroup !== targetHeader.mapGroup || warp.mapNum !== targetHeader.mapNum) continue;
        if (deletedIndex !== null && isSameMap(header, targetHeader) && warp.index === deletedIndex) continue;
        if (deletedIndex !== null && warp.warpId < deletedIndex) continue;
        refs.push({
          header,
          warp,
          relation: deletedIndex !== null && warp.warpId === deletedIndex ? "deleted" : "shifted",
        });
      }
    }
    return refs;
  }

  function updateShiftedIncomingWarpIds(targetHeader, deletedIndex) {
    if (!targetHeader || !Array.isArray(mapHeaders)) return 0;
    let changed = 0;
    for (const header of mapHeaders) {
      if (isSameMap(header, targetHeader)) continue;
      const warps = getWarpEvents(header);
      for (const warp of warps) {
        if (warp.mapGroup !== targetHeader.mapGroup || warp.mapNum !== targetHeader.mapNum) continue;
        if (warp.warpId <= deletedIndex) continue;
        ensureWriteRange(warp.offset + 0x05, 1);
        writeU8(warp.offset + 0x05, warp.warpId - 1);
        changed++;
      }
    }
    return changed;
  }

  function addWarpEvent(header, values = {}) {
    const warps = getWarps(header);
    const capacity = getWritableCapacity(header, warps.length);
    if (warps.length >= capacity) {
      throw new Error(`当前地图传送点已达最大数量 ${capacity}.`);
    }

    const previous = warps[warps.length - 1] || {};
    const next = normalizeWarp({
      x: values.x ?? previous.x ?? 0,
      y: values.y ?? previous.y ?? 0,
      elevation: values.elevation ?? previous.elevation ?? 0,
      warpId: values.warpId ?? 0,
      mapNum: values.mapNum ?? header?.mapNum ?? 0,
      mapGroup: values.mapGroup ?? header?.mapGroup ?? 0,
    });
    warps.push(next);
    rewriteWarpArray(header, warps, { capacity });
    return warps.length - 1;
  }

  function deleteLastWarpEvent(header) {
    const warps = getWarps(header);
    if (!warps.length) throw new Error("当前地图没有可删除的传送点。");
    return deleteWarpEvent(header, warps.length - 1);
  }

  function deleteWarpEvent(header, index) {
    const warps = getWarps(header);
    const idx = clampInt(index, 0, 0xFF, -1);
    if (idx < 0 || idx >= warps.length) throw new Error("传送点 index 无效。");
    const incomingRefs = findIncomingWarpReferences(header, idx);
    const deletedRefs = incomingRefs.filter(ref => ref.relation === "deleted").length;
    const shiftedRefs = incomingRefs.filter(ref => ref.relation === "shifted").length;

    warps.splice(idx, 1);
    for (const warp of warps) {
      if (warp.mapGroup === header.mapGroup && warp.mapNum === header.mapNum && warp.warpId > idx) {
        warp.warpId--;
      }
    }
    rewriteWarpArray(header, warps);
    updateShiftedIncomingWarpIds(header, idx);
    return {
      remainingCount: warps.length,
      shiftedRefs,
      deletedRefs,
    };
  }

  window.RBEditorWarpEventManager = {
    EXTRA_WARP_CAPACITY,
    getStorageInfo,
    findIncomingWarpReferences,
    rewriteWarpArray,
    addWarpEvent,
    deleteWarpEvent,
    deleteLastWarpEvent,
  };
})();
