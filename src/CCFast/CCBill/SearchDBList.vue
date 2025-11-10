<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <div class="search-dict">
          <div class="search-dict-tree" v-if="treeVisible && sidebarStyle.width != 0" :style="sidebarStyle">
            <SearchTree :sf-key="sfKey" @update-tree-key="updateTreeKey" />
          </div>
          <div class="collapse_btn" v-if="treeVisible">
            <div class="btn_container" @click="sidebarVisible = !sidebarVisible"><left-outlined :style="arrowStyle" /> </div>
          </div>
          <div class="search-dict-main" :style="contentStyle">
            <search-toolbar
              v-if="ready"
              compoment-type="SearchDBList"
              :display-button-as-dropdown="true"
              :button-list="toolbarProps.buttonList"
              :select-list="toolbarProps.selectList"
              :keyword-list="toolbarProps.keywordList"
              :date-list="toolbarProps.dateList"
              :params="props.params"
              :display-mode="displayMode"
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
              @open-design="openDesign"
            />

            <search-table :loading="loading" :config="tableConfigs" :remote="true" :rowColor="rowColor" v-if="displayMode === 'table' && tableConfigs.ready" />
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
    <Modal v-model:open="modalInfo.visible" :width="1200" :title="'附件信息'" :footer="null">
      <Ath v-if="modalInfo.visible" :params="modalInfo.params" :-p-k-value="modalInfo.params.RefOID" :ath-info="modalInfo.athInfo" is-readonly />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, shallowRef } from 'vue';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { SearchGroup, SearchTable, SearchToolbar, SearchTree, SearchImp, SearchRpt } from '/@/components/SearchComponent/index';
  import { Spin, Modal, Drawer } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
  import { useSearchDict } from './hooks/useSearchDict';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import Ath from '/@/WF/CCForm/Ath.vue';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const ready = ref(false);
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
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);
  const displayMode = ref<string>('table');
  const uac = ref(new UAC());
  const { getParams, query, InitUserRegedit, InitMapAttrs, InitToolbar, updateUserRegedit, toolbarProps, tableConfigs, updateTreeKey } = useSearchDict(
    'BP.CCBill.WF_CCBill',
    props,
    'SearchDB_Init',
    wrapperRef as any,
    drawer,
    displayMode,
    modalInfo,
    'DBList',
    entityWG,
  );
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

  const openDesign = () => {
    const atPara = frmDictObject.AtPara || '';
    if (atPara.includes('EnType=SearchBillView'))
      wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEn('TS.CCBill.SearchBillView', getParams('FrmID'))));
    else wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEn('TS.CCBill.FrmDict', getParams('FrmID'))));
  };
  const viewAsTable = async () => {
    displayMode.value = 'table';
    await InitUserRegedit();
    await InitToolbar();
    if (displayMode.value === 'table') await InitMapAttrs();
    await query();
  };
  const showTreeSelector = ref(false);
  const sfKey = ref('');

  const treeVisible = computed(() => {
    return showTreeSelector.value && displayMode.value == 'table';
  });
  const rowColor = ref('');
  const frmDictObject = new FrmDict(getParams('FrmID'));
  const InitSearch = async () => {
    try {
      loading.value = true;

      await frmDictObject.RetrieveFromDBSources();
      console.log({ frmDictObject });
      uac.value = frmDictObject.HisUAC;
      showTreeSelector.value = frmDictObject.ListShowWay == 1;

      sfKey.value = frmDictObject.ListShowKey;
      rowColor.value = frmDictObject.RowColorSet || '';
      displayMode.value = props.params.displayMode || 'table';
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + frmDictObject.No);
      await InitUserRegedit();
      await InitToolbar();
      if (displayMode.value === 'table') await InitMapAttrs();
      await query();
    } catch (e: any) {
      errorObj.tips = e as string;
      Modal.error({ content: errorObj.tips });
      console.trace(e);
    } finally {
      ready.value = true;
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
