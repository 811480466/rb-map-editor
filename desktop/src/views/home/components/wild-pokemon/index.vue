<template>
  <div class="wild-pokemon-view">
    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!currentMap" description="请先选择地图" />
    <div v-else class="wild-content">
      <section class="wild-section">
        <div class="wild-head">
          <div>
            <div class="wild-title">野生宝可梦</div>
            <div class="wild-subtitle">
              {{ currentMap.name }} / group={{ currentMap.mapGroup }} map={{ currentMap.mapNum }}
            </div>
          </div>
          <div class="wild-status">
            {{ wildHeader ? `Header ${formatHex(wildHeader.offset)}` : "当前地图无遭遇表" }}
          </div>
        </div>
      </section>

      <section v-if="!wildHeader" class="wild-section">
        <div class="section-title">创建遭遇表</div>
        <div class="create-grid">
          <label class="wild-field">
            <span>默认宝可梦</span>
            <el-select-v2 v-model="createForm.pokemonId" :options="pokemonOptions" filterable />
          </label>
          <label class="wild-field">
            <span>最低等级</span>
            <el-input-number v-model="createForm.minLevel" :min="1" :max="100" controls-position="right" />
          </label>
          <label class="wild-field">
            <span>最高等级</span>
            <el-input-number v-model="createForm.maxLevel" :min="1" :max="100" controls-position="right" />
          </label>
        </div>
        <div class="create-checks">
          <el-checkbox v-for="def in groupDefs" :key="def.key" v-model="createGroups[def.key]">
            {{ def.label }}
          </el-checkbox>
        </div>
        <div class="wild-actions">
          <el-button type="primary" @click="createEncounter">创建遭遇表</el-button>
        </div>
      </section>

      <template v-else>
        <section class="wild-section">
          <div class="wild-tabs">
            <button
              v-for="def in groupDefs" :key="def.key" type="button" class="wild-tab"
              :class="{ active: activeGroupKey === def.key, empty: !wildHeader.groups?.[def.key] }"
              @click="selectGroup(def.key)"
            >
              <span>{{ def.label }}</span>
              <span>{{ wildHeader.groups?.[def.key]?.slots.length || 0 }}</span>
            </button>
          </div>
        </section>

        <section v-if="!currentGroup" class="wild-section empty-group">
          <div class="section-title">{{ currentGroupDef?.label }}遭遇</div>
          <div class="empty-group-body">
            <span>当前地图没有这一类遭遇数据。</span>
            <el-button type="primary" @click="createCurrentGroup">创建{{ currentGroupDef?.label }}遭遇</el-button>
          </div>
        </section>

        <section v-else class="wild-section">
          <div class="section-title">
            <span>{{ currentGroup.label }}遭遇</span>
            <span class="section-meta">
              Info {{ formatHex(currentGroup.offset) }} / Slots {{ formatHex(currentGroup.slotsOffset) }}
            </span>
          </div>

          <div class="wild-toolbar">
            <label class="wild-rate-field">
              <span>遭遇率</span>
              <el-input-number v-model="groupDraft.encounterRate" :min="0" :max="255" controls-position="right" />
            </label>
            <el-button type="primary" @click="applyGroupChanges">应用修改</el-button>
          </div>

          <div class="wild-table">
            <div class="wild-table-head">
              <span>槽位</span>
              <span>概率</span>
              <span>最低</span>
              <span>最高</span>
              <span>宝可梦</span>
              <span>偏移</span>
            </div>
            <div v-for="slot in groupDraft.slots" :key="slot.index" class="wild-row">
              <span class="mono">#{{ slot.index }}</span>
              <span>{{ slot.rate }}%</span>
              <el-input-number v-model="slot.minLevel" :min="1" :max="100" controls-position="right" />
              <el-input-number v-model="slot.maxLevel" :min="1" :max="100" controls-position="right" />
              <el-select-v2 v-model="slot.pokemonId" :options="pokemonOptions" filterable />
              <span class="mono">{{ formatHex(slot.offset) }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { POKEMON_SPECIES_OPTIONS, WILD_ENCOUNTER_GROUPS } from "@/core"
import { formatHex } from "@/util"

export default {
  name: "WildPokemonView",
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
  },
  emits: ["map-updated"],
  data() {
    return {
      revision: 0,
      activeGroupKey: "land",
      createForm: {
        pokemonId: 1,
        minLevel: 2,
        maxLevel: 2,
      },
      createGroups: {
        land: true,
        water: true,
        rockSmash: true,
        fishing: true,
      },
      groupDraft: {
        encounterRate: 0,
        slots: [],
      },
    }
  },
  computed: {
    repository() {
      return this.project?.wildEncounterRepository || null
    },
    groupDefs() {
      return WILD_ENCOUNTER_GROUPS
    },
    wildHeader() {
      this.revision
      if (!this.repository || !this.currentMap) return null
      return this.repository.getHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    currentGroupDef() {
      return this.groupDefs.find(def => def.key === this.activeGroupKey) || this.groupDefs[0]
    },
    currentGroup() {
      this.revision
      return this.wildHeader?.groups?.[this.activeGroupKey] || null
    },
    pokemonOptions() {
      return POKEMON_SPECIES_OPTIONS
    },
  },
  watch: {
    wildHeader: {
      immediate: true,
      handler(header) {
        this.selectInitialGroup(header)
        this.syncGroupDraft()
      },
    },
    activeGroupKey() {
      this.syncGroupDraft()
    },
  },
  methods: {
    selectInitialGroup(header) {
      if (!header) {
        this.activeGroupKey = "land"
        return
      }

      if (header.groups?.[this.activeGroupKey]) return
      const first = this.groupDefs.find(def => header.groups?.[def.key])
      this.activeGroupKey = first?.key || "land"
    },
    selectGroup(key) {
      this.activeGroupKey = key
    },
    syncGroupDraft() {
      const group = this.currentGroup
      if (!group) {
        this.groupDraft = {
          encounterRate: this.currentGroupDef?.defaultRate ?? 20,
          slots: [],
        }
        return
      }

      this.groupDraft = {
        encounterRate: group.encounterRate,
        slots: group.slots.map(slot => ({
          index: slot.index,
          offset: slot.offset,
          rate: slot.rate,
          minLevel: slot.minLevel,
          maxLevel: slot.maxLevel,
          pokemonId: slot.pokemonId,
        })),
      }
    },
    createEncounter() {
      try {
        const enabledGroups = this.groupDefs.filter(def => this.createGroups[def.key]).map(def => def.key)
        if (!enabledGroups.length) throw new Error("至少选择一种遭遇类型")

        this.repository.createEncounterForMap(this.currentMap.mapGroup, this.currentMap.mapNum, {
          enabledGroups,
          defaultEntry: {
            pokemonId: this.createForm.pokemonId,
            minLevel: this.createForm.minLevel,
            maxLevel: this.createForm.maxLevel,
          },
        })
        this.afterWrite("遭遇表已创建")
      } catch (error) {
        ElMessage.error(error?.message || "创建遭遇表失败")
      }
    },
    createCurrentGroup() {
      try {
        this.repository.addGroupToHeader(this.currentMap.mapGroup, this.currentMap.mapNum, this.activeGroupKey, {
          encounterRate: this.groupDraft.encounterRate,
          defaultEntry: {
            pokemonId: this.createForm.pokemonId,
            minLevel: this.createForm.minLevel,
            maxLevel: this.createForm.maxLevel,
          },
        })
        this.afterWrite(`${this.currentGroupDef?.label || ""}遭遇已创建`)
      } catch (error) {
        ElMessage.error(error?.message || "创建遭遇组失败")
      }
    },
    applyGroupChanges() {
      try {
        if (!this.currentGroup) throw new Error("当前遭遇组不存在")

        this.repository.writeEncounterRate(this.currentGroup, this.groupDraft.encounterRate)
        for (const draft of this.groupDraft.slots) {
          const slot = this.currentGroup.slots.find(item => item.index === draft.index)
          this.repository.writePokemonSlot(slot, draft)
        }
        this.afterWrite("野生宝可梦已修改")
      } catch (error) {
        ElMessage.error(error?.message || "修改野生宝可梦失败")
      }
    },
    afterWrite(message) {
      this.repository.reload()
      this.revision += 1
      this.syncGroupDraft()
      ElMessage.success(message)
      this.$emit("map-updated", { key: this.currentMap?.key, field: "wild", dirty: true })
    },
    formatHex,
  },
}
</script>

<style lang="scss" scoped>
.wild-pokemon-view {
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: #f8fbff;
}

.wild-content {
  display: grid;
  width: min(1120px, 100%);
  gap: 14px;
  margin: 0 auto;
  padding: 18px;
}

.wild-section {
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fff;
}

.wild-head,
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
}

