<template>
  <div class="map-edit-view">
    <div class="map-edit-toolbar">
      <span class="toolbar-label">工具栏</span>
      <el-radio-group :model-value="mapEditState.mouseMode" size="small" @change="updateEditState({ mouseMode: $event })">
        <el-radio value="view">查看</el-radio>
        <el-radio value="pick">拾取</el-radio>
        <el-radio value="paint">绘制</el-radio>
      </el-radio-group>
      <el-checkbox :model-value="mapEditState.showGrid" @change="updateEditState({ showGrid: Boolean($event) })">
        网格
      </el-checkbox>
      <span v-if="renderStats.rendered" class="render-status">
        {{ renderStats.fallback ? "Fallback" : "ROM tileset" }}
      </span>
    </div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="map-stage">
      <div ref="viewport" class="map-viewport" @wheel="handleViewportWheel" @mouseleave="clearHover">
        <div class="map-canvas-wrap" :style="canvasWrapStyle">
          <canvas
            ref="mapCanvas" class="map-canvas" :style="canvasStyle"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
          ></canvas>
          <div v-if="selectedCell" class="cell-marker selected" :style="cellMarkerStyle(selectedCell)"></div>
          <div v-if="hoverCell" class="cell-marker hover" :style="cellMarkerStyle(hoverCell)"></div>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible" class="cell-tooltip" :style="tooltipStyle">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script>
import {
  TILE_CELL_SIZE,
  readMapCellInfo,
  renderHeaderMapToCanvas,
  writeMapBlockId,
  writeMapCollision,
} from "@/core"
import { formatHex } from "@/util"

const MAP_ZOOM_MIN = 0.5
const MAP_ZOOM_MAX = 4
const MAP_ZOOM_FACTOR = 1.12

