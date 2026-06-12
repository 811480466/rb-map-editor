export const MAP_NAME_CN = {
  "Abandoned Ship": "废弃船",
  "Altering Cave": "变化洞窟",
  "Ancient Tomb": "古代坟墓",
  "Aqua Hideout": "海洋队基地",
  "ARTISAN CAVE": "工匠洞窟",
  "Artisan Cave": "工匠洞窟",
  "Battle Frontier": "对战开拓区",
  "Birth Island": "诞生之岛",
  "Cave of Origin": "觉醒祠堂",
  "Desert Ruins": "沙漠遗迹",
  "Desert Underpass": "沙漠地下道",
  "Dewford Town": "武斗镇",
  "Ever Grande City": "彩幽市",
  "Fallarbor Town": "秋叶镇",
  "FARAWAY ISLAND": "边境的小岛",
  "Faraway Island": "边境的小岛",
  "Fiery Path": "热焰小径",
  "Fortree City": "茵郁市",
  "Granite Cave": "石之洞窟",
  "Inside of Truck": "卡车内部",
  "Island Cave": "小岛横穴",
  "Jagged Pass": "凹凸山道",
  "Lavaridge Town": "釜炎镇",
  "Lilycove City": "水静市",
  "Littleroot Town": "未白镇",
  "Magma Hideout": "熔岩队基地",
  "MARINE CAVE": "海之洞窟",
  "Marine Cave": "海之洞窟",
  "Mauville City": "紫堇市",
  "Meteor Falls": "流星瀑布",
  "Mirage Tower": "幻影之塔",
  "Mossdeep City": "绿岭市",
  "Mt. Chimney": "烟囱山",
  "Mt. Pyre": "送神山",
  "Navel Rock": "肚脐岩",
  "New Mauville": "新紫堇",
  "Oldale Town": "古辰镇",
  "Pacifidlog Town": "暮水镇",
  "Petalburg City": "橙华市",
  "Petalburg Woods": "橙华森林",
  "Rustboro City": "卡那兹市",
  "Rusturf Tunnel": "卡绿隧道",
  "Safari Zone": "狩猎地带",
  "Scorched Slab": "日照岩窟",
  "Seafloor Cavern": "海底洞窟",
  "Seafloor Cavern Underwater": "海底洞窟（水下）",
  "Sealed Chamber": "布告石室",
  "Sealed Chamber Underwater": "布告石室（水下）",
  "Secret Base": "秘密基地",
  "Shoal Cave": "浅滩洞窟",
  "Sky Pillar": "天空之柱",
  "Slateport City": "凯那市",
  "Sootopolis City": "琉璃市",
  "Sootopolis Underwater": "琉璃市（水下）",
  "Southern Island": "南方孤岛",
  "TERRA CAVE": "陆之窟",
  "Terra Cave": "陆之窟",
  "Trainer Hill": "训练家之丘",
  "UNDERWATER": "水下",
  "Underwater": "水下",
  "Verdanturf Town": "绿荫镇",
  "Victory Road": "冠军之路",
}

/**
 * @param {string | null | undefined} name
 * @returns {string}
 */
export function normalizeMapNameForTranslate(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ")
}

/**
 * @param {string | null | undefined} name
 * @returns {string}
 */
export function translateMapName(name) {
  const raw = normalizeMapNameForTranslate(name)
  if (!raw) return ""

  if (MAP_NAME_CN[raw]) return MAP_NAME_CN[raw]

  const routeMatch = raw.match(/^(Route|Rote)\s+(\d+)(?:\s+Underwater)?$/i)
  if (routeMatch) {
    const number = routeMatch[2]
    const underwater = /Underwater/i.test(raw)
    return `${number}号${underwater ? "水下" : ""}道路`
  }

  const underwaterMatch = raw.match(/^(.+)\s+Underwater$/i)
  if (underwaterMatch) {
    const baseName = underwaterMatch[1].trim()
    const baseCn = translateMapName(baseName)
    return `${baseCn}（水下）`
  }

  return raw
}

/**
 * @param {string} name
 * @param {number} [suffixCode]
 * @returns {string}
 */
export function formatMapDisplayName(name, suffixCode = 0) {
  const translatedName = translateMapName(name) || name
  const suffixText = suffixCode > 0 ? `#${suffixCode}` : ""
  return `${translatedName}${suffixText}`
}
