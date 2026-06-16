<template>
  <div class="map-info-panel">
    <div class="right-panel-title">地图信息</div>
    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />
    <pre v-else class="map-info-text">{{ mapInfoText }}</pre>
  </div>
</template>

<script>
import { formatHex, offsetToPointer, pointerToOffset } from "@/util"

export default {
  name: "MapInfoPanel",
  props: {
    project: {
      type: Object,
      default: null,
    },
    currentMap: {
      type: Object,
      default: null,
    },
  },
  computed: {
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    mapEventsInfo() {
      const rom = this.project?.rom
      const offset = this.mapHeader?.eventsOffset
      const fallback = {
        objectCount: 0,
        warpCount: 0,
        coordCount: 0,
        bgCount: 0,
        objectPointer: 0,
        warpPointer: 0,
        coordPointer: 0,
        bgPointer: 0,
        objectOffset: null,
        warpOffset: null,
        coordOffset: null,
        bgOffset: null,
      }

      if (!rom || !Number.isInteger(offset) || offset < 0 || offset + 0x14 > rom.size) return fallback

      const objectPointer = rom.readPointer(offset + 0x04)
      const warpPointer = rom.readPointer(offset + 0x08)
      const coordPointer = rom.readPointer(offset + 0x0c)
      const bgPointer = rom.readPointer(offset + 0x10)

      return {
        objectCount: rom.readByte(offset),
        warpCount: rom.readByte(offset + 0x01),
        coordCount: rom.readByte(offset + 0x02),
        bgCount: rom.readByte(offset + 0x03),
        objectPointer,
        warpPointer,
        coordPointer,
        bgPointer,
        objectOffset: pointerToOffset(objectPointer),
        warpOffset: pointerToOffset(warpPointer),
        coordOffset: pointerToOffset(coordPointer),
        bgOffset: pointerToOffset(bgPointer),
      }
    },
    mapInfoText() {
      const header = this.mapHeader
      if (!header) return "未加载地图。"

      const layout = header.layout
      const section = header.regionSection
      const events = this.mapEventsInfo
      const mapHeaderPointer = Number.isInteger(header.offset) ? offsetToPointer(header.offset) : null
      const fillerLow = header.filler18 & 0xff
      const fillerHigh = (header.filler18 >> 8) & 0xff

      return [
        `Map name         : ${section?.name ?? ""}`,
        `Map suffix code  : ${header.regionSuffixCode ?? 0}`,
        `Region section   : ${header.regionMapSectionId}`,
        `Region entry     : x=${section?.x ?? 0}, y=${section?.y ?? 0}, w=${section?.width ?? 0}, h=${section?.height ?? 0}`,
        `Region name ptr  : ${formatHex(section?.namePointer ?? 0)}`,
        `Region name off  : ${formatHex(section?.nameOffset)}`,
        "",
        `MapHeader offset : ${formatHex(header.offset)}`,
        `MapHeader ptr    : ${formatHex(mapHeaderPointer)}`,
        "",
        `Layout ptr       : ${formatHex(header.layoutPointer)}`,
        `Layout offset    : ${formatHex(layout?.offset)}`,
        `Map size         : ${layout?.width ?? 0} x ${layout?.height ?? 0}`,
        `Border ptr       : ${formatHex(layout?.borderPointer ?? 0)}`,
        `Blockmap ptr     : ${formatHex(layout?.mapPointer ?? 0)}`,
        `Primary tileset  : ${formatHex(layout?.primaryTilesetPointer ?? 0)}`,
        `Secondary tileset: ${formatHex(layout?.secondaryTilesetPointer ?? 0)}`,
        "",
        `Events ptr       : ${formatHex(header.eventsPointer)}`,
        `Events offset    : ${formatHex(header.eventsOffset)}`,
        `Object count     : ${events.objectCount}`,
        `Warp count       : ${events.warpCount}`,
        `Coord count      : ${events.coordCount}`,
        `BG count         : ${events.bgCount}`,
        "",
        `Object ptr       : ${formatHex(events.objectPointer)}`,
        `Object offset    : ${formatHex(events.objectOffset)}`,
        `Warp ptr         : ${formatHex(events.warpPointer)}`,
        `Warp offset      : ${formatHex(events.warpOffset)}`,
        `Coord ptr        : ${formatHex(events.coordPointer)}`,
        `Coord offset     : ${formatHex(events.coordOffset)}`,
        `BG ptr           : ${formatHex(events.bgPointer)}`,
        `BG offset        : ${formatHex(events.bgOffset)}`,
        "",
        `Scripts ptr      : ${formatHex(header.scriptsPointer)}`,
        `Connections ptr  : ${formatHex(header.connectionsPointer)}`,
        "",
        `music            : ${formatHex(header.music, 4)}`,
        `mapLayoutId      : ${header.mapLayoutId}`,
        `cave             : ${header.cave}`,
        `weather          : ${header.weather}`,
        `mapType          : ${header.mapType}`,
        `filler_18        : ${formatHex(fillerLow, 2)} ${formatHex(fillerHigh, 2)}`,
        "",
        `allowCycling     : ${Number(header.allowsBiking)}`,
        `allowEscaping    : ${Number(header.allowsEscaping)}`,
        `allowRunning     : ${Number(header.allowsRunning)}`,
        `showMapName      : ${Number(header.showsMapName)}`,
        `mapFlags raw     : ${formatHex(header.mapFlags, 2)}`,
        `battleType       : ${header.battleType}`,
      ].join("\n")
    },
  },
}
</script>

<style lang="scss" scoped>
.map-info-panel {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: #fff;
}

.right-panel-title {
  flex: 0 0 auto;
  padding: 12px 14px;
  border-bottom: 1px solid #e4edf7;
  color: #153b78;
  font-size: 14px;
  font-weight: 800;
}

.map-info-text {
  min-height: 0;
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: #172033;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
