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
        <component :is="currentEditorComponent" />
      </div>
    </div>
    <!--右侧面板-->
    <div class="right-panel">
      右侧面板
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { RomExportService, RomImportService } from "@/core"
import MapConnectionView from "./components/map-connection/index.vue"
import MapEditView from "./components/map-edit/index.vue"
import MapEventView from "./components/map-event/index.vue"
import MapListView from "./components/map-list/index.vue"
import MapMetadataView from "./components/map-metadata/index.vue"
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
    MapEditView,
    MapEventView,
    MapListView,
    MapMetadataView,
    WildPokemonView,
  },
  data() {
    return {
      project: null,
      maps: [],
      currentMap: null,
      selectedMapKey: "",
      importing: false,
      currentEditorMode: EDITOR_MODE_MAP_EDIT,
      editorModeList: [
        { code: EDITOR_MODE_MAP_EDIT, label: "地图编辑", component: "MapEditView" },
        { code: EDITOR_MODE_MAP_EVENT, label: "地图事件", component: "MapEventView" },
        { code: EDITOR_MODE_MAP_CONNECTION, label: "地图连接器", component: "MapConnectionView" },
        { code: EDITOR_MODE_MAP_METADATA, label: "地图元数据", component: "MapMetadataView" },
        { code: EDITOR_MODE_WILD_POKEMON, label: "野生宝可梦", component: "WildPokemonView" },
      ],
    }
  },
  computed: {
    currentEditorComponent() {
      const currentMode = this.editorModeList.find(item => item.code === this.currentEditorMode)
      return currentMode?.component || "MapEditView"
    },
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
    // 切换选择模式
    selectEditMode(code) {
      this.currentEditorMode = code
    },
  },
}
</script>

<style lang="scss" src="./style/index.scss"></style>
