<template>
  <div class="map-event-panel">
    <div class="right-panel-title">地图事件</div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="event-panel-body">
      <el-segmented
        :model-value="mapEventState.filter"
        :options="filterOptions"
        size="small"
        @change="updateEventState({ filter: $event, selectedKey: '' })"
      />

      <div class="event-count-row">
        <span>OBJ {{ eventCounts.object }}</span>
        <span>TRAINER {{ eventCounts.trainer }}</span>
        <span>WARP {{ eventCounts.warp }}</span>
        <span>EVENT {{ eventCounts.coord + eventCounts.bg }}</span>
      </div>

      <div class="event-actions">
        <el-select v-model="addType" size="small" class="add-type-select">
          <el-option value="object" label="对象" />
          <el-option value="warp" label="传送点" />
          <el-option value="coord" label="坐标事件" />
          <el-option value="bg" label="背景事件" />
        </el-select>
        <el-button type="primary" size="small" @click="openAddDialog">新增</el-button>
      </div>

      <div class="event-list">
        <button
          v-for="event in filteredEvents"
          :key="eventKey(event)"
          type="button"
          class="event-row"
          :class="{ active: selectedKey === eventKey(event) }"
          @click="selectEvent(event)"
        >
          <span class="event-badge" :class="eventBadgeClass(event)">{{ eventBadgeText(event) }}</span>
          <span class="event-row-main">
            <span class="event-row-title">#{{ event.index }} ({{ event.x }}, {{ event.y }})</span>
            <span class="event-row-meta">{{ eventMeta(event) }}</span>
          </span>
        </button>
        <el-empty v-if="!filteredEvents.length" description="当前分类没有事件" />
      </div>

      <div v-if="selectedEvent" class="event-detail">
        <div class="detail-head">
          <div>
            <div class="detail-title">{{ eventTypeLabel(selectedEvent) }} #{{ selectedEvent.index }}</div>
            <div class="detail-subtitle">{{ formatHex(selectedEvent.offset) }}</div>
          </div>
          <el-button size="small" @click="clearSelection">返回</el-button>
        </div>

        <section class="event-section">
          <div class="section-title">位置</div>
          <div class="field-grid compact">
            <label class="field">
              <span>x</span>
              <el-input-number v-model="formValues.x" :min="-32768" :max="32767" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>y</span>
              <el-input-number v-model="formValues.y" :min="-32768" :max="32767" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>z</span>
              <el-input-number v-model="formValues.elevation" :min="0" :max="255" size="small" controls-position="right" />
            </label>
          </div>
        </section>

        <section v-if="selectedEvent.type === 'object'" class="event-section">
          <div class="section-title">对象参数</div>
          <div class="field-grid">
            <label class="field">
              <span>localId</span>
              <el-input-number v-model="formValues.localId" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>graphicsId</span>
              <el-input-number v-model="formValues.graphicsId" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>kind</span>
              <el-input-number v-model="formValues.inConnection" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>moveType</span>
              <el-input-number v-model="formValues.movementType" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>rangeX</span>
              <el-input-number v-model="formValues.movementRangeX" :min="0" :max="15" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>rangeY</span>
              <el-input-number v-model="formValues.movementRangeY" :min="0" :max="15" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>trainerType</span>
              <el-input-number v-model="formValues.trainerType" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>trainerRange</span>
              <el-input-number
                v-model="formValues.trainerRangeOrBerryTreeId"
                :min="0" :max="65535" size="small" controls-position="right"
              />
            </label>
            <label class="field">
              <span>scriptPtr</span>
              <el-input-number
                v-model="formValues.scriptPointer"
                :min="0" :max="4294967295" size="small" controls-position="right"
              />
            </label>
            <label class="field">
              <span>flag</span>
              <el-input-number v-model="formValues.eventFlag" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>padding03</span>
              <el-input-number v-model="formValues.padding03" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>padding16</span>
              <el-input-number v-model="formValues.padding16" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label v-if="selectedEvent.trainerBattle" class="field">
              <span>trainerId</span>
              <el-input-number v-model="formValues.trainerId" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
          </div>
        </section>

        <section v-else-if="selectedEvent.type === 'warp'" class="event-section">
          <div class="section-title">传送目标</div>
          <div class="field-grid">
            <label class="field">
              <span>mapGroup</span>
              <el-input-number v-model="formValues.mapGroup" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>mapNum</span>
              <el-input-number v-model="formValues.mapNum" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>warpId</span>
              <el-input-number v-model="formValues.warpId" :min="0" :max="255" size="small" controls-position="right" />
            </label>
          </div>
          <div v-if="warpInfo" class="warp-status" :class="warpInfo.status">
            <div>{{ warpInfo.statusText }}</div>
            <div>目标：{{ warpTargetText }}</div>
            <div>目标 Warp：{{ warpTargetWarpText }}</div>
            <el-button :disabled="!warpInfo.targetMap" size="small" @click="jumpToWarpTarget">跳转目标地图</el-button>
          </div>
        </section>

        <section v-else-if="selectedEvent.type === 'coord'" class="event-section">
          <div class="section-title">坐标事件</div>
          <div class="field-grid">
            <label class="field">
              <span>trigger</span>
              <el-input-number v-model="formValues.trigger" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>indexVar</span>
              <el-input-number v-model="formValues.indexVariable" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>scriptPtr</span>
              <el-input-number
                v-model="formValues.scriptPointer"
                :min="0" :max="4294967295" size="small" controls-position="right"
              />
            </label>
          </div>
        </section>

        <section v-else-if="selectedEvent.type === 'bg'" class="event-section">
          <div class="section-title">背景事件</div>
          <div class="field-grid">
            <label class="field">
              <span>kind</span>
              <el-input-number v-model="formValues.kind" :min="0" :max="255" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>argument</span>
              <el-input-number v-model="formValues.argument" :min="0" :max="65535" size="small" controls-position="right" />
            </label>
            <label class="field">
              <span>scriptPtr</span>
              <el-input-number
                v-model="formValues.scriptPointer"
                :min="0" :max="4294967295" size="small" controls-position="right"
              />
            </label>
          </div>
        </section>

        <div class="detail-actions">
          <el-button type="primary" size="small" @click="saveSelectedEvent">保存</el-button>
          <el-button size="small" @click="resetForm">撤销</el-button>
          <el-button type="danger" size="small" @click="deleteSelectedEvent">删除</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="addDialogVisible" title="新增事件" width="420px" append-to-body>
      <div class="add-form">
        <label class="field">
          <span>类型</span>
          <el-select v-model="addType" size="small">
            <el-option value="object" label="对象" />
            <el-option value="warp" label="传送点" />
            <el-option value="coord" label="坐标事件" />
            <el-option value="bg" label="背景事件" />
          </el-select>
        </label>
        <div class="field-grid compact">
          <label class="field">
            <span>x</span>
            <el-input-number v-model="addForm.x" :min="-32768" :max="32767" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>y</span>
            <el-input-number v-model="addForm.y" :min="-32768" :max="32767" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>z</span>
            <el-input-number v-model="addForm.elevation" :min="0" :max="255" size="small" controls-position="right" />
          </label>
        </div>

        <div v-if="addType === 'object'" class="field-grid">
          <label class="field">
            <span>localId</span>
            <el-input-number v-model="addForm.localId" :min="0" :max="255" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>graphicsId</span>
            <el-input-number v-model="addForm.graphicsId" :min="0" :max="255" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>scriptPtr</span>
            <el-input-number v-model="addForm.scriptPointer" :min="0" :max="4294967295" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>flag</span>
            <el-input-number v-model="addForm.eventFlag" :min="0" :max="65535" size="small" controls-position="right" />
          </label>
        </div>

        <div v-else-if="addType === 'warp'" class="field-grid">
          <label class="field">
            <span>mapGroup</span>
            <el-input-number v-model="addForm.mapGroup" :min="0" :max="255" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>mapNum</span>
            <el-input-number v-model="addForm.mapNum" :min="0" :max="255" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>warpId</span>
            <el-input-number v-model="addForm.warpId" :min="0" :max="255" size="small" controls-position="right" />
          </label>
        </div>

        <div v-else-if="addType === 'coord'" class="field-grid">
          <label class="field">
            <span>trigger</span>
            <el-input-number v-model="addForm.trigger" :min="0" :max="65535" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>indexVar</span>
            <el-input-number v-model="addForm.indexVariable" :min="0" :max="65535" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>scriptPtr</span>
            <el-input-number v-model="addForm.scriptPointer" :min="0" :max="4294967295" size="small" controls-position="right" />
          </label>
        </div>

        <div v-else-if="addType === 'bg'" class="field-grid">
          <label class="field">
            <span>kind</span>
            <el-input-number v-model="addForm.kind" :min="0" :max="255" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>argument</span>
            <el-input-number v-model="addForm.argument" :min="0" :max="65535" size="small" controls-position="right" />
          </label>
          <label class="field">
            <span>scriptPtr</span>
            <el-input-number v-model="addForm.scriptPointer" :min="0" :max="4294967295" size="small" controls-position="right" />
          </label>
        </div>
      </div>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddEvent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus"
