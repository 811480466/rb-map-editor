<template>
  <div class="map-connection-panel">
    <div class="right-panel-title">地图连接器</div>
    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="connection-panel-body">
      <section class="connection-head-card">
        <div class="connection-head-row">
          <span>当前地图</span>
          <strong>{{ currentMap?.name }}</strong>
        </div>
        <div class="connection-head-row">
          <span>地图编号</span>
          <strong>{{ mapHeader.mapGroup }}:{{ mapHeader.mapNum }}</strong>
        </div>
        <div class="connection-head-row">
          <span>connectionsPtr</span>
          <strong class="mono">{{ formatHex(mapHeader.connectionsPointer) }}</strong>
        </div>
        <div class="connection-head-row">
          <span>Header / Data</span>
          <strong class="mono">{{ formatHex(parsedConnections?.offset) }} / {{ formatHex(parsedConnections?.connectionsOffset) }}</strong>
        </div>
        <div class="connection-head-row">
          <span>数量 / 状态</span>
          <strong>{{ connections.length }} / {{ parsedConnections?.status }}</strong>
        </div>
        <div class="connection-head-row">
          <span>存储</span>
          <strong>{{ storageInfo.text }}</strong>
        </div>
      </section>

      <div class="connection-panel-actions">
        <el-button
          type="primary" :disabled="!canAddConnection"
          @click="openAddConnection"
        >
          新增连接
        </el-button>
        <span>{{ connections.length }}/{{ capacity }}</span>
      </div>

      <section v-if="!connections.length" class="connection-empty-card">
        当前地图没有连接信息，可以新增连接。
      </section>

      <section
        v-for="row in draftRows" :key="`${row.index}:${row.sourceOffset}`"
        class="connector-card"
      >
        <div class="connector-card-title">
          <span>#{{ row.index }} {{ connectionDirectionName(row.direction) }}</span>
          <span class="connection-badge" :class="statusClass(row)">
            {{ statusText(row) }}
          </span>
        </div>

        <div class="connector-grid">
          <label>方向</label>
          <el-select v-model="row.direction">
            <el-option
              v-for="option in directionOptions" :key="option.value"
              :label="option.label" :value="option.value"
            />
          </el-select>

          <label>偏移</label>
          <el-input-number
            v-model="row.connectionOffset" :min="-2147483648" :max="2147483647"
            :step="1" controls-position="right"
          />

          <label>目标地图</label>
          <el-select
            v-model="row.targetKey" filterable clearable 
            @change="updateTargetFromKey(row, $event)"
          >
            <el-option
              v-for="map in mapOptions" :key="map.key"
              :label="map.label" :value="map.key"
            />
          </el-select>

          <label>目标Group</label>
          <el-input-number
            v-model="row.mapGroup" :min="0" :max="255"
            :step="1" controls-position="right"
            @change="updateTargetFromNumbers(row)"
          />

          <label>目标Map</label>
          <el-input-number
            v-model="row.mapNum" :min="0" :max="255"
            :step="1" controls-position="right"
            @change="updateTargetFromNumbers(row)"
          />
        </div>

        <div class="connector-info">
          <div>目标：{{ targetText(row) }}</div>
          <div>结构 offset=<span class="mono">{{ formatHex(row.sourceOffset) }}</span></div>
        </div>

        <div class="connector-actions">
          <el-button type="primary" @click="saveConnection(row)">保存修改</el-button>
          <el-button
            :disabled="!targetMapFor(row)"
            @click="jumpToTarget(row)"
          >
            跳转目标地图
          </el-button>
          <el-button type="danger" plain @click="deleteConnection(row)">
            删除
          </el-button>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="adding" title="新增连接" width="460px"
      destroy-on-close append-to-body :close-on-click-modal="false"
      @closed="resetAddDraft"
    >
      <div class="connector-grid dialog-grid">
        <label>方向</label>
        <el-select v-model="addDraft.direction">
          <el-option
            v-for="option in directionOptions" :key="option.value"
            :label="option.label" :value="option.value"
          />
        </el-select>

        <label>偏移</label>
        <el-input-number
          v-model="addDraft.connectionOffset" :min="-2147483648" :max="2147483647"
          :step="1" controls-position="right"
        />

        <label>目标地图</label>
        <el-select
          v-model="addDraft.targetKey" filterable clearable
          @change="updateTargetFromKey(addDraft, $event)"
        >
          <el-option
            v-for="map in mapOptions" :key="map.key"
            :label="map.label" :value="map.key"
          />
        </el-select>

        <label>目标Group</label>
        <el-input-number
          v-model="addDraft.mapGroup" :min="0" :max="255"
          :step="1" controls-position="right"
          @change="updateTargetFromNumbers(addDraft)"
        />

        <label>目标Map</label>
        <el-input-number
          v-model="addDraft.mapNum" :min="0" :max="255"
          :step="1" controls-position="right"
          @change="updateTargetFromNumbers(addDraft)"
        />
      </div>

      <template #footer>
        <el-button @click="adding = false">取消</el-button>
        <el-button type="primary" @click="createConnection">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus"
