// ============================================================
// trainerbattle 脚本解析
// ============================================================
const TRAINER_BATTLE_TYPES = {
  0: "TRAINER_BATTLE_SINGLE",
  1: "TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC",
  2: "TRAINER_BATTLE_CONTINUE_SCRIPT",
  3: "TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT",
  4: "TRAINER_BATTLE_DOUBLE",
  5: "TRAINER_BATTLE_REMATCH",
  6: "TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE",
  7: "TRAINER_BATTLE_REMATCH_DOUBLE",
  8: "TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC",
  9: "TRAINER_BATTLE_PYRAMID",
  10: "TRAINER_BATTLE_SET_TRAINER_A",
  11: "TRAINER_BATTLE_SET_TRAINER_B",
  12: "TRAINER_BATTLE_HILL",
};

const TRAINER_BATTLE_POINTER_LAYOUTS = {
  0: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
  1: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "afterScript", kind: "script" },
  ],
  2: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "afterScript", kind: "script" },
  ],
  3: [
    { name: "defeat", kind: "text" },
  ],
  4: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "cannotBattle", kind: "text" },
  ],
  5: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
  6: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "cannotBattle", kind: "text" },
    { name: "afterScript", kind: "script" },
  ],
  7: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "cannotBattle", kind: "text" },
  ],
  8: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
    { name: "cannotBattle", kind: "text" },
    { name: "afterScript", kind: "script" },
  ],
  9: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
  10: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
  11: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
  12: [
    { name: "intro", kind: "text" },
    { name: "defeat", kind: "text" },
  ],
};

function parseTrainerBattleScript(scriptOff) {
  if (!isValidOffset(scriptOff, 6)) return null;

  const cmd = readU8(scriptOff);
  if (cmd !== 0x5C) return null;

  const battleType = readU8(scriptOff + 1);
  const pointerLayout = TRAINER_BATTLE_POINTER_LAYOUTS[battleType];
  if (!pointerLayout) return null;

  const size = 6 + pointerLayout.length * 4;
  if (!isValidOffset(scriptOff, size)) return null;

  const trainerId = readU16(scriptOff + 2);
  const localId = readU16(scriptOff + 4);
  const pointers = pointerLayout.map((def, index) => {
    const ptrOffset = scriptOff + 6 + index * 4;
    const ptr = readPtr(ptrOffset);
    return {
      index,
      name: def.name,
      kind: def.kind,
      ptrOffset,
      ptr,
      off: ptrToOffset(ptr),
    };
  });

  const pointerByName = Object.fromEntries(pointers.map(p => [p.name, p]));
  const intro = pointerByName.intro || null;
  const defeat = pointerByName.defeat || pointers.find(p => p.kind === "text") || null;
  const afterScript = pointerByName.afterScript || null;

  return {
    size,
    battleType,
    battleTypeName: TRAINER_BATTLE_TYPES[battleType] || `TRAINER_BATTLE_${battleType}`,
    trainerId,
    localId,
    pointers,
    introPtr: intro?.ptr ?? null,
    introOff: intro?.off ?? null,
    defeatPtr: defeat?.ptr ?? null,
    defeatOff: defeat?.off ?? null,
    afterPtr: afterScript?.ptr ?? null,
    afterOff: afterScript?.off ?? null,
  };
}


// ============================================================
// 脚本基础解析（线性反汇编，重点解析 NPC/BG/COORD 常见命令）
// 说明：这里不做完整控制流反编译，只把从入口开始的常见命令翻成可读文本。
// 未知命令会按 unknown_xx 停止，避免误读后续数据。
// ============================================================
const SCRIPT_CONDITION_NAMES = {
  0x00: "false",
  0x01: "true",
  0x02: "eq",
  0x03: "ne",
  0x04: "lt",
  0x05: "gt",
  0x06: "le",
  0x07: "ge",
};

