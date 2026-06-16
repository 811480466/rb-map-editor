export function formatHex(value, width = 8) {
  if (!Number.isInteger(value)) return "null"
  return `0x${value.toString(16).toUpperCase().padStart(width, "0")}`
}

export const toHex = formatHex

export function formatByteHex(value) {
  return formatHex(value, 2)
}

export function formatWordHex(value) {
  return formatHex(value, 4)
}

export function formatPointerHex(value) {
  return formatHex(value, 8)
}
