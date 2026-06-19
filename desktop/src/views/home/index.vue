<template>
  <div id="home-page">
    <!--左侧面板区域-->
    <div class="left-panel">
      <div class="panel-header">
        <div class="top-actions">
          <el-button :loading="importing" type="primary" @click="openRomFile">导入</el-button>
          <el-button :disabled="!project" @click="exportRom">导出</el-button>
          <input
            ref="romFileInput" class="rom-file-input" type="file"
            accept=".gba,.bin,.rom" @change="handleRomFileChange"
          />
        </div>
      </div>
      <div class="left-panel-body">
        <MapListView :maps="maps" :selected-map-key="selectedMapKey" :loaded="Boolean(project)" @select="selectMap" />
      </div>
    </div>
    <!--中间地图区域-->
    <div class="map-wrap">
      <div class="current-map-bar">
        <div class="current-map-label">当前地图</div>
        <div class="current-map-row">
          <div id="currentMapName" class="current-map-name">
            {{ currentMap?.name || "未选择地图" }}
          </div>
        </div>
      </div>
      <div class="editor-mode-bar">
        <div class="editor-mode-options">
          <template v-for="item in editorModeList" :key="item.code">
            <div
              class="editor-mode-option primary-btn" :class="{ active: currentEditorMode === item.code }"
              @click="selectEditMode(item.code)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
      </div>
      <div class="editor-mode-box">
        <MapEditView
          v-if="isEditorMode(editorModeCodes.mapEdit)"
          :project="project" :current-map="currentMap" :map-edit-state="mapEditState"
          @map-updated="handleMapUpdated"
          @map-edit-state-updated="handleMapEditStateUpdated"
        />
        <MapEventView
          v-else-if="isEditorMode(editorModeCodes.mapEvent)"
          :project="project" :current-map="currentMap" :map-event-state="mapEventState" :revision="mapEventRevision"
          @map-event-state-updated="handleMapEventStateUpdated"
        />
        <MapConnectionView
          v-else-if="isEditorMode(editorModeCodes.mapConnection)"
          :project="project" :current-map="currentMap" :maps="maps" :revision="mapConnectionRevision"
          @select-map="selectMap"
        />
        <MapMetadataView
          v-else-if="isEditorMode(editorModeCodes.mapMetadata)"
          :project="project" :current-map="currentMap" :maps="maps"
          @map-updated="handleMapUpdated"
        />
        <WildPokemonView
          v-else-if="isEditorMode(editorModeCodes.wildPokemon)"
          :project="project" :current-map="currentMap" :maps="maps"
          @map-updated="handleMapUpdated"
        />
      </div>
    </div>
    <!--右侧面板-->
    <div class="right-panel">
      <MapEditPanel
        v-if="isEditorMode(editorModeCodes.mapEdit)"
        :project="project" :current-map="currentMap" :map-edit-state="mapEditState"
        @map-edit-state-updated="handleMapEditStateUpdated"
      />
      <MapInfoPanel
        v-else-if="isEditorMode(editorModeCodes.mapMetadata)"
        :project="project" :current-map="currentMap"
      />
      <MapEventPanel
        v-else-if="isEditorMode(editorModeCodes.mapEvent)"
        :project="project" :current-map="currentMap" :maps="maps" :map-event-state="mapEventState" :revision="mapEventRevision"
        @map-event-state-updated="handleMapEventStateUpdated"
        @map-updated="handleMapUpdated"
        @select-map="selectMap"
      />
      <MapConnectionPanel
        v-else-if="isEditorMode(editorModeCodes.mapConnection)"
        :project="project" :current-map="currentMap" :maps="maps" :revision="mapConnectionRevision"
        @map-updated="handleMapUpdated"
        @select-map="selectMap"
      />
      <WildPokemonPanel
        v-else-if="isEditorMode(editorModeCodes.wildPokemon)"
        :project="project" :current-map="currentMap"
      />
      <div v-else class="right-panel-placeholder">右侧面板</div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { RomExportService, RomImportService } from "@/core"
import MapConnectionPanel from "./components/map-connection-panel/index.vue"
import MapConnectionView from "./components/map-connection/index.vue"
import MapEditPanel from "./components/map-edit-panel/index.vue"
import MapEditView from "./components/map-edit/index.vue"
import MapEventPanel from "./components/map-event-panel/index.vue"
import MapEventView from "./components/map-event/index.vue"
import MapInfoPanel from "./components/map-info/index.vue"
import MapListView from "./components/map-list/index.vue"
import MapMetadataView from "./components/map-metadata/index.vue"
import WildPokemonPanel from "./components/wild-pokemon-panel/index.vue"
import WildPokemonView from "./components/wild-pokemon/index.vue"

