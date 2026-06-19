<template>
  <div class="map-connection-view">
    <div class="connection-toolbar">
      <span class="toolbar-label">连接预览</span>
      <el-checkbox v-model="showGrid">网格</el-checkbox>
      <span v-if="parsedConnections" class="connection-status">
        {{ parsedConnections.status }} / {{ parsedConnections.connections.length }} 条
      </span>
    </div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="connection-stage">
      <div class="connection-shell">
        <div class="connection-row" :class="{ 'has-extra': edgeMap.emerge.connection }">
          <button
            type="button" class="connection-edge connection-north"
            :class="edgeMap.north.className" :disabled="!edgeMap.north.targetMap"
            :title="edgeMap.north.title" @click="jumpToConnection(edgeMap.north)"
          >
            <span class="connection-edge-main">{{ edgeMap.north.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.north.sub }}</span>
          </button>
          <button
            v-if="edgeMap.emerge.connection" type="button" class="connection-edge"
            :class="edgeMap.emerge.className" :disabled="!edgeMap.emerge.targetMap"
            :title="edgeMap.emerge.title" @click="jumpToConnection(edgeMap.emerge)"
          >
            <span class="connection-edge-main">{{ edgeMap.emerge.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.emerge.sub }}</span>
          </button>
        </div>

        <div class="connection-middle">
          <button
            type="button" class="connection-edge connection-west"
            :class="edgeMap.west.className" :disabled="!edgeMap.west.targetMap"
            :title="edgeMap.west.title" @click="jumpToConnection(edgeMap.west)"
          >
            <span class="connection-edge-main">{{ edgeMap.west.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.west.sub }}</span>
          </button>

          <div ref="viewport" class="connection-viewport" @wheel="handleViewportWheel">
            <div class="connection-canvas-wrap" :style="canvasWrapStyle">
              <canvas ref="previewCanvas" class="connection-canvas" :style="canvasStyle"></canvas>
            </div>
          </div>

          <button
            type="button" class="connection-edge connection-east"
            :class="edgeMap.east.className" :disabled="!edgeMap.east.targetMap"
            :title="edgeMap.east.title" @click="jumpToConnection(edgeMap.east)"
          >
            <span class="connection-edge-main">{{ edgeMap.east.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.east.sub }}</span>
          </button>
        </div>

        <div class="connection-row" :class="{ 'has-extra': edgeMap.dive.connection }">
          <button
            type="button" class="connection-edge connection-south"
            :class="edgeMap.south.className" :disabled="!edgeMap.south.targetMap"
            :title="edgeMap.south.title" @click="jumpToConnection(edgeMap.south)"
          >
            <span class="connection-edge-main">{{ edgeMap.south.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.south.sub }}</span>
          </button>
          <button
            v-if="edgeMap.dive.connection" type="button" class="connection-edge"
            :class="edgeMap.dive.className" :disabled="!edgeMap.dive.targetMap"
            :title="edgeMap.dive.title" @click="jumpToConnection(edgeMap.dive)"
          >
            <span class="connection-edge-main">{{ edgeMap.dive.main }}</span>
            <span class="connection-edge-sub">{{ edgeMap.dive.sub }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  TILE_CELL_SIZE,
  connectionDirectionShortName,
  renderHeaderMapToCanvas,
} from "@/core"

const EDGE_ITEMS = [
  { key: "north", direction: 2, emptyMain: "上", emptySub: "无连接" },
  { key: "west", direction: 3, emptyMain: "左", emptySub: "无连接" },
  { key: "east", direction: 4, emptyMain: "右", emptySub: "无连接" },
  { key: "south", direction: 1, emptyMain: "下", emptySub: "无连接" },
  { key: "dive", direction: 5, emptyMain: "潜水", emptySub: "无连接" },
  { key: "emerge", direction: 6, emptyMain: "上浮", emptySub: "无连接" },
]

const MAP_ZOOM_MIN = 0.5
const MAP_ZOOM_MAX = 4
const MAP_ZOOM_FACTOR = 1.12

