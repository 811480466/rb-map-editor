<template>
  <div class="map-edit-panel">
    <div class="right-panel-title">地图编辑</div>
    <div class="terrain-tabs">
      <button
        type="button" class="terrain-tab-btn"
        :class="{ active: mapEditState.activeTab === 'tiles' }"
        @click="updateEditState({ activeTab: 'tiles' })"
      >
        地形瓦片
      </button>
      <button
        type="button" class="terrain-tab-btn"
        :class="{ active: mapEditState.activeTab === 'collision' }"
        @click="updateEditState({ activeTab: 'collision' })"
      >
        地图碰撞
      </button>
    </div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else-if="mapEditState.activeTab === 'tiles'" class="tile-panel">
      <div class="panel-section-title">当前瓦片</div>
      <div class="tile-selection-box">
        <canvas ref="currentTileCanvas" width="32" height="32"></canvas>
      </div>

      <div class="panel-section-title">瓦片库</div>
      <div ref="tileLibraryWrap" class="tile-library-wrap">
        <canvas
          ref="tileLibraryCanvas" class="tile-library-canvas"
          :title="selectedBlockTitle"
          @click="handleTileLibraryClick"
        ></canvas>
      </div>
    </div>

    <div v-else class="collision-panel">
      <section class="collision-card">
        <div class="collision-card-label">透明度</div>
        <el-slider
          :model-value="collisionState.opacity" :min="0" :max="100"
          @input="updateCollision({ opacity: Number($event) })"
        />
      </section>

      <section class="collision-summary-grid">
        <div class="collision-summary-card">
          当前高度：{{ collisionState.elevation }}
        </div>
        <div class="collision-summary-card">
          当前碰撞：{{ collisionState.value }} {{ collisionStateText }}
        </div>
      </section>

      <section class="collision-card">
        <div class="panel-section-title compact">碰撞/高度方块</div>
        <div class="collision-choice-list">
          <template v-for="height in elevationChoices" :key="height">
            <button
              type="button" class="collision-choice passable"
              :class="{ active: collisionState.value === 0 && collisionState.elevation === height }"
              @click="selectCollisionChoice(0, height)"
            >
              {{ height }}
            </button>
            <button
              type="button" class="collision-choice blocked"
              :class="{ active: collisionState.value === 1 && collisionState.elevation === height }"
              @click="selectCollisionChoice(1, height)"
            >
              {{ height }}
            </button>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import {
  TILE_CELL_SIZE,
  drawMetatilePreviewToCanvas,
  getAvailableMetatileBlocks,
  getTilesetAssetsForHeader,
  getUsedMapBlocks,
} from "@/core"
import { formatHex } from "@/util"

const TILE_LIBRARY_COLUMNS = 8
const TILE_PREVIEW_OPTIONS = {
  skipBlankTiles: true,
}

