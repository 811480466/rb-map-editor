// ============================================================
// Script viewer modal
// ============================================================
// 只负责查看脚本/文本，不做脚本编辑与回写。

(function scriptViewerModalModule() {
  let activeTab = "parsed";
  let activeOptions = null;
  let activeAnalysis = null;

  function injectStyle() {
    if (document.getElementById("scriptViewerModalStyle")) return;
    const style = document.createElement("style");
    style.id = "scriptViewerModalStyle";
    style.textContent = `
      .script-viewer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.42);
        padding: 24px;
        box-sizing: border-box;
      }

      .script-viewer-backdrop.active {
        display: flex;
      }

      .script-viewer-modal {
        width: min(980px, 96vw);
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 20px 70px rgba(15, 23, 42, 0.32);
        overflow: hidden;
      }

      .script-viewer-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 18px;
        border-bottom: 1px solid #d7e4f5;
        background: #f7fbff;
      }

      .script-viewer-title {
        font-size: 17px;
        font-weight: 800;
        color: #153b78;
      }

      .script-viewer-subtitle {
        margin-top: 5px;
        font-size: 12px;
        line-height: 1.5;
        color: #51657f;
        font-family: Consolas, Monaco, monospace;
      }

      .script-viewer-close {
        border: 1px solid #bfd1ec;
        background: #fff;
        color: #153b78;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
      }

      .script-viewer-tabs {
        display: flex;
        align-items: flex-end;
        gap: 22px;
        padding: 0 18px;
        border-bottom: 1px solid #d7e4f5;
        background: #fff;
      }

      .script-viewer-tabs button {
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 12px 0 10px !important;
        border: 0 !important;
        border-bottom: 3px solid transparent !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: #4b6382 !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        line-height: 1.2 !important;
        cursor: pointer;
      }

      .script-viewer-tabs button:hover {
        color: #1f5fbf !important;
      }

      .script-viewer-tabs button.active {
        color: #1f5fbf !important;
        border-bottom-color: #1f5fbf !important;
      }

      .script-viewer-action-btn,
      .script-viewer-open-btn {
        border: 1px solid #bfd1ec;
        background: #f7fbff;
        color: #16447d;
        border-radius: 7px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }

      .script-viewer-body {
        padding: 14px 18px 18px;
        overflow: auto;
      }

      .script-viewer-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
      }

      .script-viewer-pre {
        margin: 0;
        min-height: 260px;
        max-height: 58vh;
        overflow: auto;
        padding: 12px;
        border: 1px solid #d7e4f5;
        border-radius: 10px;
        background: #0f172a;
        color: #e5edf7;
        font-size: 12px;
        line-height: 1.55;
        font-family: Consolas, Monaco, monospace;
        white-space: pre-wrap;
      }

      .script-viewer-status {
        min-height: 18px;
        margin-top: 8px;
        font-size: 12px;
        color: #15803d;
      }

      .script-viewer-inline-actions {
        grid-column: 1 / -1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 4px;
      }

      .script-viewer-quick-section {
        border: 1px solid #d8e4f5;
        background: #fff;
        border-radius: 10px;
        padding: 10px;
        margin: 10px 0;
      }

      .script-viewer-quick-section h3 {
        margin: 0 0 8px;
        font-size: 13px;
        color: #153b78;
      }

      .script-viewer-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    injectStyle();
    let backdrop = document.getElementById("scriptViewerBackdrop");
    if (backdrop) return backdrop;

    backdrop = document.createElement("div");
    backdrop.id = "scriptViewerBackdrop";
    backdrop.className = "script-viewer-backdrop";
    backdrop.innerHTML = `
      <div class="script-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="scriptViewerTitle">
        <div class="script-viewer-header">
          <div>
            <div id="scriptViewerTitle" class="script-viewer-title">脚本查看器</div>
            <div id="scriptViewerSubtitle" class="script-viewer-subtitle"></div>
          </div>
          <button id="scriptViewerCloseBtn" class="script-viewer-close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="script-viewer-tabs">
          <button type="button" data-script-viewer-tab="parsed">解析视图</button>
          <button type="button" data-script-viewer-tab="raw">原始字节</button>
          <button type="button" data-script-viewer-tab="texts">文本预览</button>
        </div>
        <div class="script-viewer-body">
          <div class="script-viewer-toolbar">
            <button id="copyScriptViewerBtn" class="script-viewer-action-btn" type="button">复制当前视图</button>
          </div>
          <pre id="scriptViewerContent" class="script-viewer-pre"></pre>
          <div id="scriptViewerStatus" class="script-viewer-status"></div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeScriptViewer();
    });
    document.getElementById("scriptViewerCloseBtn")?.addEventListener("click", closeScriptViewer);
    document.getElementById("copyScriptViewerBtn")?.addEventListener("click", copyCurrentView);
    for (const btn of backdrop.querySelectorAll("button[data-script-viewer-tab]")) {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.scriptViewerTab || "parsed";
        renderActiveView();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("active")) closeScriptViewer();
    });

    return backdrop;
  }

  function normalizeOptions(options = {}) {
    const ptr = Number.isFinite(Number(options.ptr)) ? Number(options.ptr) >>> 0 : null;
    let off = options.off;
    if ((off === null || off === undefined) && ptr !== null) off = ptrToOffset(ptr);
    if (off !== null && off !== undefined) off = Number(off);
    return {
      title: options.title || "脚本查看器",
      sourceLabel: options.sourceLabel || "script",
      mode: options.mode || "script",
      ptr,
      off,
      event: options.event || null,
      map: options.map || (typeof currentMap !== "undefined" ? currentMap : null),
    };
  }

  function openScriptViewer(options = {}) {
    const modal = ensureModal();
    activeOptions = normalizeOptions(options);
    activeTab = activeOptions.mode === "text" ? "texts" : "parsed";
    activeAnalysis = activeOptions.mode === "text" ? null : parseScriptBasic(activeOptions.off, { maxCommands: 120, maxBytes: 720 });

    modal.classList.add("active");
    renderActiveView();
  }

  function closeScriptViewer() {
    document.getElementById("scriptViewerBackdrop")?.classList.remove("active");
  }

  function mapLabel(map) {
    if (!map) return "未选择地图";
    if (typeof getMapDisplayNameWithCode === "function") return getMapDisplayNameWithCode(map);
    return `group=${map.mapGroup ?? "?"}, map=${map.mapNum ?? "?"}`;
  }

  function renderHeader() {
    const o = activeOptions;
    document.getElementById("scriptViewerTitle").textContent = o.title || "脚本查看器";
    document.getElementById("scriptViewerSubtitle").textContent =
      `来源：${o.sourceLabel}\n` +
      `GBA Ptr: ${o.ptr !== null ? hex(o.ptr) : "null"}    ROM Off: ${o.off !== null && o.off !== undefined ? hex(o.off) : "null"}\n` +
      `地图：${mapLabel(o.map)}`;

    for (const btn of document.querySelectorAll("button[data-script-viewer-tab]")) {
      btn.classList.toggle("active", btn.dataset.scriptViewerTab === activeTab);
    }
  }

  function commandLine(cmd, index) {
    const rel = activeOptions?.off !== null && activeOptions?.off !== undefined ? cmd.off - activeOptions.off : 0;
    return `${String(index).padStart(3, "0")}  +${hex(rel, 4)}  ${cmd.offHex}  ${cmd.opcodeHex}  ${cmd.text}`;
  }

  function renderParsedText() {
    if (!activeOptions || activeOptions.mode === "text") {
      return renderTextsText();
    }
    const analysis = activeAnalysis;
    if (!analysis || !analysis.ok) return analysis?.text || "脚本地址无效或无法解析。";

    const lines = [];
    lines.push(`entryOff : ${analysis.entryOffHex}`);
    lines.push(`entryPtr : ${analysis.entryPtrHex}`);
    lines.push(`commands : ${analysis.commandCount}`);
    lines.push(`bytes    : ${analysis.consumedBytes}`);
    if (analysis.warnings?.length) {
      lines.push("");
      lines.push("Warnings:");
      for (const w of analysis.warnings) lines.push(`- ${w}`);
    }
    lines.push("");
    lines.push("Commands:");
    for (let i = 0; i < analysis.commands.length; i++) {
      const cmd = analysis.commands[i];
      lines.push(commandLine(cmd, i));
      const text = getCommandDecodedText(cmd);
      if (text) lines.push(`     text: ${JSON.stringify(text)}`);
    }
    return lines.join("\n");
  }

  function getCommandDecodedText(cmd) {
    if (!cmd?.args) return null;
    if (cmd.args.decodedText) return cmd.args.decodedText;
    if (cmd.args.introText || cmd.args.defeatText) {
      return [
        cmd.args.introText ? `intro=${cmd.args.introText}` : "",
        cmd.args.defeatText ? `defeat=${cmd.args.defeatText}` : "",
      ].filter(Boolean).join(" | ");
    }
    return null;
  }

  function formatHexDump(off, length = 0x100) {
    if (off === null || off === undefined || !isValidOffset(off, 1)) return "地址无效，无法读取原始字节。";
    const safeLen = Math.max(1, Math.min(length, rom.length - off));
    const lines = [];
    for (let base = 0; base < safeLen; base += 16) {
      const chunk = [];
      const ascii = [];
      for (let i = 0; i < 16 && base + i < safeLen; i++) {
        const b = readU8(off + base + i);
        chunk.push(b.toString(16).toUpperCase().padStart(2, "0"));
        ascii.push(b >= 0x20 && b <= 0x7E ? String.fromCharCode(b) : ".");
      }
      lines.push(`${hex(off + base)}: ${chunk.join(" ").padEnd(47, " ")}  ${ascii.join("")}`);
    }
    return lines.join("\n");
  }

  function collectTextEntries() {
    const entries = [];
    const pushText = (label, ptr, off, text) => {
      if (!text && off !== null && off !== undefined && isValidOffset(off, 1)) text = decodePokemonText(off, 320);
      if (!text) return;
      entries.push({ label, ptr, off, text });
    };

    if (!activeOptions) return entries;
    if (activeOptions.mode === "text") {
      pushText(activeOptions.sourceLabel, activeOptions.ptr, activeOptions.off, null);
      return entries;
    }

    for (const cmd of activeAnalysis?.commands || []) {
      if (cmd.args?.textPtr) {
        pushText(cmd.text, cmd.args.textPtr.ptr, cmd.args.textPtr.off, cmd.args.decodedText);
      }
      if (cmd.args?.intro) {
        pushText("trainer intro", cmd.args.intro.ptr, cmd.args.intro.off, cmd.args.introText);
      }
      if (cmd.args?.defeat) {
        pushText("trainer defeat", cmd.args.defeat.ptr, cmd.args.defeat.off, cmd.args.defeatText);
      }
      if (cmd.args?.after) {
        // after 通常是脚本，不作为文本强制解码。
      }
    }

    return entries;
  }

  function renderTextsText() {
    const entries = collectTextEntries();
    if (!entries.length) return "当前入口未解析到文本指针。";
    return entries.map((t, i) => {
      return `#${i}\n来源：${t.label}\nPtr : ${t.ptr !== null && t.ptr !== undefined ? hex(t.ptr) : "null"}\nOff : ${t.off !== null && t.off !== undefined ? hex(t.off) : "null"}\n文本：\n${t.text}`;
    }).join("\n\n");
  }

  function getActiveContent() {
    if (activeTab === "raw") return formatHexDump(activeOptions?.off, 0x100);
    if (activeTab === "texts") return renderTextsText();
    return renderParsedText();
  }

  function renderActiveView() {
    if (!activeOptions) return;
    renderHeader();
    const content = getActiveContent();
    document.getElementById("scriptViewerContent").textContent = content;
    document.getElementById("scriptViewerStatus").textContent = "";
  }

  async function copyCurrentView() {
    const content = document.getElementById("scriptViewerContent")?.textContent || "";
    try {
      await navigator.clipboard.writeText(content);
      document.getElementById("scriptViewerStatus").textContent = "已复制。";
    } catch (err) {
      document.getElementById("scriptViewerStatus").textContent = "复制失败，请手动选择文本复制。";
    }
  }

  function currentSelectedEvent() {
    if (typeof selectedEventKey === "undefined" || !selectedEventKey) return null;
    if (!Array.isArray(currentEvents)) return null;
    return currentEvents.find(ev => typeof eventKey === "function" && eventKey(ev) === selectedEventKey) || null;
  }

  function buildQuickActions(ev) {
    if (!ev) return [];
    const actions = [];
    if ((ev.type === "object" || ev.type === "bg" || ev.type === "coord") && ev.scriptOff !== null && ev.scriptOff !== undefined) {
      actions.push({
        label: "查看主脚本",
        title: `${eventTypeName(ev)} #${ev.index} 主脚本`,
        sourceLabel: `${eventTypeName(ev)} #${ev.index} scriptPtr`,
        ptr: ev.scriptPtr,
        off: ev.scriptOff,
        mode: "script",
      });
    }
    if (ev.trainerBattle) {
      const tb = ev.trainerBattle;
      if (tb.introOff !== null && tb.introOff !== undefined) actions.push({ label: "查看开战文本", title: `TRAINER #${ev.index} 开战文本`, sourceLabel: "trainer intro text", ptr: tb.introPtr, off: tb.introOff, mode: "text" });
      if (tb.defeatOff !== null && tb.defeatOff !== undefined) actions.push({ label: "查看战败文本", title: `TRAINER #${ev.index} 战败文本`, sourceLabel: "trainer defeat text", ptr: tb.defeatPtr, off: tb.defeatOff, mode: "text" });
      if (tb.afterOff !== null && tb.afterOff !== undefined) actions.push({ label: "查看战后脚本", title: `TRAINER #${ev.index} 战后脚本`, sourceLabel: "trainer after script", ptr: tb.afterPtr, off: tb.afterOff, mode: "script" });
    }
    return actions;
  }

  function eventTypeName(ev) {
    if (!ev) return "EVENT";
    if (ev.type === "object" && ev.trainerBattle) return "TRAINER";
    if (ev.type === "object") return "OBJ";
    return ev.type.toUpperCase();
  }

  function enhanceEventPanel() {
    const eventTab = document.getElementById("eventTab");
    if (!eventTab || document.getElementById("scriptViewerQuickSection")) return;
    const ev = currentSelectedEvent();
    if (!ev) return;

    const actions = buildQuickActions(ev);
    if (!actions.length) return;

    const section = document.createElement("div");
    section.id = "scriptViewerQuickSection";
    section.className = "script-viewer-quick-section";
    section.innerHTML = `
      <h3>脚本查看</h3>
      <div class="script-viewer-quick-actions">
        ${actions.map((a, i) => `<button class="script-viewer-open-btn" type="button" data-script-viewer-action="${i}">${escapeHtml(a.label)}</button>`).join("")}
      </div>
    `;
    section.__scriptViewerActions = actions;

    const actionsBox = eventTab.querySelector(".event-actions");
    if (actionsBox) eventTab.insertBefore(section, actionsBox);
    else eventTab.appendChild(section);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-script-viewer-action]");
    if (!btn) return;
    const section = btn.closest("#scriptViewerQuickSection");
    const actions = section?.__scriptViewerActions || [];
    const action = actions[Number(btn.dataset.scriptViewerAction)];
    if (!action) return;
    openScriptViewer({ ...action, event: currentSelectedEvent(), map: typeof currentMap !== "undefined" ? currentMap : null });
  }, true);

  const observer = new MutationObserver(() => enhanceEventPanel());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => observer.observe(document.body, { childList: true, subtree: true }));
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.RBEditorScriptViewer = {
    openScriptViewer,
    closeScriptViewer,
    enhanceEventPanel,
  };
})();