export default {
  name: "MapConnectionView",
  props: {
    project: {
      type: Object,
      default: null,
    },
    currentMap: {
      type: Object,
      default: null,
    },
    maps: {
      type: Array,
      default: () => [],
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  emits: ["select-map"],
  data() {
    return {
      showGrid: false,
      canvasSize: {
        width: 0,
        height: 0,
      },
      zoom: 1,
    }
  },
  computed: {
    repository() {
      return this.project?.mapConnectionRepository || null
    },
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    parsedConnections() {
      const revision = this.revision
      if (revision < 0) return null
      if (!this.repository || !this.mapHeader) return null
      return this.repository.parseConnections(this.mapHeader)
    },
    edgeMap() {
      const edges = {}
      const connections = this.parsedConnections?.connections || []

      for (const item of EDGE_ITEMS) {
        const sameDirection = connections.filter(connection => connection.direction === item.direction)
        const connection = sameDirection[0] || null
        edges[item.key] = this.buildEdgeInfo(item, connection, sameDirection.length)
      }

      return edges
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
    renderKey() {
      return [
        this.currentMap?.key || "",
        this.showGrid ? "grid" : "plain",
        this.revision,
      ].join(":")
    },
  },
  watch: {
    renderKey: {
      immediate: true,
      handler() {
        this.renderPreview()
      },
    },
  },
  mounted() {
    this.renderPreview()
  },
  methods: {
    buildEdgeInfo(item, connection, count) {
      if (!connection) {
        return {
          item,
          connection: null,
          targetMap: null,
          className: "empty",
          main: item.emptyMain,
          sub: item.emptySub,
          title: `${item.emptyMain}方向没有连接`,
        }
      }

      const info = this.repository?.getConnectionDestinationInfo(connection, this.mapHeader)
      const targetMap = info?.targetMap || null
      const targetName = targetMap ? this.getMapDisplayName(targetMap) : "未匹配地图"
      const more = count > 1 ? ` +${count - 1}` : ""
      const className = info?.status === "ok" ? "conn-ok" : (info?.status === "bad" ? "conn-bad" : "conn-warn")

      return {
        item,
        connection,
        targetMap,
        className,
        main: `${connectionDirectionShortName(connection.direction)} → ${targetName}${more}`,
        sub: `Group ${connection.mapGroup} / Map ${connection.mapNum} offset ${connection.connectionOffset}`,
        title: `${targetName}\n${info?.statusText || "未能判断"}\n点击跳转到连接地图`,
      }
    },
    renderPreview() {
      this.$nextTick(() => {
        const canvas = this.$refs.previewCanvas
        if (!canvas || !this.repository || !this.mapHeader) return

        const rects = this.repository.getConnectionPreviewRects(this.mapHeader)
        if (rects.length <= 1) {
          renderHeaderMapToCanvas(canvas, this.mapHeader, { showGrid: this.showGrid })
          this.drawPreviewFrame(canvas.getContext("2d"), rects[0], 0, 0, canvas.width, canvas.height)
          this.drawNoConnectionOverlay(canvas.getContext("2d"))
          this.updateCanvasSize(canvas)
          return
        }

        const captures = this.captureMaps(rects)
        const bounds = this.repository.getPreviewBounds(rects)
        const width = Math.max(1, bounds.maxX - bounds.minX) * TILE_CELL_SIZE
        const height = Math.max(1, bounds.maxY - bounds.minY) * TILE_CELL_SIZE
        const ctx = canvas.getContext("2d")

        canvas.width = width
        canvas.height = height
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)

        for (const rect of rects.filter(item => item.kind !== "current")) {
          this.drawPreviewRect(ctx, rect, captures, bounds, 0.45)
        }

        this.drawPreviewRect(ctx, rects[0], captures, bounds, 1)
        this.updateCanvasSize(canvas)
      })
    },
    captureMaps(rects) {
      const captures = new Map()

      for (const rect of rects) {
        const key = rect.header.offset
        if (captures.has(key)) continue

        const image = document.createElement("canvas")
        renderHeaderMapToCanvas(image, rect.header, { showGrid: this.showGrid })
        captures.set(key, image)
      }

      return captures
    },
    drawPreviewRect(ctx, rect, captures, bounds, alpha) {
      const image = captures.get(rect.header.offset)
      if (!ctx || !image) return

      const drawX = (rect.x - bounds.minX) * TILE_CELL_SIZE
      const drawY = (rect.y - bounds.minY) * TILE_CELL_SIZE
      const drawW = rect.w * TILE_CELL_SIZE
      const drawH = rect.h * TILE_CELL_SIZE
      const sourceX = rect.cropX * TILE_CELL_SIZE
      const sourceY = rect.cropY * TILE_CELL_SIZE
      const sourceW = rect.cropW * TILE_CELL_SIZE
      const sourceH = rect.cropH * TILE_CELL_SIZE

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH)
      ctx.restore()
      this.drawPreviewFrame(ctx, rect, drawX, drawY, drawW, drawH)
    },
    drawPreviewFrame(ctx, rect, drawX, drawY, drawW, drawH) {
      if (!ctx || !rect) return

      const isCurrent = rect.kind === "current"
      const name = this.getMapDisplayName(rect.header)
      const label = isCurrent
        ? `当前地图：${name}`
        : `${connectionDirectionShortName(rect.conn.direction)}：${name} / offset ${rect.conn.connectionOffset}`

      ctx.save()
      ctx.font = "700 12px Arial"
      const labelWidth = Math.min(Math.max(94, ctx.measureText(label).width + 16), Math.max(94, drawW - 8))

      ctx.globalAlpha = 1
      ctx.lineWidth = isCurrent ? 3 : 2
      ctx.strokeStyle = isCurrent ? "#7c3aed" : "#0ea5e9"
      if (!isCurrent) ctx.setLineDash([8, 5])
      ctx.strokeRect(drawX + 0.5, drawY + 0.5, Math.max(1, drawW - 1), Math.max(1, drawH - 1))
      ctx.fillStyle = isCurrent ? "rgba(124, 58, 237, 0.90)" : "rgba(2, 132, 199, 0.84)"
      ctx.fillRect(drawX + 4, drawY + 4, labelWidth, 22)
      ctx.fillStyle = "#ffffff"
      ctx.textBaseline = "middle"
      ctx.fillText(label, drawX + 12, drawY + 15, Math.max(64, labelWidth - 16))
      ctx.restore()
    },
    drawNoConnectionOverlay(ctx) {
      if (!ctx) return

      ctx.save()
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)"
      ctx.fillRect(12, 12, 260, 36)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.55)"
      ctx.strokeRect(12.5, 12.5, 259, 35)
      ctx.fillStyle = "#64748b"
      ctx.font = "700 12px Arial"
      ctx.textAlign = "start"
      ctx.textBaseline = "middle"
      ctx.fillText("当前地图没有可预览的四向连接。", 24, 30)
      ctx.restore()
    },
    updateCanvasSize(canvas) {
      this.canvasSize = {
        width: canvas.width,
        height: canvas.height,
      }
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
    getMapDisplayName(header) {
      const map = this.maps.find(item => item.key === header?.key)
      return map?.name || header?.regionSection?.name || `Group ${header?.mapGroup} / Map ${header?.mapNum}`
    },
    jumpToConnection(edge) {
      const target = edge?.targetMap
      if (!target) return

      const map = this.maps.find(item => item.key === target.key)
      if (map) this.$emit("select-map", map)
    },
  },
}
</script>