const STD_SCRIPT_NAMES = {
  0x00: "Std_BrailleMessage",
  0x01: "Std_FindItem",
  0x02: "Std_MsgboxDefault",
  0x03: "Std_MsgboxSign",
  0x04: "Std_MsgboxNpc",
  0x05: "Std_MsgboxYesNo",
  0x06: "Std_MsgboxAutoclose",
};

function readScriptU8(off) {
  return isValidOffset(off, 1) ? readU8(off) : null;
}

function readScriptU16(off) {
  return isValidOffset(off, 2) ? readU16(off) : null;
}

function readScriptU32(off) {
  return isValidOffset(off, 4) ? readU32(off) : null;
}

function scriptPtrToDisplay(ptr) {
  const off = ptrToOffset(ptr);
  return {
    ptr,
    ptrHex: hex(ptr),
    off,
    offHex: off !== null ? hex(off) : null,
  };
}

function decodeScriptTextPtr(ptr, maxLen = 180) {
  const off = ptrToOffset(ptr);
  if (off === null || !isValidOffset(off, 1)) return null;
  const text = decodePokemonText(off, maxLen);
  if (!text) return null;
  return text;
}

function scriptVarName(v) {
  if (v === null || v === undefined) return "?";
  if (v === 0x8000) return "VAR_0x8000";
  if (v === 0x8001) return "VAR_0x8001";
  if (v === 0x8002) return "VAR_0x8002";
  if (v === 0x8003) return "VAR_0x8003";
  if (v === 0x8004) return "VAR_0x8004";
  if (v === 0x8005) return "VAR_0x8005";
  if (v === 0x8006) return "VAR_0x8006";
  if (v === 0x8007) return "VAR_0x8007";
  if (v === 0x800D) return "VAR_RESULT";
  if (v === 0x800F) return "VAR_LAST_TALKED";
  return hex(v, 4);
}

function readScriptArgs(pc, spec) {
  const args = [];
  let p = pc;
  for (const type of spec) {
    if (type === "u8") {
      const v = readScriptU8(p);
      if (v === null) return null;
      args.push(v);
      p += 1;
    } else if (type === "u16") {
      const v = readScriptU16(p);
      if (v === null) return null;
      args.push(v);
      p += 2;
    } else if (type === "u32") {
      const v = readScriptU32(p);
      if (v === null) return null;
      args.push(v);
      p += 4;
    } else if (type === "ptr") {
      const v = readScriptU32(p);
      if (v === null) return null;
      args.push(v);
      p += 4;
    }
  }
  return { args, next: p };
}

function scriptLine(opcode, name, startOff, nextOff, args = {}, text = "") {
  return {
    off: startOff,
    offHex: hex(startOff),
    opcode,
    opcodeHex: hex(opcode, 2),
    name,
    size: nextOff - startOff,
    nextOff,
    nextOffHex: hex(nextOff),
    args,
    text,
  };
}

function parseTrainerBattleCommandAt(startOff) {
  const tb = parseTrainerBattleScript(startOff);
  if (!tb) return null;
  const args = {
    battleType: tb.battleType,
    battleTypeName: tb.battleTypeName,
    trainerId: tb.trainerId,
    localId: tb.localId,
    pointers: tb.pointers.map(p => ({
      index: p.index,
      name: p.name,
      kind: p.kind,
      ptrOffset: p.ptrOffset,
      ptrOffsetHex: hex(p.ptrOffset),
      ...scriptPtrToDisplay(p.ptr),
    })),
  };
  if (tb.introPtr !== null) args.intro = scriptPtrToDisplay(tb.introPtr);
  if (tb.defeatPtr !== null) args.defeat = scriptPtrToDisplay(tb.defeatPtr);
  if (tb.afterPtr !== null) args.after = scriptPtrToDisplay(tb.afterPtr);

  const introText = tb.introOff !== null ? decodePokemonText(tb.introOff, 220) : null;
  const defeatText = tb.defeatOff !== null ? decodePokemonText(tb.defeatOff, 220) : null;
  if (introText) args.introText = introText;
  if (defeatText) args.defeatText = defeatText;
  for (const p of tb.pointers) {
    if (p.kind !== "text" || p.off === null) continue;
    const text = decodePokemonText(p.off, 220);
    if (text) args[`${p.name}Text`] = text;
  }
  return scriptLine(
    0x5C,
    "trainerbattle",
    startOff,
    startOff + tb.size,
    args,
    `trainerbattle type=${tb.battleType} ${tb.battleTypeName} trainerId=${tb.trainerId} localId=${tb.localId}`
  );
}

