<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <div class="search-dict">
          <div class="search-dict-tree" v-if="treeVisible && sidebarStyle.width != 0" :style="sidebarStyle">
            <SearchTree :sf-key="sfKey" :frm-id="params['FrmID']" @update-tree-key="updateTreeKey" />
          </div>
          <div class="collapse_btn" v-if="treeVisible">
            <div class="btn_container" @click="sidebarVisible = !sidebarVisible"><left-outlined :style="arrowStyle" /> </div>
          </div>
          <div class="search-dict-main" :style="contentStyle">
            <search-toolbar
              compoment-type="SearchEntityNoName"
              :display-button-as-dropdown="true"
              :button-list="toolbarProps.buttonList"
              :select-list="toolbarProps.selectList"
              :keyword-list="toolbarProps.keywordList"
              :date-list="toolbarProps.dateList"
              :params="props.params"
              :display-mode="displayMode"
              pageType="SearchAskFrm"
              @update-first-ddl="
                (val) => {
                  if (Array.isArray(toolbarProps.selectList) && toolbarProps.selectList.length > 0) {
                    toolbarProps.selectList[0].value = val;
                  }
                }
              "
              @group-init-page="GroupInitPage"
              @view-as-rpt="viewAsRpt"
              @view-as-table="viewAsTable"
              @open-dict-settings="openDictSettings"
            />
            <search-table :loading="loading" :config="tableConfigs" :remote="true" v-if="displayMode === 'table' && tableConfigs.ready" />
            <SearchGroup v-if="displayMode === 'group'" :key="timer" :loading="loading" :config="tableConfigs" :params="props.params" />
            <SearchRpt v-if="displayMode === 'rpt'" :key="timer" :loading="loading" :config="tableConfigs" :params="props.params" />
          </div>
        </div>
      </template>
    </Spin>
    <!--右侧滑出-->
    <Drawer :visible="drawer.visible" :title="drawer.title" :width="drawer.width" @close="drawerClose" :body-style="drawerPadding">
      <div v-if="drawer.visible">
        <SearchImp :params="params" />
      </div>
    </Drawer>
    <Modal v-model:open="modalInfo.visible" :width="modalInfo.params.width || 1200" :title="'附件信息'" :footer="null">
      <!-- 图片附件 -->
      <img v-if="modalInfo.params.Type == 'ImgPreview'" :src="modalInfo.params.ImgUrl" style="width: 100%" />
      <Ath v-else :params="modalInfo.params" :-p-k-value="modalInfo.params.RefOID" :ath-info="modalInfo.athInfo" is-readonly />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { computed, reactive, Ref, ref, shallowRef } from 'vue';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { SearchGroup, SearchTable, SearchToolbar, SearchTree, SearchImp, SearchRpt } from '/@/components/SearchComponent/index';
  import { Spin, Modal, Drawer } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { useSearchAskFrm } from '../hooks/useSearchAskFrm';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import Ath from '/@/WF/CCForm/Ath.vue';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  type ModalArgs = {
    visible: boolean;
    params: Recordable;
    athInfo: Recordable;
  };
  // 模态框，主要处理附件
  const modalInfo = reactive<ModalArgs>({
    visible: false,
    params: {},
    athInfo: {},
  });
  const drawerPadding = {
    padding: '0 12px',
  };
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  //弹窗显示
  const drawer = reactive({
    visible: false,
    title: '',
    width: 800,
  });

  const sidebarVisible = ref(false);
  const sidebarStyle = computed(() => {
    return {
      width: sidebarVisible.value ? '180px' : 0,
      padding: sidebarVisible.value ? '1rem' : 0,
    };
  });
  const arrowStyle = computed(() => {
    return {
      transition: 'all ease 0.3s',
      transform: `rotate(${sidebarVisible.value ? 0 : 180}deg)`,
    };
  });
  const contentStyle = computed(() => {
    return {
      width: sidebarVisible.value ? 'calc(100% - 200px)' : '100%',
    };
  });

  const drawerClose = async () => {
    drawer.visible = false;
    await InitMapAttrs();
    await query();
  };
  const displayMode = ref<string>('table');
  const uac = ref(new UAC());
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>();
  const { getParams, mapData, initDynamicEntity, query, InitUserRegedit, InitMapAttrs, InitToolbar, updateUserRegedit, toolbarProps, tableConfigs, updateTreeKey } =
    useSearchAskFrm('BP.CCBill.WF_CCBill', props, 'Search_Init', wrapperRef as any, drawer, displayMode, modalInfo, 'Dict', loading, entityWG as Ref<WaiGuaBaseEntity>);
  const timer = ref(0);
  const GroupInitPage = async () => {
    await updateUserRegedit();
    timer.value = new Date().getTime();
    displayMode.value = 'group';
  };
  const viewAsRpt = async () => {
    await updateUserRegedit();
    timer.value = new Date().getTime();
    displayMode.value = 'rpt';
  };

  const openDictSettings = () => {
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.Replace, GloComm.UrlEn('TS.CCBill.EntityNoNameSettingOne', getParams('FrmID'))));
  };
  const viewAsTable = async () => {
    displayMode.value = 'table';
    const initMethods = [InitUserRegedit(), InitToolbar()];
    if (displayMode.value === 'table') initMethods.push(InitMapAttrs());
    await Promise.all(initMethods);
    await query();
  };
  const showTreeSelector = ref(false);
  const sfKey = ref('');

  const treeVisible = computed(() => {
    return showTreeSelector.value && displayMode.value == 'table';
  });
  const InitSearch = async () => {
    try {
      loading.value = true;
      displayMode.value = props.params.displayMode || 'table';
      await initDynamicEntity();
      uac.value = mapData.value.HisUAC;
      showTreeSelector.value = mapData.value.ListShowWay == 1;
      sfKey.value = mapData.value.ListShowKey;

      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + mapData.value.No);
      if (!!entityWG.value) {
        entityWG.value.mapData = mapData.value as any;
        if (typeof entityWG.value.Init === 'function') entityWG.value.Init();
      }
      const initMethods = [InitToolbar()];
      if (displayMode.value === 'table') initMethods.push(InitMapAttrs());
      await Promise.all(initMethods);
      // await query();
      setTimeout(() => {
        treeVisible.value && (sidebarVisible.value = true);
      }, 500);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };

  InitSearch();
</script>

<style lang="less" scoped>
  .search-dict {
    display: flex;
    align-items: stretch;
    height: calc(var(--viewport-height) - 120px);

    .search-dict-tree {
      height: 100%;
      box-sizing: border-box;
      width: 180px;
      flex-shrink: 0;
      padding: 0 8px;
      background-color: white;
    }

    .collapse_btn {
      height: 100%;
      width: 12px;
      background-color: #f2f5f7;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 80px;

      .btn_container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 100px;
        cursor: pointer;

        &:hover {
          background-color: white;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
      }
    }

    .search-dict-main {
      height: 100%;
      background-color: white;
      width: calc(100% - 200px);
      :deep(.n-config-provider) {
        height: unset;
      }
    }
  }
</style>
