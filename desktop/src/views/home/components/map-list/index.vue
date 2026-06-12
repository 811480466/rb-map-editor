<template>
  <div class="map-list-view">
    <div class="panel-section-title">
      <div class="l2-title">地图列表</div>
    </div>

    <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索地图名称或编号" />

    <div class="map-list">
      <button  
        v-for="map in filteredMaps" :key="map.code" type="button" class="map-row"
        :class="{ active: selectedMapKey === map.key }" @click="$emit('select', map)"
      >
        <span class="map-row-name">{{ map.name }}</span>
        <span class="map-row-fields">
          <span>mapGroup:{{ map.mapGroup }}</span>
          <span>mapNum:{{ map.mapNum }}</span>
          <span>地图编码:{{ map.mapCode }}</span>
          <span>区域编码:{{ map.regionCode }}</span>
        </span>
      </button>
    </div>

    <footer class="panel-footer">
      <span class="status-dot" :class="{ loaded }"></span>
      <span>{{ loaded ? `已加载 ${maps.length} 张地图` : "ROM 尚未加载" }}</span>
    </footer>
  </div>
</template>

<script>
import {
  Search,
} from "@element-plus/icons-vue"

export default {
  name: "MapListView",
  props: {
    maps: {
      type: Array,
      default: () => [],
    },
    selectedMapKey: {
      type: String,
      default: "",
    },
    loaded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["select"],
  data() {
    return {
      Search,
      keyword: "",
    }
  },
  computed: {
    filteredMaps() {
      const keyword = this.keyword.trim().toLowerCase()
      if (!keyword) return this.maps
      return this.maps.filter(map => [
        map.name,
        map.englishName,
        map.translatedName,
        map.code,
        map.mapGroup,
        map.mapNum,
        map.mapCode,
        map.regionCode,
      ].join(" ").toLowerCase().includes(keyword))
    },
  },
}
</script>

<style lang="scss" scoped>
.map-list-view {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  padding: 10px 9px;
  overflow: hidden;
}

.panel-section-title {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
  color: #1354c8;
  font-size: 14px;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.map-list {
  min-height: 0;
  flex: 1 1 auto;
  margin-top: 10px;
  padding-right: 4px;
  overflow: auto;
  background: transparent;
}

.map-row {
  display: block;
  width: 100%;
  min-height: 74px;
  margin-bottom: 7px;
  padding: 8px 10px;
  border: 1px solid #d9dceb;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #9bb8ff;
    background: #fff;
  }

  &.active {
    border-color: #5b7cff;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(91, 124, 255, 0.08);

    .map-row-name {
      color: #154fb5;
    }
  }
}

.map-row-name,
.map-row-fields {
  display: block;
  overflow: hidden;
}

.map-row-name {
  color: #154b9b;
  font-size: 16px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-row-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 12px;
  margin-top: 6px;
  color: #415a82;
  font-size: 11px;
  line-height: 1.25;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.panel-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding-top: 10px;
  color: #7c8da3;
  font-size: 11px;
}

.status-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #d39b36;

  &.loaded {
    background: #35a266;
  }
}
</style>
