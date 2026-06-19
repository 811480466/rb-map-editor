import { formatHex, offsetToPointer, pointerToOffset } from "@/util"
import { TRAINER_BATTLE_POINTER_FIELDS } from "./TrainerBattleCommand"

const TRAINER_BATTLE_TYPE_LABELS = {
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
}

const SCRIPT_CONDITION_NAMES = {
  0x00: "false",
  0x01: "true",
  0x02: "eq",
  0x03: "ne",
  0x04: "lt",
  0x05: "gt",
  0x06: "le",
  0x07: "ge",
}

const STD_SCRIPT_NAMES = {
  0x00: "Std_BrailleMessage",
  0x01: "Std_FindItem",
  0x02: "Std_MsgboxDefault",
  0x03: "Std_MsgboxSign",
  0x04: "Std_MsgboxNpc",
  0x05: "Std_MsgboxYesNo",
  0x06: "Std_MsgboxAutoclose",
}

const SIMPLE_COMMANDS = {
  0x00: "nop",
  0x01: "nop1",
  0x02: "end",
  0x03: "return",
  0x0c: "returnram",
  0x0d: "endram",
  0x27: "waitstate",
  0x2d: "dotimebasedevents",
  0x2e: "gettime",
  0x30: "waitse",
  0x32: "waitfanfare",
  0x35: "fadedefaultbgm",
  0x43: "getpartysize",
  0x5a: "faceplayer",
  0x5d: "dotrainerbattle",
  0x5e: "gotopostbattlescript",
  0x5f: "gotobeatenscript",
  0x66: "waitmessage",
  0x68: "closemessage",
  0x69: "lockall",
  0x6a: "lock",
  0x6b: "releaseall",
  0x6c: "release",
  0x6d: "waitbuttonpress",
  0x76: "hidemonpic",
  0x8b: "choosecontestmon",
  0x8d: "showcontestresults",
  0x8e: "contestlinktransfer",
  0x94: "hidemoneybox",
  0xa0: "checkplayergender",
  0xa3: "resetweather",
  0xa5: "doweather",
  0xae: "waitdooranim",
  0xb2: "showelevmenu",
  0xb7: "dowildbattle",
  0xc5: "waitmoncry",
  0xcf: "trywondercardscript",
  0xd4: "turnrotatingtileobjects",
  0xd6: "freerotatingtilepuzzle",
  0xd8: "selectapproachingtrainer",
  0xd9: "lockfortrainer",
  0xda: "closebraillemessage",
}

