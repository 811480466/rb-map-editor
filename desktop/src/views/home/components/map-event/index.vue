<template>
  <div class="map-event-view">
    <div class="map-event-toolbar">
      <el-checkbox :model-value="mapEventState.showGrid" @change="updateEventState({ showGrid: Boolean($event) })">
        网格
      </el-checkbox>
      <el-checkbox
        :model-value="mapEventState.showMovementRange"
        @change="updateEventState({ showMovementRange: Boolean($event) })"
      >
        移动范围
      </el-checkbox>
    </div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="map-stage">
      <div ref="viewport" class="map-viewport" @wheel="handleViewportWheel" @mouseleave="clearHover">
        <div class="map-canvas-wrap" :style="canvasWrapStyle">
          <canvas
            ref="mapCanvas"
            class="map-canvas"
            :style="canvasStyle"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
          ></canvas>
          <div v-if="hoverCell" class="cell-marker hover" :style="cellMarkerStyle(hoverCell)"></div>

          <div
            v-for="event in visibleEvents"
            :key="eventKey(event)"
            class="event-marker"
            :class="[eventMarkerClass(event), { selected: isSelectedEvent(event), sprite: Boolean(eventSprite(event)) }]"
            :style="eventMarkerStyle(event)"
            @click.stop="selectEvent(event)"
            @mousemove="handleCanvasMove"
          >
            <img
              v-if="eventSprite(event)"
              class="event-sprite-image"
              :src="eventSprite(event).dataUrl"
              :alt="eventTitle(event)"
              draggable="false"
            />
            <template v-else>{{ eventMarkerText(event) }}</template>
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

    <div v-if="project && mapHeader" class="legend-bar">
      <div class="event-legend">
        <span class="legend-item"><span class="legend-badge object">N</span>NPC/物体</span>
        <span class="legend-item"><span class="legend-badge trainer">B</span>训练家</span>
        <span class="legend-item"><span class="legend-badge warp">W</span>传送点</span>
        <span class="legend-item"><span class="legend-badge bg">S</span>背景事件</span>
        <span class="legend-item"><span class="legend-badge coord">T</span>触发事件</span>
      </div>
    </div>

    <div v-if="tooltip.visible" class="event-tooltip" :style="tooltipStyle">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script>
import {
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
      hoverCell: null,
    }
  },
  computed: {
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
      return this.allEvents
    },
    movementRangeEvents() {
      if (!this.mapEventState.showMovementRange) return []
      return this.visibleEvents.filter(event =>
        event.type === "object" &&
        (Number(event.movementRangeX) > 0 || Number(event.movementRangeY) > 0)
      )
    },
    eventSprites() {
      const repository = this.project?.objectEventGraphicsRepository
      const sprites = new Map()
      if (!repository) return sprites

      this.visibleEvents.forEach((event) => {
        if (event.type !== "object") return
        const graphicsId = Number(event.graphicsId)
        if (!Number.isInteger(graphicsId) || sprites.has(graphicsId)) return
        sprites.set(graphicsId, repository.getSprite(graphicsId))
      })

      return sprites
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
      this.clearHover()
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
    eventKey(event) {
      return getMapEventKey(event)
    },
    selectEvent(event) {
      this.updateEventState({
        selectedKey: this.eventKey(event),
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
      const sprite = this.eventSprite(event)
      if (sprite) return this.eventSpriteMarkerStyle(event, sprite)

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
    eventSprite(event) {
      if (event.type !== "object") return null
      return this.eventSprites.get(Number(event.graphicsId)) || null
    },
    eventSpriteMarkerStyle(event, sprite) {
      const cellSize = TILE_CELL_SIZE * this.zoom
      const width = Math.max(8, Math.round(sprite.renderWidth * this.zoom))
      const height = Math.max(8, Math.round(sprite.renderHeight * this.zoom))
      return {
        left: `${Math.round(event.x * cellSize + cellSize / 2 - width / 2)}px`,
        top: `${Math.round(event.y * cellSize + cellSize - height)}px`,
        width: `${width}px`,
        height: `${height}px`,
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
    handleCanvasMove(event) {
      const cell = this.getCellFromEvent(event)
      if (!cell) {
        this.clearHover()
        return
      }

      const hit = this.findTopEventAtCell(cell)
      this.hoverCell = {
        ...cell,
        elevation: hit ? hit.elevation : "-",
      }
      this.tooltip = {
        visible: true,
        left: event.clientX + 14,
        top: event.clientY + 14,
        text: this.formatHoverCellTooltip(this.hoverCell),
      }
    },
    findTopEventAtCell(cell) {
      return [...this.visibleEvents].reverse().find(event => event.x === cell.x && event.y === cell.y) || null
    },
    cellMarkerStyle(cell) {
      const cellSize = TILE_CELL_SIZE * this.zoom
      return {
        left: `${cell.x * cellSize}px`,
        top: `${cell.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }
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
      const lines = [
        `${getMapEventTypeLabel(event)} #${event.index}`,
        `x:${event.x} y:${event.y} elevation:${event.elevation}`,
        `offset:${formatHex(event.offset)}`,
      ]
      if (event.type === "object") lines.push(`graphicsId:${formatHex(event.graphicsId, 2)}`)
      return lines.join("\n")
    },
    formatHoverCellTooltip(cell) {
      return [
        `x:${cell.x} y:${cell.y}`,
        `z:${cell.elevation}`,
      ].join("\n")
    },
    hideTooltip() {
      this.tooltip.visible = false
    },
    clearHover() {
      this.hoverCell = null
      this.hideTooltip()
    },
  },
}
</script>

<style lang="scss" scoped>
.map-event-view {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
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

.map-stage {
  min-height: 0;
  padding: 16px 10px 10px;
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
  cursor: crosshair;
}

.cell-marker {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  pointer-events: none;
}

.cell-marker.hover {
  border: 2px solid rgba(37, 99, 235, 0.72);
  background: rgba(37, 99, 235, 0.08);
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

.event-marker.sprite {
  border: 0;
  background: transparent;
  filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.35));
}

.event-sprite-image {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  pointer-events: none;
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

.event-marker.sprite.object,
.event-marker.sprite.trainer {
  background: transparent;
}

.event-marker.selected {
  z-index: 4;
  outline: 3px solid rgba(250, 204, 21, 0.95);
  outline-offset: 2px;
}

.event-marker.sprite.selected {
  border-radius: 3px;
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

.legend-bar {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #d8e2ef;
  background: rgba(255, 255, 255, 0.9);
}

.event-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.legend-badge {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
}

.legend-badge.object {
  background: #2563eb;
}

.legend-badge.trainer {
  background: #dc2626;
}

.legend-badge.warp {
  background: #9333ea;
}

.legend-badge.coord {
  background: #16a34a;
}

.legend-badge.bg {
  background: #ea580c;
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
