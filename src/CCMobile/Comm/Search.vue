<template>
  <BaseComponent ref="baseComponent" style="background-color: #f2f5f7" :close-drawer-func="handleReload" :close-modal-func="handleRowDbClick">
    <!-- filter -->
    <VanPopup v-model:show="filterVisible" position="bottom" round :style="{ height: '80%', padding: '0 12px' }">
      <div class="van-h5">{{ '查询条件' }}</div>
      <VantField :label="enCfg.Label || '关键字'" :maxlength="100" v-model="searchInfo.SearchKey" :placeholder="enCfg.KeyPlaceholder || '请输入关键字'" />
      <VantField
        v-for="sf in searchInfo.searchFields"
        :maxlength="100"
        :key="sf.label"
        :label="sf.label || '关键字'"
        v-model="sf.value"
        :placeholder="sf.placeholder || '请输入关键字'"
      />
      <template v-if="searchInfo.DTSearchKeyWords.length > 0">
        <VantField
          v-model="searchInfo.DTSearchLabel"
          readonly
          :label="'时间字段'"
          :placeholder="'请选择查询的日期类型'"
          @click="openVanPicker('DTSearchKeyWord', 'DTSearchLabel', searchInfo.DTSearchKeyWords)"
        />
      </template>
      <template v-if="searchInfo.DTSearchWay !== DTSearchWay.None">
        <VantField v-model="vantCalendarText" :label="'日期选择'" :placeholder="'请选择日期'" @click="calendarVisible = true" />
      </template>
      <template v-for="condition in [...fkConditions, ...normalConditions]" :key="condition.title">
        <VantField
          readonly
          v-model="condition.selectedStr"
          :label="condition.title"
          :placeholder="'请选择'"
          right-icon="cross"
          @click-right-icon="
            () => {
              condition.selectedStr = '';
              condition.selected = '';
            }
          "
          @click-input="() => {
          try {
            conditionPicker.columns = condition.options.map((option) => ({ text: option.label, children: option.children, value: option.value })) as any;
            conditionPicker.visible = true;
            conditionPicker.onConfirm = ({ selectedOptions }) => {
              const lastIdx = selectedOptions.length - 1;
              condition.selectedStr = selectedOptions[lastIdx]?.text;
              condition.selected = selectedOptions[lastIdx]?.value;
              conditionPicker.visible = false;
              triggerDDLEvents(condition.selected, {}, condition.key)
            };
          } catch (e) {
            console.error(e.toString())
          }
        }
          "
        />
      </template>
      <VantCell>
        <VantButton round type="primary" size="small" block @click="refreshSearch">{{ '查询' }}</VantButton>
      </VantCell>
    </VanPopup>
    <!-- 条件选择器 -->
    <VanPopup v-model:show="conditionPicker.visible" round position="bottom">
      <VanPicker :columns="conditionPicker.columns" @cancel="conditionPicker.visible = false" @confirm="conditionPicker.onConfirm" />
    </VanPopup>
    <!-- picker -->
    <VanPopup v-model:show="pickerOption.visible" round position="bottom">
      <VanPicker :columns="pickerOption.columns" @cancel="pickerOption.visible = false" @confirm="vanPickerConfirm" />
    </VanPopup>

    <!-- calendar -->
    <VanCalendar
      v-model:show="calendarVisible"
      :min-date="minDate"
      :allow-same-day="true"
      :type="[DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay) ? 'range' : undefined"
      @confirm="onCalendarConfirm"
    />
    <!-- list -->
    <VantCheckGroup
      v-model="checkedItems"
      :style="{
        paddingTop: ignorePt ? 0 : '48px',
        backgroundColor: '#f2f5f7',
      }"
    >
      <VanLoading v-if="loading" vertical size="24px" />
      <VantEmpty v-else-if="dataSource.length === 0" :description="'暂无数据'" style="height: calc(-160px + var(--viewport-height)); background-color: white">
      </VantEmpty>
      <VantCellGroup v-if="dataSource.length > 0">
        <VantList
          :style="listStyle"
          v-model:loading="loadingMore"
          v-model:error="error"
          :error-text="'请求失败，点击重新加载'"
          :finished="finished"
          :offset="100"
          @load="loadMore"
          ref="containerRef"
        >
          <div v-for="(item, index) in dataSource" class="card-item" :key="item[pkField]" @click.stop="handleRowDbClick(item)">
            <div v-if="enCfg.IconEnumAttr" class="corner-label" :style="getLabelStyle(item)"> {{ getEnumText(item) }} </div>
            <div class="title">
              <VantCheckbox v-if="enableCheckbox()" :name="item[pkField]" :ref="(el) => (checkboxRefs[index] = el)" @click.stop="toggle(index)" />
              <span style="flex: 4; color: #1890fa" @click.stop="toggleUrl(item)">{{ getTitle(item) }}</span>
              <!-- <div style="color: #1890fa; flex: 1; text-align: right" @click.stop="handleRowDbClick(item)">{{'详情'}}</div> -->
            </div>
            <div class="body">
              <div v-if="item.rowFuncs.length > 0 && enCfg.PosRefFuncMobile == 2" class="left-func-list">
                <VantButton
                  class="footer-item"
                  round
                  size="small"
                  type="primary"
                  v-for="func in item.rowFuncs"
                  :key="func.ClassMethod"
                  @click.stop="execMethod(item, func.ClassMethod, func.Title, !!func.Tag && func.Tag === 'WaiGua' ? 'WaiGua' : 'EntityMap')"
                >
                  {{ func.Title }}
                </VantButton>
              </div>
              <div class="content">
                <div class="row" v-for="col in simpleColumns.filter((sc) => !['name', 'title'].includes(sc.key.toLowerCase()))" :key="col.key">
                  <span class="row-label">{{ col.title }}</span
                  >{{ getText(item, col.key) }}
                </div>
              </div>
              <div v-if="item.rowFuncs.length > 0 && enCfg.PosRefFuncMobile == 3" class="left-func-list">
                <VantButton
                  class="footer-item"
                  round
                  size="small"
                  type="primary"
                  v-for="func in item.rowFuncs"
                  :key="func.ClassMethod"
                  @click.stop="execMethod(item, func.ClassMethod, func.Title, !!func.Tag && func.Tag === 'WaiGua' ? 'WaiGua' : 'EntityMap')"
                >
                  {{ func.Title }}
                </VantButton>
              </div>
            </div>
            <div class="footer" v-if="item.rowFuncs.length > 0 && enCfg.PosRefFuncMobile == 1">
              <div class="func-list">
                <VantButton
                  class="footer-item"
                  round
                  size="small"
                  type="primary"
                  v-for="func in item.rowFuncs"
                  :key="func.ClassMethod"
                  @click.stop="execMethod(item, func.ClassMethod, func.Title, !!func.Tag && func.Tag === 'WaiGua' ? 'WaiGua' : 'EntityMap')"
                >
                  {{ func.Title }}
                </VantButton>
              </div>
            </div>
          </div>
        </VantList>
      </VantCellGroup>
    </VantCheckGroup>
    <!-- 扩展功能 -->
    <VanPopup v-model:show="extFuncVisible" round position="bottom" :style="{ height: '300px', padding: '0 12px' }">
      <div class="van-h5" v-if="batchFunctions.length > 0">批处理</div>
      <div class="extend-func" @click="extFuncVisible = false">
        <div class="func-item" v-for="func in batchFunctions" :key="func.ClassMethod" @click="execBatchFunction(func as RefMethod)">
          <FunctionOutlined style="font-size: 18px; margin-bottom: 12px" />
          {{ func.Title }}
        </div>
      </div>
      <div class="van-h5">{{ '扩展功能' }}</div>
      <div class="extend-func" @click="extFuncVisible = false">
        <div class="func-item" @click="exportTable">
          <ExportOutlined style="font-size: 18px; margin-bottom: 12px" />
          <span style="font-size: 12px">{{ '导出' }}</span>
        </div>
        <!-- <div class="func-item" @click="gotoGroup">
          <AreaChartOutlined style="font-size: 20px; margin-bottom: 12px" />
          <span style="font-size: 12px">{{'分析'}}</span>
        </div> -->
      </div>
    </VanPopup>

    <!-- footer -->
    <div class="tab-buttons">
      <!-- pagination -->
      <div class="pagination" v-if="dataSource.length > 0"
        >总计: {{ paginationReactive.itemCount }} 已加载: {{ paginationReactive.page }} / {{ paginationReactive.pageCount }}
      </div>
      <div class="quick-search">
        <VantSearch v-model="searchInfo.SearchKey" :placeholder="'请输入关键字'" @search="refreshSearch" />
      </div>
      <div class="btn-list">
        <VantIcon v-if="uac.IsDelete && checkedItems.length > 0" style="color: #ff5555" name="delete-o" size="22" @click="deleteSelectedKeys" />
        <VantIcon name="filter-o" size="22" style="margin-right: 12px" @click="filterVisible = true" color="#459dff" />
        <VantIcon v-if="uac.IsInsert" name="plus" size="22" @click="add" color="#459dff" />
        <VantIcon name="replay" size="22" style="margin-left: 12px" @click="refreshSearch" color="#459dff" />
        <VantIcon name="arrow-up" size="22" style="margin-left: 12px" @click="extFuncVisible = true" color="#459dff" />
      </div>
    </div>
    <VanPopup v-model:show="drawerInfo.visible" position="right" :style="{ width: '100%', height: '100%' }">
      <component v-if="drawerInfo.visible" :is="drawerInfo.component" :params="drawerInfo.params" />
    </VanPopup>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import {
    Loading as VanLoading,
    Empty as VantEmpty,
    Icon as VantIcon,
    Calendar as VanCalendar,
    Field as VantField,
    Picker as VanPicker,
    CellGroup as VantCellGroup,
    CheckboxGroup as VantCheckGroup,
    Checkbox as VantCheckbox,
    Popup as VanPopup,
    Button as VantButton,
    Cell as VantCell,
    List as VantList,
    Search as VantSearch,
  } from 'vant';
  import { ExportOutlined, FunctionOutlined } from '@ant-design/icons-vue';
  import { markRaw, onUnmounted, reactive, ref, shallowRef, unref, onMounted, onBeforeUpdate, nextTick, provide, onActivated, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { useRoute, useRouter } from 'vue-router';
  import { DTSearchWay, SearchNormals } from '/@/bp/en/Map/SearchNormal';
  import { SearchFKEnums } from '/@/bp/en/Map/SearchFKEnum';
  import { Entity } from '/@/bp/en/Entity';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { Entities } from '/@/bp/en/Entities';
  import { parseValByType, useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import dayjs from 'dayjs';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { UAC } from '/@/bp/en/Map/UAC';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { cloneDeep } from 'lodash-es';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import 'dayjs/locale/zh-cn';
  import { exportExcel } from '/@/utils/excel/exportExcel';
  import { DataType } from '/@/bp/en/DataType';
  import { SFTableDtl, SFTableDtls } from '/@/WF/Admin/FrmLogic/SFTable/SFTableDtl';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { AtPara } from '/@/bp/da/AtPara';
  import { SearchFields } from '/@/bp/en/Map/SearchFields';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { ExtModel } from '/@/bp/en/Map/EnMapExt';
  import { ClassFactoryOfGroupPageNew } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import useScrollKeep from '/@/hooks/cache/useScrollKeep';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  // import { windowOpen } from '/@/utils/windowOpen';
  // 基础能力容器，处理弹窗，抽屉等

  defineOptions({
    name: 'CCMobileSearch',
  });
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
    inTabs: {
      type: Boolean,
      default: false,
    },
    ignorePt: {
      type: Boolean,
      default: false,
    },
  });

  interface SearchDef {
    DTSearchKeyWord: any;
    DTSearchLabel: string;
    DTSearchWay: DTSearchWay;
    searchNormals: SearchNormals;
    searchFKEnums: SearchFKEnums;
    searchFields: SearchFields;
    hiddenCondition: SearchNormals;
    SearchKey: string;
    DTFrom?: number;
    DTTo?: number;
    DTSearchKeyWords: { label: string; value: any }[];
  }

  interface SearchResult {
    Attrs: Attr[];
    DT: Recordable[];
    Sys_MapData: Entity;
    dtM: Recordable[];
  }

  const route = useRoute();
  const router = useRouter();

  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string);
  const loading = ref(false);
  const loadingMore = ref(false);
  const filterVisible = ref(false);
  const listStyle = computed(() => {
    return {
      height: `calc(${props.inTabs ? '-160px' : '-160px'} - env(safe-area-inset-bottom) + var(--viewport-height))`,
      overflowY: 'auto',
      backgroundColor: `#f2f5f7`,
    };
  });
  type PickerOption = {
    visible: boolean;
    columns: { value: string; text: string }[];
    onConfirm: (...args) => void;
  };
  const conditionPicker = reactive<PickerOption>({
    visible: false,
    columns: [],
    onConfirm: () => {},
  });
  const pickerOption = reactive({
    visible: false,
    columns: [],
    labelField: '',
    valueField: '',
  });
  //移动端打开抽屉
  const drawerInfo = reactive({
    visible: false,
    component: {},
    params: {},
  });
  // 扩展功能区
  const extFuncVisible = ref(false);
  // end
  const openVanPicker = (valueField, labelField, columns) => {
    pickerOption.labelField = labelField;
    pickerOption.valueField = valueField;
    pickerOption.columns = columns.map((item) => {
      return { value: item.value, text: item.label };
    });
    pickerOption.visible = true;
  };

  const enableCheckbox = () => {
    return enCfg.EnableMobileSelect && uac.value.IsDelete;
  };

  const vanPickerConfirm = ({ selectedOptions }) => {
    const lastIdx = selectedOptions.length - 1;
    if (!!pickerOption.valueField) searchInfo[pickerOption.valueField] = selectedOptions[lastIdx].value;
    if (!!pickerOption.labelField) searchInfo[pickerOption.labelField] = selectedOptions[lastIdx].text;
    pickerOption.visible = false;
  };

  const checkedItems = ref<string[]>([]);
  const checkboxRefs = ref<any>([]);
  const toggle = (index) => {
    checkboxRefs.value[index].toggle();
  };
  //实体Search页面跳转
  const toggleUrl = async (attr) => {
    const enMapExts = enInst?._enMap?.enMapExts;
    if (!enMapExts || !Array.isArray(enMapExts)) return;
    if (enMapExts.length === 0) return;
    const _ext = enMapExts.find((ext) => ext.ExtModel == ExtModel.FieldLink && ext.AttrOfOper === 'Name');
    const url = _ext?.Tag1;
    if (!url) return;
    const matches = url.match(/@\w+/g);
    let finalSrc = url;
    for (const m of matches) {
      const key = m.substring(1);
      finalSrc = finalSrc.replace(m, attr[key]);
    }
    const param = getAllRequestParams(finalSrc || '');
    const keys = Object.keys(param);
    //通过EnName获取EnName的实体名称并拼接
    const fkEn = await ClassFactory.GetEn(param.EnName);
    await fkEn.Init();
    const enDesc = fkEn?.EnMap?.EnDesc; //EnName实体名称
    let urlLink = `/CCFastMobile/FastRoute?title=${enDesc}`;
    for (const key of keys) {
      urlLink += `&${key}=${param[key]}`;
    }
    router.push(urlLink);
  };
  onBeforeUpdate(() => {
    checkboxRefs.value = [];
  });
  const minDate = dayjs().subtract(2, 'year').toDate();
  const calendarVisible = ref(false);
  const vantCalendarText = ref('');
  const onCalendarConfirm = (values) => {
    if (Array.isArray(values)) {
      const [start, end] = values;
      calendarVisible.value = false;
      const startDateTime = handleTimestamp(start);
      const endDateTime = handleTimestamp(end);
      userRegedit.DTFrom = startDateTime;
      userRegedit.DTTo = endDateTime;
      vantCalendarText.value = `${startDateTime} - ${endDateTime}`;
      return;
    }
    const dtText = handleTimestamp(values);
    vantCalendarText.value = dtText;
    calendarVisible.value = false;
    userRegedit.DTFrom = dtText;
  };

  // cfg
  const enCfg = reactive<EnCfg>(new EnCfg());
  const cornerLabel = reactive(new SysEnums());
  const getLabelStyle = (row) => {
    if (!enCfg.IconEnumAttr) return {};
    const eKey = row[enCfg.IconEnumAttr];
    const sysEnum = cornerLabel.find((lab) => lab.IntKey === eKey);
    if (!sysEnum) return {};
    return {
      backgroundColor: sysEnum.ValColor,
    };
  };
  const getEnumText = (row) => {
    if (!enCfg.IconEnumAttr) return '';
    const eKey = row[enCfg.IconEnumAttr];
    const sysEnum = cornerLabel.find((lab) => lab.IntKey === eKey);
    return sysEnum?.Lab || '';
  };

  const triggerDDLEvents = async (key, _row, cfgKey) => {
    const exts = enInst?._enMap.enMapExts.filter((item) => item.ExtModel === ExtModel.DDLRelation && item.Tag1 === cfgKey);
    if (!Array.isArray(exts)) return;
    for (const ext of exts) {
      const triggerItem = [...fkConditions.value, ...normalConditions.value].find((item) => item.key === ext.Tag2);
      if (!triggerItem) continue;
      const rawData = await DBAccess.RunSQLReturnTable(ext.Doc.replace(/@Key/g, key));
      triggerItem.options = rawData.map((item) => {
        return {
          label: item.Name,
          value: item.No,
          text: item.Name,
        };
      });
      triggerItem.selected = '';
      triggerItem.selectedStr = '';
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
    // 处理角标
    const eAttr = enCfg.IconEnumAttr;
    if (!eAttr) {
      return;
    }
    await cornerLabel.Retrieve('EnumKey', eAttr);
  };

  // const rowSelection = computed(() => {
  //   return props.isSearch ? null : { type: 'checkbox', selectedRowKeys: checkedKeys, onChange: onSelectChange };
  // });

  const paginationReactive = reactive({
    page: 1,
    pageSize: enCfg.PageSize || 6,
    showSizePicker: true,
    pageSizes: [10, 15, 20],
    pageCount: 1,
    itemCount: 1,
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
      query();
    },
  });

  const searchInfo = reactive<SearchDef>({
    DTSearchKeyWord: '',
    DTSearchLabel: '',
    DTSearchWay: DTSearchWay.None,
    searchNormals: new SearchNormals(),
    searchFKEnums: new SearchFKEnums(),
    searchFields: new SearchFields(),
    hiddenCondition: new SearchNormals(),
    SearchKey: '',
    DTFrom: 0,
    DTTo: 0,
    DTSearchKeyWords: [],
  });

  const DTRangeSearchKeys = ref<[number, number] | null>(null);
  let ensInst: Nullable<Entities> = null;
  let enInst: Nullable<Entity> = null;
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);

  // 暂时禁用移动端分析
  // const gotoGroup = () => {
  //   const editUrl = `/src/WF/Comm/Group.vue?EnName=${enInst?.classID}`;
  //   baseComponent.value?.openDrawerByUrl('分析', editUrl, '100%');
  // };
  // 表单列
  const dataSource = ref<Recordable[]>([]);

  const loadMore = async () => {
    if (paginationReactive.page >= paginationReactive.pageCount) {
      finished.value = true;
      loadingMore.value = false;
      return;
    } else {
      finished.value = false;
    }
    await query(paginationReactive.page + 1);
    loadingMore.value = false;
  };

  // 导出表格
  const exportTable = async () => {
    const attrs = enInst?._enMap.attrs;
    if (!attrs) {
      message.error('导出表单失败，原因：未找到attrs');
      return;
    }
    await updateSearchCondition();
    userRegedit.SearchKey = searchInfo.SearchKey;
    await userRegedit.Update();
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', EnName);
    //查询集合
    const data = await handler.DoMethodReturnJson<Recordable[]>('Search_Exp');
    exportExcel(unref(data), attrs, 'Key', enInst?._enMap.EnDesc);
  };

  let _open_entity_pk = '';
  // 双击
  const handleRowDbClick = async (record: Recordable) => {
    let url = enCfg.MobileUrlExt;
    if (parseInt(enCfg.SearchUrlOpenType) === 9) {
      url = GloWF.DealExp(url, record);
    } else {
      const componentType = parseInt(enCfg.SearchUrlOpenType);
      if (componentType === 0 || componentType === 1) {
        url = '/CCMobile/Comm/En';
      } else {
        message.error('没有设置对应打开页面');
        return;
      }
      const atParaObj = new AtPara(record.AtPara);
      const enName = atParaObj.GetValStrByKey('EnName') || EnName;
      url += `?EnName=${enName}&PKVal=${record[enInst?.PK as string]}`;
    }
    const openModel = parseInt(enCfg.OpenModel);
    if (openModel === 4) {
      return;
    }

    let _url = url;
    if (_url.startsWith('/#/')) {
      _url = window.location.pathname + _url.substring(1);
    }
    if (openModel === 1) {
      window.location.href = _url;
      return;
    }
    if (openModel === 3) {
      enInst?.[enCfg.OpenModelFunc]?.();
      return;
    }
    await nextTick();
    const title = enInst?._enMap?.EnDesc + ':详情';

    if ([0, 2].includes(openModel)) {
      baseComponent.value?.openModalByUrl(title, url);
      return;
    }
    if ([5, 6, 7, 8, 9, 10].includes(openModel)) {
      if (_url.includes('.vue')) {
        // baseComponent.value?.openDrawerByUrl(title, _url + '&isShowBar=true', '100%');
        drawerInfo.visible = true;
        const params = getAllRequestParams(_url + '&isShowBar=true');
        const url = _url.split('?')[0];
        drawerInfo.component = markRaw(
          createAsyncComponent(() => import(url), {
            loading: true,
          }),
        );
        drawerInfo.params = params;
        return;
      } else {
        _open_entity_pk = record[enInst!.PK];
        router.push(_url + '&inDrawer=true');
        return;
      }
    }
  };

  let needReload = false;

  const handleReload = () => {
    if (needReload) {
      needReload = false;
      refreshSearch();
    }
  };

  const add = async () => {
    try {
      loading.value = true;
      const subComponentParams = cloneDeep(props.params || {});
      delete subComponentParams['No'];
      delete subComponentParams['MyPK'];
      delete subComponentParams['OID'];
      delete subComponentParams['WorkID'];
      delete subComponentParams['NodeID'];
      delete subComponentParams['Name'];
      delete subComponentParams['EnName'];
      delete subComponentParams['PKVal'];
      delete subComponentParams['AtPara'];
      const enGPN = await ClassFactoryOfGroupPageNew.GetEnByEntityClassID(enInst?.classID || '');
      if (enGPN != null) {
        baseComponent.value?.openDrawer({
          title: '新建' + enGPN.PageTitle,
          width: '100%',
          component: markRaw(
            createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
              loading: true,
            }),
          ),
          params: { EnName: enGPN.classID, RefDtlEnName: EnName, ...subComponentParams },
        });
        return;
      }
      baseComponent.value?.openDrawer({
        title: '新建' + enInst?._enMap.EnDesc || '',
        component: markRaw(
          createAsyncComponent(() => import('/@/CCMobile/Comm/EnOnly.vue'), {
            loading: true,
          }),
        ),
        width: '100%',
        params: { EnName, ...subComponentParams },
      });
      needReload = true;
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };

  // 删除所选行
  const deleteSelectedKeys = async () => {
    try {
      if (checkedItems.value.length === 0) {
        message.warn('请选择要删除的行.');
        return;
      }
      if (!window.confirm('确定要删除所选数据吗？')) {
        return;
      }

      const tasks: Promise<number>[] = [];
      for (const pk of checkedItems.value) {
        const tempEn = ensInst?.GetNewEntity;
        if (tempEn) {
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
      }
      checkedItems.value = [];
      await Promise.all(tasks);
      message.success('执行成功');

      await refreshSearch();
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  // 处理时间日期
  const getFormats = (type: DTSearchWay) => {
    const formatsDef = ['', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM', 'YYYY'];
    return formatsDef[type] || 'YYYY-MM-DD';
  };

  interface Condition {
    selected: string | number;
    selectedStr: string;
    title: string;
    key: string;
    isBoolean: boolean;
    dataType: DataType;
    options: any[];
    pickerVisible: boolean;
  }

  // 查询条件
  const normalConditions = ref<Condition[]>([]);
  const fkConditions = ref<Condition[]>([]);
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  // UserRegedit为查询对象
  const userRegedit = reactive<UserRegedit>(new UserRegedit());

  const resetUserRegedit = async () => {
    userRegedit.MyPK = urMyPK;
    userRegedit.SearchKey = '';
    userRegedit.AtPara = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    userRegedit.FK_Emp = webUser.No;
    userRegedit.CfgKey = 'SearchAttrs';
    userRegedit.Vals = '';
    userRegedit.FK_MapData = enInst?.classID;
    userRegedit.OrderBy = '';
    userRegedit.OrderWay = '';
    if (!(await userRegedit.RetrieveFromDBSources())) {
      await userRegedit.Insert();
    } else {
      await userRegedit.Update();
    }
  };

  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format(getFormats(searchInfo.DTSearchWay));
    }
    return '';
  };
  const isValidVal = (v: any) => v != null && v != undefined && v != '';
  // 更新查询条件
  const updateSearchCondition = async () => {
    // 处理关键字
    userRegedit.SearchKey = searchInfo.SearchKey || '';
    let queryArgs = '';
    for (const condition of fkConditions.value) {
      if (isValidVal(condition.selected)) queryArgs += `@${condition.key}=${condition.selected || ''}`;
    }

    for (const condition of normalConditions.value) {
      if (isValidVal(condition.selected)) queryArgs += `@${condition.key}=${condition.selected || ''}`;
    }
    // 隐藏条件
    // for (const hiddenCondition of searchInfo.hiddenCondition) {
    //   const { RefAttrKey, DefaultSymbol, DefaultVal } = hiddenCondition;
    //   queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
    // }
    // 字段查找
    for (const sf of searchInfo.searchFields) {
      // queryArgs += `@${sf.searchKey}=${sf.value || ''}`;
      userRegedit.SetPara(sf.searchKey, sf.value);
    }
    // const _url_query = route.query;
    // try {
    //   let urlQuery = _url_query['url_params'];
    //   if (!!urlQuery) {
    //     urlQuery = atob(urlQuery as string);
    //     const urlQueryArr = urlQuery.split('&');
    //     for (const item of urlQueryArr) {
    //       const [key, value] = item.split('=');
    //       queryArgs += `@${key}=${value}`;
    //     }
    //   }
    // } catch (_) {}

    // const attrs = enInst!._enMap.attrs;
    // for (const key in props.params) {
    //   if (['enname', 'no', 'name', 'mypk', 'workid', 'oid'].includes(key.toLowerCase())) continue;
    //   if (queryArgs.includes(key)) continue;
    //   if (!isValidVal(props.params[key])) continue;
    //   if (!attrs.find((attr) => attr.Key == key)) continue;
    //   queryArgs += `@${key}=${props.params[key]}`;
    // }
    userRegedit.Vals = queryArgs;
    userRegedit.OrderBy = enCfg.OrderBy;
    userRegedit.OrderWay = enCfg.IsDeSc ? 'desc' : 'asc';
  };
  const loopFunction = (item: Recordable, obj: Recordable) => {
    const { key } = item;
    if (!!obj[key]) {
      const selected = obj[key].includes(',') ? obj[key].split(',') : obj[key];
      item.selected = Array.isArray(selected) ? selected.map((s) => parseValByType(item.dataType, s)) : parseValByType(item.dataType, selected);
    }
  };

  // const getValidDateStr = (str: string) => (str.includes('-') ? dayjs(str).valueOf() : 0);
  const initUserRegedit = async () => {
    userRegedit.setPKVal(urMyPK);
    const res = await userRegedit.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit();
    } else {
      // 范围选择器
      const fts = handleTimestamp(userRegedit.DTFrom || '');
      const tts = handleTimestamp(userRegedit.DTTo || '');
      onCalendarConfirm([fts, tts]);
      searchInfo.DTSearchKeyWord = userRegedit.DTSearchKey;
      const dtLabel = searchInfo.DTSearchKeyWords.find((item) => item.value == userRegedit.DTSearchKey)?.label;
      searchInfo.DTSearchLabel = dtLabel || '';
      searchInfo.SearchKey = userRegedit.SearchKey;
      const obj: Recordable = {};
      const params = splitAtString(userRegedit.Vals);
      for (const param of params) {
        const [k, v] = param.split('=');
        obj[k] = v;
      }
      // 处理下拉框回显
      fkConditions.value.forEach((item) => loopFunction(item, obj));
      normalConditions.value.forEach((item) => loopFunction(item, obj));
      searchInfo.hiddenCondition.forEach((item) => loopFunction(item, obj));
    }

    // 处理url传入的查询key，时间
    const SearchKey = route.query.SearchKey || '';
    const DTFrom = route.query.DTFrom || '';
    const DTTo = route.query.DTTo || '';
    if (SearchKey) userRegedit.SearchKey = SearchKey as string;
    if (DTFrom) userRegedit.DTFrom = DTFrom as string;
    if (DTTo) userRegedit.DTTo = DTTo as string;
  };

  const cleanFilters = () => {
    searchInfo.SearchKey = '';
    searchInfo.DTSearchKeyWord = '';
    searchInfo.DTSearchLabel = '';
    vantCalendarText.value = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    DTRangeSearchKeys.value = null;
    fkConditions.value.forEach((item) => {
      item.selected = '';
      item.selectedStr = '';
    });
    normalConditions.value.forEach((item) => {
      item.selected = '';
      item.selectedStr = '';
    });
    searchInfo.hiddenCondition.forEach((item) => {
      item.selected = '';
      item.selectedStr = '';
    });
    pickerOption.visible = false;
    paginationReactive.page = 1;
    dataSource.value = [];
    query();
  };
  // let ready = false;
  const query = async (page = 1) => {
    try {
      await updateSearchCondition();
      userRegedit.SearchKey = searchInfo.SearchKey;
      userRegedit.DTSearchKey = searchInfo.DTSearchKeyWord;
      await userRegedit.Update();
      paginationReactive.page = page;
      //查询集合
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      handler.AddPara('PageIdx', paginationReactive.page);
      handler.AddPara('PageSize', paginationReactive.pageSize);
      const data = await handler.DoMethodReturnJson<SearchResult>('Search_SearchIt');
      for (const item of data.DT) {
        GetRowFunc(item);
        item.rowFuncs = cloneDeep(rowFuncs.value);
        dataSource.value.push(item);
      }
      await userRegedit.Retrieve();
      const totalSize = parseInt(userRegedit.RecCount);
      paginationReactive.itemCount = totalSize;
      paginationReactive.pageCount = Math.ceil(totalSize / paginationReactive.pageSize);
      filterVisible.value = false;
    } catch (e: any) {
      error.value = true;
      console.trace(e);
      message.error(e.toString());
    }
  };
  // 查询条件 end

  const booleanToRadioGroup = () => {
    return [
      { label: '全部', value: '', text: '全部' },
      { label: '是', value: '1', text: '是' },
      { label: '否', value: '0', text: '否' },
    ];
  };
  // 准备查询条件和列数据
  const prepareConditions = async (_, enInst) => {
    const { getDDLData } = useDDLDataLoader(enInst);
    const { DTSearchWay, searchFKEnums, searchFields, attrs } = enInst._enMap;
    const searchNormals = enInst?._enMap.searchNormals.filter((condition) => !condition.IsHidden);
    searchInfo.DTSearchKeyWords = enInst?._enMap.attrs
      .filter((attr) => attr.MyDataType == DataType.AppDate || attr.MyDataType == DataType.AppDateTime)
      .map((attr) => ({ label: attr.Desc, value: attr.Key }));
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
      if (!attr) {
        return {
          selected: '',
          selectedStr: '',
          title: '未知条件',
          isBoolean: attr.IsBoolean,
          dataType: attr.MyDataType,
          options: Promise.resolve([]),
          pickerVisible: false,
        };
      }
      fkConditions.value.push({
        selected: '',
        selectedStr: '',
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        pickerVisible: false,
        options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
      });
    }
    normalConditions.value = [];
    for await (const sn of searchNormals) {
      const attr = attrs.find((attr) => attr.Key === sn.Key);
      if (!attr) {
        return {
          selected: '',
          selectedStr: '',
          title: '未知条件',
          isBoolean: attr.IsBoolean,
          dataType: attr.MyDataType,
          pickerVisible: false,
          options: Promise.resolve([]),
        };
      }
      normalConditions.value.push({
        selected: '',
        selectedStr: '',
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        pickerVisible: false,
        options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
      });
    }
    searchInfo.searchFields = searchFields;
    searchInfo.DTSearchWay = DTSearchWay;
    searchInfo.searchNormals = searchNormals;
    searchInfo.searchFKEnums = searchFKEnums;
    searchInfo.hiddenCondition = enInst?._enMap.searchNormals.filter((condition) => condition.IsHidden);
  };

  // 批处理
  // 执行批处理方法
  const batchFunctions = ref<RefMethod[]>([]);
  const taskList = ref<Recordable[]>([]);
  const execBatchFunction = (rm: RefMethod) => {
    const funcName = rm?.ClassMethod;
    if (!rm || !funcName) {
      message.error('实体未找到此方法，请检查');
      return;
    }
    if (!enInst) {
      message.error('实体初始化失败，请检查');
      return;
    }
    if (dataSource.value.length === 0) {
      message.error('没有数据，无法执行');
      return;
    }

    if (checkedItems.value.length === 0) {
      message.warn('请选择需要批量处理的数据');
      return;
    }
    const execMethod = async (_methodName: string, data: Recordable) => {
      try {
        baseComponent.value?.resetModal();
        baseComponent.value?.handleGPNCallback(
          new GPNReturnObj(
            GPNReturnType.OpenCompByModal,
            {
              compUrl: '/src/WF/Comm/subComponents/LoadingPanel.vue',
              params: {
                taskList: taskList,
              },
            },
            `批处理(选中条数:${checkedItems.value.length})`,
          ),
        );
        taskList.value = [];
        if (checkedItems.value.length === 0) {
          message.warn('请选择处理的记录');
          return;
        }
        for (const pk of checkedItems.value) {
          const tempEn = ensInst?.GetNewEntity;
          if (!tempEn) {
            continue;
          }
          tempEn.setPKVal(pk);
          await tempEn.RetrieveFromDBSources();
          const task = {
            id: pk,
            status: 'loading',
            text: '',
            func: async () => {
              return await tempEn[_methodName](...Object.values(data));
            },
          };
          taskList.value.push(task);
        }

        for (const task of taskList.value) {
          task
            .func()
            .then((res) => {
              task.status = 'finished';
              task.text = res;
            })
            .catch((e) => {
              task.status = 'fail';
              task.text = e.toString();
            });
        }
        message.success('执行成功');
      } catch (e: any) {
        message.error(e.toString());
      }
    };
    if (rm.Tag != 'WaiGua')
      baseComponent.value?.handleGPNCallback(
        new GPNReturnObj(
          GPNReturnType.OpenCompByModal,
          {
            params: {
              row: dataSource.value[0],
              title: rm.Title,
              'method-name': funcName,
              attrs: rm.HisMap.attrs,
              'entity-ref': enInst,
              execTips: rm.Warning,
              execFunc: execMethod,
              refMethod: rm,
            },
            compUrl: '/src/CCMobile/Comm/RefMethod.vue',
          },
          `批处理(选中条数:${checkedItems.value.length})`,
        ),
      );
    if (entityWG.value != null && rm.Tag === 'WaiGua') {
      //执行自定义的方法
      entityWG.value?.BtnClick('SearchToolbar', (rm.Title || funcName) as string, checkedItems.value.join(','), null);
    }
  };
  const provideGPNCB = (res: GPNReturnObj) => {
    baseComponent.value?.handleGPNCallback(res);
  };
  provide('handle-gpn-callback', provideGPNCB);
  const getBatchFunctions = () => {
    batchFunctions.value = enInst?._enMap.rms.filter((rm) => rm.IsCanBatch) as RefMethod[];
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchToolbarBtns;
      if (!!btns) {
        btns.split(',').forEach((item) => {
          const refMethod: RefMethod = new RefMethod();
          refMethod.Title = item;
          refMethod.ClassMethod = item;
          refMethod.Tag = 'WaiGua';
          batchFunctions.value.push(refMethod);
        });
      }
    }
  };
  // end
  const uac = ref<UAC>(new UAC());
  const simpleColumns = ref<{ key: any; title: string }[]>([]);
  const rowFuncs = ref<RefMethod[]>([]); // 行功能
  const error = ref(false);
  const finished = ref(false);

  const getTitle = (row) => {
    return row['Name'] || row['Title'] || row['No'] || row['HCTBBH'];
  };
  const getText = (row, key) => {
    return row[key + 'Text'] || row[key + 'T'] || row[key];
  };

  const execMethod = async (row, methodName, title, methodType = 'EntityMap') => {
    if (!methodName) {
      message.error('方法名未找到');
      return;
    }
    if (!row) {
      message.error('未找到数据');
      return;
    }
    const tempEn = ensInst?.GetNewEntity;
    if (!tempEn) {
      message.error('实体未初始化');
      return;
    }
    if (methodType === 'EntityMap') {
      tempEn.setPKVal(row[tempEn.PK]);
      await tempEn.RetrieveFromDBSources();
      const res = await tempEn[methodName](row);
      if (res instanceof GPNReturnObj) {
        baseComponent.value?.handleGPNCallback(res);
      }
      _open_entity_pk = row[tempEn.PK];
      return;
    }

    if (entityWG.value != null) {
      //执行自定义的方法
      _open_entity_pk = row[tempEn.PK];
      entityWG.value?.BtnClick('SearchOpt', title, '', row);
      return;
    }
  };
  const refreshSearch = async () => {
    try {
      loading.value = true;
      dataSource.value = [];
      paginationReactive.page = 1;
      finished.value = false;
      error.value = false;
      query();
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  const pkField = ref('');
  // 初始化Search页面
  const InitSearch = async () => {
    try {
      loading.value = true;
      error.value = false;
      const enName = EnName as string;
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + enName.substring(enName.lastIndexOf('.') + 1)) as string);
      if (entityWG.value != null) entityWG.value.params = props.params;
      const ens = await ClassFactory.GetEns(EnName as string);
      ensInst = ens;
      enInst = ens.GetNewEntity;

      uac.value = enInst?.HisUAC;
      const loaders = enInst?._enMap.loaders;
      if (loaders.length > 0) {
        const functions = loaders.map((loader: Function) => loader.bind(enInst)());
        await Promise.all(functions);
      }

      //rowFuncs.value = enInst?._enMap.rms.filter((rm) => rm.IsForEns) as RefMethod[];
      pkField.value = enInst?.PK || '';
      getBatchFunctions();
      await Promise.all([enInst?.Init(), initEnCfg(), prepareConditions(ensInst, enInst), initUserRegedit()]);
      await query();
      // console.log({ enInst });
      simpleColumns.value = [
        ...enInst?._enMap.attrs
          .filter((attr) => attr.UIVisible && attr.Key != enInst?.PK)
          .slice(0, 6)
          .map((attr) => {
            return {
              key: attr.Key,
              title: attr.Desc,
            };
          }),
      ];
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
      error.value = true;
    } finally {
      loading.value = false;
    }
  };
  const GetRowFunc = (row) => {
    rowFuncs.value = enInst?._enMap.rms.filter((rm) => rm.IsForEns) as RefMethod[];
    if (entityWG.value != null) {
      const btns = entityWG.value?.SearchOptBtns;
      let btnDef = '';
      if (typeof btns === 'function') {
        btnDef = btns(row);
      } else if (typeof btns === 'string') {
        btnDef = btns;
      }
      if (!!btnDef) {
        btnDef
          .split(',')
          .filter((item) => !!item)
          .forEach((item) => {
            const refMethod: RefMethod = new RefMethod();
            refMethod.Title = item;
            refMethod.ClassMethod = item;
            refMethod.Tag = 'WaiGua';
            rowFuncs.value.push(refMethod);
          });
      }
    }
  };

  const containerRef = shallowRef<InstanceType<typeof VantList>>();
  let _args_ = '';
  for (const key in props.params) {
    _args_ += `@${key}_${props.params[key]}`;
  }
  const _sk_key = '_ms_' + _args_;
  const { setupElem } = useScrollKeep(_sk_key);
  onMounted(async () => {
    await InitSearch();
    if (containerRef.value) {
      setupElem(containerRef.value.$el);
    }
  });
  // 注销事件处理
  onUnmounted(async () => {
    if (enCfg.IsCond) {
      await resetUserRegedit();
    }
  });

  onActivated(async () => {
    if (!ensInst) return;
    if (!_open_entity_pk) return;
    const en = ensInst.GetNewEntity;
    en.setPKVal(_open_entity_pk);
    const r = await en.Retrieve();
    const _record = Object.fromEntries(en.Row);
    const _idx = dataSource.value.findIndex((d) => d[enInst!.PK] == _open_entity_pk);
    if (_idx == 0) return;
    if (r == 1) dataSource.value.splice(_idx, 1, _record);
    else dataSource.value.splice(_idx, 1);
    _open_entity_pk = '';
  });
