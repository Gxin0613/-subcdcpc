<template>
  <Spin :spinning="loading" :tip="'加载子表中...'">
    <div class="ct-container" :class="`mode-${displayMode}`">
      <template v-if="ready">
        <Empty v-if="mapDtls.length === 0" :description="'没有找到从表'" :image="Empty.PRESENTED_IMAGE_SIMPLE" />

        <!-- 单一从表直接呈现（非左右联动模式） -->
        <SubTableMain v-else-if="mapDtls.length === 1 && displayMode != 4" :frm-id="frmId" :dtl-id="mapDtls[0].No" :work-id="workId" />

        <!-- 折叠/标签模式（非左右联动模式） -->
        <template v-else-if="displayMode != 4">
          <Collapse v-if="displayMode == 1" class="custom-collapse" expandIconPosition="end" v-model:activeKey="activeCollapseKey">
            <CollapsePanel v-for="dtl in mapDtls" :key="dtl.No">
              <template #header>
                <div class="collapse-header">
                  <span class="header-title">{{ dtl.Name }}</span>
                </div>
              </template>
              <SubTableMain :frm-id="frmId" :dtl-id="dtl.No" :work-id="workId" fit-parent />
            </CollapsePanel>
          </Collapse>
          <Tabs v-if="displayMode == 2" type="card" tabPosition="left" class="custom-tabs">
            <TabPane v-for="dtl in mapDtls" :key="dtl.No" :name="dtl.Name">
              <template #tab>
                <div class="tab-label">
                  <span>{{ dtl.Name }}</span>
                </div>
              </template>
              <SubTableMain :frm-id="frmId" :dtl-id="dtl.No" :work-id="workId" fit-parent />
            </TabPane>
          </Tabs>
        </template>

        <!-- 左右联动模式（显示从表 + 右侧详情） -->
        <template v-else>
          <div class="split-layout">
            <div class="left-pane">
              <!-- <div class="pane-header"> -->
              <!-- <h3 class="pane-title">📑 从表列表</h3> -->
              <!-- </div> -->
              <!-- 多从表用左侧Tabs展示，单从表直接展示 -->
              <template v-if="mapDtls.length > 1">
                <Tabs type="card" tabPosition="top" v-model:activeKey="activeDtlNo" class="split-tabs">
                  <TabPane v-for="dtl in mapDtls" :key="dtl.No" :name="dtl.No">
                    <template #tab>
                      <span class="split-tab-label">{{ dtl.Name }}</span>
                    </template>
                    <SubTableMain ref="subTableRefs" :frm-id="frmId" :dtl-id="dtl.No" :work-id="workId" fitParent @row-click="onRowClick(dtl, $event)" />
                  </TabPane>
                </Tabs>
              </template>
              <template v-else>
                <SubTableMain ref="singleTableRef" :frm-id="frmId" :dtl-id="mapDtls[0].No" :work-id="workId" fitParent @row-click="onRowClick(mapDtls[0], $event)" />
              </template>
            </div>
            <div class="right-pane" :class="{ 'has-content': selectedRow && selectedDtl }">
              <!-- <div class="pane-header"> -->
              <!-- <h3 class="pane-title">📝 详细信息</h3> -->
              <!-- </div> -->
              <template v-if="selectedRow && selectedDtl">
                <DtlFrm
                  :mapDtl="selectedDtl"
                  :rowData="selectedRow"
                  :mainData="mainData || {}"
                  :params="detailParams"
                  :refOID="selectedRow.OID"
                  :refPKVal="workId + ''"
                  :auto-layout="true"
                  :key="`${selectedDtl.No}-${selectedRow.OID}`"
                  @save-success="handleSaveSuccess"
                  @delete-success="onDeleteOrClose"
                  @close="onDeleteOrClose"
                />
              </template>
              <template v-else>
                <div class="placeholder">
                  <div class="placeholder-text">请选择左侧从表记录查看详情</div>
                  <div class="placeholder-hint">点击表格行即可查看详细信息</div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </template>
    </div>
  </Spin>