const FIXED_COMMAND_SPECS = {
  0x04: ["ptr", "call"],
  0x05: ["ptr", "goto"],
  0x08: ["u8", "gotostd"],
  0x09: ["u8", "callstd"],
  0x0e: ["u8", "setmysteryeventstatus"],
  0x0f: ["u8", "u32", "loadword"],
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
  0x1a: ["u16", "u16", "setorcopyvar"],
  0x21: ["u16", "u16", "compare_var_to_value"],
  0x22: ["u16", "u16", "compare_var_to_var"],
  0x23: ["ptr", "callnative"],
  0x24: ["ptr", "gotonative"],
  0x25: ["u16", "special"],
  0x26: ["u16", "u16", "specialvar"],
  0x28: ["u16", "delay"],
  0x29: ["u16", "setflag"],
  0x2a: ["u16", "clearflag"],
  0x2b: ["u16", "checkflag"],
  0x2f: ["u16", "playse"],
  0x31: ["u16", "playfanfare"],
  0x33: ["u16", "u8", "playbgm"],
  0x39: ["u8", "u8", "u8", "u16", "u16", "warp"],
  0x3a: ["u8", "u8", "u8", "u16", "u16", "warpsilent"],
  0x3b: ["u8", "u8", "u8", "u16", "u16", "warpdoor"],
  0x3c: ["u8", "u8", "warphole"],
  0x3d: ["u8", "u8", "u8", "u16", "u16", "warpteleport"],
  0x3e: ["u8", "u8", "u8", "u16", "u16", "setwarp"],
  0x3f: ["u8", "u8", "u8", "u16", "u16", "setdynamicwarp"],
  0x40: ["u8", "u8", "u8", "u16", "u16", "setdivewarp"],
  0x41: ["u8", "u8", "u8", "u16", "u16", "setholewarp"],
  0x42: ["u16", "u16", "getplayerxy"],
  0x44: ["u16", "u16", "additem"],
  0x45: ["u16", "u16", "removeitem"],
  0x46: ["u16", "u16", "checkitemspace"],
  0x47: ["u16", "u16", "checkitem"],
  0x48: ["u16", "checkitemtype"],
  0x4f: ["u16", "ptr", "applymovement"],
  0x50: ["u16", "ptr", "u8", "u8", "applymovementat"],
  0x51: ["u16", "waitmovement"],
  0x53: ["u16", "removeobject"],
  0x55: ["u16", "addobject"],
  0x57: ["u16", "u16", "u16", "setobjectxy"],
  0x5b: ["u16", "u8", "turnobject"],
  0x60: ["u16", "checktrainerflag"],
  0x61: ["u16", "settrainerflag"],
  0x62: ["u16", "cleartrainerflag"],
  0x63: ["u16", "u16", "u16", "setobjectxyperm"],
  0x64: ["u16", "copyobjectxytoperm"],
  0x65: ["u16", "u8", "setobjectmovementtype"],
  0x67: ["ptr", "message"],
  0x6e: ["u8", "u8", "yesnobox"],
  0x6f: ["u8", "u8", "u8", "u8", "multichoice"],
  0x70: ["u8", "u8", "u8", "u8", "u8", "multichoicedefault"],
  0x78: ["ptr", "braillemessage"],
  0x79: ["u16", "u8", "u16", "u32", "u32", "u8", "givemon"],
  0x7a: ["u16", "giveegg"],
  0x7b: ["u8", "u8", "u16", "setmonmove"],
  0x7c: ["u16", "checkpartymove"],
  0x7d: ["u8", "u16", "bufferspeciesname"],
  0x80: ["u8", "u16", "bufferitemname"],
  0x82: ["u8", "u16", "buffermovename"],
  0x84: ["u8", "u16", "bufferstdstring"],
  0x85: ["u8", "ptr", "bufferstring"],
  0x86: ["ptr", "pokemart"],
  0x8f: ["u16", "random"],
  0x90: ["u32", "u8", "addmoney"],
  0x91: ["u32", "u8", "removemoney"],
  0x92: ["u32", "u8", "checkmoney"],
  0x97: ["u8", "fadescreen"],
  0x99: ["u16", "setflashlevel"],
  0x9b: ["ptr", "messageautoscroll"],
  0x9c: ["u16", "dofieldeffect"],
  0x9d: ["u8", "u16", "setfieldeffectargument"],
  0x9e: ["u16", "waitfieldeffect"],
  0x9f: ["u16", "setrespawn"],
  0xa1: ["u16", "u16", "playmoncry"],
  0xa2: ["u16", "u16", "u16", "u16", "setmetatile"],
  0xa4: ["u16", "setweather"],
  0xa6: ["u8", "setstepcallback"],
  0xa7: ["u16", "setmaplayoutindex"],
  0xac: ["u16", "u16", "opendoor"],
  0xad: ["u16", "u16", "closedoor"],
  0xaf: ["u16", "u16", "setdooropen"],
  0xb0: ["u16", "u16", "setdoorclosed"],
  0xb3: ["u16", "checkcoins"],
  0xb4: ["u16", "addcoins"],
  0xb5: ["u16", "removecoins"],
  0xb6: ["u16", "u8", "u16", "setwildbattle"],
  0xb8: ["ptr", "setvaddress"],
  0xb9: ["ptr", "vgoto"],
  0xba: ["ptr", "vcall"],
  0xbd: ["ptr", "vmessage"],
  0xbe: ["ptr", "vbuffermessage"],
  0xbf: ["u8", "ptr", "vbufferstring"],
  0xc3: ["u8", "incrementgamestat"],
  0xcd: ["u16", "setmoneventlegal"],
  0xce: ["u16", "checkmoneventlegal"],
  0xd1: ["u8", "u8", "u8", "u16", "u16", "warpspinenter"],
  0xd2: ["u16", "u8", "setmonmetlocation"],
  0xd3: ["u16", "moverotatingtileobjects"],
  0xd5: ["u16", "initrotatingtilepuzzle"],
  0xdb: ["ptr", "messageinstant"],
  0xdc: ["u8", "fadescreenswapbuffers"],
  0xdd: ["u8", "u16", "buffertrainerclassname"],
  0xde: ["u8", "u16", "buffertrainername"],
  0xdf: ["ptr", "pokenavcall"],
  0xe1: ["u8", "u16", "buffercontestname"],
  0xe2: ["u8", "u16", "u16", "bufferitemnameplural"],
}