export default {
  name: "MapEditPanel",
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
  emits: ["map-edit-state-updated"],
  data() {
    return {
      elevationChoices: Array.from({ length: 16 }, (_, index) => index),
    }
  },
  computed: {
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    tilesetAssets() {
      return getTilesetAssetsForHeader(this.mapHeader)
    },
    blockOptions() {
      const blocks = getAvailableMetatileBlocks(this.tilesetAssets.primary, this.tilesetAssets.secondary)
      return blocks.length ? blocks : getUsedMapBlocks(this.mapHeader)
    },
    selectedBlockId() {
      const selected = Number(this.mapEditState.selectedBlockId)
      if (Number.isInteger(selected)) return selected
      return this.blockOptions[0]?.blockId ?? 0
    },
    selectedBlockTitle() {
      const block = this.blockOptions.find(item => item.blockId === this.selectedBlockId)
      return block ? `${block.source} ${formatHex(block.blockId, 4)}` : ""
    },
    collisionState() {
      return {
        elevation: Number(this.mapEditState.collision?.elevation ?? 3),
        value: Number(this.mapEditState.collision?.value ?? 1),
        opacity: Number(this.mapEditState.collision?.opacity ?? 42),
      }
    },
    collisionStateText() {
      if (this.collisionState.value === 0) return "可通行"
      if (this.collisionState.value === 1) return "不可通行"
      return ""
    },
  },
  watch: {
    mapHeader: {
      immediate: true,
      handler() {
        this.ensureSelectedBlock()
        this.drawTiles()
      },
    },
    selectedBlockId() {
      this.drawTiles()
      this.scrollSelectedBlockIntoView()
    },
    "mapEditState.activeTab"() {
      this.drawTiles()
      this.scrollSelectedBlockIntoView()
    },
    blockOptions() {
      this.ensureSelectedBlock()
      this.drawTiles()
    },
  },
  mounted() {
    this.ensureSelectedBlock()
    this.drawTiles()
  },
  updated() {
    this.drawTiles()
  },
  methods: {
    updateEditState(patch) {
      this.$emit("map-edit-state-updated", patch)
    },
    updateCollision(patch) {
      this.updateEditState({
        collision: {
          ...this.mapEditState.collision,
          ...patch,
        },
      })
    },
    selectCollisionChoice(value, elevation) {
      this.updateCollision({
        value: Number(value),
        elevation: Number(elevation),
      })
    },
    ensureSelectedBlock() {
      if (!this.blockOptions.length) return
      if (this.blockOptions.some(block => block.blockId === this.selectedBlockId)) return
      this.selectBlock(this.blockOptions[0].blockId)
    },
    selectBlock(blockId) {
      this.updateEditState({ selectedBlockId: Number(blockId) & 0x03ff })
    },
    drawTiles() {
      if (this.mapEditState.activeTab !== "tiles") return
      this.$nextTick(() => {
        this.drawCurrentTile()
        this.drawTileLibrary()
      })
    },
    drawCurrentTile() {
      this.$nextTick(() => {
        drawMetatilePreviewToCanvas(this.$refs.currentTileCanvas, this.selectedBlockId, this.mapHeader, TILE_PREVIEW_OPTIONS)
      })
    },
    drawTileLibrary() {
      const canvas = this.$refs.tileLibraryCanvas
      const blocks = this.blockOptions
      if (!canvas || !blocks.length) return

      const rows = Math.ceil(blocks.length / TILE_LIBRARY_COLUMNS)
      canvas.width = TILE_LIBRARY_COLUMNS * TILE_CELL_SIZE
      canvas.height = rows * TILE_CELL_SIZE

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const tileCanvas = document.createElement("canvas")
      tileCanvas.width = TILE_CELL_SIZE
      tileCanvas.height = TILE_CELL_SIZE

      blocks.forEach((block, index) => {
        const x = (index % TILE_LIBRARY_COLUMNS) * TILE_CELL_SIZE
        const y = Math.floor(index / TILE_LIBRARY_COLUMNS) * TILE_CELL_SIZE
        drawMetatilePreviewToCanvas(tileCanvas, block.blockId, this.mapHeader, TILE_PREVIEW_OPTIONS)
        ctx.drawImage(tileCanvas, x, y)
      })

      this.drawSelectedBlockMarker(ctx)
      this.scrollSelectedBlockIntoView()
    },
    drawSelectedBlockMarker(ctx) {
      const index = this.blockOptions.findIndex(block => block.blockId === this.selectedBlockId)
      if (index < 0) return

      const x = (index % TILE_LIBRARY_COLUMNS) * TILE_CELL_SIZE
      const y = Math.floor(index / TILE_LIBRARY_COLUMNS) * TILE_CELL_SIZE

      ctx.save()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#111827"
      ctx.strokeRect(x + 1, y + 1, TILE_CELL_SIZE - 2, TILE_CELL_SIZE - 2)
      ctx.lineWidth = 1
      ctx.strokeStyle = "#fef3c7"
      ctx.strokeRect(x + 4.5, y + 4.5, TILE_CELL_SIZE - 9, TILE_CELL_SIZE - 9)
      ctx.restore()
    },
    handleTileLibraryClick(event) {
      const canvas = this.$refs.tileLibraryCanvas
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const canvasX = ((event.clientX - rect.left) * canvas.width) / rect.width
      const canvasY = ((event.clientY - rect.top) * canvas.height) / rect.height
      const column = Math.floor(canvasX / TILE_CELL_SIZE)
      const row = Math.floor(canvasY / TILE_CELL_SIZE)
      const block = this.blockOptions[row * TILE_LIBRARY_COLUMNS + column]
      if (block) this.selectBlock(block.blockId)
    },
    scrollSelectedBlockIntoView() {
      if (this.mapEditState.activeTab !== "tiles") return

      this.$nextTick(() => {
        const wrap = this.$refs.tileLibraryWrap
        if (!wrap) return

        const index = this.blockOptions.findIndex(block => block.blockId === this.selectedBlockId)
        if (index < 0) return

        const row = Math.floor(index / TILE_LIBRARY_COLUMNS)
        const top = row * TILE_CELL_SIZE
        const bottom = top + TILE_CELL_SIZE
        const viewTop = wrap.scrollTop
        const viewBottom = viewTop + wrap.clientHeight

        if (top >= viewTop && bottom <= viewBottom) return
        wrap.scrollTop = Math.max(0, top - Math.floor((wrap.clientHeight - TILE_CELL_SIZE) / 2))
      })
    },
    formatHex,
  },
}
</script>

