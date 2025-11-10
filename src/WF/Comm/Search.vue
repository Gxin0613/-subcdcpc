<template>
  <BaseComponent ref="baseComponent" :close-drawer-func="handleRefresh" :close-modal-func="handleRefresh" :update-func="handleRefresh">
    <ThemeWrapper>
      <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <Spin :spinning="loading" :tip="loadingTips">
          <div v-if="errorObj.hasError" class="ant-tag-red">
            {{ errorObj.tips }}
          </div>
          <template v-else>
            <div class="search-main">
              <Card class="card-of-head">
                <div class="search-container flex">
                  <template v-if="expandCondition">
                    <div class="search-key flex" style="width: 180px" v-if="searchInfo.searchFields.length === 0">
                      <Input class="input-search" v-model:value="searchInfo.SearchKey" :placeholder="enCfg.KeyPlaceholder || '请输入关键字'" />
                    </div>
                    <div class="search-key flex" v-for="sf in searchInfo.searchFields" style="width: 120px" :key="sf.label">
                      <template v-if="Array.isArray(sf.mapExt) && sf.mapExt.length > 0">
                        <InputGroup compact :disabled="true" style="width: 100%">
                          <Input style="display: none" v-model:value="sf.value" />
                          <div class="pop_intput_div" :id="'div_search_' + sf.searchKey" style="background-color: #fff">
                            <template v-if="!sf.value && !sf.valueT">
                              <span style="line-height: 30px; color: rgba(0, 0, 0, 0.25); padding-left: 6px">{{ sf.placeholder }}</span>
                            </template>
                            <template v-else-if="!sf.valueT">
                              <Tag v-if="sf.value">{{ sf.value }}</Tag>
                            </template>
                            <template v-else>
                              <Tag v-for="(ele, p_idx) in getTagByKey(sf.valueT)" :key="ele" :closable="true" @close="removeSearchTag(sf, p_idx)">
                                {{ getTagByKey(sf.valueT)[p_idx] }}
                              </Tag>
                            </template>
                          </div>
                          <AntButton @click="PopModalShowSearch(sf)" style="height: 32px">
                            <SettingOutlined />
                          </AntButton>
                        </InputGroup>
                      </template>
                      <template v-else>
                        <Input class="input-search" v-model:value="sf.value" :placeholder="sf.placeholder" />
                      </template>
                    </div>
                    <template v-if="_sn_init">
                      <div class="search-key flex" v-for="sn in searchInfo.searchNumAttrs" :key="sn.label">
                        <NumRangePicker :search-num-attr="sn" @update-range="updateSNRange" />
                      </div>
                    </template>
                    <div class="search-key flex select-key" style="width: 160px" v-if="searchInfo.DTSearchWay !== DTSearchWay.None">
                      <Select
                        v-model:value="searchInfo.DTSearchKey"
                        :mode="enCfg.IsSelectMore ? 'multiple' : undefined"
                        style="width: 100%"
                        :virtual="false"
                        :allow-clear="true"
                        :placeholder="'请选择'"
                        @change="updateDTSearchMode(searchInfo.DTSearchKey)"
                      >
                        <SelectOption v-for="item in searchInfo.DTSearchKeys" :key="item.value"> {{ item.label }} </SelectOption>
                      </Select>
                    </div>
                    <div class="search-key flex select-key" :style="searchDateFlexWidth" v-if="[DTSearchWay.ByDate, DTSearchWay.ByDateRange].includes(searchInfo.DTSearchWay)">
                      <NDatePicker
                        v-if="DTSearchConfig.enable"
                        :style="{ minWidth: searchInfo.DTSearchWay === DTSearchWay.ByDateRange ? '235PX' : '150px' }"
                        :type="DTSearchConfig.type"
                        v-model:value="DTRangeSearchKeys"
                        clearable
                        :placeholder="searchInfo.DTSearchLabel"
                      />
                    </div>
                    <div v-for="condition in [...fkConditions, ...normalConditions]" class="search-key flex" :style="searchFlexWidth(condition)" :key="condition.title">
                      <!-- <div class="label" v-if="condition.isBoolean">{{ condition.title }}:</div> -->
                      <Select
                        v-if="enCfg.IsSelectMore == 0"
                        v-model:value="condition.selected"
                        :mode="enCfg.IsSelectMore ? 'multiple' : undefined"
                        @change="(key, row) => triggerDDLEvents(key, row, condition.key)"
                        style="width: 100%"
                        :virtual="false"
                        :allow-clear="true"
                        :placeholder="condition.title"
                        :disabled="props.params.controlKey === condition.key"
                      >
                        <SelectOption v-for="item in condition.options" :key="item.value"> {{ item.label }} </SelectOption>
                      </Select>
                      <TreeSelect
                        v-else
                        v-model:value="condition.selected"
                        @change="(key, row) => triggerDDLEvents(key, row, condition.key)"
                        :treeCheckable="!condition.isBoolean"
                        style="width: 100%"
                        :virtual="false"
                        :allow-clear="true"
                        :placeholder="condition.title"
                        :show-search="true"
                        tree-node-filter-prop="label"
                        :tree-data="condition.options"
                        :disabled="props.params.controlKey === condition.key"
                      />
                    </div>

                    <div class="search-key flex">
                      <AntButton type="primary" @click="query()" style="margin-left: 6px">{{ '查询' }} </AntButton>
                    </div>
                  </template>
                  <div style="flex: 1 0 200px; display: flex; align-items: center; justify-content: flex-end">
                    <AntButton v-if="uac.IsInsert" type="primary" @click="add" style="margin-left: 6px" class="btn_add"> {{ '新建' }} </AntButton>
                    <AntButton type="primary" v-if="uac.IsDelete" @click="deleteSelectedKeys" style="margin-left: 6px; background-color: #ff4d4f; border-color: #f27140">
                      {{ '删除' }}</AntButton
                    >
                    <!-- <Dropdown v-if="enCfg.IsGroup || enCfg.IsExp != 0 || enCfg.IsImp">
                      <AntButton type="primary" style="margin-left: 6px">{{ '更多' }}</AntButton>
                      <template #overlay>
                        <Menu>
                          <MenuItem v-if="enCfg.IsGroup" key="gotoGroup" @click="gotoGroup" style="text-align: center; width: 80px">
                            {{ '分析' }}
                          </MenuItem>
                          <MenuItem v-if="enCfg.IsExp != 0" key="exportTable" @click="exportTable" style="text-align: center; width: 80px">
                            {{ '导出' }}
                          </MenuItem>
                          <MenuItem v-if="enCfg.IsImp" key="impTable" @click="impTable" style="text-align: center; width: 80px">
                            {{ '导入' }}
                          </MenuItem>
                        </Menu>
                      </template>
                    </Dropdown> -->
                    <AntButton v-if="enCfg.IsExp != 0" type="primary" @click="exportTable" style="margin-left: 6px"> {{ '导出' }} </AntButton>
                    <AntButton v-if="enCfg.IsImp" type="primary" @click="impTable" style="margin-left: 6px">{{ '导入' }} </AntButton>
                    <AntButton v-if="enCfg.EnablePrint" type="primary" @click="printTable" style="margin-left: 6px">{{ '打印' }} </AntButton>
                    <AntButton v-if="enCfg.IsGroup" type="primary" @click="gotoGroup" style="margin-left: 6px">{{ '分析' }}</AntButton>
                    <AntButton v-if="webUser.IsAdmin" type="primary" @click="openSetting" style="margin-left: 6px; background-color: #f27140; border-color: #f27140">
                      {{ '设置' }}
                    </AntButton>
                    <AntButton type="primary" v-for="func in batchFunctions" :key="func.ClassMethod" @click="execBatchFunction(func as RefMethod)" style="margin-left: 6px">{{
                      func.Title
                    }}</AntButton>

                    <AntButton
                      type="primary"
                      v-for="func in enCfgButtons.filter((btn) => !!btn.name && btn.name != 'null' && btn.name != 'undefined')"
                      :key="func.key"
                      @click="execEnCfgButton(func.name)"
                      style="margin-left: 6px"
                      >{{ func.name }}
                    </AntButton>
                    <a style="font-size: 14px; margin-left: 12px" @click="expandCondition = !expandCondition">
                      <UpOutlined v-if="expandCondition" />
                      <DownOutlined v-else />
                      <!-- {{ expandCondition ? '隐藏条件' : '显示条件' }} -->
                    </a>
                    <Tooltip :title="'密度'" placement="bottom" :mouseEnterDelay="0.5">
                      <Dropdown :trigger="['click']">
                        <a class="ant-dropdown-link column-setting" @click.prevent>
                          <ColumnHeightOutlined style="margin-left: 10px; margin-right: 10px" />
                        </a>
                        <template #overlay>
                          <Menu @click="(ev) => onClick(ev as unknown as MenuInfo)">
                            <MenuItem key="large">{{ '默认' }}</MenuItem>
                            <MenuItem key="small">{{ '紧凑' }}</MenuItem>
                          </Menu>
                        </template>
                      </Dropdown>
                    </Tooltip>
                  </div>
                </div>
              </Card>
              <Card ref="tableCardWrapper" class="card-of-table">
                <NDataTable
                  id="search-table"
                  :loading="loadingData"
                  remote
                  :columns="columns"
                  :data="dataSource"
                  :row-key="rowKey"
                  :expanded-row-keys="expandedRowKeys"
                  :checked-row-keys="checkedRowKeysRef"
                  :pagination="paginationReactive"
                  @update:checked-row-keys="handleCheck"
                  @update:expanded-row-keys="onUpdateExpanded"
                  @update:page="query"
                  @update:sorter="handleSorterChange"
                  :row-props="rowProps"
                  :summary="createSummary"
                  :scroll-x="0"
                  flex-height
                  :style="{
                    height: `${dynamicHeight}px`,
                  }"
                  striped
                  :size="columnSize ? columnSize : 'large'"
                />
              </Card>
            </div>
          </template>
        </Spin>
        <!-- 搜索字段 Pop 选择弹窗 -->
        <AModal v-model:open="popModal.visible" centered :title="popModal.title" :bodyStyle="{ padding: '12px' }" centerd :width="popModal.width">
          <template #footer>
            <div class="pop-footer">
              <div class="select-count"></div>
              <div class="button-group">
                <AntButton key="back" @click="handleCancelPop">{{ '取消' }}</AntButton>
                <AntButton key="submit" type="primary" class="btnStyle" @click="PopModalOK">{{ '确定' }}</AntButton>
              </div>
            </div>
          </template>
          <Pop
            v-if="popModal.visible"
            :popHeight="popModal.height"
            :selectVal="searchInfo.searchFields.find((f) => f.searchKey === popModal.keyOfEn)?.value + '' || ''"
            :selectNameVal="((searchInfo.searchFields.find((f:any)=>f.searchKey===popModal.keyOfEn)?.valueT) ?? '') + ''"
            :mapExt="(popModal.mapExt as any)"
            :rowData="{}"
            :key="componetKey"
            :entity-ref="(enInst?.value as any)"
            ref="refPop"
          />
        </AModal>
      </NConfigProvider>
    </ThemeWrapper>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { computed, markRaw, onMounted, onUnmounted, reactive, ref, Ref, nextTick, shallowRef, ShallowRef, unref, VNodeChild, watch } from 'vue';
  import {
    Button as AntButton,
    Card,
    Dropdown,
    Input,
    Menu,
    MenuItem,
    message,
    Select,
    SelectOption,
    Spin,
    Tooltip,
    TreeSelect,
    Modal as AModal,
    Tag,
    InputGroup,
  } from 'ant-design-vue';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import { DataTableColumns, DataTableRowKey, dateZhCN, NConfigProvider, NDataTable, NDatePicker, PaginationProps, zhCN } from 'naive-ui';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { useRoute } from 'vue-router';
  import { DTSearchWay, SearchNormals } from '/@/bp/en/Map/SearchNormal';
  import { SearchFKEnums } from '/@/bp/en/Map/SearchFKEnum';
  import { Entity } from '/@/bp/en/Entity';
  import { Attr, DatePickerRangeType, DatePickerType } from '/@/bp/en/Map/Attr';
  import { Entities } from '/@/bp/en/Entities';
  import { parseValByType, useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import dayjs, { Dayjs } from 'dayjs';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { ClassFactoryOfGroupPageNew } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { cloneDeep } from 'lodash-es';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import 'dayjs/locale/zh-cn';
  // import { exportExcel } from '/@/utils/excel/exportExcel';
  import { DataType } from '/@/bp/en/DataType';
  import { ColumnHeightOutlined, DownOutlined, UpOutlined, SettingOutlined } from '@ant-design/icons-vue';
  import ThemeWrapper from './ThemeWrapper.vue';
  import { SFTableDtl, SFTableDtls } from '../Admin/FrmLogic/SFTable/SFTableDtl';
  import { GloComm } from './GloComm';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { ExtModel } from '/@/bp/en/Map/EnMapExt';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { SearchFields } from '/@/bp/en/Map/SearchFields';
  import { SearchExt } from '/@/DataUser/OverrideFiles/SearchExt';
  import { useSorter } from '/@/hooks/search/useSorter';
  import { useSummary } from '/@/hooks/search/useSummary';
  import { useFunction } from '/@/hooks/search/useFunction';
  import { useColumns } from '/@/hooks/search/useColumns';
  import { Attrs } from '/@/bp/en/Map/Attrs';
  import { FieldNumColors } from '/@/WF/Admin/FrmLogic/MapExt/FieldNumColor/FieldNumColor';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { SearchNumAttr, SearchNumAttrs } from '/@/bp/en/Map/SearchNumAttr';
  import NumRangePicker from '/@/WF/Comm/subComponents/NumRangePicker.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { EnSearchCols } from '/@/bp/sys/EnSearchCol';
  import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
  import { resetUserRegedit } from '/@/components/Entities/src/searchUtils';
  import printJS from 'print-js';
  import html2canvas from 'html2canvas';
  // import { useI18n } from '/@/hooks/web/useI18n';
  import { isComPage } from '/@/utils/gl';
  import { windowOpen } from '/@/utils/windowOpen';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { SysEnums } from '../Admin/FrmLogic/SysEnum/SysEnum';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { Row } from '/@/bp/en/Map/Row';
  import Event from '/@/utils/Events';
  // import { GloWF } from '../Admin/GloWF';

  // const { t } = useI18n();
  // import { useCommSearch } from '/@/hooks/ens/useCommSearch';
  // fix ant-design-vue3 radio bugs
  // const { Group: RadioGroup, Button: RadioButton } = Radio;
  // 基础能力容器，处理弹窗，抽屉等
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isSearch: {
      type: Boolean,
      default: true,
    },
  });

  interface SearchDef {
    DTSearchKey: any;
    DTSearchLabel: string;
    DTSearchWay: DTSearchWay;
    searchNormals: SearchNormals;
    searchFKEnums: SearchFKEnums;
    searchFields: SearchFields;
    searchNumAttrs: SearchNumAttrs;
    hiddenCondition: SearchNormals;
    SearchKey: string;
    DTFrom?: Dayjs;
    DTTo?: Dayjs;
    DTVals: any;
    DTSearchKeys: { label: string; value: any; type: DatePickerType; format: string }[];
  }

  interface SearchResult {
    Attrs: Attr[];
    DT: Recordable[];
    Sys_MapData: Entity;
    dtM: Recordable[];
  }

  const route = useRoute();

  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string) || route.meta?.EnName;
  const loading = ref(false);
  const loadingTips = ref('');
  const loadingData = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  // cfg
  const enCfg = reactive<EnCfg>(new EnCfg());
  const enCfgButtons = ref<Recordable[]>([]);

  const queryButtnWithCondition = import.meta.env.VITE_SEARCH_BUTTON_LAYOUT === 'inline';

  const execEnCfgButton = async (btnName: string) => {
    if (!enInst.value) return;
    const arr = dataSource.value.filter((item) => enInst.value && checkedRowKeysRef.value.includes(item[enInst.value.PK as string]));
    if (entityWG.value != null) {
      //执行自定义的方法
      const res = entityWG.value?.BtnClick('SearchToolbar', btnName, checkedRowKeysRef.value.join(','), {});
      if (res?.hasOwnProperty?.('ReturnType')) {
        baseComponent.value?.handleGPNCallback(res);
      }
    } else {
      const res = await SearchExt.BtnClick(enInst.value.classID as string, btnName, arr, {});
      if (!res) return;
      if (res['ReturnType']) {
        baseComponent.value?.handleGPNCallback(res);
      }
    }
  };
  const initEnCfg = async () => {
    await enCfg.Init();
    enCfg.SetValByKey('No', EnName);
    if (!(await enCfg.RetrieveFromDBSources())) {
      try {
        await enCfg.Insert();
        await enCfg.Retrieve();
      } catch (e: any) {
        if (window.confirm('查询页面初始化失败，是否重试？')) {
          await InitSearch();
        }
      }
    }

    enCfgButtons.value = [
      {
        key: 'BtnLab1',
        name: enCfg.GetValByKey('BtnLab1'),
      },
      {
        key: 'BtnLab2',
        name: enCfg.GetValByKey('BtnLab2'),
      },
      {
        key: 'BtnLab3',
        name: enCfg.GetValByKey('BtnLab3'),
      },
    ];
  };
  const paginationReactive = ref<PaginationProps>({
    page: 1,
    pageSize: enCfg.PageSize || 20,
    showSizePicker: true,
    pageSizes: [10, 15, 20, 150],
    pageCount: 1,
    itemCount: 1,
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.value.pageSize = pageSize;
      paginationReactive.value.page = 1;
      query();
    },
    prefix({ itemCount }) {
      return `总数: ${itemCount}条`;
    },
  });

  const searchInfo = reactive<SearchDef>({
    DTSearchKey: undefined,
    DTSearchLabel: '',
    DTSearchWay: DTSearchWay.None,
    searchNormals: new SearchNormals(),
    searchFKEnums: new SearchFKEnums(),
    searchFields: new SearchFields(),
    searchNumAttrs: new SearchNumAttrs(),
    hiddenCondition: new SearchNormals(),
    SearchKey: '',
    DTSearchKeys: [],
    DTVals: '',
  });

  // 更新数字范围查询条件
  const updateSNRange = (sn: SearchNumAttr, sVal: number, eVal: number) => {
    sn.startVal = sVal + '';
    sn.endVal = eVal + '';
  };

  // const dateRangeChange = (timeStamp: [number, number]) => {
  //   console.log({ timeStamp });
  //   if (timeStamp != null) DTRangeSearchKeys.value = timeStamp;
  // };
  // const dateChange = (timeStamp: number) => {
  //   searchInfo.DTVals = timeStamp;
  // };
  const ensInst = ref<Nullable<Entities>>(null);
  const enInst = ref<Nullable<Entity>>(null);
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>();

  const rowKey = (rowData: RowData) => {
    const keys = Object.keys(rowData);
    const rKey = enInst.value?.PK;
    if (!rKey) return '';
    if (keys.includes(rKey)) return rowData[rKey];
  };
  const _open_key_ = ref('');
  let _reload_comp_ = false;
  const partialRefresh = async () => {
    if (!_open_key_.value) {
      await query();
      return;
    }
    const en = ensInst.value?.GetNewEntity;
    if (!en) return;
    en.setPKVal(_open_key_.value);
    // 不存在刷新列表
    if (!en.IsExits()) {
      await query();
      return;
    }
    const _idx = dataSource.value.findIndex((d) => d[enInst.value!.PK] == _open_key_.value);
    if (_idx == -1) return;
    await en.Retrieve();
    const row = Object.fromEntries(en.Row);
    dataSource.value.splice(_idx, 1, row);
    _open_key_.value = '';
  };
  const handleRefresh = async () => {
    if (_reload_comp_) {
      await InitSearch();
      _reload_comp_ = false;
      return;
    }
    await partialRefresh();
  };

  // 控制展开的行 keys
  const expandedRowKeys = ref<DataTableRowKey[]>([]);
  const onUpdateExpanded = async (keys: DataTableRowKey[]) => {
    // 仅在收起时刷新（ListDtlShowWay == 4 使用 EnOnly 编辑，收起后刷新行数据）
    const prev = expandedRowKeys.value || [];
    const removed = prev.filter((k) => !keys.includes(k));
    expandedRowKeys.value = keys;
    if (removed.length > 0 && parseInt(enCfg.ListDtlShowWay as any) === 4) {
      _open_key_.value = String(removed[0]);
      await partialRefresh();
    }
  };
  // 行属性
  const rowProps = (row: RowData): any => {
    const defaultProps = {
      style: {
        cursor: 'pointer',
      },
      ondblclick: (e: MouseEvent) => {
        // 若双击发生在展开图标单元格内，则阻止触发行的双击事件
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.expand-trigger-cell')) {
          e.stopPropagation();
          return;
        }
        if (!enCfg.isDisDBClick) {
          handleRowDbClick(row);
        }
      },
    } as any;
    const rowProps = entityWG.value?.GetRowProps?.(row);
    return Object.assign(defaultProps, rowProps || {});
  };
  const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys;
  };

  const gotoGroup = () => {
    const editUrl = `/src/WF/Comm/Group.vue?EnName=${enInst.value?.classID}`;
    baseComponent.value?.openDrawerByUrl('分析', editUrl, '80%');
  };
  const openSetting = () => {
    const editUrl = '/src/WF/Comm/En.vue?EnName=TS.User.EnCfg&PKVal=' + enInst.value?.classID;
    baseComponent.value?.openDrawerByUrl('实体编辑', editUrl, '80%');
    _reload_comp_ = true;
  };
  //控制表格列高
  interface MenuInfo {
    key: 'small' | 'large' | 'medium' | undefined;
    keyPath: string[];
    item: VNodeChild;
    domEvent: MouseEvent;
  }

  // 展开条件
  const expandCondition = ref(true);
  watch(
    () => unref(expandCondition),
    () => {
      calcTableHeight();
    },
  );

  const columnSize = ref<'small' | 'large' | 'medium' | undefined>('medium');
  const onClick = ({ key }: MenuInfo) => {
    columnSize.value = key;
  };
  // 表单列
  const columns = ref<DataTableColumns<RowData>>([]);
  const dataSource = ref<Recordable[]>([]);

  // 导入表格
  const impTable = async () => {
    const url = GloComm.UrlGPN('GPN_ImpTSEntity', '&TSEnName=' + EnName + '&ImpFuncUrl=' + enCfg.ImpFuncUrl);
    baseComponent.value?.openDrawerByUrl('导入表格', url, '50%');
    // alert(url);
  };

  const printTable = async () => {
    columns.value = columns.value.filter((col: any) => !(col.key === 'custom_functions' || col.type === 'selection'));
    const printEL = document.getElementById('search-table') as HTMLElement;
    if (!printEL) {
      message.error('未找到打印内容');
      return;
    }
    const bodyHeight = printEL.querySelector('.n-data-table-tbody')?.getBoundingClientRect().height || window.innerHeight;
    dynamicHeight.value = bodyHeight + 200;
    const prevPageSet = cloneDeep(paginationReactive.value);
    // @ts-ignore
    paginationReactive.value = undefined;
    await nextTick();
    try {
      loading.value = true;
      const canvas = await html2canvas(printEL, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      printJS({
        printable: imgData,
        type: 'image',
        imageStyle: 'width:100%; height: 100%',
      });
    } catch (e) {
      message.error('打印失败');
    } finally {
      loading.value = false;
      paginationReactive.value = prevPageSet;
      await InitSearch();
      calcTableHeight();
    }
  };

  // 导出表格
  const exportTable = async () => {
    const attrs = enInst.value?._enMap.attrs;
    if (!attrs) {
      message.error('导出表单失败，原因：未找到attrs');
      return;
    }
    await updateSearchCondition();
    userRegedit.SearchKey = searchInfo.SearchKey;
    await userRegedit.Update();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    if (enCfg.IsExp == 1) {
      //导出方式
      const myurl = GloComm.UrlGPN('GPN_EntityExportExcel', '&TSEnName=' + EnName);
      return baseComponent.value?.openDrawerByUrl('数据导出', myurl, '70%');
      // handler.AddPara('EnsName', EnName);
      // //查询集合
      // const data = await handler.DoMethodReturnJson<Recordable[]>('Search_Exp');
      // exportExcel(unref(data), attrs as Attrs, 'Key', enInst.value?._enMap.EnDesc);
      // return;
    }

    //导出模式如果是rtf、excel模式
    handler.AddPara('EnsName', EnName);
    try {
      //查询集合
      const data = await handler.DoMethodReturnString('Search_ExpByRTFOrExcel');
      if (data.includes('err@')) {
        message.error(data);
        return;
      }
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      window.open(VITE_GLOB_API_URL + '/' + data);
    } catch (e) {
      message.error(e as string);
    }
  };

  const add = async () => {
    try {
      loading.value = true;
      _reload_comp_ = true;
      loadingTips.value = '数据较大，加载中...';
      const subComponentParams = cloneDeep(props.params || {});
      delete subComponentParams['No'];
      delete subComponentParams['MyPK'];
      delete subComponentParams['OID'];
      delete subComponentParams['WorkID'];
      delete subComponentParams['NodeID'];
      delete subComponentParams['Name'];
      delete subComponentParams['EnName'];
      delete subComponentParams['PKVal'];
      const { controlKey, controlVal } = props.params;
      if (controlKey && controlVal) {
        subComponentParams[controlKey] = controlVal;
      }
      const enGPN = await ClassFactoryOfGroupPageNew.GetEnByEntityClassID(enInst.value?.classID || '');
      if (enGPN != null) {
        baseComponent.value?.openDrawer({
          title: '新建' + enGPN.PageTitle,
          width: '60%',
          component: markRaw(
            createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
              loading: true,
            }),
          ),
          params: { EnName: enGPN.classID, RefDtlEnName: EnName, ...subComponentParams },
        });
        return;
      }
      let url = `/src/WF/Comm/En.vue?EnName=${EnName}`;
      url +=
        '&' +
        Object.entries(subComponentParams)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
      const openModel = parseInt(enCfg.OpenModel);
      if (openModel === 4) {
        return;
      }
      if (openModel === 1) {
        const urlNew = isComPage(url).replace('En', 'Entity');
        windowOpen(urlNew);
        return;
      }
      if (openModel === 3) {
        enInst?.[enCfg.OpenModelFunc]?.();
        return;
      }
      const EnCfgDefWidth = {
        [5]: '30%',
        [6]: '50%',
        [7]: '70%',
        [8]: '90%',
      };
      const title = '新建' + enInst.value?._enMap.EnDesc || '';

      if ([0, 2].includes(openModel)) {
        baseComponent.value?.openModalByUrl(title, url);
        return;
      }
      if ([5, 6, 7, 8].includes(openModel)) {
        baseComponent.value?.openDrawerByUrl(title, url, EnCfgDefWidth[openModel]);
        return;
      }
      if (openModel == 9) {
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, url));
        return;
      }
      if (openModel == 10) {
        baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, title));
        return;
      }

      /*baseComponent.value?.openDrawer({
      title: '新建' + enInst.value?._enMap.EnDesc || '',
      component: markRaw(
        createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
          loading: true,
        }),
      ),
      width: '70%',
      params: { EnName, ...subComponentParams },
    });*/
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
      loadingTips.value = '';
    }
  };
  // 删除所选行
  const deleteSelectedKeys = async () => {
    try {
      if (checkedRowKeysRef.value.length === 0) {
        message.warn('请选择要删除的行.');
        return;
      }
      if (!window.confirm('确定要删除所选数据吗？')) {
        return;
      }
      const tasks: Promise<number>[] = [];
      for (const pk of checkedRowKeysRef.value) {
        const tempEn = ensInst.value?.GetNewEntity;
        if (!tempEn) {
          continue;
        }
        tempEn.setPKVal(pk);
        await tempEn.RetrieveFromDBSources();
        tasks.push(tempEn.Delete());
        if (tempEn.classID === 'TS.FrmUI.SFTable') {
          //删除从表数据
          const dtls = new SFTableDtls();
          await dtls.Retrieve('FK_SFTable', pk);
          dtls.forEach((item) => {
            const dtl = new SFTableDtl();
            dtl.setPKVal(item.MyPK);
            tasks.push(dtl.Delete());
          });
        }
      }
      await Promise.all(tasks);
      message.success('执行成功');
      await query();
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  interface Condition {
    selected: any | any[];
    title: string;
    key: string;
    isBoolean: boolean;
    width: number;
    dataType: DataType;
    options: any[];
  }

  // 查询条件
  const normalConditions = ref<Condition[]>([]);
  const fkConditions = ref<Condition[]>([]);
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  // UserRegedit为查询对象
  const userRegedit = reactive<UserRegedit>(new UserRegedit());
  const handleTimestamp = (ts: number | undefined | null, format) => {
    if (ts) {
      return dayjs(ts)
        .locale('zh-cn')
        .format(format || 'YYYY-MM-DD');
    }
    return '';
  };
  const DTRangeSearchKeys = ref<number | [number, number]>();
  const DTSearchConfig = reactive<{ enable: boolean; type: DatePickerType | DatePickerRangeType }>({
    enable: true,
    type: 'date',
  });
  const updateDTSearchMode = (dtSearchKey: string) => {
    const baseType = searchInfo.DTSearchKeys.find((dtsInfo) => dtsInfo.value == dtSearchKey)?.type || ('date' as DatePickerType);
    if (baseType === 'week') {
      DTSearchConfig.type = 'week';
      return;
    }
    if (searchInfo.DTSearchWay === DTSearchWay.ByDateRange) {
      DTSearchConfig.type = `${baseType}range` as DatePickerRangeType;
    } else {
      DTSearchConfig.type = baseType;
    }
  };
  // 更新查询条件
  const updateSearchCondition = async () => {
    // 处理关键字
    userRegedit.SearchKey = searchInfo.SearchKey || '';
    // 处理时间
    debugger;
    const format = searchInfo.DTSearchKeys.find((dtsInfo) => dtsInfo.value === searchInfo.DTSearchKey)?.format;
    if (searchInfo.DTSearchWay === DTSearchWay.ByDateRange) {
      userRegedit.DTFrom = handleTimestamp(DTRangeSearchKeys.value?.[0], format);
      userRegedit.DTTo = handleTimestamp(DTRangeSearchKeys.value?.[1], format);
    } else if (searchInfo.DTSearchWay === DTSearchWay.ByDate) {
      userRegedit.DTFrom = handleTimestamp(DTRangeSearchKeys.value as unknown as number, format);
    }
    let queryArgs = '';
    for (const condition of fkConditions.value) {
      if (Array.isArray(condition.selected) && condition.selected.length > 0) {
        queryArgs += `@${condition.key}=${condition.selected.join(',') || ''}`;
      } else {
        if (condition.selected === 0) queryArgs += `@${condition.key}=0`;
        else queryArgs += `@${condition.key}=${condition.selected || ''}`;
      }
    }
    for (const condition of normalConditions.value) {
      if (Array.isArray(condition.selected) && condition.selected.length > 0) {
        queryArgs += `@${condition.key}=${condition.selected.join(',') || ''}`;
      } else {
        if (condition.selected === 0) queryArgs += `@${condition.key}=0`;
        else queryArgs += `@${condition.key}=${condition.selected || ''}`;
      }
    }
    // 隐藏条件
    // for (const hiddenCondition of searchInfo.hiddenCondition) {
    //   const { RefAttrKey, DefaultSymbol, DefaultVal } = hiddenCondition;
    //   //queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
    //   queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
    // }
    // 字段查询
    for (const searchField of searchInfo.searchFields) {
      //queryArgs += `@${searchField.searchKey}=${searchField.value || ''}`;
      userRegedit.SetPara(searchField.searchKey, searchField.value);
    }
    // 数字
    for (const sn of searchInfo.searchNumAttrs) {
      if (sn.startVal || sn.endVal) userRegedit.SetPara(sn.searchKey, sn.startVal + ',' + sn.endVal);
      else userRegedit.DelPara(sn.searchKey);
    }

    // 解析url参数
    const args = {
      ...props.params,
      ...route.query,
    };
    const argKeys = Object.keys(args);
    for (const k of argKeys) {
      if (k.startsWith(outerQueryPrefix) && args[k]) {
        const rKey = k.replace(outerQueryPrefix, '');
        queryArgs += `@${rKey}=${args[k]}`;
      }
    }
    const { controlKey, controlVal } = props.params;
    if (controlKey && controlVal) {
      queryArgs += `@${controlKey}=${controlVal}`;
    }
    // 逻辑删除
    const { key, enable } = enInst.value!.LogicDelConfig;
    if (enable) {
      queryArgs += `@${key}=0`;
    }
    userRegedit.Vals = queryArgs;
    userRegedit.OrderBy = enCfg.OrderBy;
    userRegedit.OrderWay = enCfg.IsDeSc ? 'desc' : 'asc';
  };
  const loopFunction = async (item: Recordable, obj: Recordable) => {
    const { key } = item;
    if (!!obj[key]) {
      if (props.params.controlKey === key) {
        return;
      }
      const selected = obj[key].includes(',') ? obj[key].split(',') : obj[key];
      item.selected = Array.isArray(selected) ? selected.map((s) => parseValByType(item.dataType, s)) : parseValByType(item.dataType, selected);
    }
    //解决初始化级联数据的赋值问题
    const cascadeItems = enInst.value?._enMap.enMapExts.filter((item) => item.ExtModel === ExtModel.DDLRelation && item.Tag1 === key) || [];
    for (const ext of cascadeItems) {
      const fkItem = [...fkConditions.value].find((item) => item.key === ext.Tag2);
      if (!fkItem) continue;
      const rawData = await DBAccess.RunSQLReturnTable(ext.Doc.replace(/@Key/g, item.selected));
      fkItem.options = rawData.map((item: Recordable) => {
        return {
          label: item.Name,
          value: item.No,
          text: item.Name,
        };
      });
    }
  };
  const getValidDateStr = (str: string) => (str.includes('-') ? dayjs(str).valueOf() : 0);
  const _sn_init = ref(false);
  const InitUserRegedit = async () => {
    userRegedit.setPKVal(urMyPK);
    const res = await userRegedit.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit(userRegedit, urMyPK, webUser.No, EnName);
    } else {
      // @ts-ignore
      const { searchNumAttrs } = enInst.value?._enMap;
      // 范围选择器
      // if ([DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)) {
      if (searchInfo.DTSearchWay === DTSearchWay.ByDateRange) {
        const fts = getValidDateStr(userRegedit.DTFrom || '');
        const tts = getValidDateStr(userRegedit.DTTo || '');
        if (fts == 0 || tts == 0) {
          DTRangeSearchKeys.value = undefined;
        } else {
          DTRangeSearchKeys.value = [fts, tts];
        }
      } else {
        searchInfo.DTVals = getValidDateStr(userRegedit.DTTo || '');
      }

      if (typeof searchInfo.DTVals === 'string' && searchInfo.DTVals === '') {
        searchInfo.DTVals = undefined;
      }
      const dtLabel = searchInfo.DTSearchKeys.find((item) => item.value == userRegedit.DTSearchKey)?.label;
      searchInfo.DTSearchLabel = dtLabel || '';
      searchInfo.DTSearchKey = userRegedit.DTSearchKey + '' || undefined;
      if (searchInfo.DTSearchWay === DTSearchWay.ByDateRange) {
        updateDTSearchMode(searchInfo.DTSearchKey);
      } else {
        DTSearchConfig.type = 'date';
      }
      searchInfo.SearchKey = userRegedit.SearchKey;
      const obj: Recordable = {};
      const params = splitAtString(userRegedit.Vals);
      for (const param of params) {
        const [k, v] = param.split('=');
        //如果存在UrL参数中，需要使用URL的数据
        //判断是否含有查询条件的值
        const paraVal = props.params[k] || route.query[k] || '';
        obj[k] = !!paraVal ? paraVal : v;
      }
      for (const sn of searchNumAttrs) {
        const vals = userRegedit.GetParaString(sn.searchKey);
        if (!vals.includes(',')) {
          continue;
        }
        const [sVal, eVal] = vals.split(',');
        sn.startVal = parseFloat(sVal) || 0;
        sn.endVal = parseFloat(eVal) || 0;
      }
      _sn_init.value = true;
      // 处理下拉框回显
      fkConditions.value.forEach((item) => loopFunction(item, obj));
      normalConditions.value.forEach((item) => loopFunction(item, obj));
      searchInfo.hiddenCondition.forEach((item) => loopFunction(item, obj));
      for (const sf of searchInfo.searchFields) {
        if (sf.mapExt.length > 0) {
          sf.value = userRegedit.GetParaString(sf.searchKey);
          sf.valueT = userRegedit.GetParaString(sf.searchKey + 'T');
        }
      }
    }

    // 处理url传入的查询key，时间
    const SearchKey = route.query.SearchKey || '';
    const DTFrom = route.query.DTFrom || '';
    const DTTo = route.query.DTTo || '';
    if (SearchKey) userRegedit.SearchKey = SearchKey as string;
    if (DTFrom) userRegedit.DTFrom = DTFrom as string;
    if (DTTo) userRegedit.DTTo = DTTo as string;
  };
  const resetSearch = async () => {
    await resetUserRegedit(userRegedit, urMyPK, webUser.No, EnName);
    await InitSearch();
  };
  const query = async (page = 1) => {
    try {
      loadingData.value = true;
      await updateSearchCondition();
      userRegedit.SearchKey = searchInfo.SearchKey;
      userRegedit.DTSearchKey = searchInfo.DTSearchKey;
      await userRegedit.Update();
      paginationReactive.value.page = page;
      //查询集合
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      handler.AddPara('PageIdx', paginationReactive.value.page);
      handler.AddPara('PageSize', paginationReactive.value.pageSize);
      const data = await handler.DoMethodReturnJson<SearchResult>('Search_SearchIt');
      dataSource.value = data.DT;
      await userRegedit.Retrieve();
      const totalSize = parseInt(userRegedit.RecCount);
      paginationReactive.value.itemCount = totalSize;
      paginationReactive.value.pageCount = Math.ceil(totalSize / paginationReactive.value.pageSize!);
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loadingData.value = false;
    }
  };
  // 查询条件 end
  const booleanToRadioGroup = (attrName) => {
    return [
      { label: attrName, value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ];
  };
  const outerQueryPrefix = 's_key_';
  // 准备查询条件和列数据
  const prepareConditions = async (_, enInst) => {
    const { getDDLData } = useDDLDataLoader(enInst.value);
    const { DTSearchLabel, DTSearchWay, searchNumAttrs, searchFields, searchFKEnums, attrs } = enInst.value?._enMap;
    const searchNormals = enInst.value?._enMap.searchNormals.filter((condition) => !condition.IsHidden);
    for (const searchField of searchFields) {
      searchField.value = props.params[outerQueryPrefix + searchField.searchKey] || route.query[searchField.searchKey] || '';
    }
    searchInfo.DTSearchKeys = enInst.value?._enMap.attrs
      .filter((attr) => attr.MyDataType == DataType.AppDate || attr.MyDataType == DataType.AppDateTime)
      .map((attr) => ({
        label: attr.Desc,
        value: attr.Key + '',
        type: attr.DateConfig?.type || attr.DateTimeConfig?.type || 'year',
        format: attr.DateConfig?.format || attr.DateTimeConfig?.format || 'YYYY-MM-DD',
      }));
    // 处理外键
    const fkFields = attrs.filter((attr) => attr.MyDataType === FieldType.FK && attr.UIBindKey?.includes(','));
    if (fkFields.length > 0) {
      for await (const fkField of fkFields) {
        const tempArr = fkField.UIBindKey.split(',');
        const fkEnName = tempArr[tempArr.length - 1];
        if (!fkEnName.includes('.')) {
          alert('外键类名错误:' + fkEnName);
        }
        const fkEn = await ClassFactory.GetEn(fkEnName);
        await fkEn.Init();
      }
    }
    // 处理时间日期格式
    fkConditions.value = [];
    for await (const sn of searchFKEnums) {
      const attr = attrs.find((attr) => attr.Key === sn.Key);
      if (!attr) continue;
      fkConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        width: sn.Width,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        options: attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : await getDDLData(attr),
      });
    }
    normalConditions.value = [];
    for await (const sn of searchNormals) {
      const attr = attrs.find((attr) => attr.Key === sn.Key);
      if (!attr) continue;
      normalConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        width: sn.Width,
        options: attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : await getDDLData(attr),
      });
    }

    // 为搜索字段附加 Pop 弹窗扩展配置
    searchInfo.searchFields = searchFields.map((sf) => {
      const ext = enInst.value?._enMap.enMapExts?.filter((item) => item.AttrOfOper === sf.searchKey) || [];
      if (ext.length > 0) {
        return { ...sf, mapExt: ext, valueT: sf.valueT };
      }
      return sf;
    });
    searchInfo.DTSearchLabel = DTSearchLabel;
    searchInfo.DTSearchWay = DTSearchWay;

    searchInfo.searchNormals = searchNormals;
    searchInfo.searchFKEnums = searchFKEnums;
    searchInfo.searchNumAttrs = searchNumAttrs;
    searchInfo.hiddenCondition = enInst.value?._enMap.searchNormals.filter((condition) => condition.IsHidden);
    // 如果启用了焦点字段
    let focusField: string[] = [];
    if (enCfg.IsEnableFocusField) {
      focusField = enCfg.FocusField.split(',');
    }
    // 实现隐藏字段
    const showColModel = enCfg.ShowColModel || 0; // 显示的字段方式
    const ens = new EnSearchCols();
    await ens.Retrieve(MapExtAttr.FK_MapData, EnName, 'ExtModel', 'SearchCol', 'Idx');
    let visibleAttrs = new Attrs();
    if (showColModel != 0) {
      for (const en of ens) {
        const attr = attrs.find((attr) => attr.Key == en.AttrOfOper);
        if (!attr) continue;
        attr.UIWidth = en.W;
        visibleAttrs.push(attr);
      }
    } else {
      visibleAttrs = attrs;
    }
    if (visibleAttrs.length == 0) visibleAttrs = attrs;
    const colorConfig = new FieldNumColors();
    await colorConfig.Retrieve('FK_MapData', EnName);
    const enumConfig = {};
    const enumAttrs = visibleAttrs.filter((attr) => attr.IsEnum);
    for (const attr of enumAttrs) {
      const enumData = new SysEnums();
      await enumData.Retrieve('EnumKey', attr.Key);
      if (enumData) {
        enumConfig[attr.Key] = enumData;
      }
    }
    createColumns(visibleAttrs, focusField, colorConfig, enumConfig);
  };

  // 排序
  const { sortColumn, handleSorterChange, getSortColumns } = useSorter(enInst as Ref<Entity>, dataSource);
  // 统计
  const { getSumColumns, createSummary } = useSummary(enInst as Ref<Entity>);
  // 执行方法
  const rowFunctions = ref<RefMethod[]>([]);
  const batchFunctions = ref<RefMethod[]>([]);
  const permissionMethods = ref('');
  const { createMethods, execMethod, execBatchFunction } = useFunction(
    ensInst as Ref<Entities>,
    enInst as Ref<Entity>,
    dataSource,
    checkedRowKeysRef,
    baseComponent as ShallowRef,
    entityWG as Ref<WaiGuaBaseEntity>,
    query as Function,
  );
  // 创建列
  const { handleRowDbClick, createColumns } = useColumns(
    columns,
    sortColumn,
    enInst as Ref<Entity>,
    enCfg,
    baseComponent as ShallowRef,
    rowFunctions as Ref<RefMethod[]>,
    execMethod,
    entityWG as any,
    props.params,
    _open_key_,
    permissionMethods,
  );
  // end

  const uac = ref<UAC>(new UAC());
  const { getDBSource } = useDBSourceLoader();
  // 初始化Search页面
  const triggerDDLEvents = async (key, row, cfgKey) => {
    console.log({ row });
    const exts = enInst.value?._enMap.enMapExts.filter((item) => item.ExtModel === ExtModel.DDLRelation && item.Tag1 === cfgKey);
    if (!Array.isArray(exts)) return;
    for (const ext of exts) {
      const triggerItem = [...fkConditions.value, ...normalConditions.value].find((item) => item.key === ext.Tag2);
      if (!triggerItem) continue;
      const exp = ext.Doc.replace(/@Key/g, key);
      const dbParam = `@Key=${key}`;
      const rawData = await getDBSource(exp, 'local', dbParam);
      triggerItem.options = rawData.map((item) => {
        return {
          label: item.Name,
          value: item.No,
          text: item.Name,
        };
      });
      triggerItem.selected = undefined;
    }
  };

  const InitSearch = async () => {
    try {
      const enName = EnName as string;
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + enName.substring(enName.lastIndexOf('.') + 1)) as string);
      if (entityWG.value != null) entityWG.value.params = props.params;
      const ens = await ClassFactory.GetEns(enName);
      ensInst.value = ens;
      enInst.value = ens.GetNewEntity;
      // entityWG.value = enInst.value.GetRefExt();
      const loaders = enInst?.value._enMap.loaders;
      if (loaders.length > 0) {
        const functions = loaders.map((loader: Function) => loader.bind(enInst)());
        await Promise.all(functions);
      }
      const { permissionStr, methods } = await createMethods();
      permissionMethods.value = permissionStr;
      batchFunctions.value = methods.filter((pf) => pf.IsCanBatch);
      rowFunctions.value = methods.filter((pf) => pf.IsForEns);
      getSumColumns();
      getSortColumns();
      await enInst.value?.Init();
      uac.value = await enInst.value?.GenerUAC();
      await initEnCfg();
      await prepareConditions(ensInst, enInst);
      await InitUserRegedit();
      await query();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    }
  };

  InitSearch();
  // ========= Pop 弹窗（搜索） =========
  const popModal = reactive({
    visible: false,
    title: '',
    keyOfEn: '',
    width: 800,
    height: { height: '70vh' },
    mapExt: [] as any[],
    enableSelect: false,
  });
  const refPop = shallowRef<any>();
  const componetKey = ref(0);
  const getTagByKey = (val: string) => {
    if (!val) return [] as string[];
    return val.split(',').filter((item) => item !== '');
  };
  // 占位，避免未使用报错（如后续需要在别处读取可恢复）
  // const getSearchFieldVal = (key: string, nameVal = false) => {
  //   const sf: any = (searchInfo.searchFields as any).find((f: any) => f.searchKey === key);
  //   if (!sf) return '';
  //   return nameVal ? sf.valueT || '' : sf.value || '';
  // };

  const searchRowData = ref<Row>();
  const PopModalShowSearch = (sf: any) => {
    searchRowData.value = ensInst.value?.GetNewEntity.Row;
    popModal.visible = true;
    popModal.title = sf.label || '请选择';
    popModal.keyOfEn = sf.searchKey;
    popModal.mapExt = sf.mapExt[0];
    popModal.width = sf?.mapExt?.[0].W || sf?.mapExt?.[0].width || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: sf?.mapExt?.[0].H || window.innerHeight * 0.8 + 'px',
    };
    // 读取是否多选
    try {
      const atPara = sf?.mapExt?.[0]?.AtPara;
      popModal.enableSelect = atPara?.GetValStrByKey?.('IsMultipleChoice') == '1';
    } catch {}
    componetKey.value++;
  };
  const removeSearchTag = (sf: any, removeIndex: number) => {
    const value = sf.value || '';
    const valueT = sf.valueT || '';
    const values = value.split(',').filter((v: string) => v !== '');
    const valuesT = valueT.split(',').filter((v: string) => v !== '');
    if (removeIndex < 0 || removeIndex >= values.length) return;
    values.splice(removeIndex, 1);
    valuesT.splice(removeIndex, 1);
    sf.value = values.join(',');
    sf.valueT = valuesT.join(',');
    userRegedit.SetPara(sf.searchKey, sf.value);
  };
  const PopModalOK = async () => {
    const checkedInfo = refPop.value!.handlerPopOK();
    const sf = searchInfo.searchFields.find((f) => f.searchKey === popModal.keyOfEn) as any;
    if (!sf) {
      popModal.visible = false;
      return;
    }
    if (checkedInfo[0].length === 0) {
      sf.value = '';
      sf.valueT = '';
    } else {
      sf.value = checkedInfo?.[0].join(',');
      sf.valueT = checkedInfo?.[1].join(',');
    }
    userRegedit.SetPara(sf.searchKey + 'T', sf.valueT);
    popModal.visible = false;
  };
  const handleCancelPop = () => {
    popModal.visible = false;
  };
  const tableCardWrapper = shallowRef<InstanceType<typeof Card>>();
  const dynamicHeight = ref(500);
  const calcTableHeight = () => {
    setTimeout(() => {
      const elem = tableCardWrapper.value?.$el;
      if (elem) {
        const rect = elem.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        dynamicHeight.value = windowHeight - rect.top - 22;
      }
    }, 50);
  };

  // 控制查询条件展开/折叠
  const toggleConditions = ref(false);

  // const filterByKeyword = (input: string, option: any) => {
  //   return option.label.includes(input.toLowerCase());
  // };
  const searchFlexWidth = ({ width }) => {
    return {
      width: width + 'px',
    };
  };
  const searchDateFlexWidth = computed(() => {
    return {
      width: toggleConditions.value ? '20%' : '24%',
    };
  });
  // end

  const handleUnload = async () => {
    if (enCfg.IsCond) {
      // await userRegedit.Delete();
      await resetUserRegedit(userRegedit, urMyPK, webUser.No, EnName);
    }
  };

  watch(
    () => unref(dataSource),
    () => {
      calcTableHeight();
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    window.addEventListener('resize', calcTableHeight, {
      passive: false,
    });
    Event.on('SearchRefresh', async () => {
      await handleRefresh();
    });
    // window.addEventListener('beforeunload', handleUnload);
  });

  onUnmounted(async () => {
    window.removeEventListener('resize', calcTableHeight);
    // window.removeEventListener('beforeunload', handleUnload);
    await handleUnload();
    Event.off('SearchRefresh');
  });

  defineExpose({
    query,
  });
