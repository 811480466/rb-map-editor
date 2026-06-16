<template>
  <div class="wild-pokemon-panel">
    <div class="right-panel-title">野生宝可梦</div>
    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!currentMap" description="请先选择地图" />
    <div v-else class="wild-panel-body">
      <section class="wild-panel-card">
        <div class="wild-panel-row">
          <span class="wild-panel-label">当前地图</span>
          <span class="wild-panel-value">{{ currentMap.name }}</span>
        </div>
        <div class="wild-panel-row">
          <span class="wild-panel-label">地图编号</span>
          <span class="wild-panel-value">{{ currentMap.mapGroup }}:{{ currentMap.mapNum }}</span>
        </div>
        <div class="wild-panel-row">
          <span class="wild-panel-label">Header</span>
          <span class="wild-panel-value mono">{{ wildHeader ? formatHex(wildHeader.offset) : "无" }}</span>
        </div>
        <div class="wild-panel-row">
          <span class="wild-panel-label">Header 表</span>
          <span class="wild-panel-value mono">{{ formatHex(repository?.table?.offset) }}</span>
        </div>
      </section>

      <section v-if="!wildHeader" class="wild-panel-card muted">
        <div class="wild-panel-status-title">当前地图无遭遇表</div>
        <div class="wild-panel-note">可以在中间面板创建 WildMonInfo / WildPokemon 数据。</div>
      </section>

      <template v-else>
        <section class="wild-panel-summary">
          <div class="wild-summary-item">
            <span>{{ enabledGroupCount }}</span>
            <label>遭遇类型</label>
          </div>
          <div class="wild-summary-item">
            <span>{{ totalSlotCount }}</span>
            <label>槽位</label>
          </div>
        </section>

        <section class="wild-panel-card">
          <div v-for="row in groupRows" :key="row.key" class="wild-group-block" :class="{ empty: !row.group }">
            <div class="wild-group-head">
              <span>{{ row.label }}</span>
              <span>{{ row.status }}</span>
            </div>
            <div class="wild-group-meta">
              <span>Info</span>
              <span class="mono">{{ row.infoOffset }}</span>
            </div>
            <div class="wild-group-meta">
              <span>Slots</span>
              <span class="mono">{{ row.slotsOffset }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { WILD_ENCOUNTER_GROUPS } from "@/core"
import { formatHex } from "@/util"

export default {
  name: "WildPokemonPanel",
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
    repository() {
      return this.project?.wildEncounterRepository || null
    },
    wildHeader() {
      if (!this.repository || !this.currentMap) return null
      return this.repository.getHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    groupRows() {
      return WILD_ENCOUNTER_GROUPS.map(def => {
        const group = this.wildHeader?.groups?.[def.key] || null
        return {
          key: def.key,
          label: def.label,
          group,
          status: group ? `${group.encounterRate} / ${group.slots.length}` : "可添加",
          infoOffset: group ? formatHex(group.offset) : "null",
          slotsOffset: group ? formatHex(group.slotsOffset) : "null",
        }
      })
    },
    enabledGroupCount() {
      return this.groupRows.filter(row => row.group).length
    },
    totalSlotCount() {
      return this.groupRows.reduce((total, row) => total + (row.group?.slots.length || 0), 0)
    },
  },
  methods: {
    formatHex,
  },
}
</script>

<style lang="scss" scoped>
.wild-pokemon-panel {
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

.wild-panel-body {
  display: grid;
  min-height: 0;
  gap: 12px;
  padding: 12px;
  overflow: auto;
}

.wild-panel-card,
.wild-panel-summary {
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fbfdff;
}

.wild-panel-card {
  padding: 10px;
}

.wild-panel-card.muted {
  border-style: dashed;
  color: #64748b;
}

.wild-panel-row {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px dashed #dbe7f6;
}

.wild-panel-row:last-child {
  border-bottom: 0;
}

.wild-panel-label,
.wild-group-meta span:first-child,
.wild-summary-item label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.wild-panel-value {
  min-width: 0;
  overflow: hidden;
  color: #153b78;
  font-size: 12px;
  font-weight: 800;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wild-panel-status-title {
  color: #153b78;
  font-size: 13px;
  font-weight: 800;
}

.wild-panel-note {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.wild-panel-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.wild-summary-item {
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #e4edf7;
}

.wild-summary-item:last-child {
  border-right: 0;
}

.wild-summary-item span {
  color: #153b78;
  font-size: 22px;
  font-weight: 900;
}

.wild-group-block {
  padding: 9px 0;
  border-bottom: 1px solid #edf3fb;
}

.wild-group-block:first-child {
  padding-top: 0;
}

.wild-group-block:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.wild-group-block.empty {
  opacity: 0.68;
}

.wild-group-head,
.wild-group-meta {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.wild-group-head {
  color: #153b78;
  font-size: 13px;
  font-weight: 800;
}

.wild-group-meta {
  margin-top: 5px;
  font-size: 12px;
}

.mono {
  font-family: Consolas, Monaco, monospace;
}
</style>
