export const OBJECT_EVENT_TRAINER_TEMPLATES = {
  simpleSingle: {
    id: "simpleSingle",
    name: "简易单打训练家",
    description: "trainerbattle type=3，不显示开战对话，战斗后显示一段自动关闭对话。",
    textFields: ["defeatText", "postBattleText"],
    build(values = {}, pointers = {}) {
      return buildSimpleSingleTrainerScript(values, pointers.defeatPtr, pointers.postBattlePtr)
    },
  },
  itemRewardSingle: {
    id: "itemRewardSingle",
    name: "战斗后给道具NPC",
    description: "trainerbattle type=1，单打胜利后用 Std_BrailleMessage 给一次道具。",
    textFields: ["introText", "defeatText", "receivedText"],
    build(values = {}, pointers = {}, context = {}) {
      return buildItemRewardTrainerScript(values, pointers, context)
    },
  },
  pokemonRewardSingle: {
    id: "pokemonRewardSingle",
    name: "战斗后给宝可梦NPC",
    description: "trainerbattle type=1，单打胜利后给一次宝可梦。",
    textFields: ["introText", "defeatText", "receivedText"],
    build(values = {}, pointers = {}, context = {}) {
      return buildPokemonRewardTrainerScript(values, pointers, context)
    },
  },
}

export const OBJECT_EVENT_TRAINER_TEMPLATE_OPTIONS = Object.values(OBJECT_EVENT_TRAINER_TEMPLATES).map(template => ({
  value: template.id,
  label: template.name,
}))

export function getObjectEventTrainerTemplate(templateId = "simpleSingle") {
  return OBJECT_EVENT_TRAINER_TEMPLATES[templateId] || OBJECT_EVENT_TRAINER_TEMPLATES.simpleSingle
}

export function buildSimpleSingleTrainerScript(values = {}, defeatPtr = 0, postBattlePtr = 0) {
  const bytes = new Array(19).fill(0)
  const trainerId = Number(values.trainerId) & 0xffff
  const localId = Number(values.localId) & 0xffff
  const postPtr = postBattlePtr >>> 0

  bytes[0] = 0x5c
  bytes[1] = 0x03
  bytes[2] = trainerId & 0xff
  bytes[3] = (trainerId >> 8) & 0xff
  bytes[4] = localId & 0xff
  bytes[5] = (localId >> 8) & 0xff

  writePointerBytes(bytes, 6, defeatPtr)

  bytes[10] = 0x0f
  bytes[11] = 0x00
  writePointerBytes(bytes, 12, postPtr)
  bytes[16] = 0x09
  bytes[17] = 0x06
  bytes[18] = 0x02
  return bytes
}

export function buildItemRewardTrainerScript(values = {}, pointers = {}, context = {}) {
  const trainerId = Number(values.trainerId) & 0xffff
  const localId = Number(values.localId) & 0xffff
  const rewardFlag = normalizeRewardFlag(values.scriptFlag ?? values.rewardFlag)
  const item = normalizeWordInput(values.itemId, "道具ID", 0)
  const quantity = normalizeWordInput(values.quantity ?? 1, "道具数量", 1)
  const scriptOffset = Number(context.scriptOffset) || 0
  const continueOffset = scriptOffset + 18
  const receivedOffset = scriptOffset + 43

  return [
    0x5c, 0x01, ...word(trainerId), ...word(localId),
    ...dword(pointers.introTextPtr),
    ...dword(pointers.defeatTextPtr),
    ...dword(offsetToPointerValue(continueOffset)),
    0x2b, ...word(rewardFlag),
    0x06, 0x01, ...dword(offsetToPointerValue(receivedOffset)),
    0x1a, ...word(0x8000), ...word(item),
    0x1a, ...word(0x8001), ...word(quantity),
    0x09, 0x00,
    0x29, ...word(rewardFlag),
    0x02,
    0x0f, 0x00, ...dword(pointers.receivedTextPtr),
    0x09, 0x06,
    0x02,
  ]
}

export function buildPokemonRewardTrainerScript(values = {}, pointers = {}, context = {}) {
  const trainerId = Number(values.trainerId) & 0xffff
  const localId = Number(values.localId) & 0xffff
  const rewardFlag = normalizeRewardFlag(values.scriptFlag ?? values.rewardFlag)
  const speciesId = normalizeWordInput(values.speciesId, "宝可梦ID", 1)
  const level = normalizeByteInput(values.pokemonLevel ?? 5, "等级", 1, 100)
  const heldItem = normalizeWordInput(values.heldItemId ?? 0, "携带道具", 0)
  const scriptOffset = Number(context.scriptOffset) || 0
  const continueOffset = scriptOffset + 18
  const receivedOffset = scriptOffset + 46

  return [
    0x5c, 0x01, ...word(trainerId), ...word(localId),
    ...dword(pointers.introTextPtr),
    ...dword(pointers.defeatTextPtr),
    ...dword(offsetToPointerValue(continueOffset)),
    0x2b, ...word(rewardFlag),
    0x06, 0x01, ...dword(offsetToPointerValue(receivedOffset)),
    0x79, ...word(speciesId), level, ...word(heldItem), ...dword(0), ...dword(0), 0x00,
    0x29, ...word(rewardFlag),
    0x02,
    0x0f, 0x00, ...dword(pointers.receivedTextPtr),
    0x09, 0x06,
    0x02,
  ]
}

function writePointerBytes(bytes, offset, pointer) {
  const value = Number(pointer) >>> 0
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >> 8) & 0xff
  bytes[offset + 2] = (value >> 16) & 0xff
  bytes[offset + 3] = (value >> 24) & 0xff
}

function normalizeRewardFlag(value) {
  const flag = Number(value)
  if (!Number.isInteger(flag) || flag <= 0 || flag > 0xffff) {
    throw new Error("奖励Flag 必须是 1 ~ 65535 的整数")
  }
  return flag
}

function normalizeWordInput(value, label, min = 0) {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > 0xffff) {
    throw new Error(`${label} 必须是 ${min} ~ 65535 的整数`)
  }
  return numberValue
}

function normalizeByteInput(value, label, min = 0, max = 0xff) {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw new Error(`${label} 必须是 ${min} ~ ${max} 的整数`)
  }
  return numberValue
}

function offsetToPointerValue(offset) {
  return Number.isInteger(offset) && offset > 0 ? (offset + 0x08000000) >>> 0 : 0
}

function word(value) {
  const numberValue = Number(value) & 0xffff
  return [numberValue & 0xff, (numberValue >> 8) & 0xff]
}

function dword(value) {
  const numberValue = Number(value) >>> 0
  return [
    numberValue & 0xff,
    (numberValue >> 8) & 0xff,
    (numberValue >> 16) & 0xff,
    (numberValue >> 24) & 0xff,
  ]
}
