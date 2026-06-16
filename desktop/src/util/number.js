export function clampNumber(value, min, max, fallback = min) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

export function clampInt(value, min, max, fallback = min) {
  const number = Number.parseInt(String(value), 10)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

export function align(value, alignment = 4) {
  if (alignment <= 1) return value
  return Math.ceil(value / alignment) * alignment
}
