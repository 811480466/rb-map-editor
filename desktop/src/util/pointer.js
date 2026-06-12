export const GBA_ROM_POINTER_BASE = 0x08000000

export function pointerToOffset(pointer) {
  const value = Number(pointer)
  if (!Number.isInteger(value)) return null
  if (value < GBA_ROM_POINTER_BASE) return null
  return value - GBA_ROM_POINTER_BASE
}

export function offsetToPointer(offset) {
  const value = Number(offset)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`ROM offset 无效: ${offset}`)
  }
  return GBA_ROM_POINTER_BASE + value
}