</template>
<script lang="ts" setup>
  import { onMounted, ref, computed } from 'vue';
  import { Spin, Collapse, CollapsePanel, TabPane, Tabs, Empty } from 'ant-design-vue';
  import { MapDtls } from '/@/WF/Admin/FrmLogic/MapDtl';
  import SubTableMain from './SubTableMain.vue';
  import DtlFrm from '/@/WF/CCForm/DtlFrm.vue';
  const props = defineProps({
    frmId: {
      type: String,
      default: '',
    },
    workId: {
      type: Number,
      required: true,
    },
    displayMode: {
      type: Number,
      default: 0,
    },
    // 主表数据（用于右侧详情页面参数拼装）
    mainData: {
      type: Object,
      default: () => ({}),
    },
  });

  // 子表格
  const mapDtls = ref<MapDtls>(new MapDtls());

  const ready = ref(false);
  const loading = ref(false);
  const activeDtlNo = ref<string | undefined>(undefined);

  // 选中行与从表
  const selectedRow = ref<Record<string, any> | null>(null);
  const selectedDtl = ref<any | null>(null);
  const subTableRefs = ref<any[]>([]);
  const singleTableRef = ref<any>(null);

  const onRowClick = (dtl: any, row: Record<string, any>) => {
    selectedDtl.value = dtl;
    selectedRow.value = row;
  };

  // 刷新左侧表格
  const refreshLeftTable = () => {
    // 获取当前激活的表格并刷新
    if (mapDtls.value.length > 1) {
      // 多表情况
      const activeIndex = mapDtls.value.findIndex((d) => d.No === activeDtlNo.value);
      if (activeIndex >= 0 && subTableRefs.value[activeIndex]) {
        subTableRefs.value[activeIndex].loadTableInfo();
      }
    } else if (singleTableRef.value) {
      // 单表情况
      singleTableRef.value.loadTableInfo();
    }
  };

  // 保存成功回调
  const handleSaveSuccess = () => {
    refreshLeftTable();
  };

  // 删除成功回调
  const onDeleteOrClose = () => {
    selectedRow.value = null;
    selectedDtl.value = null;
    refreshLeftTable();
  };

  // 右侧详情所需基本参数
  const detailParams = computed(() => {
    return {
      FrmID: props.frmId,
      RefPKVal: props.workId,
      EnsName: selectedDtl.value?.No,
    } as Record<string, any>;
  });

  // 左侧表格高度：改为自适应内容，由 SubTableMain 控制

  const activeCollapseKey = ref<Array<string | number>>([]);

  onMounted(async () => {
    try {
      loading.value = true;
      await mapDtls.value.Retrieve('FK_MapData', props.frmId);
      if (mapDtls.value.length == 0) return;
      activeDtlNo.value = mapDtls.value[0].No;
      activeCollapseKey.value = [mapDtls.value[0].No];
    } catch (e: any) {
      loading.value = false;
    } finally {
      loading.value = false;
      ready.value = true;
    }
  });
</script>