function scriptVarName(value) {
  const names = {
    0x800d: "VAR_RESULT",
    0x800f: "VAR_LAST_TALKED",
  }
  if (value >= 0x8000 && value <= 0x8007) return `VAR_${formatHex(value, 4)}`
  return names[value] || formatHex(value, 4)
}

export default class ScriptAnalyzer {
  /** @type {import("../project/RomProject").default | null} */
  project = null

  /** @type {import("../rom/Rom").default | null} */
  rom = null

  constructor(project) {
    this.project = project
    this.rom = project?.rom || null
  }

  isValidOffset(offset, size = 1) {
    return Number.isInteger(offset) && offset >= 0 && Boolean(this.rom) && offset + size <= this.rom.size
  }

  parseScript(offset, options = {}) {
    const maxCommands = options.maxCommands || 120
    const maxBytes = options.maxBytes || 720
    const stopAtTerminator = options.stopAtTerminator !== false

    if (!this.isValidOffset(offset, 1)) {
      return {
        ok: false,
        reason: "invalid script offset",
        entryOff: offset,
        entryOffHex: Number.isInteger(offset) ? formatHex(offset) : "null",
        commands: [],
        warnings: ["脚本地址无效或不在 ROM 范围内。"],
        text: "脚本地址无效或不在 ROM 范围内。",
      }
    }

    const commands = []
    const warnings = []
    let pc = offset
    let consumed = 0

    for (let index = 0; index < maxCommands && consumed < maxBytes; index += 1) {
      if (!this.isValidOffset(pc, 1)) {
        warnings.push(`越界停止：${formatHex(pc)}`)
        break
      }

      const opcode = this.rom.readByte(pc)
      const line = this.formatKnownCommand(opcode, pc)
      if (!line) {
        commands.push(this.createLine(opcode, `unknown_${formatHex(opcode, 2)}`, pc, pc + 1, {}, `unknown_${formatHex(opcode, 2)} ; 停止解析`))
        warnings.push(`遇到未知命令 ${formatHex(opcode, 2)}，已停止解析。`)
        pc += 1
        consumed = pc - offset
        break
      }

      commands.push({ ...line, index })
      pc = line.nextOff
      consumed = pc - offset

      if (stopAtTerminator && [0x02, 0x03, 0x0c, 0x0d, 0x24].includes(opcode)) break
    }

    this.annotateLoadwordMessageTexts(commands)
    if (commands.length >= maxCommands) warnings.push(`达到最大命令数 ${maxCommands}，已截断。`)
    if (consumed >= maxBytes) warnings.push(`达到最大解析字节数 ${maxBytes}，已截断。`)

    return {
      ok: true,
      entryOff: offset,
      entryOffHex: formatHex(offset),
      entryPtr: offsetToPointer(offset),
      entryPtrHex: formatHex(offsetToPointer(offset)),
      commandCount: commands.length,
      consumedBytes: consumed,
      warnings,
      commands,
      text: commands.map(command => `${command.offHex}: ${command.text}`).join("\n"),
    }
  }

  formatKnownCommand(opcode, offset) {
    if (SIMPLE_COMMANDS[opcode]) {
      const name = SIMPLE_COMMANDS[opcode]
      return this.createLine(opcode, name, offset, offset + 1, {}, name)
    }

    if (opcode === 0x5c) return this.parseTrainerBattleCommand(offset)
    if ([0x06, 0x07, 0x0a, 0x0b].includes(opcode)) return this.parseConditionalCommand(opcode, offset)

    const spec = FIXED_COMMAND_SPECS[opcode]
    if (!spec) return null

    const name = spec[spec.length - 1]
    const argSpec = spec.slice(0, -1)
    const result = this.readArgs(offset + 1, argSpec)
    if (!result) return null

    const args = {}
    const displayArgs = []
    argSpec.forEach((type, index) => {
      const value = result.args[index]
      if (type === "ptr") {
        const ptr = this.pointerInfo(value)
        args[`arg${index}`] = ptr
        displayArgs.push(ptr.ptrHex)
      } else if (type === "u32") {
        args[`arg${index}`] = value
        displayArgs.push(formatHex(value, 8))
      } else if (type === "u16") {
        args[`arg${index}`] = value
        displayArgs.push(formatHex(value, 4))
      } else {
        args[`arg${index}`] = value
        displayArgs.push(formatHex(value, 2))
      }
    })

    this.decorateCommandArgs(opcode, args, result.args, displayArgs)
    return this.createLine(opcode, name, offset, result.next, args, `${name}${displayArgs.length ? ` ${displayArgs.join(" ")}` : ""}`)
  }

