// ============================================================
// Pokémon data
// ============================================================
// 本文件使用 JS 数组提供 Species ID -> 宝可梦名称映射。
// 这样即使直接用 file:// 打开 index.html，也不需要 fetch JSON 文件。
// 后续追加数据时，直接往 RBEditorPokemonData 数组里添加对象即可：
// { id: 1, code: "Bulbasaur", name: "妙蛙种子" }

window.RBEditorPokemonData = [
  [
    {
      "id": 1,
      "code": "Bulbasaur",
      "name": "妙蛙种子"
    },
    {
      "id": 2,
      "code": "Ivysaur",
      "name": "妙蛙草"
    },
    {
      "id": 3,
      "code": "Venusaur",
      "name": "妙蛙花"
    },
    {
      "id": 4,
      "code": "Charmander",
      "name": "小火龙"
    },
    {
      "id": 5,
      "code": "Charmeleon",
      "name": "火恐龙"
    },
    {
      "id": 6,
      "code": "Charizard",
      "name": "喷火龙"
    },
    {
      "id": 7,
      "code": "Squirtle",
      "name": "杰尼龟"
    },
    {
      "id": 8,
      "code": "Wartortle",
      "name": "卡咪龟"
    },
    {
      "id": 9,
      "code": "Blastoise",
      "name": "水箭龟"
    },
    {
      "id": 10,
      "code": "Caterpie",
      "name": "绿毛虫"
    },
    {
      "id": 11,
      "code": "Metapod",
      "name": "铁甲蛹"
    },
    {
      "id": 12,
      "code": "Butterfree",
      "name": "巴大蝶"
    },
    {
      "id": 13,
      "code": "Weedle",
      "name": "独角虫"
    },
    {
      "id": 14,
      "code": "Kakuna",
      "name": "铁壳蛹"
    },
    {
      "id": 15,
      "code": "Beedrill",
      "name": "大针蜂"
    },
    {
      "id": 16,
      "code": "Pidgey",
      "name": "波波"
    },
    {
      "id": 17,
      "code": "Pidgeotto",
      "name": "比比鸟"
    },
    {
      "id": 18,
      "code": "Pidgeot",
      "name": "大比鸟"
    },
    {
      "id": 19,
      "code": "Rattata",
      "name": "小拉达"
    },
    {
      "id": 20,
      "code": "Raticate",
      "name": "拉达"
    },
    {
      "id": 21,
      "code": "Spearow",
      "name": "烈雀"
    },
    {
      "id": 22,
      "code": "Fearow",
      "name": "大嘴雀"
    },
    {
      "id": 23,
      "code": "Ekans",
      "name": "阿柏蛇"
    },
    {
      "id": 24,
      "code": "Arbok",
      "name": "阿柏怪"
    },
    {
      "id": 25,
      "code": "Pikachu",
      "name": "皮卡丘"
    },
    {
      "id": 26,
      "code": "Raichu",
      "name": "雷丘"
    },
    {
      "id": 27,
      "code": "Sandshrew",
      "name": "穿山鼠"
    },
    {
      "id": 28,
      "code": "Sandslash",
      "name": "穿山王"
    },
    {
      "id": 29,
      "code": "Nidoran-F",
      "name": "尼多兰"
    },
    {
      "id": 30,
      "code": "Nidorina",
      "name": "尼多娜"
    },
    {
      "id": 31,
      "code": "Nidoqueen",
      "name": "尼多后"
    },
    {
      "id": 32,
      "code": "Nidoran-M",
      "name": "尼多朗"
    },
    {
      "id": 33,
      "code": "Nidorino",
      "name": "尼多力诺"
    },
    {
      "id": 34,
      "code": "Nidoking",
      "name": "尼多王"
    },
    {
      "id": 35,
      "code": "Clefairy",
      "name": "皮皮"
    },
    {
      "id": 36,
      "code": "Clefable",
      "name": "皮可西"
    },
    {
      "id": 37,
      "code": "Vulpix",
      "name": "六尾"
    },
    {
      "id": 38,
      "code": "Ninetales",
      "name": "九尾"
    },
    {
      "id": 39,
      "code": "Jigglypuff",
      "name": "胖丁"
    },
    {
      "id": 40,
      "code": "Wigglytuff",
      "name": "胖可丁"
    },
    {
      "id": 41,
      "code": "Zubat",
      "name": "超音蝠"
    },
    {
      "id": 42,
      "code": "Golbat",
      "name": "大嘴蝠"
    },
    {
      "id": 43,
      "code": "Oddish",
      "name": "走路草"
    },
    {
      "id": 44,
      "code": "Gloom",
      "name": "臭臭花"
    },
    {
      "id": 45,
      "code": "Vileplume",
      "name": "霸王花"
    },
    {
      "id": 46,
      "code": "Paras",
      "name": "派拉斯"
    },
    {
      "id": 47,
      "code": "Parasect",
      "name": "派拉斯特"
    },
    {
      "id": 48,
      "code": "Venonat",
      "name": "毛球"
    },
    {
      "id": 49,
      "code": "Venomoth",
      "name": "摩鲁蛾"
    },
    {
      "id": 50,
      "code": "Diglett",
      "name": "地鼠"
    },
    {
      "id": 51,
      "code": "Dugtrio",
      "name": "三地鼠"
    },
    {
      "id": 52,
      "code": "Meowth",
      "name": "喵喵"
    },
    {
      "id": 53,
      "code": "Persian",
      "name": "猫老大"
    },
    {
      "id": 54,
      "code": "Psyduck",
      "name": "可达鸭"
    },
    {
      "id": 55,
      "code": "Golduck",
      "name": "哥达鸭"
    },
    {
      "id": 56,
      "code": "Mankey",
      "name": "猴怪"
    },
    {
      "id": 57,
      "code": "Primeape",
      "name": "火暴猴"
    },
    {
      "id": 58,
      "code": "Growlithe",
      "name": "卡蒂狗"
    },
    {
      "id": 59,
      "code": "Arcanine",
      "name": "风速狗"
    },
    {
      "id": 60,
      "code": "Poliwag",
      "name": "蚊香蝌蚪"
    },
    {
      "id": 61,
      "code": "Poliwhirl",
      "name": "蚊香君"
    },
    {
      "id": 62,
      "code": "Poliwrath",
      "name": "蚊香泳士"
    },
    {
      "id": 63,
      "code": "Abra",
      "name": "凯西"
    },
    {
      "id": 64,
      "code": "Kadabra",
      "name": "勇基拉"
    },
    {
      "id": 65,
      "code": "Alakazam",
      "name": "胡地"
    },
    {
      "id": 66,
      "code": "Machop",
      "name": "腕力"
    },
    {
      "id": 67,
      "code": "Machoke",
      "name": "豪力"
    },
    {
      "id": 68,
      "code": "Machamp",
      "name": "怪力"
    },
    {
      "id": 69,
      "code": "Bellsprout",
      "name": "喇叭芽"
    },
    {
      "id": 70,
      "code": "Weepinbell",
      "name": "口呆花"
    },
    {
      "id": 71,
      "code": "Victreebel",
      "name": "大食花"
    },
    {
      "id": 72,
      "code": "Tentacool",
      "name": "玛瑙水母"
    },
    {
      "id": 73,
      "code": "Tentacruel",
      "name": "毒刺水母"
    },
    {
      "id": 74,
      "code": "Geodude",
      "name": "小拳石"
    },
    {
      "id": 75,
      "code": "Graveler",
      "name": "隆隆石"
    },
    {
      "id": 76,
      "code": "Golem",
      "name": "隆隆岩"
    },
    {
      "id": 77,
      "code": "Ponyta",
      "name": "小火马"
    },
    {
      "id": 78,
      "code": "Rapidash",
      "name": "烈焰马"
    },
    {
      "id": 79,
      "code": "Slowpoke",
      "name": "呆呆兽"
    },
    {
      "id": 80,
      "code": "Slowbro",
      "name": "呆壳兽"
    },
    {
      "id": 81,
      "code": "Magnemite",
      "name": "小磁怪"
    },
    {
      "id": 82,
      "code": "Magneton",
      "name": "三合一磁怪"
    },
    {
      "id": 83,
      "code": "Farfetch’d",
      "name": "大葱鸭"
    },
    {
      "id": 84,
      "code": "Doduo",
      "name": "嘟嘟"
    },
    {
      "id": 85,
      "code": "Dodrio",
      "name": "嘟嘟利"
    },
    {
      "id": 86,
      "code": "Seel",
      "name": "小海狮"
    },
    {
      "id": 87,
      "code": "Dewgong",
      "name": "白海狮"
    },
    {
      "id": 88,
      "code": "Grimer",
      "name": "臭泥"
    },
    {
      "id": 89,
      "code": "Muk",
      "name": "臭臭泥"
    },
    {
      "id": 90,
      "code": "Shellder",
      "name": "大舌贝"
    },
    {
      "id": 91,
      "code": "Cloyster",
      "name": "刺甲贝"
    },
    {
      "id": 92,
      "code": "Gastly",
      "name": "鬼斯"
    },
    {
      "id": 93,
      "code": "Haunter",
      "name": "鬼斯通"
    },
    {
      "id": 94,
      "code": "Gengar",
      "name": "耿鬼"
    },
    {
      "id": 95,
      "code": "Onix",
      "name": "大岩蛇"
    },
    {
      "id": 96,
      "code": "Drowzee",
      "name": "催眠貘"
    },
    {
      "id": 97,
      "code": "Hypno",
      "name": "引梦貘人"
    },
    {
      "id": 98,
      "code": "Krabby",
      "name": "大钳蟹"
    },
    {
      "id": 99,
      "code": "Kingler",
      "name": "巨钳蟹"
    },
    {
      "id": 100,
      "code": "Voltorb",
      "name": "霹雳电球"
    },
    {
      "id": 101,
      "code": "Electrode",
      "name": "顽皮雷弹"
    },
    {
      "id": 102,
      "code": "Exeggcute",
      "name": "蛋蛋"
    },
    {
      "id": 103,
      "code": "Exeggutor",
      "name": "椰蛋树"
    },
    {
      "id": 104,
      "code": "Cubone",
      "name": "卡拉卡拉"
    },
    {
      "id": 105,
      "code": "Marowak",
      "name": "嘎啦嘎啦"
    },
    {
      "id": 106,
      "code": "Hitmonlee",
      "name": "飞腿郎"
    },
    {
      "id": 107,
      "code": "Hitmonchan",
      "name": "快拳郎"
    },
    {
      "id": 108,
      "code": "Lickitung",
      "name": "大舌头"
    },
    {
      "id": 109,
      "code": "Koffing",
      "name": "瓦斯弹"
    },
    {
      "id": 110,
      "code": "Weezing",
      "name": "双弹瓦斯"
    },
    {
      "id": 111,
      "code": "Rhyhorn",
      "name": "独角犀牛"
    },
    {
      "id": 112,
      "code": "Rhydon",
      "name": "钻角犀兽"
    },
    {
      "id": 113,
      "code": "Chansey",
      "name": "吉利蛋"
    },
    {
      "id": 114,
      "code": "Tangela",
      "name": "蔓藤怪"
    },
    {
      "id": 115,
      "code": "Kangaskhan",
      "name": "袋兽"
    },
    {
      "id": 116,
      "code": "Horsea",
      "name": "墨海马"
    },
    {
      "id": 117,
      "code": "Seadra",
      "name": "海刺龙"
    },
    {
      "id": 118,
      "code": "Goldeen",
      "name": "角金鱼"
    },
    {
      "id": 119,
      "code": "Seaking",
      "name": "金鱼王"
    },
    {
      "id": 120,
      "code": "Staryu",
      "name": "海星星"
    },
    {
      "id": 121,
      "code": "Starmie",
      "name": "宝石海星"
    },
    {
      "id": 122,
      "code": "Mr. Mime",
      "name": "魔墙人偶"
    },
    {
      "id": 123,
      "code": "Scyther",
      "name": "飞天螳螂"
    },
    {
      "id": 124,
      "code": "Jynx",
      "name": "迷唇姐"
    },
    {
      "id": 125,
      "code": "Electabuzz",
      "name": "电击兽"
    },
    {
      "id": 126,
      "code": "Magmar",
      "name": "鸭嘴火兽"
    },
    {
      "id": 127,
      "code": "Pinsir",
      "name": "凯罗斯"
    },
    {
      "id": 128,
      "code": "Tauros",
      "name": "肯泰罗"
    },
    {
      "id": 129,
      "code": "Magikarp",
      "name": "鲤鱼王"
    },
    {
      "id": 130,
      "code": "Gyarados",
      "name": "暴鲤龙"
    },
    {
      "id": 131,
      "code": "Lapras",
      "name": "拉普拉斯"
    },
    {
      "id": 132,
      "code": "Ditto",
      "name": "百变怪"
    },
    {
      "id": 133,
      "code": "Eevee",
      "name": "伊布"
    },
    {
      "id": 134,
      "code": "Vaporeon",
      "name": "水伊布"
    },
    {
      "id": 135,
      "code": "Jolteon",
      "name": "雷伊布"
    },
    {
      "id": 136,
      "code": "Flareon",
      "name": "火伊布"
    },
    {
      "id": 137,
      "code": "Porygon",
      "name": "多边兽"
    },
    {
      "id": 138,
      "code": "Omanyte",
      "name": "菊石兽"
    },
    {
      "id": 139,
      "code": "Omastar",
      "name": "多刺菊石兽"
    },
    {
      "id": 140,
      "code": "Kabuto",
      "name": "化石盔"
    },
    {
      "id": 141,
      "code": "Kabutops",
      "name": "镰刀盔"
    },
    {
      "id": 142,
      "code": "Aerodactyl",
      "name": "化石翼龙"
    },
    {
      "id": 143,
      "code": "Snorlax",
      "name": "卡比兽"
    },
    {
      "id": 144,
      "code": "Articuno",
      "name": "急冻鸟"
    },
    {
      "id": 145,
      "code": "Zapdos",
      "name": "闪电鸟"
    },
    {
      "id": 146,
      "code": "Moltres",
      "name": "火焰鸟"
    },
    {
      "id": 147,
      "code": "Dratini",
      "name": "迷你龙"
    },
    {
      "id": 148,
      "code": "Dragonair",
      "name": "哈克龙"
    },
    {
      "id": 149,
      "code": "Dragonite",
      "name": "快龙"
    },
    {
      "id": 150,
      "code": "Mewtwo",
      "name": "超梦"
    },
    {
      "id": 151,
      "code": "Mew",
      "name": "梦幻"
    },
    {
      "id": 152,
      "code": "Chikorita",
      "name": "菊草叶"
    },
    {
      "id": 153,
      "code": "Bayleef",
      "name": "月桂叶"
    },
    {
      "id": 154,
      "code": "Meganium",
      "name": "大竺葵"
    },
    {
      "id": 155,
      "code": "Cyndaquil",
      "name": "火球鼠"
    },
    {
      "id": 156,
      "code": "Quilava",
      "name": "火岩鼠"
    },
    {
      "id": 157,
      "code": "Typhlosion",
      "name": "火暴兽"
    },
    {
      "id": 158,
      "code": "Totodile",
      "name": "小锯鳄"
    },
    {
      "id": 159,
      "code": "Croconaw",
      "name": "蓝鳄"
    },
    {
      "id": 160,
      "code": "Feraligatr",
      "name": "大力鳄"
    },
    {
      "id": 161,
      "code": "Sentret",
      "name": "尾立"
    },
    {
      "id": 162,
      "code": "Furret",
      "name": "大尾立"
    },
    {
      "id": 163,
      "code": "Hoothoot",
      "name": "咕咕"
    },
    {
      "id": 164,
      "code": "Noctowl",
      "name": "猫头夜鹰"
    },
    {
      "id": 165,
      "code": "Ledyba",
      "name": "芭瓢虫"
    },
    {
      "id": 166,
      "code": "Ledian",
      "name": "安瓢虫"
    },
    {
      "id": 167,
      "code": "Spinarak",
      "name": "圆丝蛛"
    },
    {
      "id": 168,
      "code": "Ariados",
      "name": "阿利多斯"
    },
    {
      "id": 169,
      "code": "Crobat",
      "name": "叉字蝠"
    },
    {
      "id": 170,
      "code": "Chinchou",
      "name": "灯笼鱼"
    },
    {
      "id": 171,
      "code": "Lanturn",
      "name": "电灯怪"
    },
    {
      "id": 172,
      "code": "Pichu",
      "name": "皮丘"
    },
    {
      "id": 173,
      "code": "Cleffa",
      "name": "皮宝宝"
    },
    {
      "id": 174,
      "code": "Igglybuff",
      "name": "宝宝丁"
    },
    {
      "id": 175,
      "code": "Togepi",
      "name": "波克比"
    },
    {
      "id": 176,
      "code": "Togetic",
      "name": "波克基古"
    },
    {
      "id": 177,
      "code": "Natu",
      "name": "天然雀"
    },
    {
      "id": 178,
      "code": "Xatu",
      "name": "天然鸟"
    },
    {
      "id": 179,
      "code": "Mareep",
      "name": "咩利羊"
    },
    {
      "id": 180,
      "code": "Flaaffy",
      "name": "茸茸羊"
    },
    {
      "id": 181,
      "code": "Ampharos",
      "name": "电龙"
    },
    {
      "id": 182,
      "code": "Bellossom",
      "name": "美丽花"
    },
    {
      "id": 183,
      "code": "Marill",
      "name": "玛力露"
    },
    {
      "id": 184,
      "code": "Azumarill",
      "name": "玛力露丽"
    },
    {
      "id": 185,
      "code": "Sudowoodo",
      "name": "树才怪"
    },
    {
      "id": 186,
      "code": "Politoed",
      "name": "蚊香蛙皇"
    },
    {
      "id": 187,
      "code": "Hoppip",
      "name": "毽子草"
    },
    {
      "id": 188,
      "code": "Skiploom",
      "name": "毽子花"
    },
    {
      "id": 189,
      "code": "Jumpluff",
      "name": "毽子棉"
    },
    {
      "id": 190,
      "code": "Aipom",
      "name": "长尾怪手"
    },
    {
      "id": 191,
      "code": "Sunkern",
      "name": "向日种子"
    },
    {
      "id": 192,
      "code": "Sunflora",
      "name": "向日花怪"
    },
    {
      "id": 193,
      "code": "Yanma",
      "name": "蜻蜻蜓"
    },
    {
      "id": 194,
      "code": "Wooper",
      "name": "乌波"
    },
    {
      "id": 195,
      "code": "Quagsire",
      "name": "沼王"
    },
    {
      "id": 196,
      "code": "Espeon",
      "name": "太阳伊布"
    },
    {
      "id": 197,
      "code": "Umbreon",
      "name": "月亮伊布"
    },
    {
      "id": 198,
      "code": "Murkrow",
      "name": "黑暗鸦"
    },
    {
      "id": 199,
      "code": "Slowking",
      "name": "呆呆王"
    },
    {
      "id": 200,
      "code": "Misdreavus",
      "name": "梦妖"
    },
    {
      "id": 201,
      "code": "Unown",
      "name": "未知图腾-A"
    },
    {
      "id": 202,
      "code": "Wobbuffet",
      "name": "果然翁"
    },
    {
      "id": 203,
      "code": "Girafarig",
      "name": "麒麟奇"
    },
    {
      "id": 204,
      "code": "Pineco",
      "name": "榛果球"
    },
    {
      "id": 205,
      "code": "Forretress",
      "name": "佛烈托斯"
    },
    {
      "id": 206,
      "code": "Dunsparce",
      "name": "土龙弟弟"
    },
    {
      "id": 207,
      "code": "Gligar",
      "name": "天蝎"
    },
    {
      "id": 208,
      "code": "Steelix",
      "name": "大钢蛇"
    },
    {
      "id": 209,
      "code": "Snubbull",
      "name": "布鲁"
    },
    {
      "id": 210,
      "code": "Granbull",
      "name": "布鲁皇"
    },
    {
      "id": 211,
      "code": "Qwilfish",
      "name": "千针鱼"
    },
    {
      "id": 212,
      "code": "Scizor",
      "name": "巨钳螳螂"
    },
    {
      "id": 213,
      "code": "Shuckle",
      "name": "壶壶"
    },
    {
      "id": 214,
      "code": "Heracross",
      "name": "赫拉克罗斯"
    },
    {
      "id": 215,
      "code": "Sneasel",
      "name": "狃拉"
    },
    {
      "id": 216,
      "code": "Teddiursa",
      "name": "熊宝宝"
    },
    {
      "id": 217,
      "code": "Ursaring",
      "name": "圈圈熊"
    },
    {
      "id": 218,
      "code": "Slugma",
      "name": "熔岩虫"
    },
    {
      "id": 219,
      "code": "Magcargo",
      "name": "熔岩蜗牛"
    },
    {
      "id": 220,
      "code": "Swinub",
      "name": "小山猪"
    },
    {
      "id": 221,
      "code": "Piloswine",
      "name": "长毛猪"
    },
    {
      "id": 222,
      "code": "Corsola",
      "name": "太阳珊瑚"
    },
    {
      "id": 223,
      "code": "Remoraid",
      "name": "铁炮鱼"
    },
    {
      "id": 224,
      "code": "Octillery",
      "name": "章鱼桶"
    },
    {
      "id": 225,
      "code": "Delibird",
      "name": "信使鸟"
    },
    {
      "id": 226,
      "code": "Mantine",
      "name": "巨翅飞鱼"
    },
    {
      "id": 227,
      "code": "Skarmory",
      "name": "盔甲鸟"
    },
    {
      "id": 228,
      "code": "Houndour",
      "name": "戴鲁比"
    },
    {
      "id": 229,
      "code": "Houndoom",
      "name": "黑鲁加"
    },
    {
      "id": 230,
      "code": "Kingdra",
      "name": "刺龙王"
    },
    {
      "id": 231,
      "code": "Phanpy",
      "name": "小小象"
    },
    {
      "id": 232,
      "code": "Donphan",
      "name": "顿甲"
    },
    {
      "id": 233,
      "code": "Porygon2",
      "name": "多边兽 Ⅱ"
    },
    {
      "id": 234,
      "code": "Stantler",
      "name": "惊角鹿"
    },
    {
      "id": 235,
      "code": "Smeargle",
      "name": "图图犬"
    },
    {
      "id": 236,
      "code": "Tyrogue",
      "name": "无畏小子"
    },
    {
      "id": 237,
      "code": "Hitmontop",
      "name": "战舞郎"
    },
    {
      "id": 238,
      "code": "Smoochum",
      "name": "迷唇娃"
    },
    {
      "id": 239,
      "code": "Elekid",
      "name": "电击怪"
    },
    {
      "id": 240,
      "code": "Magby",
      "name": "鸭嘴宝宝"
    },
    {
      "id": 241,
      "code": "Miltank",
      "name": "大奶罐"
    },
    {
      "id": 242,
      "code": "Blissey",
      "name": "幸福蛋"
    },
    {
      "id": 243,
      "code": "Raikou",
      "name": "雷公"
    },
    {
      "id": 244,
      "code": "Entei",
      "name": "炎帝"
    },
    {
      "id": 245,
      "code": "Suicune",
      "name": "水君"
    },
    {
      "id": 246,
      "code": "Larvitar",
      "name": "幼基拉斯"
    },
    {
      "id": 247,
      "code": "Pupitar",
      "name": "沙基拉斯"
    },
    {
      "id": 248,
      "code": "Tyranitar",
      "name": "班基拉斯"
    },
    {
      "id": 249,
      "code": "Lugia",
      "name": "洛奇亚"
    },
    {
      "id": 250,
      "code": "Ho-Oh",
      "name": "凤王"
    },
    {
      "id": 251,
      "code": "Celebi",
      "name": "时拉比"
    },
    {
      "id": 252,
      "code": "Treecko",
      "name": "木守宫"
    },
    {
      "id": 253,
      "code": "Grovyle",
      "name": "森林蜥蜴"
    },
    {
      "id": 254,
      "code": "Sceptile",
      "name": "蜥蜴王"
    },
    {
      "id": 255,
      "code": "Torchic",
      "name": "火稚鸡"
    },
    {
      "id": 256,
      "code": "Combusken",
      "name": "力壮鸡"
    },
    {
      "id": 257,
      "code": "Blaziken",
      "name": "火焰鸡"
    },
    {
      "id": 258,
      "code": "Mudkip",
      "name": "水跃鱼"
    },
    {
      "id": 259,
      "code": "Marshtomp",
      "name": "沼跃鱼"
    },
    {
      "id": 260,
      "code": "Swampert",
      "name": "巨沼怪"
    },
    {
      "id": 261,
      "code": "Poochyena",
      "name": "土狼犬"
    },
    {
      "id": 262,
      "code": "Mightyena",
      "name": "大狼犬"
    },
    {
      "id": 263,
      "code": "Zigzagoon",
      "name": "蛇纹熊"
    },
    {
      "id": 264,
      "code": "Linoone",
      "name": "直冲熊"
    },
    {
      "id": 265,
      "code": "Wurmple",
      "name": "刺尾虫"
    },
    {
      "id": 266,
      "code": "Silcoon",
      "name": "甲壳茧"
    },
    {
      "id": 267,
      "code": "Beautifly",
      "name": "狩猎凤蝶"
    },
    {
      "id": 268,
      "code": "Cascoon",
      "name": "盾甲茧"
    },
    {
      "id": 269,
      "code": "Dustox",
      "name": "毒粉蛾"
    },
    {
      "id": 270,
      "code": "Lotad",
      "name": "莲叶童子"
    },
    {
      "id": 271,
      "code": "Lombre",
      "name": "莲帽小童"
    },
    {
      "id": 272,
      "code": "Ludicolo",
      "name": "乐天河童"
    },
    {
      "id": 273,
      "code": "Seedot",
      "name": "橡实果"
    },
    {
      "id": 274,
      "code": "Nuzleaf",
      "name": "长鼻叶"
    },
    {
      "id": 275,
      "code": "Shiftry",
      "name": "狡猾天狗"
    },
    {
      "id": 276,
      "code": "Taillow",
      "name": "傲骨燕"
    },
    {
      "id": 277,
      "code": "Swellow",
      "name": "大王燕"
    },
    {
      "id": 278,
      "code": "Wingull",
      "name": "长翅鸥"
    },
    {
      "id": 279,
      "code": "Pelipper",
      "name": "大嘴鸥"
    },
    {
      "id": 280,
      "code": "Ralts",
      "name": "拉鲁拉丝"
    },
    {
      "id": 281,
      "code": "Kirlia",
      "name": "奇鲁莉安"
    },
    {
      "id": 282,
      "code": "Gardevoir",
      "name": "沙奈朵"
    },
    {
      "id": 283,
      "code": "Surskit",
      "name": "溜溜糖球"
    },
    {
      "id": 284,
      "code": "Masquerain",
      "name": "雨翅蛾"
    },
    {
      "id": 285,
      "code": "Shroomish",
      "name": "蘑蘑菇"
    },
    {
      "id": 286,
      "code": "Breloom",
      "name": "斗笠菇"
    },
    {
      "id": 287,
      "code": "Slakoth",
      "name": "懒人獭"
    },
    {
      "id": 288,
      "code": "Vigoroth",
      "name": "过动猿"
    },
    {
      "id": 289,
      "code": "Slaking",
      "name": "请假王"
    },
    {
      "id": 290,
      "code": "Nincada",
      "name": "土居忍士"
    },
    {
      "id": 291,
      "code": "Ninjask",
      "name": "铁面忍者"
    },
    {
      "id": 292,
      "code": "Shedinja",
      "name": "脱壳忍者"
    },
    {
      "id": 293,
      "code": "Whismur",
      "name": "咕妞妞"
    },
    {
      "id": 294,
      "code": "Loudred",
      "name": "吼爆弹"
    },
    {
      "id": 295,
      "code": "Exploud",
      "name": "爆音怪"
    },
    {
      "id": 296,
      "code": "Makuhita",
      "name": "幕下力士"
    },
    {
      "id": 297,
      "code": "Hariyama",
      "name": "铁掌力士"
    },
    {
      "id": 298,
      "code": "Azurill",
      "name": "露力丽"
    },
    {
      "id": 299,
      "code": "Nosepass",
      "name": "朝北鼻"
    },
    {
      "id": 300,
      "code": "Skitty",
      "name": "向尾喵"
    },
    {
      "id": 301,
      "code": "Delcatty",
      "name": "优雅猫"
    },
    {
      "id": 302,
      "code": "Sableye",
      "name": "勾魂眼"
    },
    {
      "id": 303,
      "code": "Mawile",
      "name": "大嘴娃"
    },
    {
      "id": 304,
      "code": "Aron",
      "name": "可可多拉"
    },
    {
      "id": 305,
      "code": "Lairon",
      "name": "可多拉"
    },
    {
      "id": 306,
      "code": "Aggron",
      "name": "波士可多拉"
    },
    {
      "id": 307,
      "code": "Meditite",
      "name": "玛沙那"
    },
    {
      "id": 308,
      "code": "Medicham",
      "name": "恰雷姆"
    },
    {
      "id": 309,
      "code": "Electrike",
      "name": "落雷兽"
    },
    {
      "id": 310,
      "code": "Manectric",
      "name": "雷电兽"
    },
    {
      "id": 311,
      "code": "Plusle",
      "name": "正电拍拍"
    },
    {
      "id": 312,
      "code": "Minun",
      "name": "负电拍拍"
    },
    {
      "id": 313,
      "code": "Volbeat",
      "name": "电萤虫"
    },
    {
      "id": 314,
      "code": "Illumise",
      "name": "甜甜萤"
    },
    {
      "id": 315,
      "code": "Roselia",
      "name": "毒蔷薇"
    },
    {
      "id": 316,
      "code": "Gulpin",
      "name": "溶食兽"
    },
    {
      "id": 317,
      "code": "Swalot",
      "name": "吞食兽"
    },
    {
      "id": 318,
      "code": "Carvanha",
      "name": "利牙鱼"
    },
    {
      "id": 319,
      "code": "Sharpedo",
      "name": "巨牙鲨"
    },
    {
      "id": 320,
      "code": "Wailmer",
      "name": "吼吼鲸"
    },
    {
      "id": 321,
      "code": "Wailord",
      "name": "吼鲸王"
    },
    {
      "id": 322,
      "code": "Numel",
      "name": "呆火驼"
    },
    {
      "id": 323,
      "code": "Camerupt",
      "name": "喷火驼"
    },
    {
      "id": 324,
      "code": "Torkoal",
      "name": "煤炭龟"
    },
    {
      "id": 325,
      "code": "Spoink",
      "name": "跳跳猪"
    },
    {
      "id": 326,
      "code": "Grumpig",
      "name": "噗噗猪"
    },
    {
      "id": 327,
      "code": "Spinda",
      "name": "晃晃斑"
    },
    {
      "id": 328,
      "code": "Trapinch",
      "name": "大颚蚁"
    },
    {
      "id": 329,
      "code": "Vibrava",
      "name": "超音波幼虫"
    },
    {
      "id": 330,
      "code": "Flygon",
      "name": "沙漠蜻蜓"
    },
    {
      "id": 331,
      "code": "Cacnea",
      "name": "刺球仙人掌"
    },
    {
      "id": 332,
      "code": "Cacturne",
      "name": "梦歌仙人掌"
    },
    {
      "id": 333,
      "code": "Swablu",
      "name": "青绵鸟"
    },
    {
      "id": 334,
      "code": "Altaria",
      "name": "七夕青鸟"
    },
    {
      "id": 335,
      "code": "Zangoose",
      "name": "猫鼬斩"
    },
    {
      "id": 336,
      "code": "Seviper",
      "name": "饭匙蛇"
    },
    {
      "id": 337,
      "code": "Lunatone",
      "name": "月石"
    },
    {
      "id": 338,
      "code": "Solrock",
      "name": "太阳岩"
    },
    {
      "id": 339,
      "code": "Barboach",
      "name": "泥泥鳅"
    },
    {
      "id": 340,
      "code": "Whiscash",
      "name": "鲶鱼王"
    },
    {
      "id": 341,
      "code": "Corphish",
      "name": "龙虾小兵"
    },
    {
      "id": 342,
      "code": "Crawdaunt",
      "name": "铁螯龙虾"
    },
    {
      "id": 343,
      "code": "Baltoy",
      "name": "天秤偶"
    },
    {
      "id": 344,
      "code": "Claydol",
      "name": "念力土偶"
    },
    {
      "id": 345,
      "code": "Lileep",
      "name": "触手百合"
    },
    {
      "id": 346,
      "code": "Cradily",
      "name": "摇篮百合"
    },
    {
      "id": 347,
      "code": "Anorith",
      "name": "太古羽虫"
    },
    {
      "id": 348,
      "code": "Armaldo",
      "name": "太古盔甲"
    },
    {
      "id": 349,
      "code": "Feebas",
      "name": "丑丑鱼"
    },
    {
      "id": 350,
      "code": "Milotic",
      "name": "美纳斯"
    },
    {
      "id": 351,
      "code": "Castform",
      "name": "飘浮泡泡"
    },
    {
      "id": 352,
      "code": "Kecleon",
      "name": "变隐龙"
    },
    {
      "id": 353,
      "code": "Shuppet",
      "name": "怨影娃娃"
    },
    {
      "id": 354,
      "code": "Banette",
      "name": "诅咒娃娃"
    },
    {
      "id": 355,
      "code": "Duskull",
      "name": "夜巡灵"
    },
    {
      "id": 356,
      "code": "Dusclops",
      "name": "彷徨夜灵"
    },
    {
      "id": 357,
      "code": "Tropius",
      "name": "热带龙"
    },
    {
      "id": 358,
      "code": "Chimecho",
      "name": "风铃铃"
    },
    {
      "id": 359,
      "code": "Absol",
      "name": "阿勃梭鲁"
    },
    {
      "id": 360,
      "code": "Wynaut",
      "name": "小果然"
    },
    {
      "id": 361,
      "code": "Snorunt",
      "name": "雪童子"
    },
    {
      "id": 362,
      "code": "Glalie",
      "name": "冰鬼护"
    },
    {
      "id": 363,
      "code": "Spheal",
      "name": "海豹球"
    },
    {
      "id": 364,
      "code": "Sealeo",
      "name": "海魔狮"
    },
    {
      "id": 365,
      "code": "Walrein",
      "name": "帝牙海狮"
    },
    {
      "id": 366,
      "code": "Clamperl",
      "name": "珍珠贝"
    },
    {
      "id": 367,
      "code": "Huntail",
      "name": "猎斑鱼"
    },
    {
      "id": 368,
      "code": "Gorebyss",
      "name": "樱花鱼"
    },
    {
      "id": 369,
      "code": "Relicanth",
      "name": "古空棘鱼"
    },
    {
      "id": 370,
      "code": "Luvdisc",
      "name": "爱心鱼"
    },
    {
      "id": 371,
      "code": "Bagon",
      "name": "宝贝龙"
    },
    {
      "id": 372,
      "code": "Shelgon",
      "name": "甲壳龙"
    },
    {
      "id": 373,
      "code": "Salamence",
      "name": "暴飞龙"
    },
    {
      "id": 374,
      "code": "Beldum",
      "name": "铁哑铃"
    },
    {
      "id": 375,
      "code": "Metang",
      "name": "金属怪"
    },
    {
      "id": 376,
      "code": "Metagross",
      "name": "巨金怪"
    },
    {
      "id": 377,
      "code": "Regirock",
      "name": "雷吉洛克"
    },
    {
      "id": 378,
      "code": "Regice",
      "name": "雷吉艾斯"
    },
    {
      "id": 379,
      "code": "Registeel",
      "name": "雷吉斯奇鲁"
    },
    {
      "id": 380,
      "code": "Latias",
      "name": "拉帝亚斯"
    },
    {
      "id": 381,
      "code": "Latios",
      "name": "拉帝欧斯"
    },
    {
      "id": 382,
      "code": "Kyogre",
      "name": "盖欧卡"
    },
    {
      "id": 383,
      "code": "Groudon",
      "name": "固拉多"
    },
    {
      "id": 384,
      "code": "Rayquaza",
      "name": "烈空坐"
    },
    {
      "id": 385,
      "code": "Jirachi",
      "name": "基拉祈"
    },
    {
      "id": 386,
      "code": "Deoxys",
      "name": "代欧奇希斯"
    },
    {
      "id": 387,
      "code": "Turtwig",
      "name": "草苗龟"
    },
    {
      "id": 388,
      "code": "Grotle",
      "name": "树林龟"
    },
    {
      "id": 389,
      "code": "Torterra",
      "name": "土台龟"
    },
    {
      "id": 390,
      "code": "Chimchar",
      "name": "小火焰猴"
    },
    {
      "id": 391,
      "code": "Monferno",
      "name": "猛火猴"
    },
    {
      "id": 392,
      "code": "Infernape",
      "name": "烈焰猴"
    },
    {
      "id": 393,
      "code": "Piplup",
      "name": "波加曼"
    },
    {
      "id": 394,
      "code": "Prinplup",
      "name": "波皇子"
    },
    {
      "id": 395,
      "code": "Empoleon",
      "name": "帝王拿波"
    },
    {
      "id": 396,
      "code": "Starly",
      "name": "姆克儿"
    },
    {
      "id": 397,
      "code": "Staravia",
      "name": "姆克鸟"
    },
    {
      "id": 398,
      "code": "Staraptor",
      "name": "姆克鹰"
    },
    {
      "id": 399,
      "code": "Bidoof",
      "name": "大牙狸"
    },
    {
      "id": 400,
      "code": "Bibarel",
      "name": "大尾狸"
    },
    {
      "id": 401,
      "code": "Kricketot",
      "name": "圆法师"
    },
    {
      "id": 402,
      "code": "Kricketune",
      "name": "音箱蟀"
    },
    {
      "id": 403,
      "code": "Shinx",
      "name": "小猫怪"
    },
    {
      "id": 404,
      "code": "Luxio",
      "name": "勒克猫"
    },
    {
      "id": 405,
      "code": "Luxray",
      "name": "伦琴猫"
    },
    {
      "id": 406,
      "code": "Budew",
      "name": "含羞苞"
    },
    {
      "id": 407,
      "code": "Roserade",
      "name": "罗丝雷朵"
    },
    {
      "id": 408,
      "code": "Cranidos",
      "name": "头盖龙"
    },
    {
      "id": 409,
      "code": "Rampardos",
      "name": "战槌龙"
    },
    {
      "id": 410,
      "code": "Shieldon",
      "name": "盾甲龙"
    },
    {
      "id": 411,
      "code": "Bastiodon",
      "name": "护城龙"
    },
    {
      "id": 412,
      "code": "Burmy",
      "name": "结草儿-草木蓑衣"
    },
    {
      "id": 413,
      "code": "Wormadam",
      "name": "结草贵妇-草木蓑衣"
    },
    {
      "id": 414,
      "code": "Mothim",
      "name": "绅士蛾"
    },
    {
      "id": 415,
      "code": "Combee",
      "name": "三蜜蜂"
    },
    {
      "id": 416,
      "code": "Vespiquen",
      "name": "蜂女王"
    },
    {
      "id": 417,
      "code": "Pachirisu",
      "name": "帕奇利兹"
    },
    {
      "id": 418,
      "code": "Buizel",
      "name": "泳圈鼬"
    },
    {
      "id": 419,
      "code": "Floatzel",
      "name": "浮潜鼬"
    },
    {
      "id": 420,
      "code": "Cherubi",
      "name": "樱花宝"
    },
    {
      "id": 421,
      "code": "Cherrim",
      "name": "樱花儿"
    },
    {
      "id": 422,
      "code": "Shellos",
      "name": "无壳海兔"
    },
    {
      "id": 423,
      "code": "Gastrodon",
      "name": "海兔兽"
    },
    {
      "id": 424,
      "code": "Ambipom",
      "name": "双尾怪手"
    },
    {
      "id": 425,
      "code": "Drifloon",
      "name": "飘飘球"
    },
    {
      "id": 426,
      "code": "Drifblim",
      "name": "随风球"
    },
    {
      "id": 427,
      "code": "Buneary",
      "name": "卷卷耳"
    },
    {
      "id": 428,
      "code": "Lopunny",
      "name": "长耳兔"
    },
    {
      "id": 429,
      "code": "Mismagius",
      "name": "梦妖魔"
    },
    {
      "id": 430,
      "code": "Honchkrow",
      "name": "乌鸦头头"
    },
    {
      "id": 431,
      "code": "Glameow",
      "name": "魅力喵"
    },
    {
      "id": 432,
      "code": "Purugly",
      "name": "东施喵"
    },
    {
      "id": 433,
      "code": "Chingling",
      "name": "铃铛响"
    },
    {
      "id": 434,
      "code": "Stunky",
      "name": "臭鼬噗"
    },
    {
      "id": 435,
      "code": "Skuntank",
      "name": "坦克臭鼬"
    },
    {
      "id": 436,
      "code": "Bronzor",
      "name": "铜镜怪"
    },
    {
      "id": 437,
      "code": "Bronzong",
      "name": "青铜钟"
    },
    {
      "id": 438,
      "code": "Bonsly",
      "name": "盆才怪"
    },
    {
      "id": 439,
      "code": "Mime Jr.",
      "name": "魔尼尼"
    },
    {
      "id": 440,
      "code": "Happiny",
      "name": "小福蛋"
    },
    {
      "id": 441,
      "code": "Chatot",
      "name": "聒噪鸟"
    },
    {
      "id": 442,
      "code": "Spiritomb",
      "name": "花岩怪"
    },
    {
      "id": 443,
      "code": "Gible",
      "name": "圆陆鲨"
    },
    {
      "id": 444,
      "code": "Gabite",
      "name": "尖牙陆鲨"
    },
    {
      "id": 445,
      "code": "Garchomp",
      "name": "烈咬陆鲨"
    },
    {
      "id": 446,
      "code": "Munchlax",
      "name": "小卡比兽"
    },
    {
      "id": 447,
      "code": "Riolu",
      "name": "利欧路"
    },
    {
      "id": 448,
      "code": "Lucario",
      "name": "路卡利欧"
    },
    {
      "id": 449,
      "code": "Hippopotas",
      "name": "沙河马"
    },
    {
      "id": 450,
      "code": "Hippowdon",
      "name": "河马兽"
    },
    {
      "id": 451,
      "code": "Skorupi",
      "name": "钳尾蝎"
    },
    {
      "id": 452,
      "code": "Drapion",
      "name": "龙王蝎"
    },
    {
      "id": 453,
      "code": "Croagunk",
      "name": "不良蛙"
    },
    {
      "id": 454,
      "code": "Toxicroak",
      "name": "毒骷蛙"
    },
    {
      "id": 455,
      "code": "Carnivine",
      "name": "尖牙笼"
    },
    {
      "id": 456,
      "code": "Finneon",
      "name": "荧光鱼"
    },
    {
      "id": 457,
      "code": "Lumineon",
      "name": "霓虹鱼"
    },
    {
      "id": 458,
      "code": "Mantyke",
      "name": "小球飞鱼"
    },
    {
      "id": 459,
      "code": "Snover",
      "name": "雪笠怪"
    },
    {
      "id": 460,
      "code": "Abomasnow",
      "name": "暴雪王"
    },
    {
      "id": 461,
      "code": "Weavile",
      "name": "玛狃拉"
    },
    {
      "id": 462,
      "code": "Magnezone",
      "name": "自爆磁怪"
    },
    {
      "id": 463,
      "code": "Lickilicky",
      "name": "大舌舔"
    },
    {
      "id": 464,
      "code": "Rhyperior",
      "name": "超甲狂犀"
    },
    {
      "id": 465,
      "code": "Tangrowth",
      "name": "巨蔓藤"
    },
    {
      "id": 466,
      "code": "Electivire",
      "name": "电击魔兽"
    },
    {
      "id": 467,
      "code": "Magmortar",
      "name": "鸭嘴炎兽"
    },
    {
      "id": 468,
      "code": "Togekiss",
      "name": "波克基斯"
    },
    {
      "id": 469,
      "code": "Yanmega",
      "name": "远古巨蜓"
    },
    {
      "id": 470,
      "code": "Leafeon",
      "name": "叶伊布"
    },
    {
      "id": 471,
      "code": "Glaceon",
      "name": "冰伊布"
    },
    {
      "id": 472,
      "code": "Gliscor",
      "name": "天蝎王"
    },
    {
      "id": 473,
      "code": "Mamoswine",
      "name": "象牙猪"
    },
    {
      "id": 474,
      "code": "Porygon-Z",
      "name": "多边兽Ｚ"
    },
    {
      "id": 475,
      "code": "Gallade",
      "name": "艾路雷朵"
    },
    {
      "id": 476,
      "code": "Probopass",
      "name": "大朝北鼻"
    },
    {
      "id": 477,
      "code": "Dusknoir",
      "name": "黑夜魔灵"
    },
    {
      "id": 478,
      "code": "Froslass",
      "name": "雪妖女"
    },
    {
      "id": 479,
      "code": "Rotom",
      "name": "洛托姆"
    },
    {
      "id": 480,
      "code": "Uxie",
      "name": "由克希"
    },
    {
      "id": 481,
      "code": "Mesprit",
      "name": "艾姆利多"
    },
    {
      "id": 482,
      "code": "Azelf",
      "name": "亚克诺姆"
    },
    {
      "id": 483,
      "code": "Dialga",
      "name": "帝牙卢卡"
    },
    {
      "id": 484,
      "code": "Palkia",
      "name": "帕路奇亚"
    },
    {
      "id": 485,
      "code": "Heatran",
      "name": "席多蓝恩"
    },
    {
      "id": 486,
      "code": "Regigigas",
      "name": "雷吉奇卡斯"
    },
    {
      "id": 487,
      "code": "Giratina",
      "name": "骑拉帝纳"
    },
    {
      "id": 488,
      "code": "Cresselia",
      "name": "克雷色利亚"
    },
    {
      "id": 489,
      "code": "Phione",
      "name": "霏欧纳"
    },
    {
      "id": 490,
      "code": "Manaphy",
      "name": "玛纳霏"
    },
    {
      "id": 491,
      "code": "Darkrai",
      "name": "达克莱伊"
    },
    {
      "id": 492,
      "code": "Shaymin",
      "name": "谢米"
    },
    {
      "id": 493,
      "code": "Arceus",
      "name": "阿尔宙斯"
    },
    {
      "id": 494,
      "code": "Victini",
      "name": "比克提尼"
    },
    {
      "id": 495,
      "code": "Snivy",
      "name": "藤藤蛇"
    },
    {
      "id": 496,
      "code": "Servine",
      "name": "青藤蛇"
    },
    {
      "id": 497,
      "code": "Serperior",
      "name": "君主蛇"
    },
    {
      "id": 498,
      "code": "Tepig",
      "name": "暖暖猪"
    },
    {
      "id": 499,
      "code": "Pignite",
      "name": "炒炒猪"
    },
    {
      "id": 500,
      "code": "Emboar",
      "name": "炎武王"
    },
    {
      "id": 501,
      "code": "Oshawott",
      "name": "水水獭"
    },
    {
      "id": 502,
      "code": "Dewott",
      "name": "双刃丸"
    },
    {
      "id": 503,
      "code": "Samurott",
      "name": "大剑鬼"
    },
    {
      "id": 504,
      "code": "Patrat",
      "name": "探探鼠"
    },
    {
      "id": 505,
      "code": "Watchog",
      "name": "步哨鼠"
    },
    {
      "id": 506,
      "code": "Lillipup",
      "name": "小约克"
    },
    {
      "id": 507,
      "code": "Herdier",
      "name": "哈约克"
    },
    {
      "id": 508,
      "code": "Stoutland",
      "name": "长毛狗"
    },
    {
      "id": 509,
      "code": "Purrloin",
      "name": "扒手猫"
    },
    {
      "id": 510,
      "code": "Liepard",
      "name": "酷豹"
    },
    {
      "id": 511,
      "code": "Pansage",
      "name": "花椰猴"
    },
    {
      "id": 512,
      "code": "Simisage",
      "name": "花椰猿"
    },
    {
      "id": 513,
      "code": "Pansear",
      "name": "爆香猴"
    },
    {
      "id": 514,
      "code": "Simisear",
      "name": "爆香猿"
    },
    {
      "id": 515,
      "code": "Panpour",
      "name": "冷水猴"
    },
    {
      "id": 516,
      "code": "Simipour",
      "name": "冷水猿"
    },
    {
      "id": 517,
      "code": "Munna",
      "name": "食梦梦"
    },
    {
      "id": 518,
      "code": "Musharna",
      "name": "梦梦蚀"
    },
    {
      "id": 519,
      "code": "Pidove",
      "name": "豆豆鸽"
    },
    {
      "id": 520,
      "code": "Tranquill",
      "name": "咕咕鸽"
    },
    {
      "id": 521,
      "code": "Unfezant",
      "name": "高傲雉鸡"
    },
    {
      "id": 522,
      "code": "Blitzle",
      "name": "斑斑马"
    },
    {
      "id": 523,
      "code": "Zebstrika",
      "name": "雷电斑马"
    },
    {
      "id": 524,
      "code": "Roggenrola",
      "name": "石丸子"
    },
    {
      "id": 525,
      "code": "Boldore",
      "name": "地幔岩"
    },
    {
      "id": 526,
      "code": "Gigalith",
      "name": "庞岩怪"
    },
    {
      "id": 527,
      "code": "Woobat",
      "name": "滚滚蝙蝠"
    },
    {
      "id": 528,
      "code": "Swoobat",
      "name": "心蝙蝠"
    },
    {
      "id": 529,
      "code": "Drilbur",
      "name": "螺钉地鼠"
    },
    {
      "id": 530,
      "code": "Excadrill",
      "name": "龙头地鼠"
    },
    {
      "id": 531,
      "code": "Audino",
      "name": "差不多娃娃"
    },
    {
      "id": 532,
      "code": "Timburr",
      "name": "搬运小匠"
    },
    {
      "id": 533,
      "code": "Gurdurr",
      "name": "铁骨土人"
    },
    {
      "id": 534,
      "code": "Conkeldurr",
      "name": "修建老匠"
    },
    {
      "id": 535,
      "code": "Tympole",
      "name": "圆蝌蚪"
    },
    {
      "id": 536,
      "code": "Palpitoad",
      "name": "蓝蟾蜍"
    },
    {
      "id": 537,
      "code": "Seismitoad",
      "name": "蟾蜍王"
    },
    {
      "id": 538,
      "code": "Throh",
      "name": "投摔鬼"
    },
    {
      "id": 539,
      "code": "Sawk",
      "name": "打击鬼"
    },
    {
      "id": 540,
      "code": "Sewaddle",
      "name": "虫宝包"
    },
    {
      "id": 541,
      "code": "Swadloon",
      "name": "宝包茧"
    },
    {
      "id": 542,
      "code": "Leavanny",
      "name": "保姆虫"
    },
    {
      "id": 543,
      "code": "Venipede",
      "name": "百足蜈蚣"
    },
    {
      "id": 544,
      "code": "Whirlipede",
      "name": "车轮球"
    },
    {
      "id": 545,
      "code": "Scolipede",
      "name": "蜈蚣王"
    },
    {
      "id": 546,
      "code": "Cottonee",
      "name": "木棉球"
    },
    {
      "id": 547,
      "code": "Whimsicott",
      "name": "风妖精"
    },
    {
      "id": 548,
      "code": "Petilil",
      "name": "百合根娃娃"
    },
    {
      "id": 549,
      "code": "Lilligant",
      "name": "裙儿小姐"
    },
    {
      "id": 550,
      "code": "Basculin",
      "name": "野蛮鲈鱼"
    },
    {
      "id": 551,
      "code": "Sandile",
      "name": "黑眼鳄"
    },
    {
      "id": 552,
      "code": "Krokorok",
      "name": "混混鳄"
    },
    {
      "id": 553,
      "code": "Krookodile",
      "name": "流氓鳄"
    },
    {
      "id": 554,
      "code": "Darumaka",
      "name": "火红不倒翁"
    },
    {
      "id": 555,
      "code": "Darmanitan",
      "name": "达摩狒狒"
    },
    {
      "id": 556,
      "code": "Maractus",
      "name": "沙铃仙人掌"
    },
    {
      "id": 557,
      "code": "Dwebble",
      "name": "石居蟹"
    },
    {
      "id": 558,
      "code": "Crustle",
      "name": "岩殿居蟹"
    },
    {
      "id": 559,
      "code": "Scraggy",
      "name": "滑滑小子"
    },
    {
      "id": 560,
      "code": "Scrafty",
      "name": "头巾混混"
    },
    {
      "id": 561,
      "code": "Sigilyph",
      "name": "象征鸟"
    },
    {
      "id": 562,
      "code": "Yamask",
      "name": "哭哭面具"
    },
    {
      "id": 563,
      "code": "Cofagrigus",
      "name": "死神棺"
    },
    {
      "id": 564,
      "code": "Tirtouga",
      "name": "原盖海龟"
    },
    {
      "id": 565,
      "code": "Carracosta",
      "name": "肋骨海龟"
    },
    {
      "id": 566,
      "code": "Archen",
      "name": "始祖小鸟"
    },
    {
      "id": 567,
      "code": "Archeops",
      "name": "始祖大鸟"
    },
    {
      "id": 568,
      "code": "Trubbish",
      "name": "破破袋"
    },
    {
      "id": 569,
      "code": "Garbodor",
      "name": "灰尘山"
    },
    {
      "id": 570,
      "code": "Zorua",
      "name": "索罗亚"
    },
    {
      "id": 571,
      "code": "Zoroark",
      "name": "索罗亚克"
    },
    {
      "id": 572,
      "code": "Minccino",
      "name": "泡沫栗鼠"
    },
    {
      "id": 573,
      "code": "Cinccino",
      "name": "奇诺栗鼠"
    },
    {
      "id": 574,
      "code": "Gothita",
      "name": "哥德宝宝"
    },
    {
      "id": 575,
      "code": "Gothorita",
      "name": "哥德小童"
    },
    {
      "id": 576,
      "code": "Gothitelle",
      "name": "哥德小姐"
    },
    {
      "id": 577,
      "code": "Solosis",
      "name": "单卵细胞球"
    },
    {
      "id": 578,
      "code": "Duosion",
      "name": "双卵细胞球"
    },
    {
      "id": 579,
      "code": "Reuniclus",
      "name": "人造细胞卵"
    },
    {
      "id": 580,
      "code": "Ducklett",
      "name": "鸭宝宝"
    },
    {
      "id": 581,
      "code": "Swanna",
      "name": "舞天鹅"
    },
    {
      "id": 582,
      "code": "Vanillite",
      "name": "迷你冰"
    },
    {
      "id": 583,
      "code": "Vanillish",
      "name": "多多冰"
    },
    {
      "id": 584,
      "code": "Vanilluxe",
      "name": "双倍多多冰"
    },
    {
      "id": 585,
      "code": "Deerling",
      "name": "四季鹿-春"
    },
    {
      "id": 586,
      "code": "Sawsbuck",
      "name": "萌芽鹿-春"
    },
    {
      "id": 587,
      "code": "Emolga",
      "name": "电飞鼠"
    },
    {
      "id": 588,
      "code": "Karrablast",
      "name": "盖盖虫"
    },
    {
      "id": 589,
      "code": "Escavalier",
      "name": "骑士蜗牛"
    },
    {
      "id": 590,
      "code": "Foongus",
      "name": "哎呀球菇"
    },
    {
      "id": 591,
      "code": "Amoonguss",
      "name": "败露球菇"
    },
    {
      "id": 592,
      "code": "Frillish",
      "name": "轻飘飘"
    },
    {
      "id": 593,
      "code": "Jellicent",
      "name": "胖嘟嘟"
    },
    {
      "id": 594,
      "code": "Alomomola",
      "name": "保姆曼波"
    },
    {
      "id": 595,
      "code": "Joltik",
      "name": "电电虫"
    },
    {
      "id": 596,
      "code": "Galvantula",
      "name": "电蜘蛛"
    },
    {
      "id": 597,
      "code": "Ferroseed",
      "name": "种子铁球"
    },
    {
      "id": 598,
      "code": "Ferrothorn",
      "name": "坚果哑铃"
    },
    {
      "id": 599,
      "code": "Klink",
      "name": "齿轮儿"
    },
    {
      "id": 600,
      "code": "Klang",
      "name": "齿轮组"
    },
    {
      "id": 601,
      "code": "Klinklang",
      "name": "齿轮怪"
    },
    {
      "id": 602,
      "code": "Tynamo",
      "name": "麻麻小鱼"
    },
    {
      "id": 603,
      "code": "Eelektrik",
      "name": "麻麻鳗"
    },
    {
      "id": 604,
      "code": "Eelektross",
      "name": "麻麻鳗鱼王"
    },
    {
      "id": 605,
      "code": "Elgyem",
      "name": "小灰怪"
    },
    {
      "id": 606,
      "code": "Beheeyem",
      "name": "大宇怪"
    },
    {
      "id": 607,
      "code": "Litwick",
      "name": "烛光灵"
    },
    {
      "id": 608,
      "code": "Lampent",
      "name": "灯火幽灵"
    },
    {
      "id": 609,
      "code": "Chandelure",
      "name": "水晶灯火灵"
    },
    {
      "id": 610,
      "code": "Axew",
      "name": "牙牙"
    },
    {
      "id": 611,
      "code": "Fraxure",
      "name": "斧牙龙"
    },
    {
      "id": 612,
      "code": "Haxorus",
      "name": "双斧战龙"
    },
    {
      "id": 613,
      "code": "Cubchoo",
      "name": "喷嚏熊"
    },
    {
      "id": 614,
      "code": "Beartic",
      "name": "冻原熊"
    },
    {
      "id": 615,
      "code": "Cryogonal",
      "name": "几何雪花"
    },
    {
      "id": 616,
      "code": "Shelmet",
      "name": "小嘴蜗"
    },
    {
      "id": 617,
      "code": "Accelgor",
      "name": "敏捷虫"
    },
    {
      "id": 618,
      "code": "Stunfisk",
      "name": "泥巴鱼"
    },
    {
      "id": 619,
      "code": "Mienfoo",
      "name": "功夫鼬"
    },
    {
      "id": 620,
      "code": "Mienshao",
      "name": "师父鼬"
    },
    {
      "id": 621,
      "code": "Druddigon",
      "name": "赤面龙"
    },
    {
      "id": 622,
      "code": "Golett",
      "name": "泥偶小人"
    },
    {
      "id": 623,
      "code": "Golurk",
      "name": "泥偶巨人"
    },
    {
      "id": 624,
      "code": "Pawniard",
      "name": "驹刀小兵"
    },
    {
      "id": 625,
      "code": "Bisharp",
      "name": "劈斩司令"
    },
    {
      "id": 626,
      "code": "Bouffalant",
      "name": "爆炸头水牛"
    },
    {
      "id": 627,
      "code": "Rufflet",
      "name": "毛头小鹰"
    },
    {
      "id": 628,
      "code": "Braviary",
      "name": "勇士雄鹰"
    },
    {
      "id": 629,
      "code": "Vullaby",
      "name": "秃鹰丫头"
    },
    {
      "id": 630,
      "code": "Mandibuzz",
      "name": "秃鹰娜"
    },
    {
      "id": 631,
      "code": "Heatmor",
      "name": "熔蚁兽"
    },
    {
      "id": 632,
      "code": "Durant",
      "name": "铁蚁"
    },
    {
      "id": 633,
      "code": "Deino",
      "name": "单首龙"
    },
    {
      "id": 634,
      "code": "Zweilous",
      "name": "双首暴龙"
    },
    {
      "id": 635,
      "code": "Hydreigon",
      "name": "三首恶龙"
    },
    {
      "id": 636,
      "code": "Larvesta",
      "name": "燃烧虫"
    },
    {
      "id": 637,
      "code": "Volcarona",
      "name": "火神蛾"
    },
    {
      "id": 638,
      "code": "Cobalion",
      "name": "勾帕路翁"
    },
    {
      "id": 639,
      "code": "Terrakion",
      "name": "代拉基翁"
    },
    {
      "id": 640,
      "code": "Virizion",
      "name": "毕力吉翁"
    },
    {
      "id": 641,
      "code": "Tornadus",
      "name": "龙卷云"
    },
    {
      "id": 642,
      "code": "Thundurus",
      "name": "雷电云"
    },
    {
      "id": 643,
      "code": "Reshiram",
      "name": "莱希拉姆"
    },
    {
      "id": 644,
      "code": "Zekrom",
      "name": "捷克罗姆"
    },
    {
      "id": 645,
      "code": "Landorus",
      "name": "土地云"
    },
    {
      "id": 646,
      "code": "Kyurem",
      "name": "酋雷姆"
    },
    {
      "id": 647,
      "code": "Keldeo",
      "name": "凯路迪欧"
    },
    {
      "id": 648,
      "code": "Meloetta",
      "name": "美洛耶塔"
    },
    {
      "id": 649,
      "code": "Genesect",
      "name": "盖诺赛克特"
    },
    {
      "id": 650,
      "code": "Chespin",
      "name": "哈力栗"
    },
    {
      "id": 651,
      "code": "Quilladin",
      "name": "胖胖哈力"
    },
    {
      "id": 652,
      "code": "Chesnaught",
      "name": "布里卡隆"
    },
    {
      "id": 653,
      "code": "Fennekin",
      "name": "火狐狸"
    },
    {
      "id": 654,
      "code": "Braixen",
      "name": "长尾火狐"
    },
    {
      "id": 655,
      "code": "Delphox",
      "name": "妖火红狐"
    },
    {
      "id": 656,
      "code": "Froakie",
      "name": "呱呱泡蛙"
    },
    {
      "id": 657,
      "code": "Frogadier",
      "name": "呱头蛙"
    },
    {
      "id": 658,
      "code": "Greninja",
      "name": "甲贺忍蛙"
    },
    {
      "id": 659,
      "code": "Bunnelby",
      "name": "掘掘兔"
    },
    {
      "id": 660,
      "code": "Diggersby",
      "name": "掘地兔"
    },
    {
      "id": 661,
      "code": "Fletchling",
      "name": "小箭雀"
    },
    {
      "id": 662,
      "code": "Fletchinder",
      "name": "火箭雀"
    },
    {
      "id": 663,
      "code": "Talonflame",
      "name": "烈箭鹰"
    },
    {
      "id": 664,
      "code": "Scatterbug",
      "name": "粉蝶虫"
    },
    {
      "id": 665,
      "code": "Spewpa",
      "name": "粉蝶蛹"
    },
    {
      "id": 666,
      "code": "Vivillon",
      "name": "彩粉蝶"
    },
    {
      "id": 667,
      "code": "Litleo",
      "name": "小狮狮"
    },
    {
      "id": 668,
      "code": "Pyroar",
      "name": "火炎狮"
    },
    {
      "id": 669,
      "code": "Flabébé",
      "name": "花蓓蓓"
    },
    {
      "id": 670,
      "code": "Floette",
      "name": "花叶蒂"
    },
    {
      "id": 671,
      "code": "Florges",
      "name": "花洁夫人"
    },
    {
      "id": 672,
      "code": "Skiddo",
      "name": "坐骑小羊"
    },
    {
      "id": 673,
      "code": "Gogoat",
      "name": "坐骑山羊"
    },
    {
      "id": 674,
      "code": "Pancham",
      "name": "顽皮熊猫"
    },
    {
      "id": 675,
      "code": "Pangoro",
      "name": "流氓熊猫"
    },
    {
      "id": 676,
      "code": "Furfrou",
      "name": "多丽米亚"
    },
    {
      "id": 677,
      "code": "Espurr",
      "name": "妙喵"
    },
    {
      "id": 678,
      "code": "Meowstic",
      "name": "超能妙喵"
    },
    {
      "id": 679,
      "code": "Honedge",
      "name": "独剑鞘"
    },
    {
      "id": 680,
      "code": "Doublade",
      "name": "双剑鞘"
    },
    {
      "id": 681,
      "code": "Aegislash-Both",
      "name": "坚盾剑怪"
    },
    {
      "id": 682,
      "code": "Spritzee",
      "name": "粉香香"
    },
    {
      "id": 683,
      "code": "Aromatisse",
      "name": "芳香精"
    },
    {
      "id": 684,
      "code": "Swirlix",
      "name": "绵绵泡芙"
    },
    {
      "id": 685,
      "code": "Slurpuff",
      "name": "胖甜妮"
    },
    {
      "id": 686,
      "code": "Inkay",
      "name": "好啦鱿"
    },
    {
      "id": 687,
      "code": "Malamar",
      "name": "乌贼王"
    },
    {
      "id": 688,
      "code": "Binacle",
      "name": "龟脚脚"
    },
    {
      "id": 689,
      "code": "Barbaracle",
      "name": "龟足巨铠"
    },
    {
      "id": 690,
      "code": "Skrelp",
      "name": "垃垃藻"
    },
    {
      "id": 691,
      "code": "Dragalge",
      "name": "毒藻龙"
    },
    {
      "id": 692,
      "code": "Clauncher",
      "name": "铁臂枪虾"
    },
    {
      "id": 693,
      "code": "Clawitzer",
      "name": "钢炮臂虾"
    },
    {
      "id": 694,
      "code": "Helioptile",
      "name": "伞电蜥"
    },
    {
      "id": 695,
      "code": "Heliolisk",
      "name": "光电伞蜥"
    },
    {
      "id": 696,
      "code": "Tyrunt",
      "name": "宝宝暴龙"
    },
    {
      "id": 697,
      "code": "Tyrantrum",
      "name": "怪颚龙"
    },
    {
      "id": 698,
      "code": "Amaura",
      "name": "冰雪龙"
    },
    {
      "id": 699,
      "code": "Aurorus",
      "name": "冰雪巨龙"
    },
    {
      "id": 700,
      "code": "Sylveon",
      "name": "仙子伊布"
    },
    {
      "id": 701,
      "code": "Hawlucha",
      "name": "摔角鹰人"
    },
    {
      "id": 702,
      "code": "Dedenne",
      "name": "咚咚鼠"
    },
    {
      "id": 703,
      "code": "Carbink",
      "name": "小碎钻"
    },
    {
      "id": 704,
      "code": "Goomy",
      "name": "黏黏宝"
    },
    {
      "id": 705,
      "code": "Sliggoo",
      "name": "黏美儿"
    },
    {
      "id": 706,
      "code": "Goodra",
      "name": "黏美龙"
    },
    {
      "id": 707,
      "code": "Klefki",
      "name": "钥圈儿"
    },
    {
      "id": 708,
      "code": "Phantump",
      "name": "小木灵"
    },
    {
      "id": 709,
      "code": "Trevenant",
      "name": "朽木妖"
    },
    {
      "id": 710,
      "code": "Pumpkaboo",
      "name": "南瓜精"
    },
    {
      "id": 711,
      "code": "Gourgeist",
      "name": "南瓜怪人"
    },
    {
      "id": 712,
      "code": "Bergmite",
      "name": "冰宝"
    },
    {
      "id": 713,
      "code": "Avalugg",
      "name": "冰岩怪"
    },
    {
      "id": 714,
      "code": "Noibat",
      "name": "嗡蝠"
    },
    {
      "id": 715,
      "code": "Noivern",
      "name": "音波龙"
    },
    {
      "id": 716,
      "code": "Xerneas",
      "name": "哲尔尼亚斯"
    },
    {
      "id": 717,
      "code": "Yveltal",
      "name": "伊裴尔塔尔"
    },
    {
      "id": 718,
      "code": "Zygarde",
      "name": "基格尔德"
    },
    {
      "id": 719,
      "code": "Diancie",
      "name": "蒂安希"
    },
    {
      "id": 720,
      "code": "Hoopa",
      "name": "胡帕"
    },
    {
      "id": 721,
      "code": "Volcanion",
      "name": "波尔凯尼恩"
    },
    {
      "id": 722,
      "code": "Rowlet",
      "name": "木木枭"
    },
    {
      "id": 723,
      "code": "Dartrix",
      "name": "投羽枭"
    },
    {
      "id": 724,
      "code": "Decidueye",
      "name": "狙射树枭"
    },
    {
      "id": 725,
      "code": "Litten",
      "name": "火斑喵"
    },
    {
      "id": 726,
      "code": "Torracat",
      "name": "炎热喵"
    },
    {
      "id": 727,
      "code": "Incineroar",
      "name": "炽焰咆哮虎"
    },
    {
      "id": 728,
      "code": "Popplio",
      "name": "球球海狮"
    },
    {
      "id": 729,
      "code": "Brionne",
      "name": "花漾海狮"
    },
    {
      "id": 730,
      "code": "Primarina",
      "name": "西狮海壬"
    },
    {
      "id": 731,
      "code": "Pikipek",
      "name": "小笃儿"
    },
    {
      "id": 732,
      "code": "Trumbeak",
      "name": "喇叭啄鸟"
    },
    {
      "id": 733,
      "code": "Toucannon",
      "name": "铳嘴大鸟"
    },
    {
      "id": 734,
      "code": "Yungoos",
      "name": "猫鼬少"
    },
    {
      "id": 735,
      "code": "Gumshoos",
      "name": "猫鼬探长"
    },
    {
      "id": 736,
      "code": "Grubbin",
      "name": "强颚鸡母虫"
    },
    {
      "id": 737,
      "code": "Charjabug",
      "name": "虫电宝"
    },
    {
      "id": 738,
      "code": "Vikavolt",
      "name": "锹农炮虫"
    },
    {
      "id": 739,
      "code": "Crabrawler",
      "name": "好胜蟹"
    },
    {
      "id": 740,
      "code": "Crabominable",
      "name": "好胜毛蟹"
    },
    {
      "id": 741,
      "code": "Oricorio",
      "name": "花舞鸟-热辣热辣风格"
    },
    {
      "id": 742,
      "code": "Cutiefly",
      "name": "萌虻"
    },
    {
      "id": 743,
      "code": "Ribombee",
      "name": "蝶结萌虻"
    },
    {
      "id": 744,
      "code": "Rockruff",
      "name": "岩狗狗"
    },
    {
      "id": 745,
      "code": "Lycanroc",
      "name": "鬃岩狼人"
    },
    {
      "id": 746,
      "code": "Wishiwashi",
      "name": "弱丁鱼"
    },
    {
      "id": 747,
      "code": "Mareanie",
      "name": "好坏星"
    },
    {
      "id": 748,
      "code": "Toxapex",
      "name": "超坏星"
    },
    {
      "id": 749,
      "code": "Mudbray",
      "name": "泥驴仔"
    },
    {
      "id": 750,
      "code": "Mudsdale",
      "name": "重泥挽马"
    },
    {
      "id": 751,
      "code": "Dewpider",
      "name": "滴蛛"
    },
    {
      "id": 752,
      "code": "Araquanid",
      "name": "滴蛛霸"
    },
    {
      "id": 753,
      "code": "Fomantis",
      "name": "伪螳草"
    },
    {
      "id": 754,
      "code": "Lurantis",
      "name": "兰螳花"
    },
    {
      "id": 755,
      "code": "Morelull",
      "name": "睡睡菇"
    },
    {
      "id": 756,
      "code": "Shiinotic",
      "name": "灯罩夜菇"
    },
    {
      "id": 757,
      "code": "Salandit",
      "name": "夜盗火蜥"
    },
    {
      "id": 758,
      "code": "Salazzle",
      "name": "焰后蜥"
    },
    {
      "id": 759,
      "code": "Stufful",
      "name": "童偶熊"
    },
    {
      "id": 760,
      "code": "Bewear",
      "name": "穿着熊"
    },
    {
      "id": 761,
      "code": "Bounsweet",
      "name": "甜竹竹"
    },
    {
      "id": 762,
      "code": "Steenee",
      "name": "甜舞妮"
    },
    {
      "id": 763,
      "code": "Tsareena",
      "name": "甜冷美后"
    },
    {
      "id": 764,
      "code": "Comfey",
      "name": "花疗环环"
    },
    {
      "id": 765,
      "code": "Oranguru",
      "name": "智挥猩"
    },
    {
      "id": 766,
      "code": "Passimian",
      "name": "投掷猴"
    },
    {
      "id": 767,
      "code": "Wimpod",
      "name": "胆小虫"
    },
    {
      "id": 768,
      "code": "Golisopod",
      "name": "具甲武者"
    },
    {
      "id": 769,
      "code": "Sandygast",
      "name": "沙丘娃"
    },
    {
      "id": 770,
      "code": "Palossand",
      "name": "噬沙堡爷"
    },
    {
      "id": 771,
      "code": "Pyukumuku",
      "name": "拳海参"
    },
    {
      "id": 772,
      "code": "Type: Null",
      "name": "属性：空"
    },
    {
      "id": 773,
      "code": "Silvally",
      "name": "银伴战兽"
    },
    {
      "id": 774,
      "code": "Minior",
      "name": "小陨星-外壳"
    },
    {
      "id": 775,
      "code": "Komala",
      "name": "树枕尾熊"
    },
    {
      "id": 776,
      "code": "Turtonator",
      "name": "爆焰龟兽"
    },
    {
      "id": 777,
      "code": "Togedemaru",
      "name": "托戈德玛尔"
    },
    {
      "id": 778,
      "code": "Mimikyu",
      "name": "谜拟Ｑ"
    },
    {
      "id": 779,
      "code": "Bruxish",
      "name": "磨牙彩皮鱼"
    },
    {
      "id": 780,
      "code": "Drampa",
      "name": "老翁龙"
    },
    {
      "id": 781,
      "code": "Dhelmise",
      "name": "破破舵轮"
    },
    {
      "id": 782,
      "code": "Jangmo-o",
      "name": "心鳞宝"
    },
    {
      "id": 783,
      "code": "Hakamo-o",
      "name": "鳞甲龙"
    },
    {
      "id": 784,
      "code": "Kommo-o",
      "name": "杖尾鳞甲龙"
    },
    {
      "id": 785,
      "code": "Tapu Koko",
      "name": "卡璞・鸣鸣"
    },
    {
      "id": 786,
      "code": "Tapu Lele",
      "name": "卡璞・蝶蝶"
    },
    {
      "id": 787,
      "code": "Tapu Bulu",
      "name": "卡璞・哞哞"
    },
    {
      "id": 788,
      "code": "Tapu Fini",
      "name": "卡璞・鳍鳍"
    },
    {
      "id": 789,
      "code": "Cosmog",
      "name": "科斯莫古"
    },
    {
      "id": 790,
      "code": "Cosmoem",
      "name": "科斯莫姆"
    },
    {
      "id": 791,
      "code": "Solgaleo",
      "name": "索尔迦雷欧"
    },
    {
      "id": 792,
      "code": "Lunala",
      "name": "露奈雅拉"
    },
    {
      "id": 793,
      "code": "Nihilego",
      "name": "虚吾伊德"
    },
    {
      "id": 794,
      "code": "Buzzwole",
      "name": "爆肌蚊"
    },
    {
      "id": 795,
      "code": "Pheromosa",
      "name": "费洛美螂"
    },
    {
      "id": 796,
      "code": "Xurkitree",
      "name": "电束木"
    },
    {
      "id": 797,
      "code": "Celesteela",
      "name": "铁火辉夜"
    },
    {
      "id": 798,
      "code": "Kartana",
      "name": "纸御剑"
    },
    {
      "id": 799,
      "code": "Guzzlord",
      "name": "恶食大王"
    },
    {
      "id": 800,
      "code": "Necrozma",
      "name": "奈克洛兹玛"
    },
    {
      "id": 801,
      "code": "Magearna",
      "name": "玛机雅娜"
    },
    {
      "id": 802,
      "code": "Marshadow",
      "name": "玛夏多"
    },
    {
      "id": 803,
      "code": "Poipole",
      "name": "毒贝比"
    },
    {
      "id": 804,
      "code": "Naganadel",
      "name": "四颚针龙"
    },
    {
      "id": 805,
      "code": "Stakataka",
      "name": "垒磊石"
    },
    {
      "id": 806,
      "code": "Blacephalon",
      "name": "砰头小丑"
    },
    {
      "id": 807,
      "code": "Zeraora",
      "name": "捷拉奥拉"
    },
    {
      "id": 808,
      "code": "Meltan",
      "name": "美录坦"
    },
    {
      "id": 809,
      "code": "Melmetal",
      "name": "美录梅塔"
    },
    {
      "id": 810,
      "code": "Grookey",
      "name": "敲音猴"
    },
    {
      "id": 811,
      "code": "Thwackey",
      "name": "啪咚猴"
    },
    {
      "id": 812,
      "code": "Rillaboom",
      "name": "轰擂金刚猩"
    },
    {
      "id": 813,
      "code": "Scorbunny",
      "name": "炎兔儿"
    },
    {
      "id": 814,
      "code": "Raboot",
      "name": "腾蹴小将"
    },
    {
      "id": 815,
      "code": "Cinderace",
      "name": "闪焰王牌"
    },
    {
      "id": 816,
      "code": "Sobble",
      "name": "泪眼蜥"
    },
    {
      "id": 817,
      "code": "Drizzile",
      "name": "变涩蜥"
    },
    {
      "id": 818,
      "code": "Inteleon",
      "name": "千面避役"
    },
    {
      "id": 819,
      "code": "Skwovet",
      "name": "贪心栗鼠"
    },
    {
      "id": 820,
      "code": "Greedent",
      "name": "藏饱栗鼠"
    },
    {
      "id": 821,
      "code": "Rookidee",
      "name": "稚山雀"
    },
    {
      "id": 822,
      "code": "Corvisquire",
      "name": "蓝鸦"
    },
    {
      "id": 823,
      "code": "Corviknight",
      "name": "钢铠鸦"
    },
    {
      "id": 824,
      "code": "Blipbug",
      "name": "索侦虫"
    },
    {
      "id": 825,
      "code": "Dottler",
      "name": "天罩虫"
    },
    {
      "id": 826,
      "code": "Orbeetle",
      "name": "以欧路普"
    },
    {
      "id": 827,
      "code": "Nickit",
      "name": "狡小狐"
    },
    {
      "id": 828,
      "code": "Thievul",
      "name": "猾大狐"
    },
    {
      "id": 829,
      "code": "Gossifleur",
      "name": "幼棉棉"
    },
    {
      "id": 830,
      "code": "Eldegoss",
      "name": "白蓬蓬"
    },
    {
      "id": 831,
      "code": "Wooloo",
      "name": "毛辫羊"
    },
    {
      "id": 832,
      "code": "Dubwool",
      "name": "毛毛角羊"
    },
    {
      "id": 833,
      "code": "Chewtle",
      "name": "咬咬龟"
    },
    {
      "id": 834,
      "code": "Drednaw",
      "name": "暴噬龟"
    },
    {
      "id": 835,
      "code": "Yamper",
      "name": "来电汪"
    },
    {
      "id": 836,
      "code": "Boltund",
      "name": "逐电犬"
    },
    {
      "id": 837,
      "code": "Rolycoly",
      "name": "小炭仔"
    },
    {
      "id": 838,
      "code": "Carkol",
      "name": "大炭车"
    },
    {
      "id": 839,
      "code": "Coalossal",
      "name": "巨炭山"
    },
    {
      "id": 840,
      "code": "Applin",
      "name": "啃果虫"
    },
    {
      "id": 841,
      "code": "Flapple",
      "name": "苹裹龙"
    },
    {
      "id": 842,
      "code": "Appletun",
      "name": "丰蜜龙"
    },
    {
      "id": 843,
      "code": "Silicobra",
      "name": "沙包蛇"
    },
    {
      "id": 844,
      "code": "Sandaconda",
      "name": "沙螺蟒"
    },
    {
      "id": 845,
      "code": "Cramorant",
      "name": "古月鸟"
    },
    {
      "id": 846,
      "code": "Arrokuda",
      "name": "刺梭鱼"
    },
    {
      "id": 847,
      "code": "Barraskewda",
      "name": "戽斗尖梭"
    },
    {
      "id": 848,
      "code": "Toxel",
      "name": "电音婴"
    },
    {
      "id": 849,
      "code": "Toxtricity",
      "name": "颤弦蝾螈-高调的样子"
    },
    {
      "id": 850,
      "code": "Sizzlipede",
      "name": "烧火蚣"
    },
    {
      "id": 851,
      "code": "Centiskorch",
      "name": "焚焰蚣"
    },
    {
      "id": 852,
      "code": "Clobbopus",
      "name": "拳拳蛸"
    },
    {
      "id": 853,
      "code": "Grapploct",
      "name": "八爪武师"
    },
    {
      "id": 854,
      "code": "Sinistea",
      "name": "来悲茶"
    },
    {
      "id": 855,
      "code": "Polteageist",
      "name": "怖思壶"
    },
    {
      "id": 856,
      "code": "Hatenna",
      "name": "迷布莉姆"
    },
    {
      "id": 857,
      "code": "Hattrem",
      "name": "提布莉姆"
    },
    {
      "id": 858,
      "code": "Hatterene",
      "name": "布莉姆温"
    },
    {
      "id": 859,
      "code": "Impidimp",
      "name": "捣蛋小妖"
    },
    {
      "id": 860,
      "code": "Morgrem",
      "name": "诈唬魔"
    },
    {
      "id": 861,
      "code": "Grimmsnarl",
      "name": "长毛巨魔"
    },
    {
      "id": 862,
      "code": "Obstagoon",
      "name": "堵拦熊"
    },
    {
      "id": 863,
      "code": "Perrserker",
      "name": "喵头目"
    },
    {
      "id": 864,
      "code": "Cursola",
      "name": "魔灵珊瑚"
    },
    {
      "id": 865,
      "code": "Sirfetch’d",
      "name": "葱游兵"
    },
    {
      "id": 866,
      "code": "Mr. Rime",
      "name": "踏冰人偶"
    },
    {
      "id": 867,
      "code": "Runerigus",
      "name": "迭失板"
    },
    {
      "id": 868,
      "code": "Milcery",
      "name": "小仙奶"
    },
    {
      "id": 869,
      "code": "Alcremie",
      "name": "霜奶仙"
    },
    {
      "id": 870,
      "code": "Falinks",
      "name": "列阵兵"
    },
    {
      "id": 871,
      "code": "Pincurchin",
      "name": "啪嚓海胆"
    },
    {
      "id": 872,
      "code": "Snom",
      "name": "雪吞虫"
    },
    {
      "id": 873,
      "code": "Frosmoth",
      "name": "雪绒蛾"
    },
    {
      "id": 874,
      "code": "Stonjourner",
      "name": "巨石丁"
    },
    {
      "id": 875,
      "code": "Eiscue",
      "name": "冰砌鹅"
    },
    {
      "id": 876,
      "code": "Indeedee",
      "name": "爱管侍"
    },
    {
      "id": 877,
      "code": "Morpeko",
      "name": "莫鲁贝可"
    },
    {
      "id": 878,
      "code": "Cufant",
      "name": "铜象"
    },
    {
      "id": 879,
      "code": "Copperajah",
      "name": "大王铜象"
    },
    {
      "id": 880,
      "code": "Dracozolt",
      "name": "雷鸟龙"
    },
    {
      "id": 881,
      "code": "Arctozolt",
      "name": "雷鸟海兽"
    },
    {
      "id": 882,
      "code": "Dracovish",
      "name": "鳃鱼龙"
    },
    {
      "id": 883,
      "code": "Arctovish",
      "name": "鳃鱼海兽"
    },
    {
      "id": 884,
      "code": "Duraludon",
      "name": "铝钢龙"
    },
    {
      "id": 885,
      "code": "Dreepy",
      "name": "多龙梅西亚"
    },
    {
      "id": 886,
      "code": "Drakloak",
      "name": "多龙奇"
    },
    {
      "id": 887,
      "code": "Dragapult",
      "name": "多龙巴鲁托"
    },
    {
      "id": 888,
      "code": "Zacian",
      "name": "苍响"
    },
    {
      "id": 889,
      "code": "Zamazenta",
      "name": "藏玛然特"
    },
    {
      "id": 890,
      "code": "Eternatus",
      "name": "无极汰那"
    },
    {
      "id": 891,
      "code": "Kubfu",
      "name": "熊徒弟"
    },
    {
      "id": 892,
      "code": "Urshifu",
      "name": "武道熊师-一击流"
    },
    {
      "id": 893,
      "code": "Zarude",
      "name": "萨戮德"
    },
    {
      "id": 894,
      "code": "Regieleki",
      "name": "雷吉艾勒奇"
    },
    {
      "id": 895,
      "code": "Regidrago",
      "name": "雷吉铎拉戈"
    },
    {
      "id": 896,
      "code": "Glastrier",
      "name": "雪暴马"
    },
    {
      "id": 897,
      "code": "Spectrier",
      "name": "灵幽马"
    },
    {
      "id": 898,
      "code": "Calyrex",
      "name": "蕾冠王"
    },
    {
      "id": 899,
      "code": "Wyrdeer",
      "name": "诡角鹿"
    },
    {
      "id": 900,
      "code": "Kleavor",
      "name": "劈斧螳螂"
    },
    {
      "id": 901,
      "code": "Ursaluna",
      "name": "月月熊"
    },
    {
      "id": 902,
      "code": "Basculegion",
      "name": "幽尾玄鱼"
    },
    {
      "id": 903,
      "code": "Sneasler",
      "name": "大狃拉"
    },
    {
      "id": 904,
      "code": "Overqwil",
      "name": "万针鱼"
    },
    {
      "id": 905,
      "code": "Enamorus",
      "name": "眷恋云"
    },
    {
      "id": 906,
      "code": "Venusaur-Mega",
      "name": "Mega妙蛙花",
      "encAble": false
    },
    {
      "id": 907,
      "code": "Charizard-Mega-X",
      "name": "Mega喷火龙X",
      "encAble": false
    },
    {
      "id": 908,
      "code": "Charizard-Mega-Y",
      "name": "Mega喷火龙Y",
      "encAble": false
    },
    {
      "id": 909,
      "code": "Blastoise-Mega",
      "name": "Mega水箭龟",
      "encAble": false
    },
    {
      "id": 910,
      "code": "Beedrill-Mega",
      "name": "Mega大针蜂",
      "encAble": false
    },
    {
      "id": 911,
      "code": "Pidgeot-Mega",
      "name": "Mega大比鸟",
      "encAble": false
    },
    {
      "id": 912,
      "code": "Alakazam-Mega",
      "name": "Mega胡地",
      "encAble": false
    },
    {
      "id": 913,
      "code": "Slowbro-Mega",
      "name": "Mega呆壳兽",
      "encAble": false
    },
    {
      "id": 914,
      "code": "Gengar-Mega",
      "name": "Mega耿鬼",
      "encAble": false
    },
    {
      "id": 915,
      "code": "Kangaskhan-Mega",
      "name": "Mega袋兽",
      "encAble": false
    },
    {
      "id": 916,
      "code": "Pinsir-Mega",
      "name": "Mega凯罗斯",
      "encAble": false
    },
    {
      "id": 917,
      "code": "Gyarados-Mega",
      "name": "Mega暴鲤龙",
      "encAble": false
    },
    {
      "id": 918,
      "code": "Aerodactyl-Mega",
      "name": "Mega化石翼龙",
      "encAble": false
    },
    {
      "id": 919,
      "code": "Mewtwo-Mega-X",
      "name": "Mega超梦X",
      "encAble": false
    },
    {
      "id": 920,
      "code": "Mewtwo-Mega-Y",
      "name": "Mega超梦Y",
      "encAble": false
    },
    {
      "id": 921,
      "code": "Ampharos-Mega",
      "name": "Mega电龙",
      "encAble": false
    },
    {
      "id": 922,
      "code": "Steelix-Mega",
      "name": "Mega大钢蛇",
      "encAble": false
    },
    {
      "id": 923,
      "code": "Scizor-Mega",
      "name": "Mega巨钳螳螂",
      "encAble": false
    },
    {
      "id": 924,
      "code": "Heracross-Mega",
      "name": "Mega赫拉克罗斯",
      "encAble": false
    },
    {
      "id": 925,
      "code": "Houndoom-Mega",
      "name": "Mega黑鲁加",
      "encAble": false
    },
    {
      "id": 926,
      "code": "Tyranitar-Mega",
      "name": "Mega班基拉斯",
      "encAble": false
    },
    {
      "id": 927,
      "code": "Sceptile-Mega",
      "name": "Mega蜥蜴王",
      "encAble": false
    },
    {
      "id": 928,
      "code": "Blaziken-Mega",
      "name": "Mega火焰鸡",
      "encAble": false
    },
    {
      "id": 929,
      "code": "Swampert-Mega",
      "name": "Mega巨沼怪",
      "encAble": false
    },
    {
      "id": 930,
      "code": "Gardevoir-Mega",
      "name": "Mega沙奈朵",
      "encAble": false
    },
    {
      "id": 931,
      "code": "Sableye-Mega",
      "name": "Mega勾魂眼",
      "encAble": false
    },
    {
      "id": 932,
      "code": "Mawile-Mega",
      "name": "Mega大嘴娃",
      "encAble": false
    },
    {
      "id": 933,
      "code": "Aggron-Mega",
      "name": "Mega波士可多拉",
      "encAble": false
    },
    {
      "id": 934,
      "code": "Medicham-Mega",
      "name": "Mega恰雷姆",
      "encAble": false
    },
    {
      "id": 935,
      "code": "Manectric-Mega",
      "name": "Mega雷电兽",
      "encAble": false
    },
    {
      "id": 936,
      "code": "Sharpedo-Mega",
      "name": "Mega巨牙鲨",
      "encAble": false
    },
    {
      "id": 937,
      "code": "Camerupt-Mega",
      "name": "Mega喷火驼",
      "encAble": false
    },
    {
      "id": 938,
      "code": "Altaria-Mega",
      "name": "Mega七夕青鸟",
      "encAble": false
    },
    {
      "id": 939,
      "code": "Banette-Mega",
      "name": "Mega诅咒娃娃",
      "encAble": false
    },
    {
      "id": 940,
      "code": "Absol-Mega",
      "name": "Mega阿勃梭鲁",
      "encAble": false
    },
    {
      "id": 941,
      "code": "Glalie-Mega",
      "name": "Mega冰鬼护",
      "encAble": false
    },
    {
      "id": 942,
      "code": "Salamence-Mega",
      "name": "Mega暴飞龙",
      "encAble": false
    },
    {
      "id": 943,
      "code": "Metagross-Mega",
      "name": "Mega巨金怪",
      "encAble": false
    },
    {
      "id": 944,
      "code": "Latias-Mega",
      "name": "Mega拉帝亚斯",
      "encAble": false
    },
    {
      "id": 945,
      "code": "Latios-Mega",
      "name": "Mega拉帝欧斯",
      "encAble": false
    },
    {
      "id": 946,
      "code": "Lopunny-Mega",
      "name": "Mega长耳兔",
      "encAble": false
    },
    {
      "id": 947,
      "code": "Garchomp-Mega",
      "name": "Mega烈咬陆鲨",
      "encAble": false
    },
    {
      "id": 948,
      "code": "Lucario-Mega",
      "name": "Mega路卡利欧",
      "encAble": false
    },
    {
      "id": 949,
      "code": "Abomasnow-Mega",
      "name": "Mega暴雪王",
      "encAble": false
    },
    {
      "id": 950,
      "code": "Gallade-Mega",
      "name": "Mega艾路雷朵",
      "encAble": false
    },
    {
      "id": 951,
      "code": "Audino-Mega",
      "name": "Mega差不多娃娃",
      "encAble": false
    },
    {
      "id": 952,
      "code": "Diancie-Mega",
      "name": "Mega蒂安希",
      "encAble": false
    },
    {
      "id": 953,
      "code": "Rayquaza-Mega",
      "name": "Mega烈空坐",
      "encAble": false
    },
    {
      "id": 954,
      "code": "Kyogre-Primal",
      "name": "盖欧卡-原始回归",
      "encAble": false
    },
    {
      "id": 955,
      "code": "Groudon-Primal",
      "name": "固拉多-原始回归",
      "encAble": false
    },
    {
      "id": 956,
      "code": "Rattata-Alola",
      "name": "阿罗拉-小拉达"
    },
    {
      "id": 957,
      "code": "Raticate-Alola",
      "name": "阿罗拉-拉达"
    },
    {
      "id": 958,
      "code": "Raichu-Alola",
      "name": "阿罗拉-雷丘"
    },
    {
      "id": 959,
      "code": "Sandshrew-Alola",
      "name": "阿罗拉-穿山鼠"
    },
    {
      "id": 960,
      "code": "Sandslash-Alola",
      "name": "阿罗拉-穿山王"
    },
    {
      "id": 961,
      "code": "Vulpix-Alola",
      "name": "阿罗拉-六尾"
    },
    {
      "id": 962,
      "code": "Ninetales-Alola",
      "name": "阿罗拉-九尾"
    },
    {
      "id": 963,
      "code": "Diglett-Alola",
      "name": "阿罗拉-地鼠"
    },
    {
      "id": 964,
      "code": "Dugtrio-Alola",
      "name": "阿罗拉-三地鼠"
    },
    {
      "id": 965,
      "code": "Meowth-Alola",
      "name": "阿罗拉-喵喵"
    },
    {
      "id": 966,
      "code": "Persian-Alola",
      "name": "阿罗拉-猫老大"
    },
    {
      "id": 967,
      "code": "Geodude-Alola",
      "name": "阿罗拉-小拳石"
    },
    {
      "id": 968,
      "code": "Graveler-Alola",
      "name": "阿罗拉-隆隆石"
    },
    {
      "id": 969,
      "code": "Golem-Alola",
      "name": "阿罗拉-隆隆岩"
    },
    {
      "id": 970,
      "code": "Grimer-Alola",
      "name": "阿罗拉-臭泥"
    },
    {
      "id": 971,
      "code": "Muk-Alola",
      "name": "阿罗拉-臭臭泥"
    },
    {
      "id": 972,
      "code": "Exeggutor-Alola",
      "name": "阿罗拉-椰蛋树"
    },
    {
      "id": 973,
      "code": "Marowak-Alola",
      "name": "阿罗拉-嘎啦嘎啦"
    },
    {
      "id": 974,
      "code": "Meowth-Galar",
      "name": "伽勒尔-喵喵"
    },
    {
      "id": 975,
      "code": "Ponyta-Galar",
      "name": "伽勒尔-小火马"
    },
    {
      "id": 976,
      "code": "Rapidash-Galar",
      "name": "伽勒尔-烈焰马"
    },
    {
      "id": 977,
      "code": "Slowpoke-Galar",
      "name": "伽勒尔-呆呆兽"
    },
    {
      "id": 978,
      "code": "Slowbro-Galar",
      "name": "伽勒尔-呆壳兽"
    },
    {
      "id": 979,
      "code": "Farfetch’d-Galar",
      "name": "伽勒尔-大葱鸭"
    },
    {
      "id": 980,
      "code": "Weezing-Galar",
      "name": "伽勒尔-双弹瓦斯"
    },
    {
      "id": 981,
      "code": "Mr. Mime-Galar",
      "name": "伽勒尔-魔墙人偶"
    },
    {
      "id": 982,
      "code": "Articuno-Galar",
      "name": "伽勒尔-急冻鸟"
    },
    {
      "id": 983,
      "code": "Zapdos-Galar",
      "name": "伽勒尔-闪电鸟"
    },
    {
      "id": 984,
      "code": "Moltres-Galar",
      "name": "伽勒尔-火焰鸟"
    },
    {
      "id": 985,
      "code": "Slowking-Galar",
      "name": "伽勒尔-呆呆王"
    },
    {
      "id": 986,
      "code": "Corsola-Galar",
      "name": "伽勒尔-太阳珊瑚"
    },
    {
      "id": 987,
      "code": "Zigzagoon-Galar",
      "name": "伽勒尔-蛇纹熊"
    },
    {
      "id": 988,
      "code": "Linoone-Galar",
      "name": "伽勒尔-直冲熊"
    },
    {
      "id": 989,
      "code": "Darumaka-Galar",
      "name": "伽勒尔-火红不倒翁"
    },
    {
      "id": 990,
      "code": "Darmanitan-Galar",
      "name": "伽勒尔-达摩狒狒"
    },
    {
      "id": 991,
      "code": "Yamask-Galar",
      "name": "伽勒尔-哭哭面具"
    },
    {
      "id": 992,
      "code": "Stunfisk-Galar",
      "name": "伽勒尔-泥巴鱼"
    },
    {
      "id": 993,
      "code": "Growlithe-Hisui",
      "name": "洗翠-卡蒂狗"
    },
    {
      "id": 994,
      "code": "Arcanine-Hisui",
      "name": "洗翠-风速狗"
    },
    {
      "id": 995,
      "code": "Voltorb-Hisui",
      "name": "洗翠-霹雳电球"
    },
    {
      "id": 996,
      "code": "Electrode-Hisui",
      "name": "洗翠-顽皮雷弹"
    },
    {
      "id": 997,
      "code": "Typhlosion-Hisui",
      "name": "洗翠-火暴兽"
    },
    {
      "id": 998,
      "code": "Qwilfish-Hisui",
      "name": "洗翠-千针鱼"
    },
    {
      "id": 999,
      "code": "Sneasel-Hisui",
      "name": "洗翠-狃拉"
    },
    {
      "id": 1000,
      "code": "Samurott-Hisui",
      "name": "洗翠-大剑鬼"
    },
    {
      "id": 1001,
      "code": "Lilligant-Hisui",
      "name": "洗翠-裙儿小姐"
    },
    {
      "id": 1002,
      "code": "Zorua-Hisui",
      "name": "洗翠-索罗亚"
    },
    {
      "id": 1003,
      "code": "Zoroark-Hisui",
      "name": "洗翠-索罗亚克"
    },
    {
      "id": 1004,
      "code": "Braviary-Hisui",
      "name": "洗翠-勇士雄鹰"
    },
    {
      "id": 1005,
      "code": "Sliggoo-Hisui",
      "name": "洗翠-黏美儿"
    },
    {
      "id": 1006,
      "code": "Goodra-Hisui",
      "name": "洗翠-黏美龙"
    },
    {
      "id": 1007,
      "code": "Avalugg-Hisui",
      "name": "洗翠-冰岩怪"
    },
    {
      "id": 1008,
      "code": "Decidueye-Hisui",
      "name": "洗翠-狙射树枭"
    },
    {
      "id": 1009,
      "code": "Pikachu-Cosplay",
      "name": "皮卡丘-Cosplay",
      "encAble": false
    },
    {
      "id": 1010,
      "code": "Pikachu-Rock-Star",
      "name": "皮卡丘-Rock-Star",
      "encAble": false
    },
    {
      "id": 1011,
      "code": "Pikachu-Belle",
      "name": "皮卡丘-Belle",
      "encAble": false
    },
    {
      "id": 1012,
      "code": "Pikachu-Pop-Star",
      "name": "皮卡丘-Pop-Star",
      "encAble": false
    },
    {
      "id": 1013,
      "code": "Pikachu-PhD",
      "name": "皮卡丘-PhD",
      "encAble": false
    },
    {
      "id": 1014,
      "code": "Pikachu-Libre",
      "name": "皮卡丘-Libre",
      "encAble": false
    },
    {
      "id": 1015,
      "code": "Pikachu-Original",
      "name": "皮卡丘-Original",
      "encAble": false
    },
    {
      "id": 1016,
      "code": "Pikachu-Hoenn",
      "name": "皮卡丘-Hoenn",
      "encAble": false
    },
    {
      "id": 1017,
      "code": "Pikachu-Sinnoh",
      "name": "皮卡丘-Sinnoh",
      "encAble": false
    },
    {
      "id": 1018,
      "code": "Pikachu-Unova",
      "name": "皮卡丘-Unova",
      "encAble": false
    },
    {
      "id": 1019,
      "code": "Pikachu-Kalos",
      "name": "皮卡丘-Kalos",
      "encAble": false
    },
    {
      "id": 1020,
      "code": "Pikachu-Alola",
      "name": "阿罗拉-雷丘"
    },
    {
      "id": 1021,
      "code": "Pikachu-Partner",
      "name": "皮卡丘-搭档"
    },
    {
      "id": 1022,
      "code": "Pikachu-World",
      "name": "皮卡丘-World",
      "encAble": false
    },
    {
      "id": 1023,
      "code": "Pichu-Spiky-eared",
      "name": "皮丘-Spiky-eared",
      "encAble": false
    },
    {
      "id": 1024,
      "code": "Unown",
      "name": "未知图腾B",
      "encAble": false
    },
    {
      "id": 1025,
      "code": "Unown",
      "name": "未知图腾C",
      "encAble": false
    },
    {
      "id": 1026,
      "code": "Unown",
      "name": "未知图腾D",
      "encAble": false
    },
    {
      "id": 1027,
      "code": "Unown",
      "name": "未知图腾E",
      "encAble": false
    },
    {
      "id": 1028,
      "code": "Unown",
      "name": "未知图腾F",
      "encAble": false
    },
    {
      "id": 1029,
      "code": "Unown",
      "name": "未知图腾G",
      "encAble": false
    },
    {
      "id": 1030,
      "code": "Unown",
      "name": "未知图腾H",
      "encAble": false
    },
    {
      "id": 1031,
      "code": "Unown",
      "name": "未知图腾I",
      "encAble": false
    },
    {
      "id": 1032,
      "code": "Unown",
      "name": "未知图腾J",
      "encAble": false
    },
    {
      "id": 1033,
      "code": "Unown",
      "name": "未知图腾K",
      "encAble": false
    },
    {
      "id": 1034,
      "code": "Unown",
      "name": "未知图腾L",
      "encAble": false
    },
    {
      "id": 1035,
      "code": "Unown",
      "name": "未知图腾M",
      "encAble": false
    },
    {
      "id": 1036,
      "code": "Unown",
      "name": "未知图腾N",
      "encAble": false
    },
    {
      "id": 1037,
      "code": "Unown",
      "name": "未知图腾O",
      "encAble": false
    },
    {
      "id": 1038,
      "code": "Unown",
      "name": "未知图腾P",
      "encAble": false
    },
    {
      "id": 1039,
      "code": "Unown",
      "name": "未知图腾Q",
      "encAble": false
    },
    {
      "id": 1040,
      "code": "Unown",
      "name": "未知图腾R",
      "encAble": false
    },
    {
      "id": 1041,
      "code": "Unown",
      "name": "未知图腾S",
      "encAble": false
    },
    {
      "id": 1042,
      "code": "Unown",
      "name": "未知图腾T",
      "encAble": false
    },
    {
      "id": 1043,
      "code": "Unown",
      "name": "未知图腾U",
      "encAble": false
    },
    {
      "id": 1044,
      "code": "Unown",
      "name": "未知图腾V",
      "encAble": false
    },
    {
      "id": 1045,
      "code": "Unown",
      "name": "未知图腾W",
      "encAble": false
    },
    {
      "id": 1046,
      "code": "Unown",
      "name": "未知图腾X",
      "encAble": false
    },
    {
      "id": 1047,
      "code": "Unown",
      "name": "未知图腾Y",
      "encAble": false
    },
    {
      "id": 1048,
      "code": "Unown",
      "name": "未知图腾Z",
      "encAble": false
    },
    {
      "id": 1049,
      "code": "Unown",
      "name": "未知图腾!",
      "encAble": false
    },
    {
      "id": 1050,
      "code": "Unown",
      "name": "未知图腾?",
      "encAble": false
    },
    {
      "id": 1051,
      "code": "Castform-Sunny",
      "name": "飘浮泡泡-晴天",
      "encAble": false
    },
    {
      "id": 1052,
      "code": "Castform-Rainy",
      "name": "飘浮泡泡-雨天",
      "encAble": false
    },
    {
      "id": 1053,
      "code": "Castform-Snowy",
      "name": "飘浮泡泡-雪天",
      "encAble": false
    },
    {
      "id": 1054,
      "code": "Deoxys-Attack",
      "name": "代欧奇希斯-攻击"
    },
    {
      "id": 1055,
      "code": "Deoxys-Defense",
      "name": "代欧奇希斯-防御"
    },
    {
      "id": 1056,
      "code": "Deoxys-Speed",
      "name": "代欧奇希斯-速度"
    },
    {
      "id": 1057,
      "code": "Burmy",
      "name": "结草儿-砂土蓑衣"
    },
    {
      "id": 1058,
      "code": "Burmy",
      "name": "结草儿-垃圾蓑衣"
    },
    {
      "id": 1059,
      "code": "Wormadam-Sandy",
      "name": "结草贵妇-砂土蓑衣"
    },
    {
      "id": 1060,
      "code": "Wormadam-Trash",
      "name": "结草贵妇-垃圾蓑衣"
    },
    {
      "id": 1061,
      "code": "Cherrim-Sunshine",
      "name": "樱花儿-晴天",
      "encAble": false
    },
    {
      "id": 1062,
      "code": "Shellos",
      "name": "无壳海兔-南海",
      "encAble": false
    },
    {
      "id": 1063,
      "code": "Gastrodon",
      "name": "海兔兽-南海",
      "encAble": false
    },
    {
      "id": 1064,
      "code": "Rotom-Heat",
      "name": "洛托姆-火衣机"
    },
    {
      "id": 1065,
      "code": "Rotom-Wash",
      "name": "洛托姆-洗衣机"
    },
    {
      "id": 1066,
      "code": "Rotom-Frost",
      "name": "洛托姆-冰衣机"
    },
    {
      "id": 1067,
      "code": "Rotom-Fan",
      "name": "洛托姆-电风扇"
    },
    {
      "id": 1068,
      "code": "Rotom-Mow",
      "name": "洛托姆-草衣机"
    },
    {
      "id": 1069,
      "code": "Dialga-Origin",
      "name": "帝牙卢卡-原始",
      "encAble": false
    },
    {
      "id": 1070,
      "code": "Palkia-Origin",
      "name": "帕路奇亚-原始",
      "encAble": false
    },
    {
      "id": 1071,
      "code": "Giratina-Origin",
      "name": "骑拉帝纳-原始",
      "encAble": false
    },
    {
      "id": 1072,
      "code": "Shaymin-Sky",
      "name": "谢米-天空形态"
    },
    {
      "id": 1073,
      "code": "Arceus-Fighting",
      "name": "阿尔宙斯-格斗",
      "encAble": false
    },
    {
      "id": 1074,
      "code": "Arceus-Flying",
      "name": "阿尔宙斯-飞行",
      "encAble": false
    },
    {
      "id": 1075,
      "code": "Arceus-Poison",
      "name": "阿尔宙斯-毒",
      "encAble": false
    },
    {
      "id": 1076,
      "code": "Arceus-Ground",
      "name": "阿尔宙斯-地面",
      "encAble": false
    },
    {
      "id": 1077,
      "code": "Arceus-Rock",
      "name": "阿尔宙斯-岩石",
      "encAble": false
    },
    {
      "id": 1078,
      "code": "Arceus-Bug",
      "name": "阿尔宙斯-虫",
      "encAble": false
    },
    {
      "id": 1079,
      "code": "Arceus-Ghost",
      "name": "阿尔宙斯-鬼",
      "encAble": false
    },
    {
      "id": 1080,
      "code": "Arceus-Steel",
      "name": "阿尔宙斯-钢",
      "encAble": false
    },
    {
      "id": 1081,
      "code": "Arceus-Fire",
      "name": "阿尔宙斯-火",
      "encAble": false
    },
    {
      "id": 1082,
      "code": "Arceus-Water",
      "name": "阿尔宙斯-水",
      "encAble": false
    },
    {
      "id": 1083,
      "code": "Arceus-Grass",
      "name": "阿尔宙斯-草",
      "encAble": false
    },
    {
      "id": 1084,
      "code": "Arceus-Electric",
      "name": "阿尔宙斯-电",
      "encAble": false
    },
    {
      "id": 1085,
      "code": "Arceus-Psychic",
      "name": "阿尔宙斯-超能",
      "encAble": false
    },
    {
      "id": 1086,
      "code": "Arceus-Ice",
      "name": "阿尔宙斯-冰",
      "encAble": false
    },
    {
      "id": 1087,
      "code": "Arceus-Dragon",
      "name": "阿尔宙斯-龙",
      "encAble": false
    },
    {
      "id": 1088,
      "code": "Arceus-Dark",
      "name": "阿尔宙斯-恶",
      "encAble": false
    },
    {
      "id": 1089,
      "code": "Arceus-Fairy",
      "name": "阿尔宙斯-妖精",
      "encAble": false
    },
    {
      "id": 1090,
      "code": "Basculin-Blue-Striped",
      "name": "野蛮鲈鱼-蓝"
    },
    {
      "id": 1091,
      "code": "Basculin-White-Striped",
      "name": "野蛮鲈鱼-白"
    },
    {
      "id": 1092,
      "code": "Darmanitan-Zen",
      "name": "达摩狒狒-达摩形态",
      "encAble": false
    },
    {
      "id": 1093,
      "code": "Darmanitan-Galar-Zen",
      "name": "伽勒尔-达摩狒狒-达摩形态",
      "encAble": false
    },
    {
      "id": 1094,
      "code": "Deerling",
      "name": "四季鹿-夏",
      "encAble": false
    },
    {
      "id": 1095,
      "code": "Deerling",
      "name": "四季鹿-秋",
      "encAble": false
    },
    {
      "id": 1096,
      "code": "Deerling",
      "name": "四季鹿-冬",
      "encAble": false
    },
    {
      "id": 1097,
      "code": "Sawsbuck",
      "name": "萌芽鹿-夏",
      "encAble": false
    },
    {
      "id": 1098,
      "code": "Sawsbuck",
      "name": "萌芽鹿-秋",
      "encAble": false
    },
    {
      "id": 1099,
      "code": "Sawsbuck",
      "name": "萌芽鹿-冬",
      "encAble": false
    },
    {
      "id": 1100,
      "code": "Tornadus-Therian",
      "name": "龙卷云-灵兽形态"
    },
    {
      "id": 1101,
      "code": "Thundurus-Therian",
      "name": "雷电云-灵兽形态"
    },
    {
      "id": 1102,
      "code": "Landorus-Therian",
      "name": "土地云-灵兽形态"
    },
    {
      "id": 1103,
      "code": "Enamorus-Therian",
      "name": "眷恋云-灵兽形态"
    },
    {
      "id": 1104,
      "code": "Kyurem-White",
      "name": "酋雷姆-白"
    },
    {
      "id": 1105,
      "code": "Kyurem-Black",
      "name": "酋雷姆-黑"
    },
    {
      "id": 1106,
      "code": "Keldeo-Resolute",
      "name": "凯路迪欧",
      "encAble": false
    },
    {
      "id": 1107,
      "code": "Meloetta-Pirouette",
      "name": "美洛耶塔-舞步形态",
      "encAble": false
    },
    {
      "id": 1108,
      "code": "Genesect-Douse",
      "name": "盖诺赛克特-水流",
      "encAble": false
    },
    {
      "id": 1109,
      "code": "Genesect-Shock",
      "name": "盖诺赛克特-闪电",
      "encAble": false
    },
    {
      "id": 1110,
      "code": "Genesect-Burn",
      "name": "盖诺赛克特-火焰",
      "encAble": false
    },
    {
      "id": 1111,
      "code": "Genesect-Chill",
      "name": "盖诺赛克特-冰冻",
      "encAble": false
    },
    {
      "id": 1112,
      "code": "Greninja",
      "name": "小智甲贺忍蛙"
    },
    {
      "id": 1113,
      "code": "Greninja-Ash",
      "name": "小智甲贺忍蛙变身",
      "encAble": false
    },
    {
      "id": 1114,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1115,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1116,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1117,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1118,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1119,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1120,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1121,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1122,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1123,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1124,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1125,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1126,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1127,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1128,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1129,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1130,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1131,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1132,
      "code": "Vivillon",
      "name": "彩粉蝶",
      "encAble": false
    },
    {
      "id": 1133,
      "code": "Flabébé",
      "name": "花蓓蓓",
      "encAble": false
    },
    {
      "id": 1134,
      "code": "Flabébé",
      "name": "花蓓蓓",
      "encAble": false
    },
    {
      "id": 1135,
      "code": "Flabébé",
      "name": "花蓓蓓",
      "encAble": false
    },
    {
      "id": 1136,
      "code": "Flabébé",
      "name": "花蓓蓓",
      "encAble": false
    },
    {
      "id": 1137,
      "code": "Floette",
      "name": "花叶蒂",
      "encAble": false
    },
    {
      "id": 1138,
      "code": "Floette",
      "name": "花叶蒂",
      "encAble": false
    },
    {
      "id": 1139,
      "code": "Floette",
      "name": "花叶蒂",
      "encAble": false
    },
    {
      "id": 1140,
      "code": "Floette",
      "name": "花叶蒂",
      "encAble": false
    },
    {
      "id": 1141,
      "code": "Floette-Eternal",
      "name": "永恒之花-花叶蒂"
    },
    {
      "id": 1142,
      "code": "Florges",
      "name": "花洁夫人",
      "encAble": false
    },
    {
      "id": 1143,
      "code": "Florges",
      "name": "花洁夫人",
      "encAble": false
    },
    {
      "id": 1144,
      "code": "Florges",
      "name": "花洁夫人",
      "encAble": false
    },
    {
      "id": 1145,
      "code": "Florges",
      "name": "花洁夫人",
      "encAble": false
    },
    {
      "id": 1146,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1147,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1148,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1149,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1150,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1151,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1152,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1153,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1154,
      "code": "Furfrou",
      "name": "多丽米亚",
      "encAble": false
    },
    {
      "id": 1155,
      "code": "Meowstic-F",
      "name": "超能妙喵",
      "encAble": false
    },
    {
      "id": 1156,
      "code": "Aegislash-Blade",
      "name": "坚盾剑怪-攻击形态",
      "encAble": false
    },
    {
      "id": 1157,
      "code": "Pumpkaboo-Small",
      "name": "南瓜精-Small",
      "encAble": false
    },
    {
      "id": 1158,
      "code": "Pumpkaboo-Large",
      "name": "南瓜精-Large",
      "encAble": false
    },
    {
      "id": 1159,
      "code": "Pumpkaboo-Super",
      "name": "南瓜精-Super",
      "encAble": false
    },
    {
      "id": 1160,
      "code": "Gourgeist-Small",
      "name": "南瓜怪人-Small",
      "encAble": false
    },
    {
      "id": 1161,
      "code": "Gourgeist-Large",
      "name": "南瓜怪人-Large",
      "encAble": false
    },
    {
      "id": 1162,
      "code": "Gourgeist-Super",
      "name": "南瓜怪人-Super",
      "encAble": false
    },
    {
      "id": 1163,
      "code": "Xerneas",
      "name": "哲尔尼亚斯-战斗形态",
      "encAble": false
    },
    {
      "id": 1164,
      "code": "Zygarde-10",
      "name": "基格尔德-10%-气场破坏",
      "encAble": false
    },
    {
      "id": 1165,
      "code": "Zygarde-10",
      "name": "基格尔德-10%-群聚变形",
      "encAble": false
    },
    {
      "id": 1166,
      "code": "Zygarde",
      "name": "基格尔德-50%-群聚变形",
      "encAble": false
    },
    {
      "id": 1167,
      "code": "Zygarde-Complete",
      "name": "基格尔德-完全形态",
      "encAble": false
    },
    {
      "id": 1168,
      "code": "Hoopa-Unbound",
      "name": "解放胡帕"
    },
    {
      "id": 1169,
      "code": "Oricorio-Pom-Pom",
      "name": "花舞鸟-啪滋啪滋风格"
    },
    {
      "id": 1170,
      "code": "Oricorio-Pa'u ",
      "name": "花舞鸟-呼拉呼拉风格 "
    },
    {
      "id": 1171,
      "code": "Oricorio-Sensu",
      "name": "花舞鸟-轻盈轻盈风格"
    },
    {
      "id": 1172,
      "code": "Rockruff",
      "name": "岩狗狗-特殊",
      "encAble": false
    },
    {
      "id": 1173,
      "code": "Lycanroc-Midnight",
      "name": "鬃岩狼人-黑夜"
    },
    {
      "id": 1174,
      "code": "Lycanroc-Dusk",
      "name": "鬃岩狼人-黄昏"
    },
    {
      "id": 1175,
      "code": "Wishiwashi-School",
      "name": "弱丁鱼-鱼群",
      "encAble": false
    },
    {
      "id": 1176,
      "code": "Silvally-Fighting",
      "name": "银伴战兽-格斗",
      "encAble": false
    },
    {
      "id": 1177,
      "code": "Silvally-Flying",
      "name": "银伴战兽-飞",
      "encAble": false
    },
    {
      "id": 1178,
      "code": "Silvally-Poison",
      "name": "银伴战兽-毒",
      "encAble": false
    },
    {
      "id": 1179,
      "code": "Silvally-Ground",
      "name": "银伴战兽-地面",
      "encAble": false
    },
    {
      "id": 1180,
      "code": "Silvally-Rock",
      "name": "银伴战兽-岩",
      "encAble": false
    },
    {
      "id": 1181,
      "code": "Silvally-Bug",
      "name": "银伴战兽-虫",
      "encAble": false
    },
    {
      "id": 1182,
      "code": "Silvally-Ghost",
      "name": "银伴战兽-鬼",
      "encAble": false
    },
    {
      "id": 1183,
      "code": "Silvally-Steel",
      "name": "银伴战兽-钢",
      "encAble": false
    },
    {
      "id": 1184,
      "code": "Silvally-Fire",
      "name": "银伴战兽-火",
      "encAble": false
    },
    {
      "id": 1185,
      "code": "Silvally-Water",
      "name": "银伴战兽-水",
      "encAble": false
    },
    {
      "id": 1186,
      "code": "Silvally-Grass",
      "name": "银伴战兽-草",
      "encAble": false
    },
    {
      "id": 1187,
      "code": "Silvally-Electric",
      "name": "银伴战兽-电",
      "encAble": false
    },
    {
      "id": 1188,
      "code": "Silvally-Psychic",
      "name": "银伴战兽-超能",
      "encAble": false
    },
    {
      "id": 1189,
      "code": "Silvally-Ice",
      "name": "银伴战兽-冰",
      "encAble": false
    },
    {
      "id": 1190,
      "code": "Silvally-Dragon",
      "name": "银伴战兽-龙",
      "encAble": false
    },
    {
      "id": 1191,
      "code": "Silvally-Dark",
      "name": "银伴战兽-恶",
      "encAble": false
    },
    {
      "id": 1192,
      "code": "Silvally-Fairy",
      "name": "银伴战兽-妖精",
      "encAble": false
    },
    {
      "id": 1193,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1194,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1195,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1196,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1197,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1198,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1199,
      "code": "Minior",
      "name": "小陨星-核心",
      "encAble": false
    },
    {
      "id": 1200,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1201,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1202,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1203,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1204,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1205,
      "code": "Minior",
      "name": "小陨星",
      "encAble": false
    },
    {
      "id": 1206,
      "code": "Mimikyu-Busted",
      "name": "谜拟丘-失去画皮",
      "encAble": false
    },
    {
      "id": 1207,
      "code": "Necrozma-Dusk-Mane",
      "name": "奈克洛兹玛-黄昏之鬃"
    },
    {
      "id": 1208,
      "code": "Necrozma-Dawn-Wings",
      "name": "奈克洛兹玛-拂晓之翼"
    },
    {
      "id": 1209,
      "code": "Necrozma-Ultra",
      "name": "究极奈克洛兹玛"
    },
    {
      "id": 1210,
      "code": "Magearna-Original",
      "name": "玛机雅娜-原始",
      "encAble": false
    },
    {
      "id": 1211,
      "code": "Cramorant-Gulping",
      "name": "古月鸟-一口吞的样子",
      "encAble": false
    },
    {
      "id": 1212,
      "code": "Cramorant-Gorging",
      "name": "古月鸟-大口吞的样子",
      "encAble": false
    },
    {
      "id": 1213,
      "code": "Toxtricity-Low-Key",
      "name": "颤弦蝾螈-低调的样子",
      "encAble": false
    },
    {
      "id": 1214,
      "code": "Sinistea-Antique",
      "name": "来悲茶-真品形态",
      "encAble": false
    },
    {
      "id": 1215,
      "code": "Polteageist-Antique",
      "name": "怖思壶-真品形态",
      "encAble": false
    },
    {
      "id": 1216,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1217,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1218,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1219,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1220,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1221,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1222,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1223,
      "code": "Alcremie",
      "name": "霜奶仙",
      "encAble": false
    },
    {
      "id": 1224,
      "code": "Eiscue-Noice",
      "name": "冰砌鹅（解冻头形态）",
      "encAble": false
    },
    {
      "id": 1225,
      "code": "Indeedee-F",
      "name": "爱管侍-母"
    },
    {
      "id": 1226,
      "code": "Morpeko-Hangry",
      "name": "莫鲁贝可-饥饿",
      "encAble": false
    },
    {
      "id": 1227,
      "code": "Zacian-Crowned",
      "name": "剑之王苍响"
    },
    {
      "id": 1228,
      "code": "Zamazenta-Crowned",
      "name": "盾之王藏玛然特"
    },
    {
      "id": 1229,
      "code": "Eternatus-Eternamax",
      "name": "无极汰那-极巨"
    },
    {
      "id": 1230,
      "code": "Urshifu-Rapid-Strike",
      "name": "武道熊师-连击流"
    },
    {
      "id": 1231,
      "code": "Zarude-Dada",
      "name": "萨戮德-阿爸",
      "encAble": false
    },
    {
      "id": 1232,
      "code": "Calyrex-Ice",
      "name": "蕾冠王-骑白马的样子"
    },
    {
      "id": 1233,
      "code": "Calyrex-Shadow",
      "name": "蕾冠王-骑黑马的样子"
    }
  ]
];

window.RBEditorPokemonDataById = new Map(
  window.RBEditorPokemonData.map(item => [Number(item.id), item])
);
