<template>
  <BaseComponent ref="baseComponent" :close-drawer-func="InitSearch" :close-modal-func="InitSearch" style="background-color: #f2f5f7">
    <VantCheckGroup v-model="tableConfigs.checkedItems" style="padding-top: 46px; padding-bottom: 40px">
      <VanLoading v-if="loading" vertical size="24px" />
      <VantEmpty
        v-else-if="tableConfigs.dataSource.length === 0"
        :description="'暂无数据'"
        style="height: calc(-150px + var(--viewport-height)); padding: 10px 10px; background-color: white"
      >
      </VantEmpty>
      <VantCellGroup inset>
        <VantList
          style="height: calc(var(--viewport-height) - 160px); overflow-y: auto; background-color: #f2f5f7"
          v-model:loading="loading"
          v-model:error="error"
          :error-text="'请求失败，点击重新加载'"
          :finished="finished"
          :offset="100"
          @load="loadMore"
        >
          <div v-for="(item, index) in tableConfigs.dataSource" class="card-item" center :key="item.OID" clickable>
            <div class="title">
              <VantCheckbox :name="item.OID" :ref="(el) => (checkboxRefs[index] = el)" @click.stop="toggle(index)" />
              <span style="flex: 4">{{ getTitle(item) }}</span>
              <div style="color: #1890fa; flex: 1; text-align: right" @click.stop="tableConfigs?.onRowClick?.(item)">{{ '详情' }}</div>
            </div>
            <div class="body">
              <div class="row" v-for="col in simpleColumns" :key="col.key">
                <span class="row-label">{{ col.title }}</span
                >{{ getText(item, col.key) }}</div
              >
            </div>
          </div>
        </VantList>
      </VantCellGroup>
    </VantCheckGroup>
    <VanPopup v-model:show="filterVisible" position="bottom" round :style="{ height: '50%', padding: '0 12px' }">
      <div class="van-h5">{{ '查询条件' }}</div>
      <search-toolbar-mobile
        :display-button-as-dropdown="true"
        :button-list="toolbarProps.buttonList"
        :select-list="toolbarProps.selectList"
        :keyword-list="toolbarProps.keywordList"
        :date-list="toolbarProps.dateList"
        :params="props.params"
        :display-mode="displayMode"
        :is-show-setting="false"
        @close-filter="filterVisible = false"
        @clean-filter="cleanFilters"
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
      />
    </VanPopup>
    <VanPopup v-model:show="extFuncVisible" round position="bottom" :style="{ height: '300px', padding: '0 12px' }">
      <div class="van-h5">{{ '扩展功能' }}</div>
      <MobileToolbarExt :button-list="toolbarProps.buttonList" @open-dict-settings="popup.visible = true" />
    </VanPopup>

    <!--右侧滑出-->
    <Popup v-model:show="popup.visible" position="bottom" :style="{ height: '60%' }"> <SearchImp :params="params" /></Popup>

    <Modal v-model:open="modalInfo.visible" :width="1200" :title="'附件信息'" :footer="null">
      <Ath v-if="modalInfo.visible" :params="modalInfo.params" :-p-k-value="modalInfo.params.RefOID" :ath-info="modalInfo.athInfo" is-readonly />
    </Modal>
    <div class="tab-buttons">
      <div class="quick-search" v-if="toolbarProps.keywordList?.length > 0">
        <VantSearch v-model="toolbarProps.keywordList[0].value" :placeholder="'请输入关键字'" @search="query()" />
      </div>
      <div class="btn-list">
        <VantIcon v-if="enableDelete()" style="color: #ff5555" name="delete-o" size="22" @click="deleteItems" />
        <VantIcon name="filter-o" size="22" style="margin-right: 12px" @click="filterVisible = true" color="#459dff" />
        <VantIcon v-if="enableCreate()" name="plus" size="22" @click="createItem" color="#459dff" />
        <VantIcon name="arrow-up" size="22" style="margin-left: 12px" @click="extFuncVisible = true" color="#459dff" />
      </div>
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import {
    Loading as VanLoading,
    Button as VantButton,
    Popup as VanPopup,
    Empty as VantEmpty,
    Icon as VantIcon,
    CellGroup as VantCellGroup,
    CheckboxGroup as VantCheckGroup,
    Checkbox as VantCheckbox,
    List as VantList,
    Search as VantSearch,
  } from 'vant';
  import { onBeforeUpdate, reactive, ref, shallowRef } from 'vue';
  import { Popup } from 'vant';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { SearchToolbarMobile, SearchImp } from '/@/components/SearchComponent/index';
  import { Modal } from 'ant-design-vue';
  import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
  import { useSearchDict } from '../CCFast/CCBill/hooks/useSearchDictMobile';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import Ath from '/@/WF/CCForm/Ath.vue';
  import MobileToolbarExt from '../components/SearchComponent/src/MobileToolbarExt.vue';

  // 基础能力容器，处理弹窗，抽屉等
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const getTitle = (row) => {
    return row['Name'] || row['Title'];
  };

  const checkboxRefs = ref<any>([]);
  const toggle = (index) => {
    console.log({ index });
    checkboxRefs.value[index].toggle();
  };
  // 扩展功能区
  const extFuncVisible = ref(false);
  const filterVisible = ref(false);

  onBeforeUpdate(() => {
    checkboxRefs.value = [];
  });

  const cleanFilters = () => {
    resetUserRegedit();
    query();
  };

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

  const enableDelete = () => {
    return toolbarProps.buttonList.find((btn) => btn.name === '删除') && tableConfigs.checkedItems.length > 0;
  };
  const deleteItems = () => {
    const btn = toolbarProps.buttonList.find((btn) => btn.name === '删除');
    if (btn) {
      btn?.onClick?.();
    }
  };
  const enableCreate = () => {
    return toolbarProps.buttonList.find((btn) => btn.name === '新建');
  };
  const createItem = () => {
    const btn = toolbarProps.buttonList.find((btn) => btn.name === '新建');
    if (btn) {
      btn?.onClick?.();
    }
  };
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  //弹窗显示
  const popup = reactive({
    visible: false,
    title: '',
    width: 800,
  });

  const displayMode = ref<string>('table');
  const uac = ref(new UAC());

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
  const showTreeSelector = ref(false);
  const sfKey = ref('');

  const getText = (row, key) => {
    return row[key + 'T'] || row[key + 'Text'] || row[key];
  };
  const simpleColumns = ref<{ key: any; title: string }[]>([]);
  const loading = ref(false);
  const error = ref(false);
  const finished = ref(false);
  const InitSearch = async () => {
    try {
      loading.value = true;
      const frmDictObject = new FrmDict(getParams('FrmID'));
      await frmDictObject.RetrieveFromDBSources();
      console.log({ frmDictObject });
      uac.value = frmDictObject.HisUAC;
      showTreeSelector.value = frmDictObject.ListShowWay == 1;

      sfKey.value = frmDictObject.ListShowKey;

      // const listShowWay = frmDictObject.GetParaInt('ListShowWay');
      // if (!!listShowWay) {
      //   // todo 切换展示模式
      //   console.log()
      //   return;
      // }
      displayMode.value = props.params.displayMode || 'table';
      await InitUserRegedit();
      await InitToolbar();
      if (displayMode.value === 'table') await InitMapAttrs();
      simpleColumns.value = [...tableConfigs.columns.slice(0, 8).map((col) => ({ key: col.key, title: col.title })), { key: 'Op', title: '操作' }];
      await query();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };
  const { getParams, query, loadMore, resetUserRegedit, InitUserRegedit, InitMapAttrs, InitToolbar, updateUserRegedit, toolbarProps, tableConfigs } = useSearchDict(
    'BP.CCBill.WF_CCBill',
    props,
    'Search_Init',
    popup,
    displayMode,
    modalInfo,
    loading,
    error,
    finished,
  );
  InitSearch();
</script>

<style lang="less" scoped>
  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  .vant-cell {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    padding: 0;
    .text {
      text-align: left;
      font-size: 15px;
    }
    .op {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .tab-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 100px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    z-index: 20;
    background-color: white;

    .btn-list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 32px;
    }
  }

  .card-item {
    background-color: white;
    padding: 6px;
    border-radius: 12px;
    margin-bottom: 16px;
    &:nth-child(1) {
      margin-top: 16px;
    }

    .title {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f2f5f7;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: bold;
      span {
        margin-left: 10px;
      }
    }
    .body {
      width: 100%;
      font-size: 13px;
      padding: 10px 12px;

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .row-label {
          color: #666;
        }
      }
      .row + .row {
        margin-top: 8px;
      }
    }
    .footer {
      border-top: 1px solid #f2f5f7;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #1989fa;
      padding: 12px;
      .func-list {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-left: 12px;
        direction: rtl;
      }
    }
  }

  .van-h5 {
    position: relative;
    padding: 15px 24px;
    margin-bottom: 0;
    color: #000;
    font-size: 15px;
    font-weight: 700;
    &::before {
      content: '';
      position: absolute;
      top: 30%;
      left: 0px;
      width: 5px;
      height: 18px;
      border-radius: 10px;
      background-color: #1989fa;
    }
  }
  .vant-cell {
    display: grid;
    grid-template-columns: 1fr 2fr 2fr 1fr;
    padding: 0;
    .text {
      text-align: left;
      font-size: 14px;
    }
    .op {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
</style>