import {
  MAP_EVENT_TYPE_OPTIONS,
  getMapEventKey,
  getMapEventTypeLabel,
} from "@/core"
import { formatHex } from "@/util"

export default {
  name: "MapEventPanel",
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
    mapEventState: {
      type: Object,
      required: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  emits: ["map-event-state-updated", "map-updated", "select-map"],
  data() {
    return {
      formValues: {},
      addDialogVisible: false,
      addType: "object",
      addForm: this.createAddForm(),
    }
  },
  computed: {
    repository() {
      return this.project?.mapEventRepository || null
    },
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    filterOptions() {
      return MAP_EVENT_TYPE_OPTIONS.map(option => ({
        label: option.label,
        value: option.value,
      }))
    },
    eventCollection() {
      if (!this.repository || !this.mapHeader) return null
      return this.repository.parseEvents(this.mapHeader, this.revision)
    },
    allEvents() {
      return this.eventCollection?.all || []
    },
    filteredEvents() {
      return this.allEvents.filter(event => this.matchesFilter(event))
    },
    selectedKey() {
      return this.mapEventState.selectedKey || ""
    },
    selectedEvent() {
      return this.allEvents.find(event => this.eventKey(event) === this.selectedKey) || null
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
    warpInfo() {
      if (!this.repository || !this.selectedEvent || this.selectedEvent.type !== "warp") return null
      return this.repository.getWarpDestinationInfo(this.selectedEvent, this.mapHeader)
    },
    warpTargetText() {
      const target = this.warpInfo?.targetMap
      if (!target) return `group=${this.selectedEvent?.mapGroup}, map=${this.selectedEvent?.mapNum}`
      const mapItem = this.maps.find(item => item.key === target.key)
      return mapItem?.name || target.key
    },
    warpTargetWarpText() {
      const warp = this.warpInfo?.targetWarp
      if (!warp) return `未找到 warpId=${this.selectedEvent?.warpId}`
      return `#${warp.index} (${warp.x}, ${warp.y}) z=${warp.elevation}`
    },
  },
  watch: {
    selectedKey: {
      immediate: true,
      handler() {
        this.resetForm()
      },
    },
    revision() {
      this.resetForm()
    },
    currentMap() {
      this.resetForm()
    },
  },
  methods: {
    updateEventState(patch) {
      this.$emit("map-event-state-updated", patch)
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
    eventTypeLabel(event) {
      return getMapEventTypeLabel(event)
    },
    eventBadgeText(event) {
      if (event.type === "object" && event.trainerBattle) return "B"
      if (event.type === "object") return "N"
      if (event.type === "warp") return "W"
      if (event.type === "bg") return "S"
      if (event.type === "coord") return "T"
      return "?"
    },
    eventBadgeClass(event) {
      if (event.type === "object" && event.trainerBattle) return "trainer"
      return event.type
    },
    eventMeta(event) {
      if (event.type === "object") {
        const trainer = event.trainerBattle ? ` trainerId=${event.trainerBattle.trainerId}` : ""
        return `localId=${event.localId} gfx=${formatHex(event.graphicsId, 2)} flag=${event.eventFlag}${trainer}`
      }
      if (event.type === "warp") return `to ${event.mapGroup}:${event.mapNum} warp=${event.warpId}`
      if (event.type === "coord") return `trigger=${event.trigger} script=${formatHex(event.scriptPointer)}`
      if (event.type === "bg") return `kind=${event.kind} script=${formatHex(event.scriptPointer)}`
      return ""
    },
    selectEvent(event) {
      this.updateEventState({
        selectedKey: this.eventKey(event),
        filter: this.mapEventState.filter || "all",
      })
    },
    clearSelection() {
      this.updateEventState({ selectedKey: "" })
    },
    resetForm() {
      this.formValues = this.buildFormValues(this.selectedEvent)
    },
    buildFormValues(event) {
      if (!event) return {}

      const common = {
        x: event.x,
        y: event.y,
        elevation: event.elevation,
      }

      if (event.type === "object") {
        return {
          ...common,
          localId: event.localId,
          graphicsId: event.graphicsId,
          inConnection: event.inConnection,
          padding03: event.padding03,
          movementType: event.movementType,
          movementRangeX: event.movementRangeX,
          movementRangeY: event.movementRangeY,
          trainerType: event.trainerType,
          trainerRangeOrBerryTreeId: event.trainerRangeOrBerryTreeId,
          scriptPointer: event.scriptPointer,
          eventFlag: event.eventFlag,
          padding16: event.padding16,
          trainerId: event.trainerBattle?.trainerId ?? 0,
        }
      }

      if (event.type === "warp") {
        return {
          ...common,
          mapGroup: event.mapGroup,
          mapNum: event.mapNum,
          warpId: event.warpId,
        }
      }

      if (event.type === "coord") {
        return {
          ...common,
          trigger: event.trigger,
          indexVariable: event.indexVariable,
          scriptPointer: event.scriptPointer,
        }
      }

      if (event.type === "bg") {
        return {
          ...common,
          kind: event.kind,
          argument: event.argument,
          scriptPointer: event.scriptPointer,
        }
      }

      return common
    },
    async saveSelectedEvent() {
      if (!this.repository || !this.mapHeader || !this.selectedEvent) return

      try {
        this.repository.updateEvent(this.mapHeader, this.selectedEvent.type, this.selectedEvent.index, this.formValues)
        this.$emit("map-updated", {
          key: this.mapHeader.key,
          field: "events",
          dirty: true,
          reloadMaps: false,
        })
        ElMessage.success("事件已保存")
      } catch (error) {
        ElMessage.error(error?.message || "事件保存失败")
      }
    },
    async deleteSelectedEvent() {
      if (!this.repository || !this.mapHeader || !this.selectedEvent) return

      try {
        await ElMessageBox.confirm(
          `确定删除 ${this.eventTypeLabel(this.selectedEvent)} #${this.selectedEvent.index} 吗？同类事件 index 会向前移动。`,
          "删除事件",
          { type: "warning" },
        )
        this.repository.deleteEvent(this.mapHeader, this.selectedEvent.type, this.selectedEvent.index)
        this.updateEventState({ selectedKey: "" })
        this.$emit("map-updated", {
          key: this.mapHeader.key,
          field: "events",
          dirty: true,
          reloadMaps: false,
        })
        ElMessage.success("事件已删除")
      } catch (error) {
        if (error === "cancel") return
        ElMessage.error(error?.message || "事件删除失败")
      }
    },
    openAddDialog() {
      const filter = this.mapEventState.filter
      this.addType = ["object", "warp", "coord", "bg"].includes(filter) ? filter : "object"
      this.addForm = this.createAddForm()
      this.addDialogVisible = true
    },
    createAddForm() {
      return {
        x: 0,
        y: 0,
        elevation: 0,
        localId: 1,
        graphicsId: 0,
        scriptPointer: 0,
        eventFlag: 0,
        mapGroup: 0,
        mapNum: 0,
        warpId: 0,
        trigger: 0,
        indexVariable: 0,
        kind: 0,
        argument: 0,
      }
    },
    submitAddEvent() {
      if (!this.repository || !this.mapHeader) return

      try {
        const collection = this.repository.addEvent(this.mapHeader, this.addType, this.addForm)
        const events = this.eventsForType(collection, this.addType)
        const created = events[events.length - 1]
        this.addDialogVisible = false
        this.updateEventState({
          filter: this.addType,
          selectedKey: created ? this.eventKey(created) : "",
        })
        this.$emit("map-updated", {
          key: this.mapHeader.key,
          field: "events",
          dirty: true,
          reloadMaps: false,
        })
        ElMessage.success("事件已新增")
      } catch (error) {
        ElMessage.error(error?.message || "事件新增失败")
      }
    },
    eventsForType(collection, type) {
      if (type === "object") return collection.objects
      if (type === "warp") return collection.warps
      if (type === "coord") return collection.coords
      if (type === "bg") return collection.backgrounds
      return []
    },
    jumpToWarpTarget() {
      const target = this.warpInfo?.targetMap
      if (!target) return
      const item = this.maps.find(map => map.key === target.key)
      if (item) this.$emit("select-map", item)
    },
    formatHex,
  },
}
</script>

<style lang="scss" scoped>
.map-event-panel {
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

.event-panel-body {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.event-count-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.event-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.add-type-select {
  min-width: 0;
  flex: 1 1 auto;
}

.event-list {
  min-height: 120px;
  max-height: 260px;
  overflow: auto;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #f8fafc;
}

.event-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 0;
  border-bottom: 1px solid #e4edf7;
  background: transparent;
  color: #172033;
  text-align: left;
  cursor: pointer;
}

.event-row:last-child {
  border-bottom: 0;
}

.event-row.active {
  background: #eaf1ff;
}

.event-badge {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
}

.event-badge.object {
  background: #2563eb;
}

.event-badge.trainer {
  background: #dc2626;
}

.event-badge.warp {
  background: #9333ea;
}

.event-badge.coord {
  background: #16a34a;
}

.event-badge.bg {
  background: #ea580c;
}

.event-row-main {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.event-row-title {
  font-size: 12px;
  font-weight: 900;
}

.event-row-meta {
  overflow: hidden;
  color: #64748b;
  font-family: Consolas, Monaco, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-detail {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #f8fbff;
}

.detail-title {
  color: #153b78;
  font-size: 13px;
  font-weight: 900;
}

.detail-subtitle {
  margin-top: 2px;
  color: #64748b;
  font-family: Consolas, Monaco, monospace;
  font-size: 11px;
}

.event-section {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fff;
}

.section-title {
  margin-bottom: 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 900;
}

.field-grid {
  display: grid;
  gap: 8px;
}

.field-grid.compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field {
  display: grid;
  min-width: 0;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.field-grid.compact .field {
  grid-template-columns: 16px minmax(0, 1fr);
}

.warp-status {
  display: grid;
  gap: 5px;
  margin-top: 10px;
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.45;
}

.warp-status.ok {
  background: #dcfce7;
  color: #166534;
}

.warp-status.warn {
  background: #fef3c7;
  color: #92400e;
}

.warp-status.bad {
  background: #fee2e2;
  color: #991b1b;
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-bottom: 4px;
}

.add-form {
  display: grid;
  gap: 12px;
}
</style>