  parseConditionalCommand(opcode, offset) {
    const hasStd = opcode === 0x0a || opcode === 0x0b
    const result = this.readArgs(offset + 1, hasStd ? ["u8", "u8"] : ["u8", "ptr"])
    if (!result) return null

    const condition = result.args[0]
    const target = result.args[1]
    const name = opcode === 0x06 ? "goto_if" : opcode === 0x07 ? "call_if" : opcode === 0x0a ? "gotostd_if" : "callstd_if"
    const args = {
      condition,
      conditionName: SCRIPT_CONDITION_NAMES[condition] || formatHex(condition, 2),
      target: hasStd ? target : this.pointerInfo(target),
      targetName: hasStd ? (STD_SCRIPT_NAMES[target] || formatHex(target, 2)) : undefined,
    }
    const text = hasStd
      ? `${name} ${args.conditionName} ${args.targetName}`
      : `${name} ${args.conditionName} ${args.target.ptrHex}`
    return this.createLine(opcode, name, offset, result.next, args, text)
  }

  parseTrainerBattleCommand(offset) {
    if (!this.isValidOffset(offset, 6) || this.rom.readByte(offset) !== 0x5c) return null
    const battleType = this.rom.readByte(offset + 1)
    const pointerFields = TRAINER_BATTLE_POINTER_FIELDS[battleType] || []
    const size = 6 + pointerFields.length * 4
    if (!this.isValidOffset(offset, size)) return null

    const pointers = pointerFields.map((field, index) => {
      const ptr = this.rom.readPointer(offset + 6 + index * 4)
      return {
        index,
        field,
        kind: field === "continueScript" ? "script" : "text",
        ptrOffset: offset + 6 + index * 4,
        ...this.pointerInfo(ptr),
      }
    })
    const args = {
      battleType,
      battleTypeName: TRAINER_BATTLE_TYPE_LABELS[battleType] || `TRAINER_BATTLE_${battleType}`,
      trainerId: this.rom.readWord(offset + 2),
      localId: this.rom.readWord(offset + 4),
      pointers,
    }

    pointers.forEach((item) => {
      if (item.kind === "text") args[`${item.field}Decoded`] = this.decodeTextAt(item.off, 220)
      else args.continueScript = item
    })

    return this.createLine(
      0x5c,
      "trainerbattle",
      offset,
      offset + size,
      args,
      `trainerbattle type=${battleType} ${args.battleTypeName} trainerId=${args.trainerId} localId=${args.localId}`,
    )
  }

  decorateCommandArgs(opcode, args, rawArgs, displayArgs) {
    if ([0x16, 0x17, 0x18].includes(opcode)) {
      args.varId = rawArgs[0]
      args.varName = scriptVarName(rawArgs[0])
      args.value = rawArgs[1]
    } else if ([0x19, 0x1a, 0x21, 0x22].includes(opcode)) {
      args.left = rawArgs[0]
      args.leftName = scriptVarName(rawArgs[0])
      args.right = rawArgs[1]
      args.rightName = scriptVarName(rawArgs[1])
    } else if ([0x29, 0x2a, 0x2b].includes(opcode)) {
      args.flag = rawArgs[0]
      args.flagHex = formatHex(rawArgs[0], 4)
    } else if ([0x60, 0x61, 0x62].includes(opcode)) {
      args.trainerId = rawArgs[0]
      args.trainerIdHex = formatHex(rawArgs[0], 4)
    } else if (opcode === 0x67 || opcode === 0x78 || opcode === 0x9b || opcode === 0xdb) {
      args.textPtr = args.arg0
      args.decodedText = this.decodeTextAt(args.arg0.off, opcode === 0x78 ? 320 : 220)
      if (args.decodedText) displayArgs.push(JSON.stringify(args.decodedText))
    } else if (opcode === 0x85 || opcode === 0xbf) {
      args.buffer = rawArgs[0]
      args.textPtr = args.arg1
      args.decodedText = this.decodeTextAt(args.arg1.off, 220)
    } else if (opcode === 0x0f) {
      args.wordIndex = rawArgs[0]
      args.value = rawArgs[1]
      args.valueHex = formatHex(rawArgs[1], 8)
    } else if ([0x04, 0x05, 0x23, 0x24, 0x86, 0x87, 0x88, 0xb8, 0xb9, 0xba].includes(opcode)) {
      args.target = args.arg0
    } else if (opcode === 0x08 || opcode === 0x09) {
      args.stdScript = rawArgs[0]
      args.stdScriptName = STD_SCRIPT_NAMES[rawArgs[0]] || formatHex(rawArgs[0], 2)
      displayArgs[0] = args.stdScriptName
    }
  }

