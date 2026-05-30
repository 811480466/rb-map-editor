// ============================================================
// Pokémon 文本解码
// ============================================================
const TEXT_CHARMAP = (() => {
  const map = new Map();

  map.set(0x00, " ");
  map.set(0x01, "À");
  map.set(0x02, "Á");
  map.set(0x03, "Â");
  map.set(0x04, "Ç");
  map.set(0x05, "È");
  map.set(0x06, "É");
  map.set(0x07, "Ê");
  map.set(0x08, "Ë");
  map.set(0x09, "Ì");
  map.set(0x0B, "Î");
  map.set(0x0C, "Ï");
  map.set(0x0D, "Ò");
  map.set(0x0E, "Ó");
  map.set(0x0F, "Ô");
  map.set(0x10, "Œ");
  map.set(0x11, "Ù");
  map.set(0x12, "Ú");
  map.set(0x13, "Û");
  map.set(0x14, "Ñ");
  map.set(0x15, "ß");
  map.set(0x16, "à");
  map.set(0x17, "á");
  map.set(0x19, "ç");
  map.set(0x1A, "è");
  map.set(0x1B, "é");
  map.set(0x1C, "ê");
  map.set(0x1D, "ë");
  map.set(0x1E, "ì");
  map.set(0x20, "î");
  map.set(0x21, "ï");
  map.set(0x22, "ò");
  map.set(0x23, "ó");
  map.set(0x24, "ô");
  map.set(0x25, "œ");
  map.set(0x26, "ù");
  map.set(0x27, "ú");
  map.set(0x28, "û");
  map.set(0x29, "ñ");
  map.set(0x2D, "&");
  map.set(0x2E, "+");
  map.set(0x35, "=");
  map.set(0x36, ";");
  map.set(0x51, "¿");
  map.set(0x52, "¡");
  map.set(0x5B, "%");
  map.set(0x5C, "(");
  map.set(0x5D, ")");
  map.set(0x85, "<");
  map.set(0x86, ">");

  for (let i = 0; i < 10; i++) {
    map.set(0xA1 + i, String(i));
  }

  map.set(0xAB, "!");
  map.set(0xAC, "?");
  map.set(0xAD, ".");
  map.set(0xAE, "-");
  map.set(0xAF, "·");
  map.set(0xB0, "…");
  map.set(0xB1, "“");
  map.set(0xB2, "”");
  map.set(0xB3, "‘");
  map.set(0xB4, "'");
  map.set(0xB5, "♂");
  map.set(0xB6, "♀");
  map.set(0xB7, "¥");
  map.set(0xB8, ",");
  map.set(0xB9, "×");
  map.set(0xBA, "/");

  for (let i = 0; i < 26; i++) {
    map.set(0xBB + i, String.fromCharCode("A".charCodeAt(0) + i));
    map.set(0xD5 + i, String.fromCharCode("a".charCodeAt(0) + i));
  }

  map.set(0xEF, "▶");
  map.set(0xF0, ":");
  map.set(0xF1, "Ä");
  map.set(0xF2, "Ö");
  map.set(0xF3, "Ü");
  map.set(0xF4, "ä");
  map.set(0xF5, "ö");
  map.set(0xF6, "ü");

  return map;
})();

function decodePokemonText(offset, maxLen = 120) {
  if (!isValidOffset(offset, 1)) return "";

  let s = "";

  for (let i = 0; i < maxLen; i++) {
    const b = readU8(offset + i);

    if (b === 0xFF) break;

    if (b === 0xFE) {
      s += "\n";
      continue;
    }

    if (b === 0xFB) {
      s += "\n\n";
      continue;
    }

    if (b === 0xFD) {
      const next = readU8(offset + i + 1);
      s += `{FD ${hex(next, 2)}}`;
      i++;
      continue;
    }

    if (b === 0xFC) {
      const next = readU8(offset + i + 1);
      s += `{FC ${hex(next, 2)}}`;
      i++;
      continue;
    }

    s += TEXT_CHARMAP.get(b) ?? `<${hex(b, 2)}>`;
  }

  return s;
}
