export const DEFAULT_MOVE_TUTOR_SCRIPT_POINTER = 0x082ff28d

export const OBJECT_EVENT_SCRIPT_TEMPLATES = {
  itemPickup: {
    id: "itemPickup",
    name: "道具拾取",
    description: "在地图上拾取某个道具",
    objectDefaults: {
      graphicsId: 0x3b,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}) {
      return buildItemPickupScript(values.itemId, values.quantity ?? 1)
    },
  },
  evolutionStonePickup: {
    id: "evolutionStonePickup",
    name: "进化石拾取",
    description: "在地图上拾取某个进化石",
    objectDefaults: {
      graphicsId: 0x4d,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}) {
      return buildItemPickupScript(values.itemId, values.quantity ?? 1)
    },
  },
  pokemonGiftNpc: {
    id: "pokemonGiftNpc",
    name: "获取宝可梦的NPC",
    description: "与 NPC 对话后获得指定宝可梦，并用脚本Flag防止重复领取。",
    textFields: ["giftText", "receivedText"],
    objectDefaults: {
      graphicsId: 0x0b,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}, pointers = {}, context = {}) {
      return buildPokemonGiftNpcScript(values, pointers.giftTextPtr, pointers.receivedTextPtr, context.scriptOffset)
    },
  },
  randomPokemonGiftNpc: {
    id: "randomPokemonGiftNpc",
    name: "获取随机宝可梦的NPC",
    description: "与 NPC 对话后从随机池里获得一只宝可梦，并用脚本Flag防止重复领取。",
    textFields: ["giftText", "receivedText"],
    objectDefaults: {
      graphicsId: 0x0b,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}, pointers = {}, context = {}) {
      return buildRandomPokemonGiftNpcScript(values, pointers.giftTextPtr, pointers.receivedTextPtr, context.scriptOffset)
    },
  },
  singleMoveTutorNpc: {
    id: "singleMoveTutorNpc",
    name: "单技能教学师",
    description: "与 NPC 对话后调用技能教学脚本，先用于验证单个技能教学效果。",
    textFields: ["tutorText"],
    objectDefaults: {
      graphicsId: 0x0b,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}, pointers = {}) {
      return buildSingleMoveTutorNpcScript(values, pointers.tutorTextPtr)
    },
  },
  multiMoveTutorNpc: {
    id: "multiMoveTutorNpc",
    name: "多技能教学师",
    description: "与 NPC 对话后打开多选菜单，并按选择项调用技能教学脚本。",
    textFields: ["tutorText", "tutorPromptText"],
    objectDefaults: {
      graphicsId: 0x0b,
      movementType: 0x01,
      movementRangeX: 0,
      movementRangeY: 0,
      trainerType: 0,
      trainerRangeOrBerryTreeId: 0,
    },
    build(values = {}, pointers = {}, context = {}) {
      return buildMultiMoveTutorNpcScript(values, pointers.tutorTextPtr, pointers.tutorPromptTextPtr, context.scriptOffset)
    },
  },
}

export const OBJECT_EVENT_SCRIPT_TEMPLATE_OPTIONS = Object.values(OBJECT_EVENT_SCRIPT_TEMPLATES).map(template => ({
  value: template.id,
  label: template.name,
}))

export function getObjectEventScriptTemplate(templateId = "itemPickup") {
  return OBJECT_EVENT_SCRIPT_TEMPLATES[templateId] || OBJECT_EVENT_SCRIPT_TEMPLATES.itemPickup
}

export function buildItemPickupScript(itemId, quantity = 1) {
  const item = Number(itemId) & 0xffff
  const qty = Number(quantity) & 0xffff

  return [
    0x1a, 0x00, 0x80, item & 0xff, (item >> 8) & 0xff,
    0x1a, 0x01, 0x80, qty & 0xff, (qty >> 8) & 0xff,
    0x09, 0x01,
    0x02,
  ]
}

export function buildPokemonGiftNpcScript(values = {}, giftTextPtr = 0, receivedTextPtr = 0, scriptOffset = 0) {
  const speciesId = Number(values.speciesId) & 0xffff
  const level = Number(values.pokemonLevel) & 0xff
  const heldItem = Number(values.heldItemId ?? 0) & 0xffff
  const scriptFlag = normalizeScriptFlag(values.scriptFlag)
  const receivedOffset = Number(scriptOffset) + 39

  return [
    0x6a,
    0x5a,
    0x2b, ...word(scriptFlag),
    0x06, 0x01, ...dword(offsetToPointerValue(receivedOffset)),
    0x0f, 0x00, ...dword(giftTextPtr),
    0x09, 0x04,
    0x79, ...word(speciesId), level, ...word(heldItem), ...dword(0), ...dword(0), 0x00,
    0x29, ...word(scriptFlag),
    0x6c,
    0x02,
    0x0f, 0x00, ...dword(receivedTextPtr),
    0x09, 0x04,
    0x6c,
    0x02,
  ]
}

