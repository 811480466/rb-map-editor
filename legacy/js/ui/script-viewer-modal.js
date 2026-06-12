// ============================================================
// Script viewer modal
// ============================================================
// 只负责查看脚本/文本，不做脚本编辑与回写。

(function scriptViewerModalModule() {
  let activeTab = "parsed";
  let activeOptions = null;
  let activeAnalysis = null;
  let navigationHistory = [];
  let navigationIndex = -1;

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
        align-items: center;
        justify-content: flex-start !important;
        gap: 8px;
        margin-bottom: 10px;
      }

      .script-viewer-nav-path {
        flex: 1 1 320px;
        min-width: 0;
        color: #51657f;
        font-size: 12px;
        font-family: Consolas, Monaco, monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

      .script-viewer-command-list {
        min-height: 260px;
        max-height: 58vh;
        overflow: auto;
        border: 1px solid #d7e4f5;
        border-radius: 10px;
        background: #0f172a;
        color: #e5edf7;
        font-family: Consolas, Monaco, monospace;
      }

      .script-viewer-command-summary {
        padding: 10px 12px;
        border-bottom: 1px solid #263650;
        color: #a9b9ce;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
      }

      .script-viewer-command-row {
        display: grid;
        grid-template-columns: 38px 72px 86px minmax(0, 1fr) auto;
        gap: 8px;
        align-items: start;
        padding: 7px 10px;
        border-bottom: 1px solid #1d2a40;
        font-size: 12px;
        line-height: 1.5;
      }

      .script-viewer-command-row:last-child { border-bottom: 0; }

      .script-viewer-command-index,
      .script-viewer-command-offset,
      .script-viewer-command-address {
        color: #8fa4bf;
        white-space: nowrap;
      }

      .script-viewer-command-text {
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .script-viewer-command-decoded {
        grid-column: 4 / -1;
        color: #86efac;
        white-space: pre-wrap;
      }

      .script-viewer-follow-btn {
        width: auto !important;
        min-width: 56px !important;
        margin: 0 !important;
        padding: 4px 8px !important;
        border: 1px solid #4f79b8 !important;
        border-radius: 6px !important;
        background: #17345f !important;
        color: #dbeafe !important;
        font-size: 11px !important;
      }

      .script-viewer-follow-btn:hover { background: #24518c !important; }

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
            <button id="scriptViewerBackBtn" class="script-viewer-action-btn" type="button" title="返回上一个脚本">返回</button>
            <button id="scriptViewerForwardBtn" class="script-viewer-action-btn" type="button" title="前进到下一个脚本">前进</button>
            <span id="scriptViewerNavPath" class="script-viewer-nav-path"></span>
            <button id="copyScriptViewerBtn" class="script-viewer-action-btn" type="button">复制当前视图</button>
          </div>
          <div id="scriptViewerContent"></div>
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
    document.getElementById("scriptViewerBackBtn")?.addEventListener("click", navigateBack);
    document.getElementById("scriptViewerForwardBtn")?.addEventListener("click", navigateForward);
    backdrop.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-script-target-off]");
      if (!btn) return;
      navigateToScript(Number(btn.dataset.scriptTargetOff), btn.dataset.scriptTargetLabel || "script");
    });
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
    navigationHistory = [];
    navigationIndex = -1;
    if (activeOptions.mode !== "text") {
      navigationHistory.push({
        off: activeOptions.off,
        ptr: activeOptions.ptr,
        label: "主脚本",
      });
      navigationIndex = 0;
    }
    activeAnalysis = activeOptions.mode === "text" ? null : parseScriptBasic(activeOptions.off, { maxCommands: 120, maxBytes: 720 });

    modal.classList.add("active");
    renderActiveView();
  }

  function activateNavigationEntry(entry) {
    if (!entry || !isValidOffset(entry.off, 1)) return false;
    activeOptions.off = entry.off;
    activeOptions.ptr = entry.ptr ?? offsetToPtr(entry.off);
    activeOptions.sourceLabel = entry.label || "script";
    activeAnalysis = parseScriptBasic(entry.off, { maxCommands: 120, maxBytes: 720 });
    activeTab = "parsed";
    renderActiveView();
    return true;
  }

  function navigateToScript(off, label = "script") {
    if (!isValidOffset(off, 1)) {
      document.getElementById("scriptViewerStatus").textContent = `目标脚本地址无效：${hex(off)}`;
      return false;
    }

    navigationHistory = navigationHistory.slice(0, navigationIndex + 1);
    navigationHistory.push({ off, ptr: offsetToPtr(off), label });
    navigationIndex = navigationHistory.length - 1;
    return activateNavigationEntry(navigationHistory[navigationIndex]);
  }

  function navigateBack() {
    if (navigationIndex <= 0) return false;
    navigationIndex--;
    return activateNavigationEntry(navigationHistory[navigationIndex]);
  }

  function navigateForward() {
    if (navigationIndex < 0 || navigationIndex >= navigationHistory.length - 1) return false;
    navigationIndex++;
    return activateNavigationEntry(navigationHistory[navigationIndex]);
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

    const path = document.getElementById("scriptViewerNavPath");
    if (path) {
      path.textContent = navigationHistory.length
        ? navigationHistory.slice(0, navigationIndex + 1).map(entry => `${entry.label} ${hex(entry.off)}`).join(" > ")
        : "";
      path.title = path.textContent;
    }
    const backBtn = document.getElementById("scriptViewerBackBtn");
    const forwardBtn = document.getElementById("scriptViewerForwardBtn");
    if (backBtn) backBtn.disabled = navigationIndex <= 0;
    if (forwardBtn) forwardBtn.disabled = navigationIndex < 0 || navigationIndex >= navigationHistory.length - 1;
  }

  function commandLine(cmd, index) {
    const rel = activeOptions?.off !== null && activeOptions?.off !== undefined ? cmd.off - activeOptions.off : 0;
    return `${String(index).padStart(3, "0")}  +${hex(rel, 4)}  ${cmd.offHex}  ${cmd.opcodeHex}  ${cmd.text}`;
  }

  function getCommandScriptTarget(cmd) {
    const names = new Set(["goto", "call", "goto_if", "call_if", "vgoto", "vcall"]);
    if (!cmd || !names.has(cmd.name)) return null;
    const target = cmd.args?.target || cmd.args?.arg0;
    if (!target || target.off === null || target.off === undefined) return null;
    return {
      off: target.off,
      ptr: target.ptr,
      label: cmd.name,
      valid: isValidOffset(target.off, 1),
      visited: navigationHistory.some(entry => entry.off === target.off),
    };
  }

  function renderParsedView(container) {
    const analysis = activeAnalysis;
    container.className = "script-viewer-command-list";
    container.innerHTML = "";

    if (!analysis || !analysis.ok) {
      container.innerHTML = `<div class="script-viewer-command-summary">${escapeHtml(analysis?.text || "脚本地址无效或无法解析。")}</div>`;
      return;
    }

    const warningText = analysis.warnings?.length
      ? `\n警告：\n${analysis.warnings.map(w => `- ${w}`).join("\n")}`
      : "";
    const summary = document.createElement("div");
    summary.className = "script-viewer-command-summary";
    summary.textContent =
      `入口：${analysis.entryOffHex} / ${analysis.entryPtrHex}\n` +
      `命令：${analysis.commandCount}    字节：${analysis.consumedBytes}${warningText}`;
    container.appendChild(summary);

    analysis.commands.forEach((cmd, index) => {
      const target = getCommandScriptTarget(cmd);
      const row = document.createElement("div");
      row.className = "script-viewer-command-row";
      const rel = activeOptions?.off !== null && activeOptions?.off !== undefined ? cmd.off - activeOptions.off : 0;
      row.innerHTML = `
        <span class="script-viewer-command-index">${String(index).padStart(3, "0")}</span>
        <span class="script-viewer-command-offset">+${hex(rel, 4)}</span>
        <span class="script-viewer-command-address">${cmd.offHex}</span>
        <span class="script-viewer-command-text">${escapeHtml(cmd.text)}</span>
        ${target
          ? `<button class="script-viewer-follow-btn" type="button" data-script-target-off="${target.off}" data-script-target-label="${escapeHtml(target.label)}" ${target.valid ? "" : "disabled"}>${target.visited ? "再次进入" : "进入"}</button>`
          : "<span></span>"}
      `;
      const decoded = getCommandDecodedText(cmd);
      if (decoded) {
        const text = document.createElement("div");
        text.className = "script-viewer-command-decoded";
        text.textContent = `text: ${decoded}`;
        row.appendChild(text);
      }
      container.appendChild(row);
    });
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
    const contentEl = document.getElementById("scriptViewerContent");
    if (activeTab === "parsed" && activeOptions.mode !== "text") {
      renderParsedView(contentEl);
    } else {
      contentEl.className = "script-viewer-pre";
      contentEl.textContent = getActiveContent();
    }
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
