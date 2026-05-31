// ============================================================
// ObjectEventTemplate writer patch
// ============================================================
// 按 pokeemerald ObjectEventTemplate 结构修正对象事件写回：
// 0x02 inConnection, 0x03 padding, 0x09 movementType, 0x0A movementRange bitfield。

(function objectEventTemplateWriterModule() {
  function parseNum(raw, name, min, max) {
    const text = String(raw ?? "").trim();
    if (!text) throw new Error(`${name} 不能为空`);
    const value = /^[-+]?0x/i.test(text) ? Number.parseInt(text, 16) : Number(text);
    if (!Number.isInteger(value)) throw new Error(`${name} 必须是整数`);
    if (value < min || value > max) throw new Error(`${name} 超出范围：${min} ~ ${max}`);
    return value;
  }

  function getInputMap() {
    const map = {};
    for (const input of document.querySelectorAll("#eventTab [data-event-field]")) {
      map[input.dataset.eventField] = input.value;
    }
    return map;
  }

  function writeU8(off, value) {
    if (!rom || !isValidOffset(off, 1)) throw new Error(`ROM 写入范围无效：${hex(off)} size=1`);
    rom[off] = value & 0xFF;
  }

  function writeU16(off, value) {
    if (!rom || !isValidOffset(off, 2)) throw new Error(`ROM 写入范围无效：${hex(off)} size=2`);
    rom[off] = value & 0xFF;
    rom[off + 1] = (value >> 8) & 0xFF;
  }

  function writeU32(off, value) {
    if (!rom || !isValidOffset(off, 4)) throw new Error(`ROM 写入范围无效：${hex(off)} size=4`);
    const v = value >>> 0;
    rom[off] = v & 0xFF;
    rom[off + 1] = (v >> 8) & 0xFF;
    rom[off + 2] = (v >> 16) & 0xFF;
    rom[off + 3] = (v >> 24) & 0xFF;
  }

  function writeS16(off, value) {
    writeU16(off, value < 0 ? value + 0x10000 : value);
  }

  function findSelectedObjectEvent() {
    if (typeof selectedEventKey === "undefined" || !selectedEventKey) return null;
    if (!Array.isArray(currentEvents)) return null;
    return currentEvents.find(ev => {
      if (ev.type !== "object") return false;
      const key = typeof eventKey === "function" ? eventKey(ev) : `${ev.type}:${ev.index}:${ev.offset}`;
      return key === selectedEventKey;
    }) || null;
  }

  function setStatus(text, cls = "") {
    const el = document.getElementById("eventEditStatus");
    if (!el) return;
    el.className = `event-edit-status ${cls}`.trim();
    el.textContent = text || "";
  }

  function refreshObjectAfterWrite(oldKey) {
    if (currentMap && typeof loadMapEvents === "function") {
      currentEvents = loadMapEvents(currentMap);
    }
    if (currentMap && typeof renderMap === "function") {
      renderMap(currentMap, currentEvents);
    }

    const next = Array.isArray(currentEvents)
      ? currentEvents.find(ev => (typeof eventKey === "function" ? eventKey(ev) : `${ev.type}:${ev.index}:${ev.offset}`) === oldKey)
      : null;

    if (next && window.RBEditorEventPanel?.renderDetailView) {
      selectedEventKey = oldKey;
      window.RBEditorEventPanel.renderDetailView(next);
      setStatus("已应用修改。点击左上角“导出”保存到文件。", "ok");
    } else if (window.RBEditorEventPanel?.renderListView) {
      selectedEventKey = null;
      window.RBEditorEventPanel.renderListView(currentEvents || []);
    }
  }

  function writeSelectedObjectEvent() {
    const ev = findSelectedObjectEvent();
    if (!ev) return false;
    if (!rom) throw new Error("尚未加载 ROM。无法写入。“应用修改”只修改内存中的 ROM，最后仍需导出文件。");
    if (!isValidOffset(ev.offset, 0x18)) throw new Error(`ROM 写入范围无效：${hex(ev.offset)} size=0x18`);

    const input = getInputMap();
    const localId = parseNum(input.localId, "对象ID", 0, 0xFF);
    const graphicsId = parseNum(input.graphicsId, "图形", 0, 0xFF);
    const inConnection = parseNum(input.inConnection ?? input.kind ?? ev.inConnection ?? 0, "inConnection", 0, 0xFF);
    const padding03 = parseNum(input.padding03 ?? ev.padding03 ?? 0, "padding03", 0, 0xFF);
    const x = parseNum(input.x, "x", -32768, 32767);
    const y = parseNum(input.y, "y", -32768, 32767);
    const elevation = parseNum(input.elevation, "z", 0, 0xFF);
    const movementType = parseNum(input.movementType, "移动类型", 0, 0xFF);
    const movementRangeX = parseNum(input.movementRangeX, "移动范围 X", 0, 0x0F);
    const movementRangeY = parseNum(input.movementRangeY, "移动范围 Y", 0, 0x0F);
    const trainerType = parseNum(input.trainerType, "训练家类型", 0, 0xFFFF);
    const trainerRange = parseNum(input.trainerRange, "视野/树果", 0, 0xFFFF);
    const scriptPtr = parseNum(input.scriptPtr ?? ev.scriptPtr, "scriptPtr", 0, 0xFFFFFFFF);
    const flagId = parseNum(input.flagId, "事件Flag", 0, 0xFFFF);
    const padding16 = parseNum(input.padding16 ?? input.unknown16 ?? ev.padding16 ?? 0, "padding16", 0, 0xFFFF);

    const movementRangeRaw = (movementRangeX & 0x0F) | ((movementRangeY & 0x0F) << 4);

    writeU8(ev.offset + 0x00, localId);
    writeU8(ev.offset + 0x01, graphicsId);
    writeU8(ev.offset + 0x02, inConnection);
    writeU8(ev.offset + 0x03, padding03);
    writeS16(ev.offset + 0x04, x);
    writeS16(ev.offset + 0x06, y);
    writeU8(ev.offset + 0x08, elevation);
    writeU8(ev.offset + 0x09, movementType);
    writeU16(ev.offset + 0x0A, movementRangeRaw);
    writeU16(ev.offset + 0x0C, trainerType);
    writeU16(ev.offset + 0x0E, trainerRange);
    writeU32(ev.offset + 0x10, scriptPtr);
    writeU16(ev.offset + 0x14, flagId);
    writeU16(ev.offset + 0x16, padding16);

    refreshObjectAfterWrite(typeof eventKey === "function" ? eventKey(ev) : `${ev.type}:${ev.index}:${ev.offset}`);
    return true;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#applyEventEditBtn");
    if (!btn) return;
    const ev = findSelectedObjectEvent();
    if (!ev) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    try {
      writeSelectedObjectEvent();
    } catch (err) {
      setStatus(err?.message || String(err), "error");
    }
  }, true);

  window.RBEditorObjectEventTemplateWriter = {
    writeSelectedObjectEvent,
  };
})();
