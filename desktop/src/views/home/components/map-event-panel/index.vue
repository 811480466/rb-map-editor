<template>
  <div class="map-event-panel">
    <div class="right-panel-title">地图事件</div>

    <el-empty v-if="!project" description="请先导入 ROM" />
    <el-empty v-else-if="!mapHeader" description="请先选择地图" />

    <div v-else class="event-panel-body">
      <template v-if="!selectedEvent">
        <div class="event-tabs" role="tablist" aria-label="地图事件类型">
          <button
            v-for="tab in eventTabs"
            :key="tab.value"
            type="button"
            class="event-tab"
            :class="{ active: activeFilter === tab.value }"
            :aria-selected="activeFilter === tab.value"
            @click="changeFilter(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="add-event-actions" :class="{ single: addEventActions.length === 1 }">
          <el-button
            v-for="action in addEventActions"
            :key="action.type"
            class="add-event-button"
            type="primary"
            
            @click="openAddDialog(action.type)"
          >
            {{ action.label }}
          </el-button>
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
          <el-empty v-if="!filteredEvents.length" :description="`${currentFilterLabel} 暂无事件`" />
        </div>
      </template>

      <div v-else class="event-detail">
        <div class="detail-head">
          <div>
            <div class="detail-title">{{ detailTitle }}</div>
            <div class="detail-subtitle">{{ formatHex(selectedEvent.offset) }}</div>
          </div>
          <el-button plain @click="clearSelection">返回</el-button>
        </div>

        <div class="event-section">
          <div class="section-title">参数</div>
          <div class="event-form">
            <div v-if="selectedEvent.type === 'object'" class="form-field">
              <span>对象ID</span>
              <el-input-number
                v-model="formValues.localId"
                :min="0"
                :max="255"
                
                controls-position="right"
              />
            </div>

            <div class="coordinate-grid">
              <div class="form-field compact">
                <span>x</span>
                <el-input-number
                  v-model="formValues.x"
                  :min="-32768"
                  :max="32767"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="form-field compact">
                <span>y</span>
                <el-input-number
                  v-model="formValues.y"
                  :min="-32768"
                  :max="32767"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="form-field compact">
                <span>z</span>
                <el-input-number
                  v-model="formValues.elevation"
                  :min="0"
                  :max="255"
                  size="small"
                  controls-position="right"
                />
              </div>
            </div>

            <template v-if="selectedEvent.type === 'object'">
              <div class="form-field">
                <span>图形</span>
                <el-select v-model="formValues.graphicsId" filterable>
                  <el-option
                    v-for="option in objectGraphicsOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  />
                </el-select>
              </div>

              <div class="form-field">
                <span>移动类型</span>
                <el-select v-model="formValues.movementType" filterable>
                  <el-option
                    v-for="option in movementTypeSelectOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  />
                </el-select>
              </div>

              <div class="movement-range-grid">
                <div class="form-field">
                  <span>移动范围 X</span>
                  <el-input-number
                    v-model="formValues.movementRangeX"
                    :min="0"
                    :max="15"
                    
                    controls-position="right"
                  />
                </div>
                <div class="form-field">
                  <span>移动范围 Y</span>
                  <el-input-number
                    v-model="formValues.movementRangeY"
                    :min="0"
                    :max="15"
                    
                    controls-position="right"
                  />
                </div>
              </div>

              <div class="form-field">
                <span>事件Flag</span>
                <el-input-number
                  v-model="formValues.eventFlag"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>

              <div class="form-field">
                <span>训练家类型</span>
                <el-select v-model="formValues.trainerType" filterable>
                  <el-option
                    v-for="option in trainerTypeSelectOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  />
                </el-select>
              </div>

              <div class="form-field">
                <span>视野/树果</span>
                <el-input-number
                  v-model="formValues.trainerRangeOrBerryTreeId"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>

              <div v-if="selectedEvent.trainerBattle" class="form-field">
                <span>训练家ID</span>
                <el-input-number
                  v-model="formValues.trainerId"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>
            </template>

            <template v-else-if="selectedEvent.type === 'warp'">
              <div class="form-field">
                <span>目标地图组</span>
                <el-input-number
                  v-model="formValues.mapGroup"
                  :min="0"
                  :max="255"
                  
                  controls-position="right"
                />
              </div>
              <div class="form-field">
                <span>目标地图</span>
                <el-input-number
                  v-model="formValues.mapNum"
                  :min="0"
                  :max="255"
                  
                  controls-position="right"
                />
              </div>
              <div class="form-field">
                <span>目标 Warp</span>
                <el-input-number
                  v-model="formValues.warpId"
                  :min="0"
                  :max="255"
                  
                  controls-position="right"
                />
              </div>
            </template>

            <template v-else-if="selectedEvent.type === 'coord'">
              <div class="form-field">
                <span>触发值</span>
                <el-input-number
                  v-model="formValues.trigger"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>
              <div class="form-field">
                <span>索引变量</span>
                <el-input-number
                  v-model="formValues.indexVariable"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>
            </template>

            <template v-else-if="selectedEvent.type === 'bg'">
              <div class="form-field">
                <span>事件类型</span>
                <el-input-number
                  v-model="formValues.kind"
                  :min="0"
                  :max="255"
                  
                  controls-position="right"
                />
              </div>
              <div class="form-field">
                <span>参数</span>
                <el-input-number
                  v-model="formValues.argument"
                  :min="0"
                  :max="65535"
                  
                  controls-position="right"
                />
              </div>
            </template>
          </div>

          <div v-if="warpInfo" class="warp-status" :class="warpInfo.status">
            <div>{{ warpInfo.statusText }}</div>
            <div>目标：{{ warpTargetText }}</div>
            <div>目标 Warp：{{ warpTargetWarpText }}</div>
            <el-button :disabled="!warpInfo.targetMap" @click="jumpToWarpTarget">跳转目标地图</el-button>
          </div>
        </div>

        <div v-if="selectedEventHasScript" class="event-section">
          <div class="section-title">脚本</div>
          <div class="form-field">
            <span>脚本指针</span>
            <el-input :model-value="scriptPointerHex" disabled />
          </div>
          <div class="script-view-actions">
            <el-button
              v-for="action in scriptViewerActions"
              :key="action.key"
              class="script-view-button"
              
              plain
              @click="openScriptViewer(action)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" @click="saveSelectedEvent">应用修改</el-button>
          <el-button plain @click="resetForm">撤销修改</el-button>
          <el-button type="danger" plain @click="deleteSelectedEvent">删除{{ deleteTargetLabel }}</el-button>
        </div>

        <!-- <details class="debug-json">
          <summary>调试 JSON</summary>
          <pre>{{ selectedEventJson }}</pre>
        </details> -->
      </div>
    </div>

    <el-dialog
      v-model="addDialogVisible"
      :title="addDialogTitle"
      width="460px"
      class="event-add-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="add-form event-add-form">
        <div class="add-form-section">
          <div class="add-form-section-title">位置</div>
          <div class="coordinate-grid">
            <div class="form-field compact">
              <span>x</span>
              <el-input-number v-model="addForm.x" :min="-32768" :max="32767" controls-position="right" />
            </div>
            <div class="form-field compact">
              <span>y</span>
              <el-input-number v-model="addForm.y" :min="-32768" :max="32767" controls-position="right" />
            </div>
            <div class="form-field compact">
              <span>z</span>
              <el-input-number v-model="addForm.elevation" :min="0" :max="255" controls-position="right" />
            </div>
          </div>
        </div>

        <div v-if="addType === 'object'" class="add-form-section">
          <div class="add-form-section-title">对象</div>
          <div class="field-grid">
            <div class="form-field">
              <span>对象模板</span>
              <el-select v-model="addForm.templateId" @change="applyAddObjectTemplateDefaults">
                <el-option
                  v-for="option in objectTemplateOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </div>
            <div class="form-field">
              <span>对象ID</span>
              <el-input-number v-model="addForm.localId" :min="0" :max="255" controls-position="right" />
            </div>
            <div class="form-field">
              <span>事件Flag</span>
              <el-input-number
                v-model="addForm.eventFlag"
                :min="addObjectTemplateAllowsZeroEventFlag ? 0 : 1"
                :max="65535"
                controls-position="right"
              />
            </div>
            <div v-if="addObjectTemplateIsItemPickup" class="form-field">
              <span>道具ID</span>
              <el-input-number v-model="addForm.itemId" :min="0" :max="65535" controls-position="right" />
            </div>
            <template v-else-if="addObjectTemplateIsPokemonGift">
              <div class="form-field">
                <span>领取Flag</span>
                <el-input-number v-model="addForm.scriptFlag" :min="1" :max="65535" controls-position="right" />
              </div>
              <div v-if="addForm.templateId === 'pokemonGiftNpc'" class="form-field">
                <span>宝可梦ID</span>
                <el-input-number v-model="addForm.speciesId" :min="1" :max="65535" controls-position="right" />
              </div>
              <div v-else class="form-field textarea-field">
                <span>随机池</span>
                <el-input v-model="addForm.randomSpeciesPool" type="textarea" :rows="2" placeholder="例如：1, 4, 7" />
              </div>
              <div class="form-field">
                <span>等级</span>
                <el-input-number v-model="addForm.pokemonLevel" :min="1" :max="100" controls-position="right" />
              </div>
              <div class="form-field">
                <span>携带道具</span>
                <el-input-number v-model="addForm.heldItemId" :min="0" :max="65535" controls-position="right" />
              </div>
              <div class="form-field textarea-field">
                <span>领取对话</span>
                <el-input v-model="addForm.giftText" type="textarea" :rows="2" />
              </div>
              <div class="form-field textarea-field">
                <span>已领取对话</span>
                <el-input v-model="addForm.receivedText" type="textarea" :rows="2" />
              </div>
            </template>
            <template v-else-if="addObjectTemplateIsMoveTutor">
              <div v-if="addObjectTemplateIsSingleMoveTutor" class="form-field">
                <span>技能ID</span>
                <el-input-number v-model="addForm.moveId" :min="1" :max="65535" controls-position="right" />
              </div>
              <template v-else>
                <div class="form-field textarea-field">
                  <span>技能列表</span>
                  <el-input v-model="addForm.moveIds" type="textarea" :rows="2" placeholder="例如：398, 409, 7" />
                </div>
              </template>
              <div class="form-field textarea-field">
                <span>介绍对话</span>
                <el-input v-model="addForm.tutorText" type="textarea" :rows="2" />
              </div>
              <div v-if="addObjectTemplateIsMultiMoveTutor" class="form-field textarea-field">
                <span>选择提示</span>
                <el-input v-model="addForm.tutorPromptText" type="textarea" :rows="2" />
              </div>
            </template>
            <div class="add-object-status" :class="{ error: addObjectFlagStatusIsError }">
              <div>{{ addObjectTemplateDescription }}</div>
              <div>{{ addObjectLocalIdStatus }}</div>
              <div>{{ addObjectFlagStatus }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="addType === 'trainer'" class="add-form-section">
          <div class="add-form-section-title">训练家</div>
          <div class="field-grid">
            <div class="form-field">
              <span>脚本模板</span>
              <el-select v-model="addForm.trainerTemplateId" @change="applyAddTrainerTemplateDefaults">
                <el-option
                  v-for="option in trainerTemplateOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </div>
            <div class="form-field">
              <span>对象ID</span>
              <el-input-number v-model="addForm.localId" :min="0" :max="255" controls-position="right" />
            </div>
            <div class="form-field">
              <span>图形</span>
              <el-select v-model="addForm.graphicsId" filterable>
                <el-option
                  v-for="option in objectGraphicsOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </div>
            <div class="form-field">
              <span>移动类型</span>
              <el-select v-model="addForm.movementType" filterable>
                <el-option
                  v-for="option in movementTypeSelectOptionsForAdd"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </div>
            <div class="form-field">
              <span>训练家类型</span>
              <el-select v-model="addForm.trainerType" filterable>
                <el-option
                  v-for="option in trainerTypeSelectOptionsForAdd"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </div>
            <div class="form-field">
              <span>视野/树果</span>
              <el-input-number v-model="addForm.trainerRangeOrBerryTreeId" :min="0" :max="65535" controls-position="right" />
            </div>
            <div class="form-field">
              <span>训练家ID</span>
              <el-input-number v-model="addForm.trainerId" :min="0" :max="65535" controls-position="right" />
            </div>
            <div class="form-field">
              <span>事件Flag</span>
              <el-input-number v-model="addForm.eventFlag" :min="0" :max="65535" controls-position="right" />
            </div>
            <template v-if="addTrainerTemplateIsItemReward">
              <div class="form-field">
                <span>道具ID</span>
                <el-input-number v-model="addForm.itemId" :min="0" :max="65535" controls-position="right" />
              </div>
              <div class="form-field">
                <span>数量</span>
                <el-input-number v-model="addForm.quantity" :min="1" :max="99" controls-position="right" />
              </div>
            </template>
            <template v-else-if="addTrainerTemplateIsPokemonReward">
              <div class="form-field">
                <span>宝可梦ID</span>
                <el-input-number v-model="addForm.speciesId" :min="1" :max="65535" controls-position="right" />
              </div>
              <div class="form-field">
                <span>等级</span>
                <el-input-number v-model="addForm.pokemonLevel" :min="1" :max="100" controls-position="right" />
              </div>
              <div class="form-field">
                <span>携带道具</span>
                <el-input-number v-model="addForm.heldItemId" :min="0" :max="65535" controls-position="right" />
              </div>
            </template>
            <template v-if="addTrainerTemplateIsReward">
              <div class="form-field">
                <span>奖励Flag</span>
                <el-input-number v-model="addForm.scriptFlag" :min="1" :max="65535" controls-position="right" />
              </div>
            </template>
            <div v-if="addTrainerTemplateHasIntro" class="form-field textarea-field">
              <span>开战对话</span>
              <el-input v-model="addForm.introText" type="textarea" :rows="2" />
            </div>
            <div class="form-field textarea-field">
              <span>战败对话</span>
              <el-input v-model="addForm.defeatText" type="textarea" :rows="2" />
            </div>
            <template v-if="addTrainerTemplateIsReward">
              <div class="form-field textarea-field">
                <span>已领取对话</span>
                <el-input v-model="addForm.receivedText" type="textarea" :rows="2" />
              </div>
            </template>
            <div v-else class="form-field textarea-field">
              <span>战后对话</span>
              <el-input v-model="addForm.postBattleText" type="textarea" :rows="2" />
            </div>
            <div class="add-object-status" :class="{ error: addTrainerStatusIsError }">
              <div>{{ addTrainerTemplateDescription }}</div>
              <div>{{ addTrainerStatus }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="addType === 'warp'" class="add-form-section">
          <div class="add-form-section-title">目标</div>
          <div class="field-grid">
            <div class="form-field">
              <span>目标地图组</span>
              <el-input-number v-model="addForm.mapGroup" :min="0" :max="255" controls-position="right" />
            </div>
            <div class="form-field">
              <span>目标地图</span>
              <el-input-number v-model="addForm.mapNum" :min="0" :max="255" controls-position="right" />
            </div>
            <div class="form-field">
              <span>目标 Warp</span>
              <el-input-number v-model="addForm.warpId" :min="0" :max="255" controls-position="right" />
            </div>
          </div>
        </div>

        <div v-else-if="addType === 'coord'" class="add-form-section">
          <div class="add-form-section-title">触发</div>
          <div class="field-grid">
            <div class="form-field">
              <span>触发值</span>
              <el-input-number v-model="addForm.trigger" :min="0" :max="65535" controls-position="right" />
            </div>
            <div class="form-field">
              <span>索引变量</span>
              <el-input-number v-model="addForm.indexVariable" :min="0" :max="65535" controls-position="right" />
            </div>
            <div class="form-field">
              <span>脚本指针</span>
              <el-input-number v-model="addForm.scriptPointer" :min="0" :max="4294967295" controls-position="right" />
            </div>
          </div>
        </div>

        <div v-else-if="addType === 'bg'" class="add-form-section">
          <div class="add-form-section-title">事件</div>
          <div class="field-grid">
            <div class="form-field">
              <span>事件类型</span>
              <el-input-number v-model="addForm.kind" :min="0" :max="255" controls-position="right" />
            </div>
            <div class="form-field">
              <span>参数</span>
              <el-input-number v-model="addForm.argument" :min="0" :max="65535" controls-position="right" />
            </div>
            <div class="form-field">
              <span>脚本指针</span>
              <el-input-number v-model="addForm.scriptPointer" :min="0" :max="4294967295" controls-position="right" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="addDialogSubmitDisabled" @click="submitAddEvent">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scriptViewerVisible" :title="scriptViewerTitle" width="860px" append-to-body>
      <div class="script-viewer">
        <div class="script-viewer-meta">
          <div>来源：{{ scriptViewerEntry?.sourceLabel || "-" }}</div>
          <div>GBA Ptr：{{ scriptViewerEntry ? formatHex(scriptViewerEntry.ptr) : "null" }}</div>
          <div>ROM Off：{{ scriptViewerEntry?.off !== null && scriptViewerEntry?.off !== undefined ? formatHex(scriptViewerEntry.off) : "null" }}</div>
        </div>

        <div class="script-viewer-toolbar">
          <el-button :disabled="!canNavigateScriptBack" @click="navigateScriptHistory(-1)">返回</el-button>
          <el-button :disabled="!canNavigateScriptForward" @click="navigateScriptHistory(1)">前进</el-button>
          <span class="script-viewer-path">{{ scriptViewerPath }}</span>
          <el-button plain @click="copyScriptViewerContent">复制当前视图</el-button>
        </div>

        <el-tabs v-model="scriptViewerTab">
          <el-tab-pane label="解析视图" name="parsed">
            <div v-if="!scriptAnalysis?.ok" class="script-viewer-empty">
              {{ scriptAnalysis?.text || "脚本地址无效或无法解析。" }}
            </div>
            <div v-else class="script-command-list">
              <div class="script-command-summary">
                <div>入口：{{ scriptAnalysis.entryOffHex }} / {{ scriptAnalysis.entryPtrHex }}</div>
                <div>命令：{{ scriptAnalysis.commandCount }} 字节：{{ scriptAnalysis.consumedBytes }}</div>
                <div v-if="scriptAnalysis.warnings?.length" class="script-warning">
                  {{ scriptAnalysis.warnings.join("；") }}
                </div>
              </div>

              <div v-for="(command, index) in scriptAnalysis.commands" :key="`${command.off}:${index}`" class="script-command-row">
                <span class="script-command-index">{{ String(index).padStart(3, "0") }}</span>
                <span class="script-command-offset">+{{ formatHex(command.off - scriptAnalysis.entryOff, 4) }}</span>
                <span class="script-command-address">{{ command.offHex }}</span>
                <span class="script-command-text">{{ command.text }}</span>
                <el-button
                  v-if="scriptCommandTarget(command)"
                  
                  plain
                  :disabled="!scriptCommandTarget(command).valid"
                  @click="openScriptTarget(scriptCommandTarget(command))"
                >
                  进入
                </el-button>
                <span v-else></span>
                <div v-if="commandDecodedText(command)" class="script-command-decoded">
                  text: {{ commandDecodedText(command) }}
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="原始字节" name="raw">
            <pre class="script-viewer-pre">{{ scriptRawText }}</pre>
          </el-tab-pane>

          <el-tab-pane label="文本预览" name="texts">
            <div v-if="!scriptTextEntries.length" class="script-viewer-empty">当前入口未解析到文本指针。</div>
            <div v-else class="script-text-list">
              <div v-for="(entry, index) in scriptTextEntries" :key="`${entry.off}:${index}`" class="script-text-entry">
                <div class="script-text-title">#{{ index }} {{ entry.label }}</div>
                <div class="script-text-meta">Ptr：{{ entry.ptrHex }} Off：{{ entry.offHex }}</div>
                <pre class="script-text-content">{{ entry.text }}</pre>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="script-viewer-status">{{ scriptViewerStatus }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus"
import {
  DEFAULT_MOVE_TUTOR_SCRIPT_POINTER,
  OBJECT_EVENT_SCRIPT_TEMPLATE_OPTIONS,
  OBJECT_EVENT_TRAINER_TEMPLATE_OPTIONS,
  OBJECT_EVENT_GRAPHICS_OPTIONS,
  getObjectEventScriptTemplate,
  getObjectEventTrainerTemplate,
  getMapEventKey,
  getMapEventTypeLabel,
} from "@/core"
import { formatHex, pointerToOffset } from "@/util"

const EVENT_TABS = [
  { value: "object", label: "对象" },
  { value: "trainer", label: "训练家" },
  { value: "warp", label: "传送点" },
  { value: "event", label: "事件" },
]

const ADD_TYPE_LABELS = {
  object: "对象",
  trainer: "训练家",
  warp: "传送点",
  coord: "触发事件",
  bg: "背景事件",
}

const MOVEMENT_TYPE_LABELS = {
  0x00: "无",
  0x01: "环顾四周",
  0x02: "随机游走",
  0x03: "上下游走",
  0x04: "下上游走",
  0x05: "左右游走",
  0x06: "右左游走",
  0x07: "面朝下",
  0x08: "面朝上",
  0x09: "面朝左",
  0x0a: "面朝右",
  0x0b: "玩家",
  0x0c: "树果树生长",
  0x17: "逆时针转向",
  0x18: "顺时针转向",
  0x35: "复制玩家移动",
  0x36: "反向复制玩家移动",
  0x39: "伪装成树",
  0x3a: "伪装成山",
  0x3f: "埋藏",
  0x4c: "不可见",
}

const TRAINER_TYPE_LABELS = {
  0x00: "无训练家类型",
  0x01: "普通训练家",
  0x02: "可观察所有方向",
  0x03: "埋地训练家",
}

const DEFAULT_MOVE_TUTOR_SCRIPT_POINTER_TEXT = formatHex(DEFAULT_MOVE_TUTOR_SCRIPT_POINTER)

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
      panelFilter: "object",
      formValues: {},
      addDialogVisible: false,
      addType: "object",
      addForm: this.createAddForm(),
      scriptViewerVisible: false,
      scriptViewerTab: "parsed",
      scriptViewerEntry: null,
      scriptViewerHistory: [],
      scriptViewerHistoryIndex: -1,
      scriptViewerStatus: "",
    }
  },
  computed: {
    repository() {
      return this.project?.mapEventRepository || null
    },
    scriptRepository() {
      return this.project?.scriptRepository || null
    },
    mapHeader() {
      if (!this.project?.mapRepository || !this.currentMap) return null
      return this.project.mapRepository.getMapHeader(this.currentMap.mapGroup, this.currentMap.mapNum)
    },
    eventTabs() {
      return EVENT_TABS
    },
    activeFilter() {
      return this.normalizePanelFilter(this.panelFilter)
    },
    currentFilterLabel() {
      return EVENT_TABS.find(tab => tab.value === this.activeFilter)?.label || "事件"
    },
    addEventActions() {
      if (this.activeFilter === "trainer") return [{ type: "trainer", label: "新增训练家" }]
      if (this.activeFilter === "warp") return [{ type: "warp", label: "新增传送点" }]
      if (this.activeFilter === "event") {
        return [
          { type: "coord", label: "新增坐标事件" },
          { type: "bg", label: "新增背景事件" },
        ]
      }
      return [{ type: "object", label: "新增对象" }]
    },
    addDialogTitle() {
      return `新增${ADD_TYPE_LABELS[this.addType] || "事件"}`
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
    detailTitle() {
      if (!this.selectedEvent) return ""
      return `${this.detailTypeCode(this.selectedEvent)} #${this.selectedEvent.index}`
    },
    deleteTargetLabel() {
      if (!this.selectedEvent) return "事件"
      if (this.selectedEvent.type === "object" && this.selectedEvent.trainerBattle) return "训练家"
      if (this.selectedEvent.type === "object") return "对象"
      if (this.selectedEvent.type === "warp") return "传送点"
      return "事件"
    },
    movementTypeSelectOptions() {
      return this.buildValueOptions(MOVEMENT_TYPE_LABELS, this.formValues.movementType, "未知移动类型")
    },
    trainerTypeSelectOptions() {
      return this.buildValueOptions(TRAINER_TYPE_LABELS, this.formValues.trainerType, "未知训练家类型")
    },
    movementTypeSelectOptionsForAdd() {
      return this.buildValueOptions(MOVEMENT_TYPE_LABELS, this.addForm.movementType, "未知移动类型")
    },
    trainerTypeSelectOptionsForAdd() {
      return this.buildValueOptions(TRAINER_TYPE_LABELS, this.addForm.trainerType, "未知训练家类型")
    },
    objectGraphicsOptions() {
      return OBJECT_EVENT_GRAPHICS_OPTIONS
    },
    objectTemplateOptions() {
      return OBJECT_EVENT_SCRIPT_TEMPLATE_OPTIONS
    },
    trainerTemplateOptions() {
      return OBJECT_EVENT_TRAINER_TEMPLATE_OPTIONS
    },
    addObjectTemplateDescription() {
      return getObjectEventScriptTemplate(this.addForm.templateId).description
    },
    addObjectTemplateIsPokemonGift() {
      return this.addForm.templateId === "pokemonGiftNpc" || this.addForm.templateId === "randomPokemonGiftNpc"
    },
    addObjectTemplateIsMoveTutor() {
      return this.addObjectTemplateIsSingleMoveTutor || this.addObjectTemplateIsMultiMoveTutor
    },
    addObjectTemplateAllowsZeroEventFlag() {
      return this.addObjectTemplateIsPokemonGift || this.addObjectTemplateIsMoveTutor
    },
    addObjectTemplateIsSingleMoveTutor() {
      return this.addForm.templateId === "singleMoveTutorNpc"
    },
    addObjectTemplateIsMultiMoveTutor() {
      return this.addForm.templateId === "multiMoveTutorNpc"
    },
    addObjectTemplateIsItemPickup() {
      return !this.addObjectTemplateIsPokemonGift && !this.addObjectTemplateIsMoveTutor
    },
    addMoveTutorMoveIds() {
      const values = String(this.addForm.moveIds || "")
        .split(/[\s,，;；]+/)
        .filter(Boolean)
      return values
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value > 0 && value <= 0xffff)
    },
    addTrainerTemplateDescription() {
      return getObjectEventTrainerTemplate(this.addForm.trainerTemplateId).description
    },
    addTrainerTemplateIsItemReward() {
      return this.addForm.trainerTemplateId === "itemRewardSingle"
    },
    addTrainerTemplateIsPokemonReward() {
      return this.addForm.trainerTemplateId === "pokemonRewardSingle"
    },
    addTrainerTemplateIsReward() {
      return this.addTrainerTemplateIsItemReward || this.addTrainerTemplateIsPokemonReward
    },
    addTrainerTemplateHasIntro() {
      return this.addTrainerTemplateIsReward
    },
    addTrainerLocalIdRefs() {
      if (this.addType !== "trainer") return []
      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId)) return []
      return (this.eventCollection?.objects || []).filter(event => Number(event.localId) === localId)
    },
    addTrainerStatus() {
      if (this.addType !== "trainer") return ""

      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId) || localId < 0 || localId > 0xff) {
        return "对象ID 必须是 0 ~ 255 的整数。"
      }
      if (this.addTrainerLocalIdRefs.length) {
        const first = this.addTrainerLocalIdRefs[0]
        return `对象ID ${localId} 已在当前地图使用：OBJ #${first.index}。`
      }

      if (this.addTrainerTemplateIsReward) {
        const rewardFlag = Number(this.addForm.scriptFlag)
        if (!Number.isInteger(rewardFlag) || rewardFlag <= 0 || rewardFlag > 0xffff) {
          return "奖励Flag 必须是 1 ~ 65535 的整数。"
        }
      }

      if (this.addTrainerTemplateIsItemReward) {
        const itemId = Number(this.addForm.itemId)
        const quantity = Number(this.addForm.quantity)
        if (!Number.isInteger(itemId) || itemId < 0 || itemId > 0xffff) {
          return "道具ID 必须是 0 ~ 65535 的整数。"
        }
        if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 0xffff) {
          return "数量必须是 1 ~ 65535 的整数。"
        }
        const rewardFlag = Number(this.addForm.scriptFlag)
        return `战斗胜利后用 Std_BrailleMessage 给道具 ${itemId} x${quantity}，奖励Flag ${rewardFlag} 防止重复领取。`
      }

      if (this.addTrainerTemplateIsPokemonReward) {
        const speciesId = Number(this.addForm.speciesId)
        const level = Number(this.addForm.pokemonLevel)
        const heldItemId = Number(this.addForm.heldItemId)
        if (!Number.isInteger(speciesId) || speciesId <= 0 || speciesId > 0xffff) {
          return "宝可梦ID 必须是 1 ~ 65535 的整数。"
        }
        if (!Number.isInteger(level) || level <= 0 || level > 100) {
          return "等级必须是 1 ~ 100 的整数。"
        }
        if (!Number.isInteger(heldItemId) || heldItemId < 0 || heldItemId > 0xffff) {
          return "携带道具必须是 0 ~ 65535 的整数。"
        }
        const rewardFlag = Number(this.addForm.scriptFlag)
        return `战斗胜利后给宝可梦 ${speciesId} Lv.${level}，奖励Flag ${rewardFlag} 防止重复领取。`
      }

      return `对象ID ${localId} 当前可用。`
    },
    addTrainerStatusIsError() {
      if (this.addType !== "trainer") return false

      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId) || localId < 0 || localId > 0xff || this.addTrainerLocalIdRefs.length > 0) {
        return true
      }
      if (!this.addTrainerTemplateIsReward) return false

      const rewardFlag = Number(this.addForm.scriptFlag)
      if (!Number.isInteger(rewardFlag) || rewardFlag <= 0 || rewardFlag > 0xffff) return true

      if (this.addTrainerTemplateIsItemReward) {
        const itemId = Number(this.addForm.itemId)
        const quantity = Number(this.addForm.quantity)
        return !Number.isInteger(itemId) || itemId < 0 || itemId > 0xffff
          || !Number.isInteger(quantity) || quantity <= 0 || quantity > 0xffff
      }

      if (this.addTrainerTemplateIsPokemonReward) {
        const speciesId = Number(this.addForm.speciesId)
        const level = Number(this.addForm.pokemonLevel)
        const heldItemId = Number(this.addForm.heldItemId)
        return !Number.isInteger(speciesId) || speciesId <= 0 || speciesId > 0xffff
          || !Number.isInteger(level) || level <= 0 || level > 100
          || !Number.isInteger(heldItemId) || heldItemId < 0 || heldItemId > 0xffff
      }

      return false
    },
    addDialogSubmitDisabled() {
      if (this.addType === "object") return this.addObjectFlagStatusIsError
      if (this.addType === "trainer") return this.addTrainerStatusIsError
      return false
    },
    addObjectLocalIdRefs() {
      if (this.addType !== "object") return []
      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId)) return []
      return (this.eventCollection?.objects || []).filter(event => Number(event.localId) === localId)
    },
    addObjectLocalIdStatus() {
      if (this.addType !== "object") return ""

      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId) || localId < 0 || localId > 0xff) {
        return "对象ID 必须是 0 ~ 255 的整数。"
      }

      if (this.addObjectLocalIdRefs.length) {
        const first = this.addObjectLocalIdRefs[0]
        return `对象ID ${localId} 已在当前地图使用：OBJ #${first.index}。`
      }

      return `对象ID ${localId} 当前可用。`
    },
    addObjectFlagRefs() {
      const flag = Number(this.addForm.eventFlag)
      if (!this.repository || this.addType !== "object" || !Number.isInteger(flag) || flag <= 0) return []
      return this.repository.findGlobalObjectFlagRefs(flag)
    },
    addObjectFlagStatus() {
      if (this.addType !== "object") return ""

      if (this.addObjectTemplateIsPokemonGift) {
        const scriptFlag = Number(this.addForm.scriptFlag)
        if (!Number.isInteger(scriptFlag) || scriptFlag <= 0 || scriptFlag > 0xffff) {
          return "领取Flag 必须是 1 ~ 65535 的整数。"
        }

        return `脚本会先 checkflag ${scriptFlag}，领取后 setflag ${scriptFlag}；对象事件Flag 可保持 0。`
      }

      const flag = Number(this.addForm.eventFlag)
      const minFlag = this.addObjectTemplateAllowsZeroEventFlag ? 0 : 1
      if (!Number.isInteger(flag) || flag < minFlag || flag > 0xffff) {
        return `事件Flag 必须是 ${minFlag} ~ 65535 的整数。`
      }

      if (flag > 0 && this.addObjectFlagRefs.length) {
        const first = this.addObjectFlagRefs[0]
        const mapName = this.mapDisplayName(first.header)
        return `事件Flag ${flag} 已被使用：${mapName} / OBJ #${first.event.index}。`
      }

      if (this.addObjectTemplateIsMoveTutor) {
        const tutorPointer = this.parseHexOrDecimal(this.addForm.tutorScriptPointer)
        if (this.addObjectTemplateIsSingleMoveTutor) {
          const moveId = Number(this.addForm.moveId)
          if (!Number.isInteger(moveId) || moveId <= 0 || moveId > 0xffff) {
            return "技能ID 必须是 1 ~ 65535 的整数。"
          }
        }
        if (this.addObjectTemplateIsMultiMoveTutor && !this.addMoveTutorMoveIds.length) {
          return "技能ID 必须是 1 ~ 65535 的整数。"
        }
        if (!Number.isInteger(tutorPointer) || tutorPointer < 0x08000000 || tutorPointer > 0x09ffffff) {
          return "教学脚本指针必须是有效 GBA 指针。"
        }
        if (this.addObjectTemplateIsMultiMoveTutor) {
          if (this.addMoveTutorMoveIds.length > 10) {
            return "多技能教学师一次最多放 10 个技能。"
          }
          return `会自动扩展菜单表，并分配 0x7F 起的教学菜单；${this.addMoveTutorMoveIds.length} 个技能后追加 Exit，再 call ${formatHex(tutorPointer)}。`
        }

        return `对话后设置 moveId=${Number(this.addForm.moveId)}，再 call ${formatHex(tutorPointer)}。`
      }

      return `事件Flag ${flag} 当前未被全局对象使用。`
    },
    addObjectFlagStatusIsError() {
      if (this.addType !== "object") return false
      const localId = Number(this.addForm.localId)
      if (!Number.isInteger(localId) || localId < 0 || localId > 0xff || this.addObjectLocalIdRefs.length > 0) {
        return true
      }
      if (this.addObjectTemplateIsPokemonGift) {
        const scriptFlag = Number(this.addForm.scriptFlag)
        return !Number.isInteger(scriptFlag) || scriptFlag <= 0 || scriptFlag > 0xffff
      }
      const flag = Number(this.addForm.eventFlag)
      const minFlag = this.addObjectTemplateAllowsZeroEventFlag ? 0 : 1
      if (!Number.isInteger(flag) || flag < minFlag || flag > 0xffff || this.addObjectFlagRefs.length > 0) return true
      if (this.addObjectTemplateIsMoveTutor) {
        const tutorPointer = this.parseHexOrDecimal(this.addForm.tutorScriptPointer)
        if (!Number.isInteger(tutorPointer) || tutorPointer < 0x08000000 || tutorPointer > 0x09ffffff) return true
        if (this.addObjectTemplateIsSingleMoveTutor) {
          const moveId = Number(this.addForm.moveId)
          return !Number.isInteger(moveId) || moveId <= 0 || moveId > 0xffff
        }
        if (this.addObjectTemplateIsMultiMoveTutor) {
          return !this.addMoveTutorMoveIds.length
            || this.addMoveTutorMoveIds.length > 10
        }
      }
      return false
    },
    selectedEventHasScript() {
      return ["object", "coord", "bg"].includes(this.selectedEvent?.type)
    },
    scriptPointerHex() {
      const pointer = Number(this.formValues.scriptPointer ?? this.selectedEvent?.scriptPointer)
      return Number.isInteger(pointer) ? formatHex(pointer >>> 0) : "null"
    },
    scriptViewerActions() {
      if (!this.selectedEventHasScript) return []

      const actions = []
      const mainPointer = Number(this.formValues.scriptPointer ?? this.selectedEvent?.scriptPointer)
      const mainOffset = pointerToOffset(mainPointer)
      if (Number.isInteger(mainOffset)) {
        actions.push({
          key: "main",
          label: "查看主脚本",
          title: `${this.detailTitle} 主脚本`,
          sourceLabel: `${this.detailTitle} scriptPointer`,
          mode: "script",
          ptr: mainPointer >>> 0,
          off: mainOffset,
        })
      }

      const trainerBattle = this.selectedEvent?.trainerBattle
      trainerBattle?.pointerFields?.forEach((field, index) => {
        const pointer = trainerBattle.pointers?.[index]
        const offset = pointerToOffset(pointer)
        if (!Number.isInteger(offset)) return
        const isScript = field === "continueScript"
        actions.push({
          key: `trainer:${field}`,
          label: this.trainerScriptActionLabel(field),
          title: `${this.detailTitle} ${this.trainerScriptActionTitle(field)}`,
          sourceLabel: `trainer ${field}`,
          mode: isScript ? "script" : "text",
          ptr: pointer >>> 0,
          off: offset,
        })
      })

      return actions
    },
    scriptViewerTitle() {
      return this.scriptViewerEntry?.title || "脚本查看器"
    },
    scriptAnalysis() {
      if (!this.scriptViewerVisible || !this.scriptViewerEntry || this.scriptViewerEntry.mode === "text") return null
      return this.scriptRepository?.analyzeScript(this.scriptViewerEntry.off, {
        maxCommands: 120,
        maxBytes: 720,
      }) || null
    },
    scriptRawText() {
      if (!this.scriptViewerEntry) return ""
      return this.scriptRepository?.formatHexDump(this.scriptViewerEntry.off, 0x100) || ""
    },
    scriptTextEntries() {
      if (!this.scriptViewerEntry) return []
      if (this.scriptViewerEntry.mode === "text") return [this.buildDirectTextEntry(this.scriptViewerEntry)].filter(Boolean)
      return this.scriptRepository?.collectTextEntries(this.scriptAnalysis) || []
    },
    scriptViewerPath() {
      return this.scriptViewerHistory
        .slice(0, this.scriptViewerHistoryIndex + 1)
        .map(entry => `${entry.sourceLabel} ${formatHex(entry.off)}`)
        .join(" > ")
    },
    canNavigateScriptBack() {
      return this.scriptViewerHistoryIndex > 0
    },
    canNavigateScriptForward() {
      return this.scriptViewerHistoryIndex >= 0 && this.scriptViewerHistoryIndex < this.scriptViewerHistory.length - 1
    },
    currentScriptViewerContent() {
      if (this.scriptViewerTab === "raw") return this.scriptRawText
      if (this.scriptViewerTab === "texts") {
        if (!this.scriptTextEntries.length) return "当前入口未解析到文本指针。"
        return this.scriptTextEntries.map((entry, index) =>
          `#${index} ${entry.label}\nPtr : ${entry.ptrHex}\nOff : ${entry.offHex}\n${entry.text}`
        ).join("\n\n")
      }
      if (!this.scriptAnalysis?.ok) return this.scriptAnalysis?.text || "脚本地址无效或无法解析。"
      return this.scriptAnalysis.commands.map((command, index) =>
        `${String(index).padStart(3, "0")} ${command.offHex} ${command.opcodeHex} ${command.text}`
      ).join("\n")
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
    selectedEventJson() {
      return JSON.stringify({
        event: this.toPlainEvent(this.selectedEvent),
        form: this.formValues,
      }, null, 2)
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
    normalizePanelFilter(filter) {
      if (filter === "coord" || filter === "bg") return "event"
      if (EVENT_TABS.some(tab => tab.value === filter)) return filter
      return "object"
    },
    changeFilter(filter) {
      this.panelFilter = this.normalizePanelFilter(filter)
      this.updateEventState({ selectedKey: "" })
    },
    matchesFilter(event) {
      const filter = this.activeFilter
      if (filter === "trainer") return event.type === "object" && event.trainerBattle
      if (filter === "object") return event.type === "object" && !event.trainerBattle
      if (filter === "event") return event.type === "coord" || event.type === "bg"
      return event.type === filter
    },
    eventKey(event) {
      return getMapEventKey(event)
    },
    eventTypeLabel(event) {
      return getMapEventTypeLabel(event)
    },
    detailTypeCode(event) {
      if (event.type === "object" && event.trainerBattle) return "TRAINER"
      if (event.type === "object") return "OBJ"
      if (event.type === "warp") return "WARP"
      if (event.type === "coord") return "COORD"
      if (event.type === "bg") return "BG"
      return "EVENT"
    },
    eventBadgeText(event) {
      if (event.type === "object" && event.trainerBattle) return "训练家"
      if (event.type === "object") return "对象"
      if (event.type === "warp") return "传送点"
      if (event.type === "bg") return "背景事件"
      if (event.type === "coord") return "触发事件"
      return "?"
    },
    eventBadgeClass(event) {
      if (event.type === "object" && event.trainerBattle) return "trainer"
      return event.type
    },
    eventMeta(event) {
      if (event.type === "object" && event.trainerBattle) {
        return `trainerType=${event.trainerType}, range=${event.trainerRangeOrBerryTreeId}, flag=${event.eventFlag}`
      }
      if (event.type === "object") {
        return `localId=${event.localId}, graphicsId=${formatHex(event.graphicsId, 2)}, script=${formatHex(event.scriptPointer)}`
      }
      if (event.type === "warp") return `to mapGroup=${event.mapGroup}, mapNum=${event.mapNum}, warp=${event.warpId}`
      if (event.type === "coord") return `trigger=${event.trigger}, script=${formatHex(event.scriptPointer)}`
      if (event.type === "bg") return `kind=${event.kind}, script=${formatHex(event.scriptPointer)}`
      return ""
    },
    selectEvent(event) {
      this.updateEventState({
        selectedKey: this.eventKey(event),
      })
    },
    filterForEvent(event) {
      if (event.type === "object") return event.trainerBattle ? "trainer" : "object"
      if (event.type === "coord" || event.type === "bg") return "event"
      return event.type
    },
    mapDisplayName(header) {
      if (!header) return "未知地图"
      const key = `${header.mapGroup}:${header.mapNum}`
      const mapItem = this.maps.find(item => item.key === key || (item.mapGroup === header.mapGroup && item.mapNum === header.mapNum))
      return mapItem?.name || `${header.mapGroup}:${header.mapNum}`
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
    openAddDialog(type) {
      this.addType = Object.prototype.hasOwnProperty.call(ADD_TYPE_LABELS, type) ? type : "object"
      this.addForm = this.createAddForm()
      if (this.addType === "object") this.initializeAddObjectForm()
      if (this.addType === "trainer") this.initializeAddTrainerForm()
      this.addDialogVisible = true
    },
    createAddForm() {
      return {
        templateId: "itemPickup",
        trainerTemplateId: "simpleSingle",
        x: 0,
        y: 0,
        elevation: 0,
        localId: 1,
        graphicsId: 0,
        scriptPointer: 0,
        eventFlag: 0,
        trainerId: 0,
        introText: "Let's battle!",
        defeatText: "I lost!",
        postBattleText: "Let's battle again sometime!",
        mapGroup: 0,
        mapNum: 0,
        warpId: 0,
        trigger: 0,
        indexVariable: 0,
        kind: 0,
        argument: 0,
        itemId: 1,
        quantity: 1,
        moveId: 398,
        moveIds: "398, 409, 8, 9, 7, 264",
        menuId: 0x78,
        exitChoice: 6,
        tutorScriptPointer: DEFAULT_MOVE_TUTOR_SCRIPT_POINTER_TEXT,
        speciesId: 1,
        randomSpeciesPool: "1, 4, 7",
        scriptFlag: 1165,
        pokemonLevel: 5,
        heldItemId: 0,
        giftText: "Please take good care of this Pokemon!",
        tutorText: "Which Pokemon should learn this move?",
        tutorPromptText: "Which Pokemon should learn this move?",
        receivedText: "You already received this Pokemon.",
      }
    },
    initializeAddObjectForm() {
      const objects = this.eventCollection?.objects || []
      this.addForm.localId = this.repository?.getNextLocalId(objects) ?? 1
      this.addForm.x = 0
      this.addForm.y = 0
      this.addForm.elevation = 0
      this.addForm.eventFlag = 1165
      this.addForm.itemId = 1
      this.addForm.moveId = 398
      this.addForm.moveIds = "398, 409, 8, 9, 7, 264"
      this.addForm.menuId = 0x78
      this.addForm.exitChoice = 6
      this.addForm.tutorScriptPointer = DEFAULT_MOVE_TUTOR_SCRIPT_POINTER_TEXT
      this.addForm.speciesId = 1
      this.addForm.randomSpeciesPool = "1, 4, 7"
      this.addForm.scriptFlag = 1165
      this.addForm.pokemonLevel = 5
      this.addForm.heldItemId = 0
      this.addForm.giftText = "Please take good care of this Pokemon!"
      this.addForm.tutorText = "Which Pokemon should learn this move?"
      this.addForm.tutorPromptText = "Which Pokemon should learn this move?"
      this.addForm.receivedText = "You already received this Pokemon."
      this.applyAddObjectTemplateDefaults()
    },
    initializeAddTrainerForm() {
      const objects = this.eventCollection?.objects || []
      const trainers = objects.filter(event => event.trainerBattle)
      const previousTrainer = trainers[trainers.length - 1] || {}

      this.addForm.trainerTemplateId = "simpleSingle"
      this.addForm.localId = this.repository?.getNextLocalId(objects) ?? 1
      this.addForm.x = previousTrainer.x ?? 0
      this.addForm.y = previousTrainer.y ?? 0
      this.addForm.elevation = previousTrainer.elevation ?? 0
      this.addForm.graphicsId = previousTrainer.graphicsId ?? 1
      this.addForm.movementType = previousTrainer.movementType ?? 0
      this.addForm.trainerType = previousTrainer.trainerType ?? 1
      this.addForm.trainerRangeOrBerryTreeId = previousTrainer.trainerRangeOrBerryTreeId ?? 3
      this.addForm.trainerId = previousTrainer.trainerBattle?.trainerId ?? 0
      this.addForm.eventFlag = previousTrainer.eventFlag ?? 0
      this.addForm.itemId = 1
      this.addForm.quantity = 1
      this.addForm.scriptFlag = 1165
      this.addForm.introText = "Let's battle!"
      this.addForm.defeatText = "I lost!"
      this.addForm.postBattleText = "Let's battle again sometime!"
      this.addForm.receivedText = "I hope that item helps you."
      this.applyAddTrainerTemplateDefaults()
    },
    applyAddTrainerTemplateDefaults() {
      if (!this.addTrainerTemplateIsReward) {
        this.addForm.postBattleText = this.addForm.postBattleText || "Let's battle again sometime!"
        return
      }

      this.addForm.scriptFlag = this.addForm.scriptFlag || 1165
      this.addForm.receivedText = this.addForm.receivedText || "I hope that item helps you."
      if (this.addTrainerTemplateIsItemReward) {
        this.addForm.itemId = this.addForm.itemId || 1
        this.addForm.quantity = this.addForm.quantity || 1
      }
      if (this.addTrainerTemplateIsPokemonReward) {
        this.addForm.speciesId = this.addForm.speciesId || 1
        this.addForm.pokemonLevel = this.addForm.pokemonLevel || 5
        this.addForm.heldItemId = this.addForm.heldItemId ?? 0
      }
    },
    applyAddObjectTemplateDefaults() {
      const defaults = getObjectEventScriptTemplate(this.addForm.templateId).objectDefaults || {}
      this.addForm.graphicsId = defaults.graphicsId ?? this.addForm.graphicsId
      this.addForm.movementType = defaults.movementType ?? this.addForm.movementType
      this.addForm.movementRangeX = defaults.movementRangeX ?? this.addForm.movementRangeX ?? 0
      this.addForm.movementRangeY = defaults.movementRangeY ?? this.addForm.movementRangeY ?? 0
      this.addForm.trainerType = defaults.trainerType ?? this.addForm.trainerType ?? 0
      this.addForm.trainerRangeOrBerryTreeId =
        defaults.trainerRangeOrBerryTreeId ?? this.addForm.trainerRangeOrBerryTreeId ?? 0
      if (this.addObjectTemplateIsPokemonGift) {
        this.addForm.eventFlag = 0
        this.addForm.scriptFlag = this.addForm.scriptFlag || 1165
        this.addForm.receivedText = this.addForm.receivedText || "You already received this Pokemon."
      } else if (this.addObjectTemplateIsMoveTutor) {
        this.addForm.eventFlag = 0
        this.addForm.moveId = this.addForm.moveId || 398
        this.addForm.moveIds = this.addForm.moveIds || "398, 409, 8, 9, 7, 264"
        this.addForm.menuId = this.addForm.menuId ?? 0x78
        this.addForm.exitChoice = this.addForm.exitChoice ?? 6
        this.addForm.tutorScriptPointer = this.addForm.tutorScriptPointer || DEFAULT_MOVE_TUTOR_SCRIPT_POINTER_TEXT
        this.addForm.tutorText = this.addForm.tutorText || "Which Pokemon should learn this move?"
        this.addForm.tutorPromptText = this.addForm.tutorPromptText || "Which Pokemon should learn this move?"
      } else if (!this.addForm.eventFlag) {
        this.addForm.eventFlag = 1165
      }
    },
    submitAddEvent() {
      if (!this.repository || !this.mapHeader) return

      try {
        const values = this.addType === "trainer"
          ? { ...this.addForm, templateId: this.addForm.trainerTemplateId }
          : this.addForm
        const collection = this.repository.addEvent(this.mapHeader, this.addType, values)
        const events = this.eventsForType(collection, this.addType)
        const created = events[events.length - 1]
        this.addDialogVisible = false
        this.panelFilter = created
          ? this.filterForEvent(created)
          : this.normalizePanelFilter(this.addType)
        this.updateEventState({
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
      if (type === "trainer") return collection.objects.filter(event => event.trainerBattle)
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
    openScriptViewer(action) {
      if (!this.scriptRepository || !action) return
      if (!Number.isInteger(action.off)) {
        ElMessage.warning("脚本地址无效")
        return
      }

      this.scriptViewerEntry = { ...action }
      this.scriptViewerHistory = action.mode === "script" ? [{ ...action }] : []
      this.scriptViewerHistoryIndex = action.mode === "script" ? 0 : -1
      this.scriptViewerTab = action.mode === "text" ? "texts" : "parsed"
      this.scriptViewerStatus = ""
      this.scriptViewerVisible = true
    },
    openScriptTarget(target) {
      if (!target?.valid) return
      const entry = {
        key: `target:${target.off}`,
        label: target.label,
        title: `${target.label} ${formatHex(target.off)}`,
        sourceLabel: target.label,
        mode: "script",
        ptr: target.ptr,
        off: target.off,
      }
      this.scriptViewerHistory = this.scriptViewerHistory.slice(0, this.scriptViewerHistoryIndex + 1)
      this.scriptViewerHistory.push(entry)
      this.scriptViewerHistoryIndex = this.scriptViewerHistory.length - 1
      this.scriptViewerEntry = entry
      this.scriptViewerTab = "parsed"
      this.scriptViewerStatus = ""
    },
    navigateScriptHistory(direction) {
      const nextIndex = this.scriptViewerHistoryIndex + direction
      if (nextIndex < 0 || nextIndex >= this.scriptViewerHistory.length) return
      this.scriptViewerHistoryIndex = nextIndex
      this.scriptViewerEntry = { ...this.scriptViewerHistory[nextIndex] }
      this.scriptViewerTab = "parsed"
      this.scriptViewerStatus = ""
    },
    scriptCommandTarget(command) {
      const targetNames = new Set(["goto", "call", "goto_if", "call_if", "vgoto", "vcall"])
      if (!command || !targetNames.has(command.name)) return null
      const target = command.args?.target || command.args?.arg0
      if (!target || target.off === null || target.off === undefined) return null
      return {
        off: target.off,
        ptr: target.ptr,
        label: command.name,
        valid: this.scriptRepository?.analyzer?.isValidOffset(target.off, 1) || false,
      }
    },
    commandDecodedText(command) {
      if (!command?.args) return ""
      if (command.args.decodedText) return command.args.decodedText
      const trainerTexts = Object.entries(command.args)
        .filter(([key, value]) => key.endsWith("Decoded") && value)
        .map(([key, value]) => `${key.replace(/Decoded$/, "")}=${value}`)
      return trainerTexts.join(" | ")
    },
    trainerScriptActionLabel(field) {
      const labels = {
        introText: "查看开战文本",
        defeatText: "查看战败文本",
        notEnoughPokemonText: "查看无法战斗文本",
        continueScript: "查看战后脚本",
      }
      return labels[field] || `查看 ${field}`
    },
    trainerScriptActionTitle(field) {
      const labels = {
        introText: "开战文本",
        defeatText: "战败文本",
        notEnoughPokemonText: "无法战斗文本",
        continueScript: "战后脚本",
      }
      return labels[field] || field
    },
    buildDirectTextEntry(entry) {
      const text = this.decodeTextAt(entry.off, 320)
      if (!text) return null
      return {
        label: entry.sourceLabel || "text",
        ptr: entry.ptr,
        ptrHex: Number.isInteger(entry.ptr) ? formatHex(entry.ptr) : "null",
        off: entry.off,
        offHex: Number.isInteger(entry.off) ? formatHex(entry.off) : "null",
        text,
      }
    },
    decodeTextAt(offset, maxLength = 320) {
      const rom = this.project?.rom
      if (!rom || !Number.isInteger(offset) || offset < 0 || offset >= rom.size) return ""
      const bytes = []
      for (let index = 0; index < maxLength && offset + index < rom.size; index += 1) {
        const byte = rom.readByte(offset + index)
        bytes.push(byte)
        if (byte === 0xff) break
      }
      return this.project?.textCodec?.decode(bytes) || ""
    },
    async copyScriptViewerContent() {
      try {
        await globalThis.navigator?.clipboard?.writeText(this.currentScriptViewerContent)
        this.scriptViewerStatus = "已复制。"
      } catch {
        this.scriptViewerStatus = "复制失败，请手动选择文本复制。"
      }
    },
    buildValueOptions(labelMap, currentValue, unknownLabel) {
      const options = Object.entries(labelMap).map(([value, label]) => {
        const numberValue = Number(value)
        return {
          value: numberValue,
          label: `${formatHex(numberValue, 2)} ${label}`,
        }
      })
      const numberValue = Number(currentValue)
      if (Number.isInteger(numberValue) && !Object.prototype.hasOwnProperty.call(labelMap, numberValue)) {
        options.push({
          value: numberValue,
          label: `${formatHex(numberValue, 2)} ${unknownLabel}`,
        })
      }
      return options
    },
    parseHexOrDecimal(value) {
      if (typeof value === "string" && value.trim().toLowerCase().startsWith("0x")) {
        return Number.parseInt(value.trim(), 16)
      }
      return Number(value)
    },
    toPlainEvent(event) {
      if (!event) return null
      const skippedKeys = new Set(["rom", "profile", "targetMap", "targetWarp"])
      return Object.fromEntries(
        Object.entries(event).filter(([, value]) =>
          value === null ||
          ["string", "number", "boolean"].includes(typeof value)
        ).filter(([key]) => !skippedKeys.has(key)),
      )
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
  overflow: hidden;
  padding: 12px;
}

.event-tabs {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid #d8e2ef;
}

.event-tab {
  position: relative;
  min-width: 0;
  padding: 8px 4px 9px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.event-tab.active {
  color: #1d4ed8;
}

.event-tab.active::after {
  position: absolute;
  right: 8px;
  bottom: -1px;
  left: 8px;
  height: 2px;
  border-radius: 999px;
  background: #1d4ed8;
  content: "";
}

.add-event-actions {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.add-event-actions.single {
  grid-template-columns: minmax(0, 1fr);
}

.add-event-button {
  flex: 0 0 auto;
  width: 100%;
  margin-left: 0;
}

.event-list {
  display: grid;
  min-height: 0;
  flex: 1 1 auto;
  align-content: start;
  gap: 8px;
  overflow: auto;
  padding-right: 2px;
}

.event-row {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 9px;
  padding: 9px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
  color: #172033;
  text-align: left;
  cursor: pointer;
}

.event-row:hover,
.event-row.active {
  border-color: #60a5fa;
  background: #eff6ff;
}

.event-badge {
  display: inline-flex;
  min-width: 34px;
  height: 22px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 7px;
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
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
  gap: 3px;
}

.event-row-title {
  color: #153b78;
  font-size: 13px;
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
  padding-right: 2px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.detail-title {
  color: #153b78;
  font-size: 15px;
  font-weight: 900;
}

.detail-subtitle {
  margin-top: 2px;
  color: #64748b;
  font-family: Consolas, Monaco, monospace;
  font-size: 11px;
}

.event-section {
  margin-top: 14px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: #153b78;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.section-title::before {
  width: 3px;
  height: 13px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #2563eb;
  content: "";
}

.event-form,
.field-grid,
.add-form {
  display: grid;
  gap: 9px;
}

.event-add-dialog :deep(.el-dialog__body) {
  padding: 18px 20px;
  background: #ffffff;
}

.event-add-form {
  gap: 16px;
}

.add-form-section {
  display: grid;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
}

.add-form-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #153b78;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
}

.add-form-section-title::before {
  width: 3px;
  height: 13px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #2563eb;
  content: "";
}

.add-object-status {
  display: grid;
  gap: 4px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.add-object-status.error {
  color: #b91c1c;
}

.form-field {
  display: grid;
  min-width: 0;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.form-field.compact {
  grid-template-columns: 16px minmax(0, 1fr);
}

.event-add-form .form-field {
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
}

.event-add-form .form-field.compact {
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 6px;
}

.event-add-form .form-field.compact > span {
  color: #64748b;
  font-size: 11px;
  letter-spacing: 0;
  line-height: 1;
}

.event-add-form .textarea-field {
  align-items: start;
}

.event-add-form .textarea-field > span {
  padding-top: 7px;
}

.event-add-form .coordinate-grid {
  gap: 10px;
}

.event-add-form :deep(.el-input-number .el-input__inner) {
  text-align: left;
}

.coordinate-grid,
.movement-range-grid {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.coordinate-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.movement-range-grid {
  grid-template-columns: minmax(0, 1fr);
}

.script-view-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.script-view-button,
.detail-actions .el-button {
  min-width: 0;
  width: 100%;
  margin-left: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
  padding-top: 2px;
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

.debug-json {
  margin-top: 10px;
  padding: 9px 0;
  border-top: 1px solid #e4edf7;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.debug-json summary {
  cursor: pointer;
}

.debug-json pre {
  max-height: 220px;
  overflow: auto;
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: Consolas, Monaco, monospace;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  white-space: pre-wrap;
}

:deep(.el-input-number),
:deep(.el-select) {
  width: 100%;
}

.script-viewer {
  display: grid;
  gap: 10px;
  color: #172033;
}

.script-viewer-meta {
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #f8fbff;
  color: #475569;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.45;
}

.script-viewer-toolbar {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.script-viewer-path {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.script-command-list,
.script-text-list {
  display: grid;
  max-height: 460px;
  gap: 8px;
  overflow: auto;
}

.script-command-summary,
.script-viewer-empty,
.script-text-entry {
  padding: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

.script-warning {
  margin-top: 4px;
  color: #b45309;
}

.script-command-row {
  display: grid;
  grid-template-columns: 38px 70px 96px minmax(0, 1fr) 54px;
  gap: 8px;
  align-items: start;
  padding: 8px;
  border: 1px solid #e4edf7;
  border-radius: 8px;
  background: #f8fafc;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
}

.script-command-index,
.script-command-offset,
.script-command-address {
  color: #64748b;
}

.script-command-text {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #172033;
}

.script-command-decoded {
  grid-column: 4 / 6;
  color: #047857;
  white-space: pre-wrap;
}

.script-viewer-pre,
.script-text-content {
  max-height: 460px;
  overflow: auto;
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.script-text-title {
  color: #153b78;
  font-weight: 900;
}

.script-text-meta {
  margin: 4px 0 8px;
  color: #64748b;
  font-family: Consolas, Monaco, monospace;
}

.script-viewer-status {
  min-height: 18px;
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}
</style>
