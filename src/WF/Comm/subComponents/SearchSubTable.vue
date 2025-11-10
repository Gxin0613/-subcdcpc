<template>
  <div class="ct-container" :style="containerStyle" ref="ctContainer">
    <Empty v-if="tabs.length === 0" :description="'当前实体没有从表，请配置'" style="padding-top: 50px" />
    <!-- <Collapse v-else-if="displayMode == 1" v-model:activeKey="activeKeys" :style="{ height: '100%' }" class="enhanced-collapse">
      <CollapsePanel v-for="tab in tabs" :key="tab.key" :header="tab.name" class="enhanced-panel">
        <template #header>
          <div class="panel-header">
            <div class="header-content">
              <span class="header-icon">📋</span>
              <span class="header-title">{{ tab.name }}</span>
            </div>
            <div class="header-indicator">
              <span class="arrow-icon">▶</span>
            </div>
          </div>
        </template>
        <component
          :key="tab.key"
          :is="tab.comp"
          :main-table-info="{
            row: props.mainTableRow,
            classId: entity.classID,
          }"
          :height="320"
          :params="getAllRequestParams(tab.compSrc!)"
        />
      </CollapsePanel>
    </Collapse> -->
    <template v-else>
      <component
        v-if="tabs.length == 1"
        :key="tabs[0].key"
        :is="tabs[0].comp"
        :main-table-info="{
          row: props.mainTableRow,
          classId: entity.classID,
        }"
        :height="320"
        :params="getAllRequestParams(tabs[0].compSrc!)"
      />
      <Tabs v-else-if="[1, 2].includes(displayMode)" type="card" tab-position="left">
        <TabPane v-for="tab in tabs" :key="tab.key" :tab="tab.name">
          <component
            :key="tab.key"
            :is="tab.comp"
            :main-table-info="{
              row: props.mainTableRow,
              classId: entity.classID,
            }"
            :height="320"
            :params="getAllRequestParams(tab.compSrc!)"
          />
        </TabPane>
      </Tabs>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, markRaw, shallowRef } from 'vue';
  import { TabPane, Tabs, Empty } from 'ant-design-vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';

  interface EnOnlyTabs {
    key: string;
    name: string;
    type: 'group' | 'component';
    compSrc: string | null;
    comp: any;
    height: number;
  }

  const props = defineProps({
    entity: {
      type: Object,
      required: true,
    },
    mainTableRow: {
      type: Object,
      default: () => ({}),
    },
    displayMode: {
      type: Number,
      default: 2, // 0: 默认，1: 折叠面板，2: 标签页
    },
  });

  const ctContainer = shallowRef<HTMLElement>();

  const containerStyle = computed(() => {
    const rect = ctContainer.value?.getBoundingClientRect();
    const width = window.innerWidth - (rect?.left || 0);
    return {
      width: width - 30 + 'px',
    };
  });

  const activeKeys = ref<string[]>([]);

  const { loadComponent } = useComponentLoader();
  const tabs = ref<Array<EnOnlyTabs>>([]);

  onMounted(() => {
    const groups = props.entity._enMap.attrs.groups.filter((group) => group.type == 'component');
    const pkFieldName = props.entity.PK;
    tabs.value = groups.map((t) => {
      const tInfo = {
        ...t,
      };
      if (t.type === 'component') {
        tInfo.compSrc = t.compSrc + '&PKVal=' + props.mainTableRow[pkFieldName];
        tInfo.comp = markRaw(loadComponent(tInfo.compSrc));
      }
      return tInfo;
    });
    console.log(tabs.value[0]?.key);
    if (tabs.value.length > 0) {
      activeKeys.value = [tabs.value[0]?.key];
    }
  });
</script>

<style lang="less" scoped>
  .ct-container {
    height: 500px;
    min-width: 600px;
    overflow-y: scroll;

    .enhanced-collapse {
      background: transparent;
      border: none;

      :deep(.ant-collapse-item) {
        margin-bottom: 4px;
        border: 1px solid #e1e6eb;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition: all 0.2s ease;
        overflow: hidden;

        &:hover {
          border-color: #c7d2fe;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        &.ant-collapse-item-active {
          border-color: #3b82f6;
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.12);
        }
      }

      :deep(.ant-collapse-header) {
        padding: 10px 16px;
        background: #f8fafc;
        border-bottom: 1px solid transparent;
        transition: all 0.2s ease;
        position: relative;
        min-height: 44px;
        display: flex;
        align-items: center;

        &:hover {
          background: #f1f5f9;
        }

        .ant-collapse-arrow {
          display: none;
        }
      }

      :deep(.ant-collapse-item-active .ant-collapse-header) {
        background: #3b82f6;
        border-bottom-color: #e1e6eb;
        color: white;

        .panel-header {
          color: white;

          .header-icon {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .arrow-icon {
            color: white;
            transform: rotate(90deg);
          }
        }
      }

      :deep(.ant-collapse-content) {
        background: #ffffff;
        border-top: none;
      }

      :deep(.ant-collapse-content-box) {
        padding: 12px 16px;
        background: #ffffff;
      }
    }

    // 自定义头部样式
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      font-weight: 500;
      color: #374151;

      .header-content {
        display: flex;
        align-items: center;
        gap: 8px;

        .header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;

          background: #dbeafe;
          color: #3b82f6;
          font-size: 12px;
          transition: all 0.2s ease;
          border: 1px solid #bfdbfe;
        }

        .header-title {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }
      }

      .header-indicator {
        .arrow-icon {
          display: inline-block;
          font-size: 10px;
          color: #6b7280;
          transition: all 0.2s ease;
          transform-origin: center;
        }
      }
    }

    // 原有的 Tabs 样式保持不变
    :deep(.ant-collapse-content-box) {
      padding: 0;
    }

    :deep(.ant-collapse) {
      background-color: #fff;
    }

    :deep(.ant-tabs-tab) {
      border: none;
      padding: 12px 16px;
      border-radius: 0 !important;
    }

    :deep(.ant-tabs-nav > div) {
      display: flex;
      align-items: center;
      padding-top: 6px;
    }

    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }

    :deep(.ant-tabs-card.ant-tabs-left > .ant-tabs-nav .ant-tabs-tab + .ant-tabs-tab) {
      margin-top: 0;
    }

    :deep(.ant-tabs-content > .ant-tabs-tabpane) {
      padding-left: 0 !important;
    }

    :deep(.ant-tabs-tab-active) {
      border-bottom-color: unset;
      // background-color: var(--system-bg-color);
      background-color: #e6f7ff;

      .ant-tabs-tab-btn {
        color: #1890ff !important;
      }
    }

    :deep(.ant-tabs-tab-remove) {
      color: white;
    }

    :deep(.ant-tabs-nav-wrap) {
      background-color: #ffffff;
    }

    :deep(.ant-tabs-nav > div > span) {
      height: 12px !important;
    }

    .ant-tabs-tab-active .ant-tabs-tab {
      margin-right: 4px;
    }
  }
</style>