export function buildRandomPokemonGiftNpcScript(values = {}, giftTextPtr = 0, receivedTextPtr = 0, scriptOffset = 0) {
  const pool = parseSpeciesPool(values.randomSpeciesPool || values.speciesPool || values.speciesId)
  const level = Number(values.pokemonLevel) & 0xff
  const heldItem = Number(values.heldItemId ?? 0) & 0xffff
  const scriptFlag = normalizeScriptFlag(values.scriptFlag)
  const prefixLength = 22 + pool.length * 11
  const caseLength = 20
  const receivedOffset = Number(scriptOffset) + prefixLength + pool.length * caseLength
  const bytes = [
    0x6a,
    0x5a,
    0x2b, ...word(scriptFlag),
    0x06, 0x01, ...dword(offsetToPointerValue(receivedOffset)),
    0x0f, 0x00, ...dword(giftTextPtr),
    0x09, 0x04,
    0x8f, ...word(pool.length),
  ]

  for (let index = 0; index < pool.length; index += 1) {
    const target = offsetToPointerValue(scriptOffset + prefixLength + index * caseLength)
    bytes.push(
      0x21, ...word(0x800d), ...word(index),
      0x06, 0x02, ...dword(target),
    )
  }

  pool.forEach(speciesId => {
    bytes.push(
      0x79, ...word(speciesId), level, ...word(heldItem), ...dword(0), ...dword(0), 0x00,
      0x29, ...word(scriptFlag),
      0x6c,
      0x02,
    )
  })

  bytes.push(
    0x0f, 0x00, ...dword(receivedTextPtr),
    0x09, 0x04,
    0x6c,
    0x02,
  )

  return bytes
}

export function buildSingleMoveTutorNpcScript(values = {}, tutorTextPtr = 0) {
  const moveId = normalizeWordInput(values.moveId, "技能ID", 1)
  const tutorScriptPointer = normalizePointerInput(
    values.tutorScriptPointer ?? DEFAULT_MOVE_TUTOR_SCRIPT_POINTER,
    "教学脚本指针",
  )

  return [
    0x6a,
    0x5a,
    0x0f, 0x00, ...dword(tutorTextPtr),
    0x09, 0x04,
    0x16, ...word(0x8005), ...word(moveId),
    0x04, ...dword(tutorScriptPointer),
    0x6c,
    0x02,
  ]
}

export function buildMultiMoveTutorNpcScript(values = {}, tutorTextPtr = 0, tutorPromptTextPtr = 0, scriptOffset = 0) {
  const moveIds = parseMoveIds(values.moveIds || values.moveId)
  const tutorScriptPointer = normalizePointerInput(
    values.tutorScriptPointer ?? DEFAULT_MOVE_TUTOR_SCRIPT_POINTER,
    "教学脚本指针",
  )
  const menuId = normalizeByteInput(values.menuId ?? 0x78, "菜单ID", 0)
  const menuX = normalizeByteInput(values.menuX ?? 0x12, "菜单X", 0)
  const menuY = normalizeByteInput(values.menuY ?? 0x00, "菜单Y", 0)
  const menuDefault = normalizeByteInput(values.menuDefault ?? 0x00, "默认选项", 0)
  const exitChoice = normalizeWordInput(values.exitChoice ?? moveIds.length, "退出选项", 0)
  const dispatchLength = 36 + moveIds.length * 11
  const branchLength = 34
  const baseOffset = Number(scriptOffset) || 0
  const menuOffset = baseOffset + 10
  const exitOffset = baseOffset + dispatchLength + moveIds.length * branchLength
  const bytes = [
    0x6a,
    0x5a,
    0x0f, 0x00, ...dword(tutorTextPtr),
    0x09, 0x06,
    0x6f, menuX, menuY, menuId, menuDefault,
    0x19, ...word(0x8000), ...word(0x800d),
  ]

  moveIds.forEach((moveId, index) => {
    bytes.push(
      0x21, ...word(0x8000), ...word(index),
      0x06, 0x01, ...dword(offsetToPointerValue(baseOffset + dispatchLength + index * branchLength)),
    )
  })

  bytes.push(
    0x21, ...word(0x8000), ...word(exitChoice),
    0x06, 0x01, ...dword(offsetToPointerValue(exitOffset)),
    0x05, ...dword(offsetToPointerValue(exitOffset)),
  )

  moveIds.forEach(moveId => {
    bytes.push(
      0x0f, 0x00, ...dword(tutorPromptTextPtr),
      0x09, 0x04,
      0x16, ...word(0x8005), ...word(moveId),
      0x04, ...dword(tutorScriptPointer),
      0x21, ...word(0x800d), ...word(0),
      0x06, 0x01, ...dword(offsetToPointerValue(exitOffset)),
      0x05, ...dword(offsetToPointerValue(menuOffset)),
    )
  })

  bytes.push(
    0x6c,
    0x02,
  )

  return bytes
}

function parseSpeciesPool(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || "")
      .split(/[\s,，;；]+/)
      .filter(Boolean)
  const pool = values
    .map(item => Number(item))
    .filter(item => Number.isInteger(item) && item > 0 && item <= 0xffff)
  return pool.length ? pool : [1]
}

function parseMoveIds(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || "")
      .split(/[\s,，;；、]+/)
      .filter(Boolean)
  const moves = values
    .map(item => Number(item))
    .filter(item => Number.isInteger(item) && item > 0 && item <= 0xffff)
  return moves.length ? moves : [398]
}

function offsetToPointerValue(offset) {
  return Number.isInteger(offset) && offset > 0 ? (offset + 0x08000000) >>> 0 : 0
}

function normalizeScriptFlag(value) {
  const flag = Number(value)
  if (!Number.isInteger(flag) || flag <= 0 || flag > 0xffff) {
    throw new Error("领取Flag 必须是 1 ~ 65535 的整数")
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

function normalizeByteInput(value, label, min = 0) {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > 0xff) {
    throw new Error(`${label} 必须是 ${min} ~ 255 的整数`)
  }
  return numberValue
}

function normalizePointerInput(value, label) {
  const numberValue = typeof value === "string" && value.trim().toLowerCase().startsWith("0x")
    ? Number.parseInt(value.trim(), 16)
    : Number(value)
  if (!Number.isInteger(numberValue) || numberValue < 0x08000000 || numberValue > 0x09ffffff) {
    throw new Error(`${label} 必须是有效 GBA 指针`)
  }
  return numberValue >>> 0
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