<style lang="scss" scoped>
.map-connection-view {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #eaf1ff;
}

.connection-toolbar {
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

.connection-status {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.connection-stage {
  min-height: 0;
  padding: 12px 10px 16px;
  overflow: hidden;
}

.connection-shell {
  display: grid;
  grid-template-rows: 74px minmax(0, 1fr) 74px;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.connection-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
  gap: 8px;
}

.connection-row.has-extra {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.connection-middle {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 150px;
  min-height: 0;
  gap: 8px;
}

.connection-viewport {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #fff;
}

.connection-canvas-wrap {
  position: relative;
  min-width: 100%;
  min-height: 100%;
}

.connection-canvas {
  display: block;
  image-rendering: pixelated;
}

.connection-edge {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #fff;
  color: #155e75;
  text-align: center;
  cursor: pointer;
}

.connection-edge:disabled {
  cursor: default;
}

.connection-edge-main,
.connection-edge-sub {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.connection-edge-main {
  color: #153b78;
  font-size: 12px;
  font-weight: 900;
}

.connection-edge-sub {
  color: #166534;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.connection-edge.empty {
  border-color: #d8e2ef;
  background: #f8fafc;
  color: #94a3b8;
}

.connection-edge.empty .connection-edge-main,
.connection-edge.empty .connection-edge-sub {
  color: #94a3b8;
}

.connection-edge.conn-ok {
  border-color: #86efac;
  background: #f0fdf4;
}

.connection-edge.conn-warn {
  border-color: #fcd34d;
  background: #fffbeb;
}

.connection-edge.conn-warn .connection-edge-sub {
  color: #92400e;
}

.connection-edge.conn-bad {
  border-color: #fca5a5;
  background: #fef2f2;
}

.connection-edge.conn-bad .connection-edge-sub {
  color: #991b1b;
}

.connection-west,
.connection-east {
  width: 150px;
}

</style>
