<template>
  <div class="map-event-view">
    <div class="map-event-toolbar">
      <span class="toolbar-label">事件工具</span>
      <el-segmented
        :model-value="mapEventState.filter"
        :options="filterOptions"
        size="small"
        @change="updateEventState({ filter: $event })"
      />
      <el-checkbox :model-value="mapEventState.showGrid" @change="updateEventState({ showGrid: Boolean($event) })">
        网格
      </el-checkbox>
      <span class="event-summary">
        OBJ {{ eventCounts.object }} / TRAINER {{ eventCounts.trainer }} / WARP {{ eventCounts.warp }} /
        EVENT {{ eventCounts.coord + eventCounts.bg }}
      </span>
    </div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="map-stage">
      <div ref="viewport" class="map-viewport" @wheel="handleViewportWheel">
        <div class="map-canvas-wrap" :style="canvasWrapStyle" @mouseleave="hideTooltip">
          <canvas ref="mapCanvas" class="map-canvas" :style="canvasStyle" @click="handleCanvasClick"></canvas>

          <div
            v-for="event in visibleEvents"
            :key="eventKey(event)"
            class="event-marker"
            :class="[eventMarkerClass(event), { selected: isSelectedEvent(event) }]"
            :style="eventMarkerStyle(event)"
            :title="eventTitle(event)"
            @click.stop="selectEvent(event)"
            @mouseenter="showEventTooltip($event, event)"
            @mousemove="moveTooltip($event)"
            @mouseleave="hideTooltip"
          >
            {{ eventMarkerText(event) }}
          </div>

          <div
            v-for="event in movementRangeEvents"
            :key="`range:${eventKey(event)}`"
            class="movement-range"
            :class="{ selected: isSelectedEvent(event) }"
            :style="movementRangeStyle(event)"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible" class="event-tooltip" :style="tooltipStyle">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script>
import {
  MAP_EVENT_TYPE_OPTIONS,
  TILE_CELL_SIZE,
  getMapEventKey,
  getMapEventTypeLabel,
  renderHeaderMapToCanvas,
} from "@/core"
import { formatHex } from "@/util"

const MAP_ZOOM_MIN = 0.5
const MAP_ZOOM_MAX = 4
const MAP_ZOOM_FACTOR = 1.12