.wild-head,
.section-title {
  border-bottom: 1px solid #e4edf7;
}

.wild-title,
.section-title {
  color: #153b78;
  font-size: 16px;
  font-weight: 800;
}

.wild-subtitle,
.wild-status,
.section-meta {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.create-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 160px 160px;
  gap: 14px;
  padding: 14px;
}

.wild-field,
.wild-rate-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: #415a82;
  font-size: 12px;
  font-weight: 800;
}

.create-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 14px 14px;
}

.wild-actions {
  padding: 0 14px 14px;
}

.wild-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
}

.wild-tab {
  display: inline-flex;
  min-width: 96px;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px;
  border: 1px solid #d8e2ef;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;

  &.active {
    border-color: #2563eb;
    background: #2563eb;
    color: #fff;
  }

  &.empty:not(.active) {
    color: #94a3b8;
  }
}

.empty-group-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  color: #64748b;
  font-size: 13px;
}

.wild-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
}

.wild-rate-field {
  width: 180px;
}

.wild-table {
  padding: 0 14px 14px;
}

.wild-table-head,
.wild-row {
  display: grid;
  grid-template-columns: 48px 48px 82px 82px minmax(280px, 1fr) 104px;
  gap: 8px;
  align-items: center;
}

.wild-table-head {
  padding: 0 8px 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.wild-row {
  min-height: 46px;
  margin-bottom: 7px;
  padding: 7px 8px;
  border: 1px solid #dbe7f6;
  border-radius: 8px;
  color: #172033;
  font-size: 12px;
}

.wild-row > * {
  min-width: 0;
}

.wild-row :deep(.el-input-number) {
  width: 82px;
}

.wild-row :deep(.el-select-v2) {
  width: 100%;
}

.mono {
  font-family: Consolas, Monaco, monospace;
}
</style>
