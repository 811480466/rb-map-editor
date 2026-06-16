<template>
  <div class="map-metadata-view">
    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />
    <div v-else class="metadata-content">
      <section class="metadata-section">
        <div class="section-title">基础信息</div>
        <div class="metadata-grid">
          <div v-for="row in basicRows" :key="row.label" class="metadata-item">
            <span class="metadata-label">{{ row.label }}</span>
            <span class="metadata-value">{{ row.value }}</span>
          </div>
        </div>
      </section>

      <section class="metadata-section">
        <div class="section-title">地图字段</div>
        <div class="metadata-form">
          <label class="metadata-field">
            <span>天气</span>
            <el-select v-model="draft.weather" filterable @change="applyWeather">
              <el-option
                v-for="item in weatherOptions" :key="item.value" :label="item.label"
                :value="item.value"
              />
            </el-select>
          </label>

          <label class="metadata-field">
            <span>所属区域</span>
            <el-select v-model="draft.regionMapSectionId" filterable @change="applyRegionMapSection">
              <el-option
                v-for="item in regionOptions" :key="item.value" :label="item.label"
                :value="item.value"
              />
            </el-select>
          </label>

          <label class="metadata-field region-name-field">
            <span>区域英文名</span>
            <div class="region-name-row">
              <el-input v-model="draft.regionName" maxlength="64" />
              <el-button type="primary" @click="applyRegionName">保存</el-button>
            </div>
          </label>
        </div>
      </section>

      <section class="metadata-section">
        <div class="section-title">ROM 结构</div>
        <div class="metadata-grid compact">
          <div v-for="row in romRows" :key="row.label" class="metadata-item">
            <span class="metadata-label">{{ row.label }}</span>
            <span class="metadata-value mono">{{ row.value }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { formatHex } from "@/util"

const REGION_NAME_MAX_LENGTH = 64

const WEATHER_OPTIONS = [
  { value: 0, label: "00 = 无天气" },
  { value: 1, label: "01 = 晴天有云" },
  { value: 2, label: "02 = 晴天" },
  { value: 3, label: "03 = 下雨" },
  { value: 4, label: "04 = 下雪" },
  { value: 5, label: "05 = 雷阵雨" },
  { value: 6, label: "06 = 水平方向雾" },
  { value: 7, label: "07 = 火山灰" },
  { value: 8, label: "08 = 沙暴" },
  { value: 9, label: "09 = 永久顺风" },
  { value: 10, label: "0A = 水下" },
  { value: 11, label: "0B = 阴天/多云" },
  { value: 12, label: "0C = 大日照" },
  { value: 13, label: "0D = 倾盆大雨" },
  { value: 14, label: "0E = 水下气泡" },
  { value: 15, label: "0F = 异常天气" },
  { value: 20, label: "14 = 119号道路循环天气" },
  { value: 21, label: "15 = 123号道路循环天气" },
  { value: 22, label: "16 = 熔岩风暴" },
  { value: 23, label: "17 = 极光幕" },
]

export default {
  name: "MapMetadataView",
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
      weatherOptions: WEATHER_OPTIONS,
      draft: {
        weather: 0,
        regionMapSectionId: 0,
        regionName: "",
      },
    }
  },
  computed: {
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    regionOptions() {
      const regions = new Map()

      for (const map of this.maps) {
        const id = Number(map.regionCode)
        if (!Number.isInteger(id) || regions.has(id)) continue
        const name = map.translatedName || map.englishName || `Section ${id}`
        regions.set(id, {
          value: id,
          label: `${name}（编码:${id}）`,
        })
      }

      const section = this.mapHeader?.regionSection
      if (section && !regions.has(section.id)) {
        regions.set(section.id, {
          value: section.id,
          label: `${section.name || `Section ${section.id}`}（编码:${section.id}）`,
        })
      }

      return [...regions.values()].sort((left, right) => left.value - right.value)
    },
    basicRows() {
      const header = this.mapHeader
      const layout = header?.layout
      const section = header?.regionSection
      if (!header) return []

      return [
        { label: "地图名称", value: this.currentMap?.name || "" },
        { label: "英文名称", value: section?.name || "" },
        { label: "地图索引", value: `${header.mapGroup}:${header.mapNum}` },
        { label: "地图编码", value: header.id },
        { label: "区域编码", value: header.regionMapSectionId },
        { label: "地图尺寸", value: `${layout?.width ?? 0} x ${layout?.height ?? 0}` },
        { label: "音乐", value: formatHex(header.music, 4) },
        { label: "战斗类型", value: header.battleType },
      ]
    },
    romRows() {
      const header = this.mapHeader
      const layout = header?.layout
      const section = header?.regionSection
      if (!header) return []

      return [
        { label: "MapHeader", value: formatHex(header.offset) },
        { label: "Layout 指针", value: formatHex(header.layoutPointer) },
        { label: "Layout 偏移", value: formatHex(layout?.offset) },
        { label: "Events 指针", value: formatHex(header.eventsPointer) },
        { label: "Events 偏移", value: formatHex(header.eventsOffset) },
        { label: "Scripts 指针", value: formatHex(header.scriptsPointer) },
        { label: "Connections 指针", value: formatHex(header.connectionsPointer) },
        { label: "Blockmap 指针", value: formatHex(layout?.mapPointer) },
        { label: "Primary Tileset", value: formatHex(layout?.primaryTilesetPointer) },
        { label: "Secondary Tileset", value: formatHex(layout?.secondaryTilesetPointer) },
        { label: "Region Name 指针", value: formatHex(section?.namePointer) },
        { label: "Region Name 偏移", value: formatHex(section?.nameOffset) },
        { label: "MapFlags", value: formatHex(header.mapFlags, 2) },
        { label: "Weather 偏移", value: formatHex(header.offset + 0x16) },
      ]
    },
  },
  watch: {
    mapHeader: {
      immediate: true,
      handler(header) {
        this.syncDraft(header)
      },
    },
  },
  methods: {
    syncDraft(header) {
      this.draft.weather = header?.weather ?? 0
      this.draft.regionMapSectionId = header?.regionMapSectionId ?? 0
      this.draft.regionName = header?.regionSection?.name || ""
    },
    applyWeather(value) {
      const header = this.requireHeader()
      const weather = Number(value) & 0xff
      this.project.rom.writeByte(header.offset + 0x16, weather)
      header.weather = weather
      ElMessage.success("天气已修改")
      this.$emit("map-updated", { key: header.key, field: "weather", dirty: true })
    },
    applyRegionMapSection(value) {
      const header = this.requireHeader()
      const regionMapSectionId = Number(value) & 0xff
      this.project.rom.writeByte(header.offset + 0x14, regionMapSectionId)
      header.regionMapSectionId = regionMapSectionId
      header.regionSection = this.project.mapRepository.readRegionMapSection(regionMapSectionId)
      this.syncDraft(header)
      ElMessage.success("所属区域已修改")
      this.$emit("map-updated", { key: header.key, field: "regionMapSectionId", dirty: true })
    },
    applyRegionName() {
      try {
        const header = this.requireHeader()
        const section = header.regionSection
        if (!section) throw new Error("当前区域信息无效")

        const name = this.validateRegionName(this.draft.regionName)
        const encoded = this.project.textCodec.encode(name)
        const capacity = this.getRegionNameCapacity(section.nameOffset)

        if (encoded.length > capacity) {
          throw new Error(`区域名称不能超过原长度：最多 ${capacity - 1} 字符`)
        }

        this.project.rom.fill(section.nameOffset, capacity, 0xff)
        this.project.rom.writeBytes(section.nameOffset, encoded)
        section.name = name
        ElMessage.success("区域名称已修改")
        this.$emit("map-updated", { key: header.key, field: "regionName", dirty: true })
      } catch (error) {
        ElMessage.error(error?.message || "区域名称修改失败")
      }
    },
    validateRegionName(value) {
      const name = String(value ?? "").trim().replace(/ +/g, " ")
      if (!name) throw new Error("区域名称不能为空")
      if (name.length > REGION_NAME_MAX_LENGTH) {
        throw new Error(`区域名称不能超过 ${REGION_NAME_MAX_LENGTH} 个字符`)
      }
      if (!/^[A-Za-z0-9 .,'!?()&+\-/%:;=<>]+$/.test(name)) {
        throw new Error("区域名称只能使用英文、数字和常用标点")
      }
      this.project.textCodec.encode(name)
      return name
    },
    getRegionNameCapacity(nameOffset) {
      if (!Number.isInteger(nameOffset)) throw new Error("区域名称偏移无效")

      for (let length = 0; length < REGION_NAME_MAX_LENGTH; length += 1) {
        const offset = nameOffset + length
        if (offset >= this.project.rom.size) break
        if (this.project.rom.readByte(offset) === 0xff) return length + 1
      }

      throw new Error(`区域名称超过 ${REGION_NAME_MAX_LENGTH} 字节仍未结束`)
    },
    requireHeader() {
      if (!this.project?.rom || !this.mapHeader) {
        throw new Error("当前没有可编辑的地图")
      }
      return this.mapHeader
    },
  },
}
</script>

<style lang="scss" scoped>
.map-metadata-view {
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: #f8fbff;
}

.metadata-content {
  display: grid;
  width: min(1040px, 100%);
  gap: 14px;
  margin: 0 auto;
  padding: 18px;
}

.metadata-section {
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fff;
}

.section-title {
  padding: 12px 14px;
  border-bottom: 1px solid #e4edf7;
  color: #153b78;
  font-size: 14px;
  font-weight: 800;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;

  &.compact {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.metadata-item {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  min-height: 42px;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid #edf3fb;
  color: #172033;
}

.metadata-label {
  color: #6f819a;
  font-size: 12px;
  font-weight: 700;
}

.metadata-value {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mono {
  font-family: Consolas, Monaco, monospace;
}

.metadata-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 14px;
}

.metadata-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: #415a82;
  font-size: 12px;
  font-weight: 800;
}

.region-name-field {
  grid-column: 1 / -1;
}

.region-name-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}
</style>