  annotateLoadwordMessageTexts(commands) {
    const messageStdIds = new Set([0x02, 0x03, 0x04, 0x05, 0x06])
    for (let index = 0; index < commands.length - 1; index += 1) {
      const loadword = commands[index]
      const callstd = commands[index + 1]
      if (loadword?.name !== "loadword" || loadword.args?.wordIndex !== 0x00) continue
      if (callstd?.name !== "callstd" || !messageStdIds.has(callstd.args?.stdScript)) continue

      const ptr = loadword.args.value
      const ptrInfo = this.pointerInfo(ptr)
      const decodedText = this.decodeTextAt(ptrInfo.off, 320)
      if (!decodedText) continue

      loadword.args.textPtr = ptrInfo
      loadword.args.decodedText = decodedText
      loadword.args.messageStdScript = callstd.args.stdScript
      loadword.args.messageStdScriptName = callstd.args.stdScriptName
    }
  }

  collectTextEntries(analysis) {
    const entries = []
    const pushText = (label, ptrInfo, text = null) => {
      const decoded = text || this.decodeTextAt(ptrInfo?.off, 320)
      if (!decoded) return
      entries.push({
        label,
        ptr: ptrInfo?.ptr ?? null,
        ptrHex: ptrInfo?.ptrHex || "null",
        off: ptrInfo?.off ?? null,
        offHex: ptrInfo?.offHex || "null",
        text: decoded,
      })
    }

    for (const command of analysis?.commands || []) {
      if (command.args?.textPtr) pushText(command.text, command.args.textPtr, command.args.decodedText)
      for (const pointer of command.args?.pointers || []) {
        if (pointer.kind === "text") pushText(`trainer ${pointer.field}`, pointer, command.args?.[`${pointer.field}Decoded`])
      }
    }
    return entries
  }

  formatHexDump(offset, length = 0x100) {
    if (!this.isValidOffset(offset, 1)) return "地址无效，无法读取原始字节。"
    const safeLength = Math.max(1, Math.min(length, this.rom.size - offset))
    const lines = []
    for (let base = 0; base < safeLength; base += 16) {
      const chunk = []
      const ascii = []
      for (let index = 0; index < 16 && base + index < safeLength; index += 1) {
        const byte = this.rom.readByte(offset + base + index)
        chunk.push(byte.toString(16).toUpperCase().padStart(2, "0"))
        ascii.push(byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : ".")
      }
      lines.push(`${formatHex(offset + base)}: ${chunk.join(" ").padEnd(47, " ")}  ${ascii.join("")}`)
    }
    return lines.join("\n")
  }

  readArgs(offset, spec) {
    const args = []
    let cursor = offset
    for (const type of spec) {
      if (type === "u8") {
        if (!this.isValidOffset(cursor, 1)) return null
        args.push(this.rom.readByte(cursor))
        cursor += 1
      } else if (type === "u16") {
        if (!this.isValidOffset(cursor, 2)) return null
        args.push(this.rom.readWord(cursor))
        cursor += 2
      } else {
        if (!this.isValidOffset(cursor, 4)) return null
        args.push(this.rom.readDword(cursor))
        cursor += 4
      }
    }
    return { args, next: cursor }
  }

  pointerInfo(pointer) {
    const off = pointerToOffset(pointer)
    return {
      ptr: pointer >>> 0,
      ptrHex: formatHex(pointer >>> 0),
      off,
      offHex: off !== null ? formatHex(off) : "null",
    }
  }

  createLine(opcode, name, offset, nextOff, args = {}, text = "") {
    return {
      off: offset,
      offHex: formatHex(offset),
      opcode,
      opcodeHex: formatHex(opcode, 2),
      name,
      size: nextOff - offset,
      nextOff,
      nextOffHex: formatHex(nextOff),
      args,
      text,
    }
  }

  decodeTextAt(offset, maxLength = 320) {
    if (!this.isValidOffset(offset, 1)) return null
    const bytes = []
    for (let index = 0; index < maxLength && this.isValidOffset(offset + index, 1); index += 1) {
      const byte = this.rom.readByte(offset + index)
      bytes.push(byte)
      if (byte === 0xff) break
    }
    return this.project?.textCodec?.decode(bytes) || null
  }
}