import {
  CONNECTION_DIRECTION_OPTIONS,
  MANAGED_CONNECTION_CAPACITY,
  connectionDirectionName,
} from "@/core"
import { formatHex } from "@/util"

function createConnectionDraft(currentMap = null) {
  return {
    index: -1,
    sourceOffset: null,
    direction: 4,
    connectionOffset: 0,
    mapGroup: currentMap?.mapGroup ?? 0,
    mapNum: currentMap?.mapNum ?? 0,
    targetKey: currentMap?.key || "",
  }
}

export default {
  name: "MapConnectionPanel",
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
  emits: ["map-updated", "select-map"],
  data() {
    return {
      capacity: MANAGED_CONNECTION_CAPACITY,
      directionOptions: CONNECTION_DIRECTION_OPTIONS,
      localRevision: 0,
      adding: false,
      draftRows: [],
      addDraft: createConnectionDraft(this.currentMap),
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
      const revision = this.revision + this.localRevision
      if (revision < 0) return null
      if (!this.repository || !this.mapHeader) return null
      return this.repository.parseConnections(this.mapHeader)
    },
    connections() {
      return this.parsedConnections?.connections || []
    },
    storageInfo() {
      return this.repository?.getStorageInfo(this.parsedConnections) || {
        text: "unknown",
      }
    },
    canAddConnection() {
      return this.connections.length < MANAGED_CONNECTION_CAPACITY
    },
    mapOptions() {
      return this.maps.map(map => ({
        key: map.key,
        label: `${map.name}（Group ${map.mapGroup} / Map ${map.mapNum}）`,
        map,
      }))
    },
    syncKey() {
      return [
        this.currentMap?.key || "",
        this.revision,
        this.localRevision,
        this.parsedConnections?.status || "",
        this.parsedConnections?.connectionsOffset || "",
      ].join(":")
    },
  },
  watch: {
    syncKey: {
      immediate: true,
      handler() {
        this.syncDraftRows()
      },
    },
  },
  methods: {
    createEmptyDraft() {
      return createConnectionDraft(this.currentMap)
    },
    syncDraftRows() {
      this.draftRows = this.connections.map(connection => ({
        index: connection.index,
        sourceOffset: connection.offset,
        direction: connection.direction,
        connectionOffset: connection.connectionOffset,
        mapGroup: connection.mapGroup,
        mapNum: connection.mapNum,
        targetKey: connection.targetKey,
      }))
      this.addDraft = this.createEmptyDraft()
      this.adding = false
    },
    openAddConnection() {
      this.addDraft = this.createEmptyDraft()
      this.adding = true
    },
    resetAddDraft() {
      this.addDraft = this.createEmptyDraft()
    },
    updateTargetFromKey(row, key) {
      const target = this.maps.find(map => map.key === key)
      if (!target) return

      row.mapGroup = target.mapGroup
      row.mapNum = target.mapNum
      row.targetKey = target.key
    },
    updateTargetFromNumbers(row) {
      const key = `${Number(row.mapGroup)}:${Number(row.mapNum)}`
      row.targetKey = this.maps.some(map => map.key === key) ? key : ""
    },
    validateDraft(row) {
      const direction = Number(row.direction)
      const connectionOffset = Number(row.connectionOffset)
      const mapGroup = Number(row.mapGroup)
      const mapNum = Number(row.mapNum)

      if (![1, 2, 3, 4, 5, 6].includes(direction)) throw new Error("连接方向无效")
      if (!Number.isInteger(connectionOffset) || connectionOffset < -2147483648 || connectionOffset > 2147483647) {
        throw new Error("连接偏移必须是 32 位整数")
      }
      if (!Number.isInteger(mapGroup) || mapGroup < 0 || mapGroup > 255) throw new Error("目标 Group 必须是 0-255")
      if (!Number.isInteger(mapNum) || mapNum < 0 || mapNum > 255) throw new Error("目标 Map 必须是 0-255")

      return {
        direction,
        connectionOffset,
        mapGroup,
        mapNum,
      }
    },
    createConnection() {
      try {
        const values = this.validateDraft(this.addDraft)
        this.repository.addConnection(this.mapHeader, values)
        this.afterMutation("connection-add")
        ElMessage.success("连接已新增")
      } catch (error) {
        ElMessage.error(error?.message || "新增连接失败")
      }
    },
    saveConnection(row) {
      try {
        const values = this.validateDraft(row)
        this.repository.updateConnection(this.mapHeader, row.index, values)
        this.afterMutation("connection-update")
        ElMessage.success("连接已保存")
      } catch (error) {
        ElMessage.error(error?.message || "保存连接失败")
      }
    },
    async deleteConnection(row) {
      try {
        await ElMessageBox.confirm(`确定删除连接 #${row.index} 吗？`, "删除连接", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        })
        this.repository.deleteConnection(this.mapHeader, row.index)
        this.afterMutation("connection-delete")
        ElMessage.success("连接已删除")
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          ElMessage.error(error?.message || "删除连接失败")
        }
      }
    },
    afterMutation(field) {
      this.localRevision += 1
      this.syncDraftRows()
      this.$emit("map-updated", {
        key: this.mapHeader.key,
        field,
        dirty: true,
        reloadMaps: false,
      })
    },
    connectionInfo(row) {
      return this.repository?.getConnectionDestinationInfo(row, this.mapHeader) || null
    },
    statusText(row) {
      return this.connectionInfo(row)?.statusText || "未能判断"
    },
    statusClass(row) {
      const status = this.connectionInfo(row)?.status
      if (status === "ok") return "ok"
      if (status === "bad") return "bad"
      if (status === "warn") return "warn"
      return "neutral"
    },
    targetMapFor(row) {
      return this.connectionInfo(row)?.targetMap || null
    },
    targetText(row) {
      const target = this.targetMapFor(row)
      if (!target) return "未匹配地图"
      const map = this.maps.find(item => item.key === target.key)
      return map?.name || target.regionSection?.name || `Group ${target.mapGroup} / Map ${target.mapNum}`
    },
    jumpToTarget(row) {
      const target = this.targetMapFor(row)
      if (!target) return

      const map = this.maps.find(item => item.key === target.key)
      if (map) this.$emit("select-map", map)
    },
    formatHex,
    connectionDirectionName,
  },
}
</script>

