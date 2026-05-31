// ============================================================
// 新区域野生宝可梦示例初始化
// ============================================================
(function(){
  if(!window.RBEditorWildEncounters) window.RBEditorWildEncounters = { maps: [], addMap: function(map){ this.maps.push(map); } };

  // 新区域 group=10, map=0
  window.RBEditorWildEncounters.addMap({
    mapGroup: 10,
    mapNum: 0,
    headerOffset: 0x00630000,
    groups: {
      land: {
        encounterRate: 20,
        monsOffset: 0x00630010,
        entries: [
          { slot: 0, minLevel: 5, maxLevel: 7, species: 25, rate: 10, offset: 0x00630020 },
          { slot: 1, minLevel: 5, maxLevel: 5, species: 29, rate: 5, offset: 0x00630028 },
          { slot: 2, minLevel: 6, maxLevel: 8, species: 133, rate: 7, offset: 0x00630030 },
        ]
      },
      water: { encounterRate: 20, monsOffset: 0x00630100, entries: [] },
      fishing: { encounterRate: 20, monsOffset: 0x00630200, entries: [] },
      rockSmash: { encounterRate: 20, monsOffset: 0x00630300, entries: [] }
    }
  });
})();