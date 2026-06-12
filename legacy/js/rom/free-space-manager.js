// ============================================================
// Global ROM free-space manager
// ============================================================
// Default blank byte is 0xFF. Allocations are reserved with 0x01 first
// so later scans do not treat partially-empty structured data as free.

(function freeSpaceManagerModule() {
  const DEFAULT_FREE_SPACE_START = 0x01900000;
  const DEFAULT_ALIGN = 4;

  let freeSpaceStart = DEFAULT_FREE_SPACE_START;
  let freeSpaceCursor = DEFAULT_FREE_SPACE_START;
  const allocatedRanges = [];

  function align(value, boundary = DEFAULT_ALIGN) {
    return (Number(value) + boundary - 1) & ~(boundary - 1);
  }

  function normalizeOffset(value, fallback = DEFAULT_FREE_SPACE_START) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.trunc(n));
  }

  function rangesOverlap(aStart, aSize, bStart, bSize) {
    return aStart < bStart + bSize && bStart < aStart + aSize;
  }

  function overlapsAllocated(off, size) {
    return allocatedRanges.some(range => rangesOverlap(off, size, range.offset, range.size));
  }

  function isBlankByte(value) {
    return value === 0xFF;
  }

  function isBlankRange(off, size) {
    if (!rom || !isValidOffset(off, size)) return false;
    if (overlapsAllocated(off, size)) return false;
    for (let i = 0; i < size; i++) {
      if (!isBlankByte(readU8(off + i))) return false;
    }
    return true;
  }

  function reserveRange(off, size, tag = "manual") {
    if (!rom || !isValidOffset(off, size)) {
      throw new Error(`ROM free-space range invalid: ${hex(off)} size=${size}`);
    }
    allocatedRanges.push({ offset: off, size, tag });
    return { offset: off, size, tag };
  }

  function fillRange(off, size, value) {
    if (!rom || !isValidOffset(off, size)) {
      throw new Error(`ROM write range invalid: ${hex(off)} size=${size}`);
    }
    for (let i = 0; i < size; i++) writeU8(off + i, value);
  }

  function allocate(size, options = {}) {
    if (!rom) throw new Error("ROM is not loaded.");

    const alignTo = options.align || DEFAULT_ALIGN;
    const needed = align(Math.max(1, Number(size) || 1), alignTo);
    const tag = options.tag || "allocation";
    const reserveValue = options.reserveValue ?? 0x01;
    const begin = align(Math.max(freeSpaceCursor, freeSpaceStart), alignTo);
    const end = rom.length - needed;

    for (let off = begin; off <= end; off += alignTo) {
      if (!isBlankRange(off, needed)) continue;
      fillRange(off, needed, reserveValue);
      const range = reserveRange(off, needed, tag);
      freeSpaceCursor = align(off + needed, alignTo);
      return range;
    }

    throw new Error(`No free space found: need ${needed} bytes from ${hex(begin)}.`);
  }

  function findLargestFreeRange(start = freeSpaceStart) {
    if (!rom) return { offset: null, size: 0 };

    const scanStart = align(normalizeOffset(start, freeSpaceStart), DEFAULT_ALIGN);
    let bestOffset = null;
    let bestSize = 0;
    let runOffset = null;
    let runSize = 0;

    for (let off = scanStart; off < rom.length; off++) {
      const free = isBlankByte(readU8(off)) && !overlapsAllocated(off, 1);
      if (free) {
        if (runOffset === null) runOffset = off;
        runSize++;
      } else if (runOffset !== null) {
        if (runSize > bestSize) {
          bestOffset = runOffset;
          bestSize = runSize;
        }
        runOffset = null;
        runSize = 0;
      }
    }

    if (runOffset !== null && runSize > bestSize) {
      bestOffset = runOffset;
      bestSize = runSize;
    }

    return { offset: bestOffset, size: bestSize };
  }

  function setFreeSpaceStart(offset) {
    freeSpaceStart = align(normalizeOffset(offset), DEFAULT_ALIGN);
    freeSpaceCursor = freeSpaceStart;
    allocatedRanges.length = 0;
    return getState();
  }

  function setFreeSpaceCursor(offset) {
    freeSpaceCursor = align(Math.max(normalizeOffset(offset), freeSpaceStart), DEFAULT_ALIGN);
    return getState();
  }

  function resetAllocations() {
    freeSpaceCursor = freeSpaceStart;
    allocatedRanges.length = 0;
    return getState();
  }

  function isInManagedRegion(off, size = 1) {
    return Number.isInteger(off) && off >= freeSpaceStart && isValidOffset(off, size);
  }

  function getState() {
    return {
      start: freeSpaceStart,
      cursor: freeSpaceCursor,
      largest: findLargestFreeRange(freeSpaceCursor),
      allocated: allocatedRanges.slice(),
    };
  }

  window.RBEditorFreeSpace = {
    DEFAULT_FREE_SPACE_START,
    align,
    allocate,
    reserveRange,
    fillRange,
    findLargestFreeRange,
    getLargestFreeRange: findLargestFreeRange,
    setFreeSpaceStart,
    setFreeSpaceCursor,
    resetAllocations,
    isBlankRange,
    isInManagedRegion,
    getState,
  };
})();