<style lang="scss" scoped>
.map-connection-panel {
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

.connection-panel-body {
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 10px;
  padding: 12px;
  overflow: auto;
}

.connection-head-card,
.connection-empty-card,
.connector-card {
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fbfdff;
}

.connection-head-card {
  padding: 9px 10px;
}

.connection-head-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px dashed #dbe7f6;
  font-size: 12px;
}

.connection-head-row:last-child {
  border-bottom: 0;
}

.connection-head-row span {
  color: #64748b;
  font-weight: 700;
}

.connection-head-row strong {
  min-width: 0;
  overflow: hidden;
  color: #153b78;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connection-panel-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.connection-panel-actions span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.connection-empty-card {
  padding: 14px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
}

.connector-card {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.connector-card-title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
}

.connector-card-title > span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connection-badge {
  max-width: 128px;
  overflow: hidden;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connection-badge.ok {
  background: #dcfce7;
  color: #166534;
}

.connection-badge.warn {
  background: #fef3c7;
  color: #92400e;
}

.connection-badge.bad {
  background: #fee2e2;
  color: #991b1b;
}

.connection-badge.neutral {
  background: #e2e8f0;
  color: #475569;
}

.connector-grid {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.connector-grid label {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.connection-dialog-subtitle {
  margin: 0 0 16px;
  padding: 9px 10px;
  border: 1px solid #d8e2ef;
  border-left: 3px solid #2563eb;
  border-radius: 6px;
  background: #f8fbff;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
}

.dialog-grid {
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 12px;
}

.dialog-grid label {
  color: #475569;
}

.dialog-grid :deep(.el-input-number),
.dialog-grid :deep(.el-select) {
  width: 100%;
}

.connector-info {
  display: grid;
  gap: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.connector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mono {
  font-family: Consolas, Monaco, monospace;
}
</style>