<style lang="less" scoped>
  .ct-container {
    min-height: 100px;
    width: 100%;
    padding: 6px;
    background: linear-gradient(135deg, #f5f7fa 0%, #f0f3f8 100%);
    border-radius: 8px;
    transition: all 0.3s ease;

    :deep(.ant-tabs-tab-btn) {
      color: #1890ff;
      font-size: 13px;
    }
    :deep(.ant-tabs-tab-active) {
      background-color: #1890ff !important;

      .ant-tabs-tab-btn {
        color: white !important;
      }
    }

    &.mode-1 {
      background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
    }

    &.mode-2 {
      background: linear-gradient(135deg, #f8f9fb 0%, #f3f5f9 100%);
    }

    &.mode-4 {
      background: transparent;
      padding: 0;
    }

    // 自定义折叠面板样式
    .custom-collapse {
      background: transparent;
      border: none;

      :deep(.ant-collapse-item) {
        margin-bottom: 12px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e8eaed;
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        &.ant-collapse-item-active {
          border-color: #1890ff;
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
        }
      }

      :deep(.ant-collapse-header) {
        padding: 16px 20px !important;
        background: linear-gradient(90deg, #fafbfc 0%, #fff 100%);
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(90deg, #f0f3f8 0%, #fafbfc 100%);
        }
      }

      :deep(.ant-collapse-content-box) {
        padding: 0;
        background: #fafbfc;
      }

      :deep(.ant-collapse-arrow) {
        font-size: 14px;
        color: #1890ff;
      }
    }

    .collapse-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;

      .header-title {
        flex: 1;
        color: #1f2329;
      }

      .header-badge {
        padding: 2px 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        min-width: 24px;
        text-align: center;
      }
    }

    // 自定义标签页样式
    .custom-tabs {
      :deep(.ant-tabs-nav) {
        background: #fff;
        padding: 8px;
        border-radius: 8px 0 0 8px;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);

        &::before {
          border: none;
        }
      }

      :deep(.ant-tabs-tab) {
        margin: 0 0 8px 0 !important;
        padding: 12px 16px !important;
        border-radius: 6px;
        background: transparent;
        transition: all 0.3s ease;

        &:hover {
          background: #f0f3f8;
          color: #1890ff;
        }

        &.ant-tabs-tab-active {
          background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);

          .tab-icon {
            transform: scale(1.1);
          }
        }
      }

      :deep(.ant-tabs-content) {
        background: #fff;
        padding: 16px;
        border-radius: 0 8px 8px 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      :deep(.ant-tabs-tabpane) {
        padding: 0;
      }
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .tab-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
    }
  }

  // 左右联动模式样式
  .split-layout {
    display: flex;
    gap: 4px;
    min-height: 500px;
    padding: 4px;
    background: #f5f7fa;
    border-radius: 6px;
  }

  .left-pane,
  .right-pane {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }
  }

  .left-pane {
    width: 50%;
    min-width: 400px;

    .split-tabs {
      :deep(.ant-tabs-nav) {
        padding: 0 16px;
        background: #fafbfc;
        border-bottom: 1px solid #e8eaed;

        &::before {
          border: none;
        }
      }

      :deep(.ant-tabs-tab) {
        margin-top: 20px;
        padding: 6px 8px;
        transition: all 0.3s ease;

        &:hover {
          color: #1890ff;
        }

        &.ant-tabs-tab-active {
          color: #1890ff;
          background: #fff;
          box-shadow: 0 -2px 8px rgba(24, 144, 255, 0.1);
        }
      }

      :deep(.ant-tabs-content) {
        padding: 0;
      }
    }

    .split-tab-label {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .right-pane {
    flex: 1;
    min-height: 400px;
    position: relative;

    &.has-content {
      :deep(.ant-form) {
        padding: 16px;
      }
    }
  }

  .pane-header {
    padding: 12px 16px;
    background: linear-gradient(90deg, #fafbfc 0%, #fff 100%);
    border-bottom: 1px solid #e8eaed;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .pane-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pane-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(.ant-btn) {
        font-size: 12px;
        height: 28px;
        padding: 0 12px;
        border-radius: 6px;
        transition: all 0.2s ease;

        &.ant-btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          border: none;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);

          &:hover {
            background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
            box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
          }
        }

        &.ant-btn-dangerous {
          color: #ff4d4f;
          border-color: #ff4d4f;

          &:hover {
            background: #fff1f0;
            border-color: #ff7875;
            color: #ff7875;
          }
        }

        &.ant-btn-text {
          color: #646a73;

          &:hover {
            background: #f0f2f5;
            color: #1f2329;
          }
        }
      }
    }
  }

  .placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 40px;

    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
      animation: pulse 2s infinite;
    }

    .placeholder-text {
      font-size: 16px;
      color: #646a73;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .placeholder-hint {
      font-size: 14px;
      color: #8f959e;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  // 全局优化
  :deep(.ant-empty) {
    padding: 40px;

    .ant-empty-image {
      height: 80px;
    }

    .ant-empty-description {
      font-size: 14px;
      color: #8f959e;
    }
  }

  :deep(.ant-spin-nested-loading) {
    min-height: 200px;
  }

  :deep(.ant-spin-dot) {
    font-size: 32px;
  }

  :deep(.ant-spin-text) {
    margin-top: 12px;
    color: #646a73;
    font-size: 14px;
  }
</style>
