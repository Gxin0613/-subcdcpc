<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitSearchExt" :close-modal-func="InitSearchExt">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <div class="search-bill">
          <div class="search-bill-tree" v-if="treeVisible && sidebarStyle.width != 0" :style="sidebarStyle">
            <SearchTree :sf-key="sfKey" :frm-id="params['FrmID']" @update-tree-key="updateTreeKey" />
          </div>
          <div class="collapse_btn" v-if="treeVisible">
            <div class="btn_container" @click="sidebarVisible = !sidebarVisible"><left-outlined :style="arrowStyle" /> </div>
          </div>
          <div class="search-bill-main" :style="contentStyle">
            <search-toolbar
              v-if="ready"
              compoment-type="SearchBill"
              :display-button-as-dropdown="true"
              :button-list="toolbarProps.buttonList"
              :select-list="toolbarProps.selectList"
              :keyword-list="toolbarProps.keywordList"
              :date-list="toolbarProps.dateList"
              :display-mode="displayMode"
              :params="params"
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
              @open-bill-design="openBillDesign"
            />
            <search-table :loading="loading" :config="tableConfigs" :remote="true" v-if="displayMode === 'table' && tableConfigs.ready" />
            <SearchGroup v-if="displayMode === 'group'" :key="timer" :loading="loading" :config="tableConfigs" :params="props.params" />
            <SearchRpt v-if="displayMode === 'rpt'" :key="timer" :loading="loading" :config="tableConfigs" :params="props.params" />
          </div>
        </div>
      </template>
    </Spin>
    <!--右侧滑出-->
    <Drawer :visible="drawer.visible" :title="drawer.title" :width="drawer.width" @close="drawerClose" :body-style="dStyle">
      <div v-if="drawer.visible">
        <SearchImp :params="params" />
      </div>
    </Drawer>
    <Modal v-model:open="modalInfo.visible" :width="modalInfo.params.width || 1200" :title="'附件信息'" :footer="null">
      <!-- 图片附件 -->
      <img v-if="modalInfo.params.Type == 'ImgPreview'" :src="modalInfo.params.ImgUrl" style="width: 100%" />
    </Modal>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { computed, reactive, Ref, ref, shallowRef } from 'vue';
  import { UAC } from '/@/bp/en/Map/UAC';
  // import SearchToolbar from '/@/components/SearchComponent/src/SearchToolbar.vue';
  // import SearchTable from '/@/components/SearchComponent/src/SearchTable.vue';
  import { LeftOutlined } from '@ant-design/icons-vue';
  import { SearchGroup, SearchTable, SearchToolbar, SearchTree, SearchRpt, SearchImp } from '/@/components/SearchComponent/index';
  import { Spin, Drawer, Modal } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { useSearchBill } from './hooks/useSearchBill';
  import { FrmDict } from './FrmDict';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { FrmBill } from './FrmBill';

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

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  console.log(props.params);
  //弹窗显示
  const drawer = reactive({
    visible: false,
    title: '',
    width: 800,
  });
  const dStyle = computed(() => {
    return {
      padding: '0 12px',
    };
  });
  const drawerClose = async () => {
    drawer.visible = false;
    await query();
  };
  const uac = ref(new UAC());
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);
  const displayMode = ref<string>('table');
  const { getParams, initDynamicEntity, query, frmBill, InitUserRegedit, InitMapAttrs, InitToolbar, updateUserRegedit, updateTreeKey, toolbarProps, tableConfigs } = useSearchBill(
    'BP.CCBill.WF_CCBill',
    props,
    'Search_Init',
    wrapperRef as any,
    drawer,
    displayMode,
    modalInfo,
    entityWG as Ref<WaiGuaBaseEntity>,
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

  const viewAsTable = async () => {
    displayMode.value = 'table';
    await InitUserRegedit();
    await InitToolbar();
    if (displayMode.value === 'table') await InitMapAttrs();
    await query();
  };

  const openBillDesign = () => {
    const url = GloComm.UrlEn('TS.CCBill.FrmBill', props.params.FrmID);
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url + '&FrmID=' + props.params.FrmID, '单据设计'));
  };

  const ready = ref(false);
  const showTreeSelector = ref(false);
  const sfKey = ref('');
  const treeVisible = computed(() => {
    return showTreeSelector.value && displayMode.value == 'table';
  });
  const sidebarVisible = ref(false);
  const sidebarStyle = computed(() => {
    return {
      width: sidebarVisible.value ? '180px' : 0,
      padding: sidebarVisible.value ? '1rem' : 0,
    };
  });
  const contentStyle = computed(() => {
    return {
      width: sidebarVisible.value ? 'calc(100% - 200px)' : '100%',
    };
  });
  const arrowStyle = computed(() => {
    return {
      transition: 'all ease 0.3s',
      transform: `rotate(${sidebarVisible.value ? 0 : 180}deg)`,
    };
  });
  const InitSearch = async () => {
    try {
      loading.value = true;
      await initDynamicEntity();

      const frmID = getParams('FrmID');
      const frmDictObject = new FrmDict(frmID);
      await frmDictObject.RetrieveFromDBSources();
      console.log({ frmDictObject });
      uac.value = frmDictObject.HisUAC;
      // const listShowWay = frmDictObject.GetParaInt('ListShowWay');
      showTreeSelector.value = frmDictObject.ListShowWay == 1;
      sfKey.value = frmDictObject.ListShowKey;
      // if (!!listShowWay) {
      //   // todo 切换展示模式
      //   return;
      // }
      displayMode.value = props.params.displayMode || 'table';
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + frmID);
      if (!!entityWG.value) {
        const mapData = new MapData();
        mapData.No = frmID;
        await mapData.Retrieve();
        entityWG.value.mapData = mapData;
        entityWG.value.params = props.params;
        if (typeof entityWG.value.Init === 'function') entityWG.value.Init();
      }
      await InitUserRegedit();
      await InitToolbar();
      await InitMapAttrs();
      await query();

      setTimeout(() => {
        treeVisible.value && (sidebarVisible.value = true);
      }, 500);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      ready.value = true;
      loading.value = false;
    }
  };
  const InitSearchExt = async () => {
    const frmID = getParams('FrmID');
    const frmBill = new FrmBill(frmID);
    await frmBill.Retrieve();
    if (frmBill.RowOpenModel == 2) return;
    InitSearch();
  };
  InitSearch();
</script>

<style lang="less" scoped>
  .search-bill {
    display: flex;
    align-items: stretch;
    height: calc(var(--viewport-height) - 120px);

    .search-bill-tree {
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

    .search-bill-main {
      height: 100%;
      background-color: white;
      width: calc(100% - 200px);
      :deep(.n-config-provider) {
        height: unset;
      }
    }
  }
</style>