<style lang="scss" scoped>
.map-edit-panel {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
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

.terrain-tabs {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid #e4edf7;
}

.terrain-tab-btn {
  height: 38px;
  padding: 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #1f5fbf;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.terrain-tab-btn.active {
  border-bottom-color: #2563eb;
  color: #153b78;
  font-weight: 900;
}

.tile-panel,
.collision-panel {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  padding: 12px;
}

.panel-section-title {
  flex: 0 0 auto;
  margin: 0 0 6px;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.panel-section-title.compact {
  margin-bottom: 10px;
}

.tile-selection-box {
  display: flex;
  min-height: 84px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-bottom: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #f8fafc;
}

.tile-selection-box canvas {
  width: 64px;
  height: 64px;
  border: 1px solid #94a3b8;
  background: #fff;
  image-rendering: pixelated;
}

.tile-library-wrap {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  padding: 8px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #f8fafc;
}

.tile-library-canvas {
  display: block;
  background: #fff;
  cursor: pointer;
  image-rendering: pixelated;
}

.collision-panel {
  gap: 12px;
  overflow: auto;
  background: #f8fbff;
}

.collision-card {
  padding: 12px 10px;
  border: 1px solid #cfe0f6;
  border-radius: 8px;
  background: #f8fbff;
}

.collision-card-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.collision-card :deep(.el-slider) {
  --el-slider-main-bg-color: #3797d3;
  --el-slider-runway-bg-color: #e5e7eb;
  --el-slider-stop-bg-color: #e5e7eb;
  --el-slider-button-size: 14px;
  margin: 0 2px;
}

.collision-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 10px;
  border: 1px solid #d6e5fb;
  border-radius: 8px;
  background: #f8fbff;
}

.collision-summary-card {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid #cfe0f6;
  border-radius: 8px;
  background: #fff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
}

.collision-choice-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.collision-choice {
  height: 44px;
  border: 1px solid #cfe0f6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.collision-choice.passable {
  background: #fff;
  color: #111827;
}

.collision-choice.blocked {
  border-color: #ef4444;
  background: #f14145;
  color: #fff;
}

.collision-choice.active {
  border-color: #2563eb;
  box-shadow: inset 0 0 0 2px rgba(37, 99, 235, 0.9);
}
</style>
