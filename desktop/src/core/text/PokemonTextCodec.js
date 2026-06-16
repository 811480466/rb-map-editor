export default class PokemonTextCodec {
  /** @type {Map<number, string>} */
  table = new Map()

  /** @type {Map<string, number>} */
  reverseTable = new Map()

  /** @type {number} */
  terminator = 0xff

  /**
   * @param {{ terminator?: number, table?: Record<number, string> }} options
   */
  constructor(options = {}) {
    this.terminator = options.terminator ?? 0xff
    this.setTable(options.table || PokemonTextCodec.createAsciiTable())
  }

  /** @returns {Record<number, string>} */
  static createAsciiTable() {
    const table = {}

    for (let code = 0x20; code <= 0x7e; code += 1) {
      table[code] = String.fromCharCode(code)
    }

    return table
  }

  /** @returns {Record<number, string>} */
  static createPokemonEnglishTable() {
    const table = {
      0x00: " ",
      0x01: "À",
      0x02: "Á",
      0x03: "Â",
      0x04: "Ç",
      0x05: "È",
      0x06: "É",
      0x07: "Ê",
      0x08: "Ë",
      0x09: "Ì",
      0x0b: "Î",
      0x0c: "Ï",
      0x0d: "Ò",
      0x0e: "Ó",
      0x0f: "Ô",
      0x10: "Œ",
      0x11: "Ù",
      0x12: "Ú",
      0x13: "Û",
      0x14: "Ñ",
      0x15: "ß",
      0x16: "à",
      0x17: "á",
      0x19: "ç",
      0x1a: "è",
      0x1b: "é",
      0x1c: "ê",
      0x1d: "ë",
      0x1e: "ì",
      0x20: "î",
      0x21: "ï",
      0x22: "ò",
      0x23: "ó",
      0x24: "ô",
      0x25: "œ",
      0x26: "ù",
      0x27: "ú",
      0x28: "û",
      0x29: "ñ",
      0x2d: "&",
      0x2e: "+",
      0x35: "=",
      0x36: ";",
      0x51: "¿",
      0x52: "¡",
      0x5b: "%",
      0x5c: "(",
      0x5d: ")",
      0x85: "<",
      0x86: ">",
      0xab: "!",
      0xac: "?",
      0xad: ".",
      0xae: "-",
      0xaf: "·",
      0xb0: "…",
      0xb1: "“",
      0xb2: "”",
      0xb3: "‘",
      0xb4: "'",
      0xb5: "♂",
      0xb6: "♀",
      0xb7: "¥",
      0xb8: ",",
      0xb9: "×",
      0xba: "/",
      0xef: "▶",
      0xf0: ":",
      0xf1: "Ä",
      0xf2: "Ö",
      0xf3: "Ü",
      0xf4: "ä",
      0xf5: "ö",
      0xf6: "ü",
    }

    for (let index = 0; index < 10; index += 1) {
      table[0xa1 + index] = String(index)
    }

    for (let index = 0; index < 26; index += 1) {
      table[0xbb + index] = String.fromCharCode("A".charCodeAt(0) + index)
      table[0xd5 + index] = String.fromCharCode("a".charCodeAt(0) + index)
    }

    return table
  }

  /**
   * @param {Record<number, string>} table
   * @returns {this}
   */
  setTable(table) {
    this.table.clear()
    this.reverseTable.clear()

    Object.entries(table).forEach(([key, value]) => {
      const code = Number(key)
      this.table.set(code, value)
      if (!this.reverseTable.has(value)) this.reverseTable.set(value, code)
    })

    return this
  }

  /**
   * @param {Uint8Array | number[]} bytes
   * @returns {string}
   */
  decode(bytes) {
    const chars = []

    for (const byte of bytes) {
      if (byte === this.terminator) break
      if (byte === 0xfe) {
        chars.push("\n")
        continue
      }
      if (byte === 0xfb) {
        chars.push("\n\n")
        continue
      }
      chars.push(this.table.get(byte) ?? `{${byte.toString(16).padStart(2, "0")}}`)
    }

    return chars.join("")
  }

  /**
   * @param {string} text
   * @param {{ terminated?: boolean }} options
   * @returns {Uint8Array}
   */
  encode(text, options = {}) {
    const bytes = []

    for (const char of text) {
      const code = this.reverseTable.get(char)
      if (code === undefined) {
        throw new Error(`Character is not encodable: ${char}`)
      }
      bytes.push(code)
    }

    if (options.terminated !== false) bytes.push(this.terminator)
    return new Uint8Array(bytes)
  }
}
