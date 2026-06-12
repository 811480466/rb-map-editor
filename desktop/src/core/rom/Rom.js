import { offsetToPointer, pointerToOffset } from "../../util/pointer"

export default class Rom {
  /** @type {string | null} */
  name = null

  /** @type {Uint8Array | null} */
  bytes = null

  /** @type {number} */
  size = 0
  
  /**
   * @param {ArrayBuffer | Uint8Array} source
   * @param {{ name?: string }} options
   */
  constructor(source, options = {}) {
    this.name = options.name || ""
    this.initialize(source)
  }

  /**
   * @param {ArrayBuffer | Uint8Array} source
   * @returns {this}
   */
  initialize(source) {
    if (source instanceof Uint8Array) {
      this.bytes = new Uint8Array(source)
    } else if (source instanceof ArrayBuffer) {
      this.bytes = new Uint8Array(source)
    } else {
      throw new Error("Rom 初始化需要 ArrayBuffer 或 Uint8Array")
    }

    this.size = this.bytes.length
    return this
  }

  /**
   * @param {number} offset
   * @param {number} [size]
   * @returns {void}
   */
  ensureRange(offset, size = 1) {
    if (!Number.isInteger(offset) || !Number.isInteger(size) || size < 0) {
      throw new Error(`ROM 范围参数无效: offset=${offset}, size=${size}`)
    }

    if (offset < 0 || offset + size > this.size) {
      throw new Error(`ROM 范围越界: offset=0x${offset.toString(16)}, size=${size}`)
    }
  }

  /**
   * @param {number} offset
   * @returns {number}
   */
  readByte(offset) {
    this.ensureRange(offset, 1)
    return this.bytes[offset]
  }

  /**
   * @param {number} offset
   * @returns {number}
   */
  readWord(offset) {
    this.ensureRange(offset, 2)
    return this.bytes[offset] | (this.bytes[offset + 1] << 8)
  }

  /**
   * @param {number} offset
   * @returns {number}
   */
  readDword(offset) {
    this.ensureRange(offset, 4)
    return (
      this.bytes[offset] |
      (this.bytes[offset + 1] << 8) |
      (this.bytes[offset + 2] << 16) |
      (this.bytes[offset + 3] << 24)
    ) >>> 0
  }

  /**
   * @param {number} offset
   * @returns {number}
   */
  readPointer(offset) {
    return this.readDword(offset)
  }

  /**
   * @param {number} offset
   * @returns {number | null}
   */
  readPointerOffset(offset) {
    const pointer = this.readPointer(offset)
    return pointerToOffset(pointer)
  }

  /**
   * @param {number} offset
   * @param {number} size
   * @returns {Uint8Array}
   */
  readBytes(offset, size) {
    this.ensureRange(offset, size)
    return this.bytes.slice(offset, offset + size)
  }

  /**
   * @param {number} offset
   * @param {number} value
   * @returns {this}
   */
  writeByte(offset, value) {
    this.ensureRange(offset, 1)
    this.bytes[offset] = value & 0xff
    return this
  }

  /**
   * @param {number} offset
   * @param {number} value
   * @returns {this}
   */
  writeWord(offset, value) {
    this.ensureRange(offset, 2)
    this.bytes[offset] = value & 0xff
    this.bytes[offset + 1] = (value >> 8) & 0xff
    return this
  }

  /**
   * @param {number} offset
   * @param {number} value
   * @returns {this}
   */
  writeDword(offset, value) {
    this.ensureRange(offset, 4)
    const normalized = value >>> 0
    this.bytes[offset] = normalized & 0xff
    this.bytes[offset + 1] = (normalized >> 8) & 0xff
    this.bytes[offset + 2] = (normalized >> 16) & 0xff
    this.bytes[offset + 3] = (normalized >> 24) & 0xff
    return this
  }

  /**
   * @param {number} offset
   * @param {number} pointer
   * @returns {this}
   */
  writePointer(offset, pointer) {
    return this.writeDword(offset, pointer)
  }

  /**
   * @param {number} offset
   * @param {number} targetOffset
   * @returns {this}
   */
  writePointerOffset(offset, targetOffset) {
    return this.writePointer(offset, offsetToPointer(targetOffset))
  }

  /**
   * @param {number} offset
   * @param {ArrayBuffer | Uint8Array | number[]} bytes
   * @returns {this}
   */
  writeBytes(offset, bytes) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
    this.ensureRange(offset, source.length)
    this.bytes.set(source, offset)
    return this
  }

  /**
   * @param {number} offset
   * @param {number} size
   * @param {number} [value]
   * @returns {this}
   */
  fill(offset, size, value = 0xff) {
    this.ensureRange(offset, size)
    this.bytes.fill(value & 0xff, offset, offset + size)
    return this
  }

  /**
   * @returns {ArrayBuffer}
   */
  toArrayBuffer() {
    return this.bytes.slice().buffer
  }

  /**
   * @param {string} [type]
   * @returns {Blob}
   */
  toBlob(type = "application/octet-stream") {
    return new globalThis.Blob([this.toArrayBuffer()], { type })
  }
}