const EDITOR_MODE_MAP_EDIT = "map-edit"
const EDITOR_MODE_MAP_EVENT = "map-event"
const EDITOR_MODE_MAP_CONNECTION = "map-connection"
const EDITOR_MODE_MAP_METADATA = "map-metadata"  
const EDITOR_MODE_WILD_POKEMON = "wild-pokemon"
const romImportService = new RomImportService()
const romExportService = new RomExportService()

export default {   
  name: "HomeView",
  components: {
    MapConnectionView,
    MapConnectionPanel,
    MapEditPanel,
    MapEditView,
    MapEventPanel,
    MapEventView,
    MapInfoPanel,
    MapListView,
    MapMetadataView,
    WildPokemonPanel,
    WildPokemonView,
  },
  data() {
    return {
      project: null,
      maps: [],
      currentMap: null,
      selectedMapKey: "",
      importing: false,
      mapConnectionRevision: 0,
      mapEventRevision: 0,
      mapEditState: {
        mouseMode: "view",
        showGrid: false,
        activeTab: "tiles",
        selectedBlockId: 0,
        collision: {
          elevation: 3,
          value: 1,
          opacity: 42,
        },
      },
      mapEventState: {
        filter: "all",
        selectedKey: "",
        showGrid: false,
        showMovementRange: false,
      },
      editorModeCodes: {
        mapEdit: EDITOR_MODE_MAP_EDIT,
        mapEvent: EDITOR_MODE_MAP_EVENT,
        mapConnection: EDITOR_MODE_MAP_CONNECTION,
        mapMetadata: EDITOR_MODE_MAP_METADATA,
        wildPokemon: EDITOR_MODE_WILD_POKEMON,
      },
      currentEditorMode: EDITOR_MODE_MAP_EDIT,
      editorModeList: [
        { code: EDITOR_MODE_MAP_EDIT, label: "地图编辑" },
        { code: EDITOR_MODE_MAP_EVENT, label: "地图事件" },
        { code: EDITOR_MODE_MAP_CONNECTION, label: "地图连接器" },
        { code: EDITOR_MODE_MAP_METADATA, label: "地图元数据" },
        { code: EDITOR_MODE_WILD_POKEMON, label: "野生宝可梦" },
      ],
    }
  },
  mounted() {
  },
  methods: {
    openRomFile() {
      this.$refs.romFileInput?.click()
    },
    async handleRomFileChange(event) {
      const file = event.target.files?.[0]
      event.target.value = ""
      if (!file) return

      this.importing = true
      try {
        const result = await romImportService.importFile(file)
        this.project = result.project
        this.maps = result.maps
        this.selectMap(this.maps[0] || null)
        ElMessage.success(`已加载 ${result.maps.length} 张地图`)
      } catch (error) {
        ElMessage.error(error?.message || "ROM 导入失败")
      } finally {
        this.importing = false
      }
    },
    exportRom() {
      try {
        const result = romExportService.exportProject(this.project)
        const url = URL.createObjectURL(result.blob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.fileName
        link.click()
        URL.revokeObjectURL(url)
        ElMessage.success(`已导出 ${result.fileName}`)
      } catch (error) {
        ElMessage.error(error?.message || "ROM 导出失败")
      }
    },
    selectMap(map) {
      this.currentMap = map
      this.selectedMapKey = map?.key || ""
    },
    handleMapUpdated(payload = {}) {
      const selectedKey = payload.key || this.selectedMapKey
      if (!this.project?.mapRepository) return

      if (payload.dirty) this.project.markDirty()
      if (String(payload.field || "").startsWith("connection")) this.mapConnectionRevision += 1
      if (String(payload.field || "").startsWith("events")) this.mapEventRevision += 1
      if (payload.reloadMaps === false) return

      this.maps = this.project.mapRepository.loadMapList()
      this.selectMap(this.maps.find(map => map.key === selectedKey) || this.maps[0] || null)
    },
    handleMapEditStateUpdated(patch = {}) {
      this.mapEditState = {
        ...this.mapEditState,
        ...patch,
        collision: {
          ...this.mapEditState.collision,
          ...(patch.collision || {}),
        },
      }
    },
    handleMapEventStateUpdated(patch = {}) {
      this.mapEventState = {
        ...this.mapEventState,
        ...patch,
      }
    },
    // 切换选择模式
    selectEditMode(code) {
      this.currentEditorMode = code
    },
    isEditorMode(code) {
      return this.currentEditorMode === code
    },
  },
}
</script>

<style lang="scss" src="./style/index.scss"></style>