</script>

<style lang="less" scoped>
  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }

  .extend-func {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    gap: 10px;
    box-sizing: border-box;

    .func-item {
      height: 80px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #1989fa;
      background-color: #1989fa;
      color: white;
      font-size: 12px;
      flex-direction: column;
    }
  }

  .vant-cell {
    display: grid;
    grid-template-columns: 1fr 2fr 2fr;
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

  .card-item {
    background-color: white;
    padding: 6px;
    margin-bottom: 4px;
    position: relative;
    overflow: hidden;

    .corner-label {
      font-size: 12px;
      line-height: 20px;
      position: absolute;
      height: 20px;
      width: 120px;
      top: 20px;
      text-align: center;
      right: -30px;
      background-color: #1989fa;
      color: white;
      transform: rotate(45deg);
      opacity: 0.8;
    }

    &:nth-child(1) {
      margin-top: 16px;
    }

    .title {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f2f5f7;
      padding: 4px 0;
      font-size: 12px;
      font-weight: bold;

      span {
        margin-left: 10px;
      }
    }

    .body {
      width: 100%;
      font-size: 13px;
      display: flex;
      padding: 4px 12px;

      .left-func-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        button + button {
          margin-top: 12px;
          margin-left: 0 !important;
        }
      }

      .content {
        flex: 3;

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .row-label {
            color: #666;
          }
        }

        .row + .row {
          margin-top: 4px;
        }
      }
    }

    .footer {
      border-top: 1px solid #f2f5f7;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #1989fa;
      padding: 4px 12px;

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

  .tab-buttons {
    position: fixed;
    bottom: env(safe-area-inset-bottom);
    left: 0;
    height: 120px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    z-index: 20;
    background-color: white;

    .pagination {
      height: 20px;
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 14px;
      padding: 10px 14px 0px 14px;
      color: #666;
      background-color: white;
    }

    .btn-list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 32px;
    }
  }

  .van-h5 {
    position: relative;
    padding: 15px 24px;
    margin-bottom: 0;
    color: #000;
    font-size: 15px;
    font-weight: 700;
  }

  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: #1989fa;
  }
</style>