export default {
  name: "MapEditView",
  props: {
    project: {
      type: Object,
      default: null,
    },
    currentMap: {
      type: Object,
      default: null,
    },
    mapEditState: {
      type: Object,
      required: true,
    },
  },
  emits: ["map-updated", "map-edit-state-updated"],
  data() {
    return {
      canvasSize: {
        width: 0,
        height: 0,
      },
      zoom: 1,
      hoverCell: null,
      selectedCell: null,
      renderStats: {
        rendered: false,
        fallback: false,
        missingMetatiles: 0,
        missingTiles: 0,
      },
      tooltip: {
        visible: false,
        left: 0,
        top: 0,
        text: "",
      },
    }
  },
  computed: {
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
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
        this.mapEditState.showGrid ? "grid" : "plain",
        this.mapEditState.activeTab,
        this.mapEditState.collision?.opacity,
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
      this.hoverCell = null
      this.selectedCell = null
      this.hideTooltip()
    },
  },
  mounted() {
    this.renderMap()
  },
  methods: {
    updateEditState(patch) {
      this.$emit("map-edit-state-updated", patch)
    },
    renderMap() {
      this.$nextTick(() => {
        const canvas = this.$refs.mapCanvas
        if (!canvas || !this.mapHeader) return

        this.renderStats = renderHeaderMapToCanvas(canvas, this.mapHeader, {
          showGrid: this.mapEditState.showGrid,
        })

        if (this.mapEditState.activeTab === "collision") {
          this.drawCollisionOverlay(canvas)
        }

        this.canvasSize = {
          width: canvas.width,
          height: canvas.height,
        }
      })
    },
    drawCollisionOverlay(canvas) {
      const ctx = canvas.getContext("2d")
      const layout = this.mapHeader?.layout
      if (!ctx || !layout) return

      const opacity = Math.max(0, Math.min(100, Number(this.mapEditState.collision?.opacity ?? 42))) / 100
      ctx.save()
      ctx.font = `${Math.max(10, Math.floor(TILE_CELL_SIZE * 0.42))}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      for (let y = 0; y < layout.height; y += 1) {
        for (let x = 0; x < layout.width; x += 1) {
          const info = readMapCellInfo(this.mapHeader, x, y)
          if (!info) continue

          const left = x * TILE_CELL_SIZE
          const top = y * TILE_CELL_SIZE
          if (info.collision > 0) {
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`
            ctx.fillRect(left, top, TILE_CELL_SIZE, TILE_CELL_SIZE)
            ctx.fillStyle = "#ffffff"
          } else {
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 0.45})`
            ctx.fillRect(left, top, TILE_CELL_SIZE, TILE_CELL_SIZE)
            ctx.fillStyle = "#14532d"
          }

          ctx.fillText(String(info.elevation), left + TILE_CELL_SIZE / 2, top + TILE_CELL_SIZE / 2)
        }
      }

      ctx.restore()
    },
    handleCanvasMove(event) {
      const cell = this.getCellFromEvent(event)
      this.hoverCell = cell
      if (!cell) {
        this.hideTooltip()
        return
      }

      const info = readMapCellInfo(this.mapHeader, cell.x, cell.y)
      this.tooltip = {
        visible: Boolean(info),
        left: event.clientX + 14,
        top: event.clientY + 14,
        text: this.formatCellTooltip(info),
      }
    },
    handleCanvasClick(event) {
      const cell = this.getCellFromEvent(event)
      if (!cell) return

      this.selectedCell = cell
      if (this.mapEditState.mouseMode === "pick") {
        this.pickMapBlock(cell)
        return
      }

      if (this.mapEditState.mouseMode !== "paint") return

      const changed = this.mapEditState.activeTab === "collision"
        ? writeMapCollision(
          this.mapHeader,
          cell.x,
          cell.y,
          Number(this.mapEditState.collision?.value ?? 1),
          Number(this.mapEditState.collision?.elevation ?? 3),
        )
        : writeMapBlockId(this.mapHeader, cell.x, cell.y, Number(this.mapEditState.selectedBlockId ?? 0))

      if (!changed) return
      this.renderMap()
      this.$emit("map-updated", {
        key: this.mapHeader.key,
        field: this.mapEditState.activeTab === "collision" ? "collision" : "block",
        dirty: true,
        reloadMaps: false,
      })
    },
    pickMapBlock(cell) {
      const info = readMapCellInfo(this.mapHeader, cell.x, cell.y)
      if (!info) return

      this.updateEditState({
        activeTab: "tiles",
        selectedBlockId: info.blockId,
      })
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
    cellMarkerStyle(cell) {
      const cellSize = TILE_CELL_SIZE * this.zoom
      return {
        left: `${cell.x * cellSize}px`,
        top: `${cell.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }
    },
    formatCellTooltip(info) {
      if (!info) return ""

      const attr = info.attributes || {}
      const lines = [
        `x:${info.x} y:${info.y}`,
        `blockId=${info.blockId} (${formatHex(info.blockId, 4)})`,
        `${attr.source || (info.blockId >= 0x200 ? "secondary" : "primary")} metatile=${attr.localMetatileId ?? info.blockId}`,
        `raw=${formatHex(info.rawBlock, 4)} collision=${info.collision} elevation=${info.elevation}`,
      ]

      if (attr.rawAttributes !== null && attr.rawAttributes !== undefined) {
        lines.push(`behavior=${formatHex(attr.behavior, 3)} attrCollision=${attr.collision}`)
        lines.push(`encounter=${attr.encounterType} terrain=${attr.terrainType}`)
      }

      return lines.join("\n")
    },
    clearHover() {
      this.hoverCell = null
      this.hideTooltip()
    },
    hideTooltip() {
      this.tooltip.visible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.map-edit-view {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #eaf1ff;
}

.map-edit-toolbar {
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

.render-status {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
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

.cell-marker.selected {
  border: 2px solid rgba(239, 68, 68, 0.88);
}

.cell-tooltip {
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
