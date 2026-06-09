// ============================================================
// Warp event manager
// ============================================================
// Keep MapEvents in place, migrate only WarpEvent[] to managed free space,
// reserve 10 slots, append new warps, and repair shifted warpId references
// when deleting a middle warp.

(function warpEventManagerModule() {
  const MANAGED_WARP_CAPACITY = 10;
  const MANAGED_WARP_BYTES = MANAGED_WARP_CAPACITY * WARP_EVENT_SIZE;

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

  function clearWarpSlots(dataOff) {
    ensureWriteRange(dataOff, MANAGED_WARP_BYTES);
    for (let i = 0; i < MANAGED_WARP_BYTES; i++) writeU8(dataOff + i, 0);
  }

  function isManagedWarpArray(dataOff) {
    return window.RBEditorFreeSpace?.isInManagedRegion?.(dataOff, MANAGED_WARP_BYTES) === true;
  }

  function allocateWarpArray() {
    const allocator = window.RBEditorFreeSpace;
    if (!allocator?.allocate) throw new Error("Free-space manager is not available.");
    return allocator.allocate(MANAGED_WARP_BYTES, { tag: "WarpEvent[10]" }).offset;
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
    return {
      capacity: MANAGED_WARP_CAPACITY,
      count,
      dataOff,
      managed: isManagedWarpArray(dataOff),
    };
  }

  function rewriteWarpArray(header, warps) {
    if (!header?.events || !isValidOffset(header.events.offset, MAP_EVENTS_SIZE)) {
      throw new Error("MapEvents offset is invalid.");
    }
    if (warps.length > MANAGED_WARP_CAPACITY) {
      throw new Error(`Warp count cannot exceed ${MANAGED_WARP_CAPACITY}.`);
    }

    const oldDataOff = header.events.warpOff;
    const dataOff = isManagedWarpArray(oldDataOff) ? oldDataOff : allocateWarpArray();
    clearWarpSlots(dataOff);
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
    if (warps.length >= MANAGED_WARP_CAPACITY) {
      throw new Error(`当前地图传送点已达最大数量 ${MANAGED_WARP_CAPACITY}.`);
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
    rewriteWarpArray(header, warps);
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
    MANAGED_WARP_CAPACITY,
    getStorageInfo,
    findIncomingWarpReferences,
    rewriteWarpArray,
    addWarpEvent,
    deleteWarpEvent,
    deleteLastWarpEvent,
  };
})();