function formatKnownScriptCommand(opcode, startOff) {
  // 返回 null 表示未知命令。
  const simple = {
    0x00: "nop",
    0x01: "nop1",
    0x02: "end",
    0x03: "return",
    0x0C: "returnram",
    0x0D: "endram",
    0x27: "waitstate",
    0x2D: "dotimebasedevents",
    0x2E: "gettime",
    0x30: "waitse",
    0x32: "waitfanfare",
    0x35: "fadedefaultbgm",
    0x43: "getpartysize",
    0x5A: "faceplayer",
    0x5D: "dotrainerbattle",
    0x5E: "gotopostbattlescript",
    0x5F: "gotobeatenscript",
    0x66: "waitmessage",
    0x68: "closemessage",
    0x69: "lockall",
    0x6A: "lock",
    0x6B: "releaseall",
    0x6C: "release",
    0x6D: "waitbuttonpress",
    0x76: "hidemonpic",
    0x8B: "choosecontestmon",
    0x8D: "showcontestresults",
    0x8E: "contestlinktransfer",
    0x94: "hidemoneybox",
    0xA0: "checkplayergender",
    0xA3: "resetweather",
    0xA5: "doweather",
    0xAE: "waitdooranim",
    0xB2: "showelevmenu",
    0xB7: "dowildbattle",
    0xC5: "waitmoncry",
    0xCF: "trywondercardscript",
    0xD4: "turnrotatingtileobjects",
    0xD6: "freerotatingtilepuzzle",
    0xD8: "selectapproachingtrainer",
    0xD9: "lockfortrainer",
    0xDA: "closebraillemessage",
  };

  if (simple[opcode]) {
    return scriptLine(opcode, simple[opcode], startOff, startOff + 1, {}, simple[opcode]);
  }

  if (opcode === 0x5C) return parseTrainerBattleCommandAt(startOff);

  const fixedSpecs = {
    0x04: ["ptr", "call"],
    0x05: ["ptr", "goto"],
    0x08: ["u8", "gotostd"],
    0x09: ["u8", "callstd"],
    0x0E: ["u8", "setmysteryeventstatus"],

    0x0F: ["u8", "u32", "loadword"],
    0x10: ["u8", "u8", "loadbyte"],
    0x11: ["u8", "ptr", "setptr"],
    0x12: ["u8", "ptr", "loadbytefromptr"],
    0x13: ["u8", "ptr", "setptrbyte"],
    0x14: ["u8", "u8", "copylocal"],
    0x15: ["ptr", "ptr", "copybyte"],

    0x16: ["u16", "u16", "setvar"],
    0x17: ["u16", "u16", "addvar"],
    0x18: ["u16", "u16", "subvar"],
    0x19: ["u16", "u16", "copyvar"],
    0x1A: ["u16", "u16", "setorcopyvar"],

    0x1B: ["u8", "u8", "compare_local_to_local"],
    0x1C: ["u8", "u8", "compare_local_to_value"],
    0x1D: ["u8", "ptr", "compare_local_to_ptr"],
    0x1E: ["ptr", "u8", "compare_ptr_to_local"],
    0x1F: ["ptr", "u8", "compare_ptr_to_value"],
    0x20: ["ptr", "ptr", "compare_ptr_to_ptr"],
    0x21: ["u16", "u16", "compare_var_to_value"],
    0x22: ["u16", "u16", "compare_var_to_var"],

    0x23: ["ptr", "callnative"],
    0x24: ["ptr", "gotonative"],
    0x25: ["u16", "special"],
    0x26: ["u16", "u16", "specialvar"],

    0x28: ["u16", "delay"],
    0x29: ["u16", "setflag"],
    0x2A: ["u16", "clearflag"],
    0x2B: ["u16", "checkflag"],
    0x2C: ["u16", "u16", "initclock"],

    0x2F: ["u16", "playse"],
    0x31: ["u16", "playfanfare"],
    0x33: ["u16", "u8", "playbgm"],
    0x34: ["u16", "savebgm"],
    0x36: ["u16", "fadenewbgm"],
    0x37: ["u8", "fadeoutbgm"],
    0x38: ["u8", "fadeinbgm"],

    0x39: ["u8", "u8", "u8", "u16", "u16", "warp"],
    0x3A: ["u8", "u8", "u8", "u16", "u16", "warpsilent"],
    0x3B: ["u8", "u8", "u8", "u16", "u16", "warpdoor"],
    0x3C: ["u8", "u8", "warphole"],
    0x3D: ["u8", "u8", "u8", "u16", "u16", "warpteleport"],
    0x3E: ["u8", "u8", "u8", "u16", "u16", "setwarp"],
    0x3F: ["u8", "u8", "u8", "u16", "u16", "setdynamicwarp"],
    0x40: ["u8", "u8", "u8", "u16", "u16", "setdivewarp"],
    0x41: ["u8", "u8", "u8", "u16", "u16", "setholewarp"],

    0x42: ["u16", "u16", "getplayerxy"],

    0x44: ["u16", "u16", "additem"],
    0x45: ["u16", "u16", "removeitem"],
    0x46: ["u16", "u16", "checkitemspace"],
    0x47: ["u16", "u16", "checkitem"],
    0x48: ["u16", "checkitemtype"],
    0x49: ["u16", "u16", "addpcitem"],
    0x4A: ["u16", "u16", "checkpcitem"],
    0x4B: ["u16", "adddecoration"],
    0x4C: ["u16", "removedecoration"],
    0x4D: ["u16", "checkdecor"],
    0x4E: ["u16", "checkdecorspace"],

    0x4F: ["u16", "ptr", "applymovement"],
    0x50: ["u16", "ptr", "u8", "u8", "applymovementat"],
    0x51: ["u16", "waitmovement"],
    0x52: ["u16", "u8", "u8", "waitmovementat"],
    0x53: ["u16", "removeobject"],
    0x54: ["u16", "u8", "u8", "removeobjectat"],
    0x55: ["u16", "addobject"],
    0x56: ["u16", "u8", "u8", "addobjectat"],
    0x57: ["u16", "u16", "u16", "setobjectxy"],
    0x58: ["u16", "u8", "u8", "showobjectat"],
    0x59: ["u16", "u8", "u8", "hideobjectat"],

    0x5B: ["u16", "u8", "turnobject"],

    0x60: ["u16", "checktrainerflag"],
    0x61: ["u16", "settrainerflag"],
    0x62: ["u16", "cleartrainerflag"],
    0x63: ["u16", "u16", "u16", "setobjectxyperm"],
    0x64: ["u16", "copyobjectxytoperm"],
    0x65: ["u16", "u8", "setobjectmovementtype"],

    0x67: ["ptr", "message"],

    0x6E: ["u8", "u8", "yesnobox"],
    0x6F: ["u8", "u8", "u8", "u8", "multichoice"],
    0x70: ["u8", "u8", "u8", "u8", "u8", "multichoicedefault"],
    0x71: ["u8", "u8", "u8", "u8", "u8", "multichoicegrid"],
    0x72: ["u8", "u8", "u8", "u8", "drawbox"],
    0x73: ["u8", "u8", "u8", "u8", "erasebox"],
    0x74: ["u8", "u8", "u8", "u8", "drawboxtext"],

    0x75: ["u16", "u8", "u8", "showmonpic"],
    0x77: ["u8", "showcontestpainting"],
    0x78: ["ptr", "braillemessage"],

    0x79: ["u16", "u8", "u16", "u32", "u32", "u8", "givemon"],
    0x7A: ["u16", "giveegg"],
    0x7B: ["u8", "u8", "u16", "setmonmove"],
    0x7C: ["u16", "checkpartymove"],

    0x7D: ["u8", "u16", "bufferspeciesname"],
    0x7E: ["u8", "bufferleadmonspeciesname"],
    0x7F: ["u8", "u16", "bufferpartymonnick"],
    0x80: ["u8", "u16", "bufferitemname"],
    0x81: ["u8", "u16", "bufferdecorationname"],
    0x82: ["u8", "u16", "buffermovename"],
    0x83: ["u8", "u16", "buffernumberstring"],
    0x84: ["u8", "u16", "bufferstdstring"],
    0x85: ["u8", "ptr", "bufferstring"],

    0x86: ["ptr", "pokemart"],
    0x87: ["ptr", "pokemartdecoration"],
    0x88: ["ptr", "pokemartdecoration2"],
    0x89: ["u16", "playslotmachine"],
    0x8A: ["u8", "u8", "u8", "setberrytree"],
    0x8C: ["u8", "startcontest"],
    0x8F: ["u16", "random"],

    0x90: ["u32", "u8", "addmoney"],
    0x91: ["u32", "u8", "removemoney"],
    0x92: ["u32", "u8", "checkmoney"],
    0x93: ["u8", "u8", "u8", "showmoneybox"],
    0x95: ["u8", "u8", "u8", "updatemoneybox"],
    0x96: ["u16", "getpokenewsactive"],

    0x97: ["u8", "fadescreen"],
    0x98: ["u8", "u8", "fadescreenspeed"],
    0x99: ["u16", "setflashlevel"],
    0x9A: ["u8", "animateflash"],
    0x9B: ["ptr", "messageautoscroll"],

    0x9C: ["u16", "dofieldeffect"],
    0x9D: ["u8", "u16", "setfieldeffectargument"],
    0x9E: ["u16", "waitfieldeffect"],
    0x9F: ["u16", "setrespawn"],

    0xA1: ["u16", "u16", "playmoncry"],
    0xA2: ["u16", "u16", "u16", "u16", "setmetatile"],
    0xA4: ["u16", "setweather"],
    0xA6: ["u8", "setstepcallback"],
    0xA7: ["u16", "setmaplayoutindex"],

    0xA8: ["u16", "u8", "u8", "u8", "setobjectsubpriority"],
    0xA9: ["u16", "u8", "u8", "resetobjectsubpriority"],
    0xAA: ["u8", "u8", "u16", "u16", "u8", "u8", "createvobject"],
    0xAB: ["u8", "u8", "turnvobject"],

    0xAC: ["u16", "u16", "opendoor"],
    0xAD: ["u16", "u16", "closedoor"],
    0xAF: ["u16", "u16", "setdooropen"],
    0xB0: ["u16", "u16", "setdoorclosed"],

    0xB1: ["u8", "u16", "u16", "u16", "addelevmenuitem"],
    0xB3: ["u16", "checkcoins"],
    0xB4: ["u16", "addcoins"],
    0xB5: ["u16", "removecoins"],
    0xB6: ["u16", "u8", "u16", "setwildbattle"],

    0xB8: ["ptr", "setvaddress"],
    0xB9: ["ptr", "vgoto"],
    0xBA: ["ptr", "vcall"],
    0xBD: ["ptr", "vmessage"],
    0xBE: ["ptr", "vbuffermessage"],
    0xBF: ["u8", "ptr", "vbufferstring"],

    0xC0: ["u8", "u8", "showcoinsbox"],
    0xC1: ["u8", "u8", "hidecoinsbox"],
    0xC2: ["u8", "u8", "updatecoinsbox"],
    0xC3: ["u8", "incrementgamestat"],
    0xC4: ["u8", "u8", "u8", "u16", "u16", "setescapewarp"],

    0xCD: ["u16", "setmoneventlegal"],
    0xCE: ["u16", "checkmoneventlegal"],

    0xD1: ["u8", "u8", "u8", "u16", "u16", "warpspinenter"],
    0xD2: ["u16", "u8", "setmonmetlocation"],
    0xD3: ["u16", "moverotatingtileobjects"],
    0xD5: ["u16", "initrotatingtilepuzzle"],
    0xD7: ["u8", "u8", "u8", "u16", "u16", "warpmossdeepgym"],

    0xDB: ["ptr", "messageinstant"],
    0xDC: ["u8", "fadescreenswapbuffers"],
    0xDD: ["u8", "u16", "buffertrainerclassname"],
    0xDE: ["u8", "u16", "buffertrainername"],
    0xDF: ["ptr", "pokenavcall"],
    0xE0: ["u8", "u8", "u8", "u16", "u16", "warpwhitefade"],
    0xE1: ["u8", "u16", "buffercontestname"],
    0xE2: ["u8", "u16", "u16", "bufferitemnameplural"],
  };

  if (opcode === 0x06 || opcode === 0x07 || opcode === 0x0A || opcode === 0x0B) {
    const hasStd = opcode === 0x0A || opcode === 0x0B;
    const spec = hasStd ? ["u8", "u8"] : ["u8", "ptr"];
    const r = readScriptArgs(startOff + 1, spec);
    if (!r) return null;
    const cond = r.args[0];
    const target = r.args[1];
    const name = opcode === 0x06 ? "goto_if" : opcode === 0x07 ? "call_if" : opcode === 0x0A ? "gotostd_if" : "callstd_if";
    const args = {
      condition: cond,
      conditionName: SCRIPT_CONDITION_NAMES[cond] || hex(cond, 2),
      target: hasStd ? target : scriptPtrToDisplay(target),
      targetName: hasStd ? (STD_SCRIPT_NAMES[target] || hex(target, 2)) : undefined,
    };
    const text = hasStd
      ? `${name} ${args.conditionName} ${args.targetName}`
      : `${name} ${args.conditionName} ${args.target.ptrHex}`;
    return scriptLine(opcode, name, startOff, r.next, args, text);
  }

  const spec = fixedSpecs[opcode];
  if (!spec) return null;

  const name = spec[spec.length - 1];
  const argSpec = spec.slice(0, -1);
  const r = readScriptArgs(startOff + 1, argSpec);
  if (!r) return null;

  const args = {};
  const displayArgs = [];
  for (let i = 0; i < argSpec.length; i++) {
    const type = argSpec[i];
    const v = r.args[i];
    if (type === "ptr") {
      const ptrInfo = scriptPtrToDisplay(v);
      args[`arg${i}`] = ptrInfo;
      displayArgs.push(ptrInfo.ptrHex);
    } else if (type === "u32") {
      args[`arg${i}`] = v;
      displayArgs.push(hex(v, 8));
    } else if (type === "u16") {
      args[`arg${i}`] = v;
      displayArgs.push(hex(v, 4));
    } else {
      args[`arg${i}`] = v;
      displayArgs.push(hex(v, 2));
    }
  }

  // 给常用命令补上更友好的字段名。
  if ([0x16, 0x17, 0x18].includes(opcode)) {
    args.varId = r.args[0];
    args.varName = scriptVarName(r.args[0]);
    args.value = r.args[1];
  } else if ([0x19, 0x1A, 0x21, 0x22].includes(opcode)) {
    args.left = r.args[0];
    args.leftName = scriptVarName(r.args[0]);
    args.right = r.args[1];
    args.rightName = scriptVarName(r.args[1]);
  } else if ([0x29, 0x2A, 0x2B].includes(opcode)) {
    args.flag = r.args[0];
    args.flagHex = hex(r.args[0], 4);
  } else if ([0x60, 0x61, 0x62].includes(opcode)) {
    args.trainerId = r.args[0];
    args.trainerIdHex = hex(r.args[0], 4);
  } else if (opcode === 0x67 || opcode === 0x78) {
    args.textPtr = args.arg0;
    args.decodedText = decodeScriptTextPtr(r.args[0], opcode === 0x78 ? 320 : 220);
    if (args.decodedText) displayArgs.push(JSON.stringify(args.decodedText));
  } else if (opcode === 0x85) {
    args.buffer = r.args[0];
    args.textPtr = args.arg1;
    args.decodedText = decodeScriptTextPtr(r.args[1], 220);
  } else if (opcode === 0x4F || opcode === 0x50) {
    args.localId = r.args[0];
    args.movementPtr = args.arg1;
  } else if (opcode === 0x79) {
    args.species = r.args[0];
    args.level = r.args[1];
    args.item = r.args[2];
    args.unknown1 = r.args[3];
    args.unknown2 = r.args[4];
    args.unknown3 = r.args[5];
  } else if (opcode === 0x04 || opcode === 0x05 || opcode === 0x23 || opcode === 0x24 || opcode === 0x86 || opcode === 0x87 || opcode === 0x88) {
    args.target = args.arg0;
  } else if (opcode === 0x08 || opcode === 0x09) {
    args.stdScript = r.args[0];
    args.stdScriptName = STD_SCRIPT_NAMES[r.args[0]] || hex(r.args[0], 2);
    displayArgs[0] = args.stdScriptName;
  }

  return scriptLine(opcode, name, startOff, r.next, args, `${name}${displayArgs.length ? " " + displayArgs.join(" ") : ""}`);
}