</script>

<style lang="less" scoped>
  .pop_intput_div {
    line-height: 30px;
    height: 32px;
    width: calc(100% - 46px);
    border: 1px solid #ccc;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    padding-left: 5px;
    box-sizing: border-box;
  }
</style>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
  }

  .search-main {
    height: calc(var(--viewport-height) - 80px);

    :deep(tr.n-data-table-tr--expanded > td.n-data-table-td--last-col) {
      padding: 0 !important;
    }
  }

  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }

  .card-of-table {
    border-radius: 0;
  }

  .search-container {
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-start;

    .search-key {
      align-items: center;
      flex: 0 0 calc(100% / 6);
      flex-shrink: 0;
      padding: 4px 10px 4px 0;

      .column-setting {
        font-size: 17px;
        margin: 0 10px;
        display: flex;
        align-items: center;
      }

      .label {
        min-width: 80px;
        text-align: right;
        height: 32px;
        line-height: 32px;
        padding-right: 12px;
        box-sizing: border-box;
        font-weight: 550; //关键字 数据源字体加粗
      }

      .input-search {
        border-radius: 5px;
      }

      :deep(.ant-select-selector) {
        border-radius: 5px;
      }
    }

    .select-key {
      flex: 0 0 calc(100% / 9);
    }
    .search-buttons {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .column-setting {
        font-size: 17px;
        margin: 0 10px;
        display: flex;
        align-items: center;
      }
    }

    .toggle-btn {
      margin-left: 12px;
      font-size: 12px;
      color: #459dff;
      cursor: pointer;
    }
  }

  :deep(.num-style) {
    text-align: right !important;
  }

  // :deep(.n-data-table-tr--summary) {
  //   position: absolute;
  //   bottom: 20px;
  //   z-index: 999;
  //   left: 0;
  // }

  //列名加粗
  :deep(.n-data-table .n-data-table-th .n-data-table-th__title-wrapper .n-data-table-th__title) {
    font-weight: 550;
    text-align: center !important;
    justify-content: center !important;
  }

  .btn_add {
    background-color: #67c23a !important;
    border-color: #67c23a !important;
    color: #fff !important;
  }

  .btn_del {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff !important;
  }

  /* 支持自定义行背景色 */
  :deep(.n-data-table .n-data-table-tr .n-data-table-td) {
    // background-color: inherit !important;
    text-align: center !important;
    justify-content: center !important;
  }

  // :deep(.n-data-table .n-data-table-tr .n-data-table-td) {
  //   background-color: inherit !important;
  //   color: inherit !important;
  // }

  .pop-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    .select-count {
      width: 80px;
    }
    .button-group {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: flex-end;
      padding: 12px;
    }
  }
</style>
