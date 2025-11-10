<template>
  <aside class="attr-panel" :style="panelStyle">
    <div class="form-wrapper">
      <n-tabs type="line" :theme-overrides="TabsTheme" v-model:value="currentSettingTab">
        <n-tab-pane name="node" :tab="'节点设置'">
          <div class="wrapper" v-if="nodeEntity || nodeLoading">
            <Spin :spinning="nodeLoading" :tip="'加载中...'">
              <div class="ns-wrapper" v-if="nodeLoading"> </div>
            </Spin>
            <NodeSettings v-if="nodeEntity" />
          </div>
          <div class="wrapper" v-else style="padding-top: 60px">
            <n-empty size="large" :description="'请选择一个节点'" />
          </div>
        </n-tab-pane>
        <n-tab-pane name="flow" :tab="'流程设置'">
          <div class="wrapper">
            <FlowSettings />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
    <div class="locked" @click="changeLockStatus">
      <LockOutlined v-if="locked" />
      <UnlockOutlined v-else />
    </div>
    <div v-if="!locked" class="switch" @click="togglePanel">
      <right-outlined class="icon" :style="switchStyle" />
    </div>
  </aside>
</template>

<script lang="ts" setup>
  import { NTabs, NTabPane, NEmpty } from 'naive-ui';
  import { computed, inject, onMounted, onUnmounted, ref, unref, watch } from 'vue';
  import FlowSettings from './settings/FlowSettings.vue';
  // load theme
  import { TabsTheme } from '/@form/theme/index';
  import { ProvideNodeInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
  import NodeSettings from '/@/WF/Admin/FlowDesigner/components/settings/NodeSettings.vue';
  import { flowEntityKeys, nodeEntityKeys } from '/@/WF/Admin/FlowDesigner/utils/keys';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { Spin } from 'ant-design-vue';
  import { RightOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { nodeEntity, nodeLoading } = inject(nodeEntityKeys) as ProvideNodeInfo;
  const currentSettingTab = ref<string>('flow');

  const VisibleKey = 'panelOpened';
  const LockedKey = 'panelLocked';
  let countdownLatch: Nullable<any> = null;
  const stopWatchNode = watch<BSEntity>(
    () => unref(nodeEntity),
    (value) => {
      if (!!value) {
        currentSettingTab.value = 'node';
        panelVisible.value = true;
        clearTimeout(countdownLatch);
        countdownLatch = null;
      } else {
        countdownLatch = setTimeout(() => {
          currentSettingTab.value = 'flow';
        }, 300);
      }
    },
  );
  const { flowEntity, updateFlowEntity } = inject(flowEntityKeys)!;
  const flowAtPara = computed(() => {
    if (flowEntity.value?.atPara) {
      return flowEntity.value?.atPara;
    }
    return {};
  });

  const panelVisible = ref(false);
  const togglePanel = async () => {
    panelVisible.value = !panelVisible.value;
    await updateFlowEntity(VisibleKey, panelVisible.value ? 1 : 0, true);
  };
  const locked = ref(false);
  const changeLockStatus = () => {
    locked.value = !locked.value;
    updateFlowEntity(LockedKey, locked.value ? 1 : 0, true);
  };
  const getLockStatus = () => {
    if (!flowAtPara.value.map.has(LockedKey)) {
      updateFlowEntity(LockedKey, 0, true);
      locked.value = false;
      return;
    }
    locked.value = flowAtPara.value.map.get(LockedKey) == 1;
  };
  const getPanelVisible = () => {
    if (!flowAtPara.value.map.has(VisibleKey)) {
      updateFlowEntity(VisibleKey, 1, true);
      panelVisible.value = true;
      return;
    }
    panelVisible.value = flowAtPara.value.map.get(VisibleKey) == 1;
  };

  onMounted(() => {
    getLockStatus();
    getPanelVisible();
  });

  // 面板属性
  const panelStyle = computed(() => {
    if (locked.value) {
      return { right: '-340px' };
    }
    return {
      right: panelVisible.value ? '0' : '-330px',
    };
  });
  // 开关属性
  const switchStyle = computed(() => {
    return {
      transform: `rotate(${panelVisible.value ? '0' : '180deg'})`,
    };
  });

  onUnmounted(() => {
    stopWatchNode();
  });
</script>

<style lang="less" scoped>
  .attr-panel {
    width: 350px;
    height: calc(100vh - 60px);
    padding: 9px 21px;
    border-left: 1px solid #eeeeee;
    box-sizing: border-box;
    flex-shrink: 0;
    background-color: white;
    transition: all ease 0.4s;
    position: absolute;
    z-index: 888;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

    .form-wrapper {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: auto;
      padding: 3px;
      .wrapper {
        height: 100%;
        width: 100%;
        box-sizing: border-box;

        :deep(.n-form-item) {
          margin-bottom: 6px;
        }
      }
    }

    .switch {
      position: absolute;
      z-index: 12;
      top: calc(50% + 30px);
      left: -20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all ease 0.4s;
      box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

      .icon {
        transition: all ease 0.4s;
      }
    }

    .locked {
      position: absolute;
      z-index: 12;
      top: calc(50% - 30px);
      left: -20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all ease 0.4s;
      box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

      .icon {
        transition: all ease 0.4s;
        color: #459dff;
      }
    }
  }
  .ns-wrapper {
    width: 100%;
    height: 400px;
  }
  .setting-item {
    padding: 0 4px;
    box-sizing: border-box;
  }
</style>