function parseScriptBasic(scriptOff, options = {}) {
  const maxCommands = options.maxCommands || 80;
  const maxBytes = options.maxBytes || 420;
  const stopAtTerminator = options.stopAtTerminator !== false;

  if (scriptOff === null || scriptOff === undefined || !isValidOffset(scriptOff, 1)) {
    return {
      ok: false,
      reason: "invalid script offset",
      entryOff: scriptOff,
      entryOffHex: scriptOff !== null && scriptOff !== undefined ? hex(scriptOff) : null,
      commands: [],
      text: "脚本地址无效或不在 ROM 范围内。",
    };
  }

  const commands = [];
  const warnings = [];
  let pc = scriptOff;
  let consumed = 0;

  for (let i = 0; i < maxCommands && consumed < maxBytes; i++) {
    if (!isValidOffset(pc, 1)) {
      warnings.push(`越界停止：${hex(pc)}`);
      break;
    }

    const opcode = readU8(pc);
    const line = formatKnownScriptCommand(opcode, pc);

    if (!line) {
      commands.push(scriptLine(opcode, `unknown_${hex(opcode, 2)}`, pc, pc + 1, {}, `unknown_${hex(opcode, 2)} ; 停止解析`));
      warnings.push(`遇到未知命令 ${hex(opcode, 2)}，已停止，避免把文本/数据误解析成脚本。`);
      pc += 1;
      consumed = pc - scriptOff;
      break;
    }

    commands.push(line);
    pc = line.nextOff;
    consumed = pc - scriptOff;

    if (stopAtTerminator && [0x02, 0x03, 0x0C, 0x0D, 0x24].includes(opcode)) {
      break;
    }
  }

  if (commands.length >= maxCommands) warnings.push(`达到最大命令数 ${maxCommands}，已截断。`);
  if (consumed >= maxBytes) warnings.push(`达到最大解析字节数 ${maxBytes}，已截断。`);

  return {
    ok: true,
    entryOff: scriptOff,
    entryOffHex: hex(scriptOff),
    entryPtrHex: hex(GBA_BASE + scriptOff),
    commandCount: commands.length,
    consumedBytes: consumed,
    warnings,
    commands,
    text: commands.map(c => `${c.offHex}: ${c.text}`).join("\n"),
  };
}

function getEventScriptAnalysis(ev) {
  if (!ev) return null;
  if ((ev.type === "object" || ev.type === "bg" || ev.type === "coord") && ev.scriptOff !== null && ev.scriptOff !== undefined) {
    return parseScriptBasic(ev.scriptOff, { maxCommands: 80, maxBytes: 480 });
  }
  return null;
}