export default {
  name: "MapEventView",
  props: {
    project: {
      type: Object,
      default: null,
    },
    currentMap: {
      type: Object,
      default: null,
    },
    mapEventState: {
      type: Object,
      required: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  emits: ["map-event-state-updated"],
  data() {
    return {
      canvasSize: {
        width: 0,
        height: 0,
      },
      zoom: 1,
      tooltip: {
        visible: false,
        left: 0,
        top: 0,
        text: "",
      },
    }
  },
  computed: {
    filterOptions() {
      return MAP_EVENT_TYPE_OPTIONS.map(option => ({
        label: option.label,
        value: option.value,
      }))
    },
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    eventCollection() {
      if (!this.project?.mapEventRepository || !this.mapHeader) return null
      return this.project.mapEventRepository.parseEvents(this.mapHeader, this.revision)
    },
    allEvents() {
      return this.eventCollection?.all || []
    },
    visibleEvents() {
      return this.allEvents.filter(event => this.matchesFilter(event))
    },
    movementRangeEvents() {
      return this.visibleEvents.filter(event =>
        event.type === "object" &&
        (Number(event.movementRangeX) > 0 || Number(event.movementRangeY) > 0)
      )
    },
    eventCounts() {
      return {
        object: this.allEvents.filter(event => event.type === "object" && !event.trainerBattle).length,
        trainer: this.allEvents.filter(event => event.type === "object" && event.trainerBattle).length,
        warp: this.allEvents.filter(event => event.type === "warp").length,
        coord: this.allEvents.filter(event => event.type === "coord").length,
        bg: this.allEvents.filter(event => event.type === "bg").length,
      }
    },
    canvasWrapStyle() {
      return {
        width: `${this.scaledCanvasSize.width}px`,
        height: `${this.scaledCanvasSize.height}px`,
      }
    },
    canvasStyle() {
      return {
        width: `${this.scaledCanvasSize.width}px`,
        height: `${this.scaledCanvasSize.height}px`,
      }
    },
    scaledCanvasSize() {
      return {
        width: Math.max(1, Math.round(this.canvasSize.width * this.zoom)),
        height: Math.max(1, Math.round(this.canvasSize.height * this.zoom)),
      }
    },
    tooltipStyle() {
      return {
        left: `${this.tooltip.left}px`,
        top: `${this.tooltip.top}px`,
      }
    },
    renderKey() {
      return [
        this.currentMap?.key || "",
        this.mapEventState.showGrid ? "grid" : "plain",
        this.revision,
      ].join(":")
    },
  },
  watch: {
    renderKey: {
      immediate: true,
      handler() {
        this.renderMap()
      },
    },
    currentMap() {
      this.updateEventState({ selectedKey: "" })
      this.hideTooltip()
    },
  },
  mounted() {
    this.renderMap()
  },
  methods: {
    updateEventState(patch) {
      this.$emit("map-event-state-updated", patch)
    },
    renderMap() {
      this.$nextTick(() => {
        const canvas = this.$refs.mapCanvas
        if (!canvas || !this.mapHeader) return

        renderHeaderMapToCanvas(canvas, this.mapHeader, {
          showGrid: this.mapEventState.showGrid,
        })

        this.canvasSize = {
          width: canvas.width,
          height: canvas.height,
        }
      })
    },
    matchesFilter(event) {
      const filter = this.mapEventState.filter || "all"
      if (filter === "all") return true
      if (filter === "trainer") return event.type === "object" && event.trainerBattle
      if (filter === "object") return event.type === "object" && !event.trainerBattle
      return event.type === filter
    },
    eventKey(event) {
      return getMapEventKey(event)
    },
    selectEvent(event) {
      this.updateEventState({
        selectedKey: this.eventKey(event),
        filter: this.mapEventState.filter || "all",
      })
    },
    isSelectedEvent(event) {
      return this.mapEventState.selectedKey === this.eventKey(event)
    },
    eventMarkerText(event) {
      if (event.type === "object" && event.trainerBattle) return "B"
      if (event.type === "object") return "N"
      if (event.type === "warp") return "W"
      if (event.type === "bg") return "S"
      if (event.type === "coord") return "T"
      return "?"
    },
    eventMarkerClass(event) {
      if (event.type === "object" && event.trainerBattle) return "trainer"
      return event.type
    },
    eventMarkerStyle(event) {
      const cellSize = TILE_CELL_SIZE * this.zoom
      const pad = Math.max(3, Math.round(cellSize * 0.16))
      return {
        left: `${event.x * cellSize + pad}px`,
        top: `${event.y * cellSize + pad}px`,
        width: `${Math.max(12, cellSize - pad * 2)}px`,
        height: `${Math.max(12, cellSize - pad * 2)}px`,
        fontSize: `${Math.max(10, Math.round(cellSize * 0.42))}px`,
      }
    },
    movementRangeStyle(event) {
      const cellSize = TILE_CELL_SIZE * this.zoom
      const rangeX = Number(event.movementRangeX) || 0
      const rangeY = Number(event.movementRangeY) || 0
      return {
        left: `${(event.x - rangeX) * cellSize}px`,
        top: `${(event.y - rangeY) * cellSize}px`,
        width: `${(rangeX * 2 + 1) * cellSize}px`,
        height: `${(rangeY * 2 + 1) * cellSize}px`,
      }
    },
    handleCanvasClick(event) {
      const cell = this.getCellFromEvent(event)
      if (!cell) return

      const hit = [...this.visibleEvents].reverse().find(item => item.x === cell.x && item.y === cell.y)
      if (hit) this.selectEvent(hit)
    },
    getCellFromEvent(event) {
      const canvas = this.$refs.mapCanvas
      const layout = this.mapHeader?.layout
      if (!canvas || !layout) return null

      const rect = canvas.getBoundingClientRect()
      const canvasX = ((event.clientX - rect.left) * canvas.width) / rect.width
      const canvasY = ((event.clientY - rect.top) * canvas.height) / rect.height
      const x = Math.floor(canvasX / TILE_CELL_SIZE)
      const y = Math.floor(canvasY / TILE_CELL_SIZE)

      if (x < 0 || y < 0 || x >= layout.width || y >= layout.height) return null
      return { x, y }
    },
    handleViewportWheel(event) {
      if (!event.ctrlKey) return

      event.preventDefault()
      const viewport = this.$refs.viewport
      if (!viewport) return

      const oldZoom = this.zoom
      const nextZoom = this.clampZoom(event.deltaY < 0 ? oldZoom * MAP_ZOOM_FACTOR : oldZoom / MAP_ZOOM_FACTOR)
      if (nextZoom === oldZoom) return

      const rect = viewport.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const contentX = (viewport.scrollLeft + mouseX) / oldZoom
      const contentY = (viewport.scrollTop + mouseY) / oldZoom

      this.zoom = nextZoom
      this.$nextTick(() => {
        viewport.scrollLeft = contentX * nextZoom - mouseX
        viewport.scrollTop = contentY * nextZoom - mouseY
      })
    },
    clampZoom(value) {
      const clamped = Math.max(MAP_ZOOM_MIN, Math.min(MAP_ZOOM_MAX, Number(value)))
      return Math.round(clamped * 1000) / 1000
    },
    eventTitle(event) {
      return [
        `${getMapEventTypeLabel(event)} #${event.index}`,
        `x:${event.x} y:${event.y} elevation:${event.elevation}`,
        `offset:${formatHex(event.offset)}`,
      ].join("\n")
    },
    showEventTooltip(event, mapEvent) {
      this.tooltip = {
        visible: true,
        left: event.clientX + 14,
        top: event.clientY + 14,
        text: this.eventTitle(mapEvent),
      }
    },
    moveTooltip(event) {
      if (!this.tooltip.visible) return
      this.tooltip.left = event.clientX + 14
      this.tooltip.top = event.clientY + 14
    },
    hideTooltip() {
      this.tooltip.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.map-event-view {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #eaf1ff;
}

.map-event-toolbar {
  display: flex;
  min-height: 34px;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-bottom: 1px solid #d8e2ef;
  background: #fff;
}

.toolbar-label {
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 800;
}

.event-summary {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.map-stage {
  min-height: 0;
  padding: 64px 10px 16px;
  overflow: hidden;
}

.map-viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.map-canvas-wrap {
  position: relative;
  min-width: 100%;
  min-height: 100%;
}

.map-canvas {
  display: block;
  image-rendering: pixelated;
}

.event-marker {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.86);
  color: #fff;
  cursor: pointer;
  font-family: Arial, sans-serif;
  font-weight: 900;
  line-height: 1;
  user-select: none;
}

.event-marker.object {
  background: #2563eb;
}

.event-marker.trainer {
  background: #dc2626;
}

.event-marker.warp {
  background: #9333ea;
}

.event-marker.coord {
  background: #16a34a;
}

.event-marker.bg {
  background: #ea580c;
}

.event-marker.selected {
  z-index: 4;
  outline: 3px solid rgba(250, 204, 21, 0.95);
  outline-offset: 2px;
}

.movement-range {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  border: 2px solid rgba(220, 38, 38, 0.56);
  pointer-events: none;
}

.movement-range.selected {
  border-color: rgba(250, 204, 21, 0.9);
}

.event-tooltip {
  position: fixed;
  z-index: 50;
  max-width: 320px;
  padding: 7px 9px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
  color: #fff;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: none;
  white-space: pre;
}
</style>
