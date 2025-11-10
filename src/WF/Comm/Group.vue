<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <ThemeWrapper>
      <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <div class="p-4">
          <Spin :spinning="loading" :tip="loadingTips">
            <div v-if="errorObj.hasError" class="ant-tag-red">
              {{ errorObj.tips }}
            </div>
            <template v-else>
              <Card class="card-of-head">
                <div class="search-container flex">
                  <div class="search-keys">
                    <div class="search-key flex" style="width: 120px">
                      <Input class="input-search" v-model:value="searchInfo.SearchKey" :placeholder="enCfg.KeyPlaceholder || '请输入关键字'" />
                    </div>
                    <div class="search-key flex" v-for="sf in searchInfo.searchFields" style="width: 120px" :key="sf.label">
                      <Input class="input-search" v-model:value="sf.value" :placeholder="sf.placeholder" />
                    </div>
                    <template v-if="_sn_init">
                      <div class="search-key flex" v-for="sn in searchInfo.searchNumAttrs" :key="sn.label">
                        <NumRangePicker :search-num-attr="sn" @update-range="updateSNRange" />
                      </div>
                    </template>
                    <div class="search-key flex" style="width: 160px" v-if="searchInfo.DTSearchWay !== DTSearchWay.None">
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
                    <div class="search-key flex" :style="searchDateFlexWidth" v-if="[DTSearchWay.ByDate, DTSearchWay.ByDateRange].includes(searchInfo.DTSearchWay)">
                      <NDatePicker v-if="DTSearchConfig.enable" :type="DTSearchConfig.type" v-model:value="DTRangeSearchKeys" clearable :placeholder="searchInfo.DTSearchLabel" />
                    </div>

                    <div v-for="condition in [...fkConditions, ...normalConditions]" class="search-key flex" :style="searchFlexWidth(condition)" :key="condition.title">
                      <div class="label" v-if="condition.isBoolean">{{ condition.title }}:</div>
                      <TreeSelect
                        v-model:value="condition.selected"
                        @change="(key, row) => triggerDDLEvents(key, row, condition.key)"
                        :treeCheckable="false"
                        style="width: 100%"
                        :virtual="false"
                        :allow-clear="true"
                        :placeholder="condition.title"
                        :show-search="true"
                        tree-node-filter-prop="label"
                        :tree-data="condition.options"
                      />
                    </div>
                    <div class="search-key flex">
                      <AntButton type="primary" @click="query()" style="margin-left: 6px">{{ '分析' }}</AntButton>
                    </div>
                  </div>
                </div>
              </Card>
              <Card ref="tableCardWrapper" class="card-of-table">
                <Row :gutter="16" style="height: calc(100vh - 160px)">
                  <!--左侧-->
                  <Col class="gutter-row" :span="6" style="padding-top: 10px">
                    <Card size="small" :title="'分组条件'" style="width: 100%; max-height: 33%; overflow-y: auto; margin-bottom: 10px">
                      <template v-for="item in groupByArray" :key="item.Field">
                        <Checkbox v-model:checked="item.Checked" @change="doChange()" style="margin-bottom: 5px">{{ item.Name }}</Checkbox
                        ><br />
                      </template>
                    </Card>
                    <Card size="small" :title="'分析项目'" style="width: 100%; max-height: 33%; overflow-y: auto; margin-bottom: 10px">
                      <template v-for="item in AnalysisArray" :key="item.Field">
                        <Checkbox v-model:checked="item.checked" @change="doChange()" style="margin-bottom: 5px" class="analy">
                          <Tooltip placement="topLeft" :title="item.Name">
                            {{ item.Name }}
                          </Tooltip>
                        </Checkbox>
                        <Select
                          v-model:value="item.selected"
                          style="width: 140px; margin-bottom: 5px"
                          optionFilterProp="label"
                          :options="item.options"
                          class="frmStyleType"
                          @change="doChange()"
                        />
                        <br />
                      </template>
                    </Card>
                    <Card size="small" :title="'图表'" style="width: 100%; max-height: 26%">
                      宽度:
                      <InputNumber v-model:value="widthVal" :controls="false" stringMode class="frmStyleType" style="margin-bottom: 10px" /><br />
                      高度:
                      <InputNumber v-model:value="heightVal" :controls="false" stringMode class="frmStyleType" style="margin-bottom: 10px" /><br />
                      <Checkbox v-model:checked="isShowPic" :disabled="isDisabled" @change="ChangeIsShowPic">{{ '图表' }}</Checkbox>
                    </Card>
                  </Col>
                  <!--右侧-->
                  <Col class="gutter-row" :span="16" style="margin: 10px; height: 100%; background-color: white">
                    <div v-if="rerrorObj.hasError" class="ant-tag-red">{{ rerrorObj.tips }}</div>
                    <div v-else>
                      <div v-if="isShowPic === false" style="padding: 10px">
                        <Table :columns="columns" :dataSource="tableData" :key="tempData" bordered size="small" :pagination="false">
                          <template #bodyCell="{ column, record, index }">
                            <template v-if="column.key === 'Oper'">
                              <Button type="link" @click="OpenView(record)">{{ '查看' }}</Button>
                            </template>
                            <template v-else-if="column.key === 'SN'">
                              {{ index + 1 }}
                            </template>
                          </template>
                          <template #summary>
                            <TableSummaryRow>
                              <TableSummaryCell style="text-align: center">{{ '汇总' }}</TableSummaryCell>
                              <template v-for="item in columns" :key="item.key">
                                <TableSummaryCell v-if="item.key != 'SN' && item.key != 'Oper'" style="text-align: center">
                                  <TypographyText>{{ totals[item.key] }}</TypographyText>
                                </TableSummaryCell>
                                <TableSummaryCell v-if="item.key === 'Oper'" style="text-align: center">
                                  <TypographyText />
                                </TableSummaryCell>
                              </template>
                            </TableSummaryRow>
                          </template>
                        </Table>
                      </div>
                      <div v-else>
                        <Tabs v-model:activeKey="activeKey" @tabClick="ChageTab" destroyInactiveTabPane>
                          <TabPane key="Table">
                            <template #tab>
                              <span> <i class="icon-info"></i>{{ '分组数据' }}</span>
                            </template>
                            <Table :columns="columns" :dataSource="tableData" :key="tempData" bordered size="small" :pagination="false">
                              <template #bodyCell="{ column, record, index }">
                                <template v-if="column.key === 'Oper'">
                                  <Button type="link" @click="OpenView(record)">{{ '查看' }}</Button>
                                </template>
                                <template v-else-if="column.key === 'SN'">
                                  {{ index + 1 }}
                                </template>
                              </template>
                              <template #summary>
                                <TableSummaryRow>
                                  <TableSummaryCell style="text-align: center">{{ '汇总' }}</TableSummaryCell>
                                  <template v-for="item in columns" :key="item.key">
                                    <TableSummaryCell v-if="item.key != 'SN' && item.key != 'Oper'" style="text-align: center">
                                      <TypographyText>{{ totals[item.key] }}</TypographyText>
                                    </TableSummaryCell>
                                    <TableSummaryCell v-if="item.key === 'Oper'" style="text-align: center">
                                      <TypographyText />
                                    </TableSummaryCell>
                                  </template>
                                </TableSummaryRow>
                              </template>
                            </Table>
                          </TabPane>
                          <TabPane key="Bar">
                            <template #tab>
                              <span> <i class="icon-chart"></i>{{ '柱状图' }}</span>
                            </template>
                            <div id="Bar" style="width: 100%; height: 400px">{{ '柱状图' }}</div>
                          </TabPane>
                          <TabPane key="Pie">
                            <template #tab>
                              <span> <i class="icon-pie-chart"></i>{{ '饼图' }}</span>
                            </template>
                            <div id="Pie" style="width: 100%; height: 400px">{{ '饼状图' }}</div>
                          </TabPane>
                          <TabPane key="Line">
                            <template #tab>
                              <span> <i class="icon-graph"></i>{{ '折线图' }}</span>
                            </template>
                            <div id="Line" style="width: 100%; height: 400px">{{ '折线图' }}</div>
                          </TabPane>
                        </Tabs>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </template>
          </Spin>
        </div>
      </NConfigProvider>
      <Drawer
        v-model:open="popModal.visible"
        :title="popModal.title"
        :width="popModal.width"
        centered
        :bodyStyle="{
          padding: '0px 12px !important',
        }"
        :footer="null"
      >
        <ContrastDtl :params="popModal.params" :key="tempateData" />
      </Drawer>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { nextTick, reactive, ref, computed, VNodeChild, h } from 'vue';
  import { Spin, message, Card, Row, Col, Checkbox, InputNumber, Tabs, TableSummaryRow, TableSummaryCell, TypographyText, Button, TabPane, Table } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Button as AntButton, Input, Radio, Select, SelectOption, Drawer, TreeSelect, Tooltip } from 'ant-design-vue';
  import { NDatePicker, NConfigProvider, zhCN, dateZhCN, NTag } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { DTSearchWay, SearchNormals } from '/@/bp/en/Map/SearchNormal';
  import { SearchFKEnums } from '/@/bp/en/Map/SearchFKEnum';
  import dayjs, { Dayjs } from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import ContrastDtl from './ContrastDtl.vue';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart } from 'echarts/charts';
  import { PieChart } from 'echarts/charts';
  import { LineChart } from 'echarts/charts';
  import * as echarts from 'echarts/core';
  import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
  import { LabelLayout, UniversalTransition } from 'echarts/features';
  import { Entity } from '/@/bp/en/Entity';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import { useRoute } from 'vue-router';
  import { DataType } from '/@/bp/en/DataType';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { parseValByType, useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Entities } from '/@/bp/en/Entities';
  import { SearchFields } from '/@/bp/en/Map/SearchFields';
  import { ExtModel } from '/@/bp/en/Map/EnMapExt';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { DatePickerRangeType, DatePickerType } from '/@/bp/en/Map/Attr';
  import NumRangePicker from '/@/WF/Comm/subComponents/NumRangePicker.vue';
  import { SearchNumAttr, SearchNumAttrs } from '/@/bp/en/Map/SearchNumAttr';
  import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  // const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  // 初始化echarts
  echarts.use([
    GridComponent,
    LineChart,
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
    LegendComponent,
    ToolboxComponent,
    UniversalTransition,
    LabelLayout,
    CanvasRenderer,
  ]);

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
    DTSearchKeys: { label: string; value: any; type: DatePickerType }[];
  }

  const route = useRoute();

  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string);
  const loading = ref(false);
  const loadingTips = ref('');
  const loadingData = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const rerrorObj = reactive({
    tips: '',
    hasError: false,
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
  const DTRangeSearchKeys = ref<[number, number] | null>(null);
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
  // 处理时间日期
  const getFormats = (type: DTSearchWay) => {
    const formatsDef = ['', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm', 'YYYY-MM', 'YYYY'];
    return formatsDef[type];
  };

  const enCfg = reactive<EnCfg>(new EnCfg());
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
  const myPK = webUser.No + EnName + '_Group';
  // UserRegedit为查询对象
  const userGroupRegedit = reactive<UserRegedit>(new UserRegedit());

  let ensInst: Nullable<Entities> = null;
  let enInst: Nullable<Entity> = null;
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

    await userRegedit.Save();
  };

  const handleTimestamp = (ts: number | undefined | null) => {
    if (ts) {
      return dayjs(ts).locale('zh-cn').format(getFormats(searchInfo.DTSearchWay));
    }
    return '';
  };
  // 更新查询条件
  const updateSearchCondition = async () => {
    // 处理关键字
    userRegedit.SearchKey = searchInfo.SearchKey || '';
    // 处理时间
    if (searchInfo.DTSearchWay === DTSearchWay.ByDateRange) {
      userRegedit.DTFrom = handleTimestamp(DTRangeSearchKeys.value?.[0]);
      userRegedit.DTTo = handleTimestamp(DTRangeSearchKeys.value?.[1]);
    } else if (searchInfo.DTSearchWay === DTSearchWay.ByDate && !!searchInfo.DTVals) {
      userRegedit.DTFrom = handleTimestamp(parseInt(searchInfo.DTVals) || 0);
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
    const { key, enable } = enInst!.LogicDelConfig;
    if (enable) {
      queryArgs += `@${key}=0`;
    }
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

  interface MenuInfo {
    key: string;
    keyPath: string[];
    item: VNodeChild;
    domEvent: MouseEvent;
  }
  const columnSize = ref('');
  const onClick = ({ key }: MenuInfo) => {
    console.log(`Click on item ${key}`);
    columnSize.value = key;
    console.log(columnSize.value);
  };

  // 控制查询条件展开/折叠
  const toggleConditions = ref(false);

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
  const totalConditions = computed(() => {
    let conditionCount = 1; // 关键字
    if (searchInfo.DTSearchWay !== DTSearchWay.None) {
      conditionCount += 1;
    }
    return (conditionCount += [...fkConditions.value, ...normalConditions.value].length);
  });
  const getValidDateStr = (str: string) => (str.includes('-') ? dayjs(str).valueOf() : 0);
  const _sn_init = ref(false);
  const initUserRegedit = async () => {
    userRegedit.setPKVal(urMyPK);
    const res = await userRegedit.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit();
    } else {
      // @ts-ignore
      const { searchNumAttrs } = enInst?._enMap;
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
    }

    // 处理url传入的查询key，时间
    const SearchKey = route.query.SearchKey || '';
    const DTFrom = route.query.DTFrom || '';
    const DTTo = route.query.DTTo || '';
    if (SearchKey) userRegedit.SearchKey = SearchKey as string;
    if (DTFrom) userRegedit.DTFrom = DTFrom as string;
    if (DTTo) userRegedit.DTTo = DTTo as string;
    userGroupRegedit.setPKVal(myPK);
    const result = await userGroupRegedit.RetrieveFromDBSources();
    if (result === 0) await userGroupRegedit.Insert();
  };

  const query = async () => {
    try {
      rerrorObj.hasError = false;
      rerrorObj.tips = '';
      loadingData.value = true;
      await updateSearchCondition();
      userRegedit.SearchKey = searchInfo.SearchKey;
      await userRegedit.Update();

      let queryArgs = '';

      const SelectedGroupKey = groupByArray.value
        .filter((item) => item.Checked == true)
        .map((item) => {
          return item.Field;
        });
      if (SelectedGroupKey.length === 0) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '至少选择一项分组项目';
        return false;
      }
      queryArgs += '@SelectedGroupKey=' + SelectedGroupKey.join(',');
      let StateNumKey = '';
      AnalysisArray.value
        .filter((item) => item.checked === true)
        .forEach((item) => {
          if (!!item.selected) StateNumKey += ',' + item.Field + '=' + item.selected + ',';
        });
      if (!StateNumKey) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '至少选择一项分析条件';
        return false;
      }
      queryArgs += '@StateNumKey=' + StateNumKey;
      userGroupRegedit.Vals = queryArgs;
      await userGroupRegedit.Update();
      //查询集合
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      const data = await handler.DoMethodReturnJson('Group_Search');
      groupSearch.value = data['MainData'];
      attrsOfNum.value = data['AttrsOfNum'];
      attrsOfGroup.value = data['Sys_MapAttr'];
       const en = AnalysisArray.value.find((item) => item.checked === true && item.Field === 'Group_Percentage');
      if(en!=null){
        //处理占比数据
        let count = 0;
        groupSearch.value.forEach(item=>{
          count+=parseFloat(item['Group_Percentage']);
        });
        groupSearch.value.forEach(item=>{
          if(en.selected ==="Perm")
            item['Group_Percentage'] = (parseFloat((item['Group_Percentage']/count).toFixed(4))*1000).toFixed(2)+'‰' ;
          else
           item['Group_Percentage'] = (parseFloat((item['Group_Percentage']/count).toFixed(4))*100).toFixed(2)+'%' ;
        });
      }
      GenerTable(groupSearch.value, attrsOfNum.value, attrsOfGroup.value);
      await userRegedit.Retrieve();
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loadingData.value = false;
    }
  };
  // 查询条件 end

  const booleanToRadioGroup = () => {
    return [
      { label: '全部', value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ];
  };
  const outerQueryPrefix = 's_key_';
  // 准备查询条件和列数据
  const prepareConditions = async (_, enInst) => {
    const { getDDLData } = useDDLDataLoader(enInst);
    const { DTSearchLabel, DTSearchWay, searchNumAttrs, searchFields, searchFKEnums, attrs } = enInst?._enMap;
    console.log({ DTSearchWay });
    const searchNormals = enInst?._enMap.searchNormals.filter((condition) => !condition.IsHidden);
    for (const searchField of searchFields) {
      searchField.value = props.params[outerQueryPrefix + searchField.searchKey] || route.query[searchField.searchKey] || '';
    }
    searchInfo.DTSearchKeys = enInst?._enMap.attrs
      .filter((attr) => attr.MyDataType == DataType.AppDate || attr.MyDataType == DataType.AppDateTime)
      .map((attr) => ({ label: attr.Desc, value: attr.Key + '', type: attr.DateConfig?.type || 'year' }));
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
      const ddls = await getDDLData(attr);
      fkConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        width: sn.Width,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        options: attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : [{ value: '', label: '全部', text: '全部' }, ...ddls],
      });
    }
    normalConditions.value = [];
    for await (const sn of searchNormals) {
      const attr = attrs.find((attr) => attr.Key === sn.Key);
      if (!attr) continue;
      const ddls = await getDDLData(attr);
      normalConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        width: sn.Width,
        options: attr.IsBoolean ? booleanToRadioGroup(attr.Desc) : [{ value: '', label: '全部', text: '全部' }, ...ddls],
      });
    }

    searchInfo.searchFields = searchFields;
    searchInfo.DTSearchLabel = DTSearchLabel;
    searchInfo.DTSearchWay = DTSearchWay;

    searchInfo.searchNormals = searchNormals;
    searchInfo.searchFKEnums = searchFKEnums;
    searchInfo.searchNumAttrs = searchNumAttrs;
    searchInfo.hiddenCondition = enInst?._enMap.searchNormals.filter((condition) => condition.IsHidden);
  };

  const triggerDDLEvents = async (key, row, cfgKey) => {
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
      triggerItem.selected = undefined;
    }
  };

  // 初始化Search页面
  const InitSearch = async () => {
    try {
      const ens = await ClassFactory.GetEns(EnName as string);
      ensInst = ens;
      enInst = ens.GetNewEntity;
      await enInst?.Init();
      await initEnCfg();
      await prepareConditions(ensInst, enInst);
      await initUserRegedit();
      await query();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    }
  };

  //分组的项目
  const groupByArray = ref<Record<string, any>[]>([]);
  const AnalysisArray = ref<Record<string, any>[]>([]);
  const widthVal = ref(800);
  const heightVal = ref(460);
  const isShowPic = ref(true);
  const isDisabled = ref(false);
  const activeKey = ref('Table');
  //表格
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const tempData = ref(1);

  const ChangeIsShowPic = () => {
    if (isShowPic.value) activeKey.value = 'Table';
  };
  const enumMains = ref<Record<string, any>[]>([]);
  const enums = ref<Record<string, any>[]>([]);
  const sysLang = WebUser.SysLang || 'CH';
  /**
   * 初始化数据
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      let data = await handler.DoMethodReturnJson('Group_ContentAttrs');
      groupByArray.value = data['Attrs'];
      enumMains.value = data['EnumMain'];
      enums.value = data['Enums'];
      groupByArray.value.map((item) => (item.Checked === 'true' ? (item.Checked = true) : (item.Checked = false)));
      const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
      if (selectGroupBy.length === 0 && groupByArray.value.length > 0) groupByArray.value[0].Checked = true;
      if (selectGroupBy.length > 1) {
        isDisabled.value = true;
        isShowPic.value = false;
      }
      data = await handler.DoMethodReturnJson('Group_Analysis');

      const analysis = data['Attrs'];
      analysis.forEach((item) => {
        if(!!data[item.Field]){
          const select = data[item.Field].filter((obj) => obj.Selected === 'true');
          AnalysisArray.value.push({
            Field: item.Field,
            Name: item['Name' + sysLang] || item.Name,
            checked: false,
            options: data[item.Field].map((obj) => {
              return { value: obj.No, label: obj['Name' + sysLang] || obj.Name };
            }),
            selected: select.length === 0 ? data[item.Field][0].No : select[0].No,
          });
        }
      });
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
    await InitSearch();
  };

  const groupSearch = ref<Record<string, any>[]>([]);
  const attrsOfNum = ref<Record<string, any>[]>([]);
  const attrsOfGroup = ref<Record<string, any>[]>([]);

  /**
   * 分组条件，分析项目，图表的选择
   */
  const doChange = async () => {
    const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
    if (selectGroupBy.length > 1) {
      isDisabled.value = true;
      isShowPic.value = false;
    } else {
      isDisabled.value = false;
      isShowPic.value = true;
    }
    await query();
  };
  const ChageTab = (curactiveKey) => {
    activeKey.value = curactiveKey;

    nextTick().then(() => {
      if (activeKey.value === 'Bar') barChart();
      if (activeKey.value === 'Pie') pieChart();
      if (activeKey.value === 'Line') lineChart();
    });
  };
  //柱状图
  const barChart = () => {
    const barObj = document.getElementById('Bar');
    if (!!barObj) {
      // 基于准备好的dom，初始化echarts实例
      const barChart = echarts.init(barObj);
      const xAxisData: any[] = [];
      groupSearch.value.forEach((item) => {
        xAxisData.push(item[attrsOfGroup.value[0].KeyOfEn + 'Text'] || item[attrsOfGroup.value[0].KeyOfEn + 'T'] || item[attrsOfGroup.value[0].KeyOfEn]);
      });
      const seriesData: any[] = [];
      attrsOfNum.value.forEach((item) => {
        if (!!item.Name) {
          const data: any[] = [];
          groupSearch.value.forEach((obj) => {
            data.push(obj[item.KeyOfEn]);
          });
          seriesData.push({
            name: item.Name,
            data: data,
            type: 'bar',
            smooth: true,
          });
        }
      });
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData,
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: seriesData,
      };
      barChart.setOption(option);
    }
  };
  //饼状图
  const pieChart = () => {
    const pieObj = document.getElementById('Pie');
    if (!!pieObj) {
      const pieChart = echarts.init(pieObj);
      const series: any = [];
      const dataSet: any[] = [];
      const xAxisData: any[] = [];
      groupSearch.value.forEach((item) => {
        dataSet.push(item[attrsOfGroup.value[0].KeyOfEn + 'Text'] || item[attrsOfGroup.value[0].KeyOfEn + 'T'] || item[attrsOfGroup.value[0].KeyOfEn]);
        xAxisData.push(item[attrsOfGroup.value[0].KeyOfEn + 'Text'] || item[attrsOfGroup.value[0].KeyOfEn + 'T'] || item[attrsOfGroup.value[0].KeyOfEn]);
      });
      let center = 0;
      attrsOfNum.value.forEach((item) => {
        if (!!item.Name) {
          const data: any[] = [];
          groupSearch.value.forEach((obj) => {
            data.push({
              value: obj[item.KeyOfEn],
              name: obj[attrsOfGroup.value[0].KeyOfEn + 'Text'] || obj[attrsOfGroup.value[0].KeyOfEn + 'T'] || obj[attrsOfGroup.value[0].KeyOfEn],
            });
          });
          const num = attrsOfNum.value.length;
          if (center == 0) center += 100 / num - num;
          else center += 100 / num - num;
          dataSet.push(data);
          series.push({
            name: item.Name,
            data: data,
            type: 'pie',
            center: [center + '%', '50%'], //圆心横坐标、纵坐标
            radius: '40%',
            seriesLayoutBy: 'row',
            encode: {
              itemName: 0, //数据项名称，在legend中展示
              value: 1,
            },
            label: {
              show: false,
            },
          });
        }
      });
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          // orient 设置布局方式，默认水平布局，可选值：'horizontal'（水平） ¦ 'vertical'（垂直）
          orient: 'vertical',
          // x 设置水平安放位置，默认全图居中，可选值：'center' ¦ 'left' ¦ 'right' ¦ {number}（x坐标，单位px）
          x: 'left',
          // y 设置垂直安放位置，默认全图顶端，可选值：'top' ¦ 'bottom' ¦ 'center' ¦ {number}（y坐标，单位px）
          y: 'center',
          type: 'scroll', // 设置图例的类型。可选值：'plain' ¦ 'scroll'。（'plain'：普通图例。缺省就是普通图例，'scroll'：可滚动翻页的图例。当图例数量较多时可以使用。）
          itemWidth: 24, // 设置图例图形的宽
          itemHeight: 18, // 设置图例图形的高
          textStyle: {
            color: '#666', // 图例文字颜色
          },
          // itemGap设置各个item之间的间隔，单位px，默认为10，横向布局时为水平间隔，纵向布局时为纵向间隔
          itemGap: 10,
          //backgroundColor: '#f8f8f8',  // 设置整个图例区域背景颜色
          data: xAxisData,
        },
        dataset: {
          source: dataSet,
        },
        series: series,
      };
      pieChart.setOption(option);
    }
  };
  //折线
  const lineChart = () => {
    const lineObj = document.getElementById('Line');
    if (!!lineObj) {
      const xAxisData: any[] = [];
      groupSearch.value.forEach((item) => {
        xAxisData.push(item[attrsOfGroup.value[0].KeyOfEn + 'Text'] || item[attrsOfGroup.value[0].KeyOfEn + 'T'] || item[attrsOfGroup.value[0].KeyOfEn]);
      });
      const seriesData: any[] = [];
      attrsOfNum.value.forEach((item) => {
        if (!!item.Name) {
          const data: any[] = [];
          groupSearch.value.forEach((obj) => {
            data.push(obj[item.KeyOfEn]);
          });
          seriesData.push({
            name: item.Name,
            data: data,
            type: 'line',
            smooth: true,
          });
        }
      });
      const lineChart = echarts.init(lineObj);
      const option = {
        xAxis: {
          type: 'category',
          data: xAxisData,
        },
        yAxis: {
          type: 'value',
        },
        series: seriesData,
        grid: {
          top: '5%',
          right: '1%',
          left: '1%',
          bottom: '10%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
        },
      };
      lineChart.setOption(option);
    }
  };
  const totals = ref<Record<string, any>>({});
  const GenerTable = (groupSearch, attrsOfNum, attrsOfGroup) => {
    let StateNumKey = '';
    AnalysisArray.value
      .filter((item) => item.checked === true)
      .forEach((item) => {
        if (!!item.selected) StateNumKey += '@' + item.Field + '=' + item.selected;
      });

    columns.value = [];
    tableData.value = [];
    columns.value.push({
      title: '序',
      key: 'SN',
      width: 50,
      align: 'center',
      customRender: ({ index }) => {
        return `${index + 1}`;
      },
    });
    attrsOfGroup.forEach((item) => {
      let enumList = enums.value?.filter((en) => en.EnumKey == item.UIBindKey) || [];
      let enumConfigs = enumMains.value?.filter((en) => en.EnumKey == item.UIBindKey) || [];
      if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) {
        enumConfigs = enumConfigs.filter((enumMain) => enumMain.OrgNo == WebUser.OrgNo || parseInt(enumMain.IsShare) === 1);
      }
      item.enumList = enumList;
      item.enableEnumColor = enumConfigs.length == 0 ? false : enumConfigs[0].EnableColor == 1;
      let title = item.Name;
      columns.value.push({
        title: title,
        key: item.KeyOfEn,
        dataIndex: item.KeyOfEn,
        align: 'center',
        customRender: ({ _text, record, _column }: Recordable) => {
          if (!item.enableEnumColor)
            return h(
              'span',
              {},
              {
                default: () => {
                  if (item.enumList.length == 0) return record[item.KeyOfEn];
                  const rowVal = record[item.KeyOfEn] === -1 ? '无' : record[`${item.KeyOfEn}Text`] || record[`${item.KeyOfEn}T`] || record[item.KeyOfEn];
                  const enumVal = item.enumList.find((enumItem) => enumItem.StrKey == rowVal || enumItem.IntKey == rowVal)?.Lab;
                  return enumVal || rowVal;
                },
              },
            );
          const rowVal = record[`${item.KeyOfEn}Text`] || record[`${item.KeyOfEn}T`] || record[item.KeyOfEn];
          const colorVal = item.enumList?.find((enumItem) => enumItem.IntKey == record[item.KeyOfEn])?.ValColor || '#000';
          const styleConfig = {
            maxWidth: (item.UIWidth < rowVal.length * 20 ? rowVal.length * 20 : item.UIWidth) + 'px',
          };
          const getTextColor = (c: string) => {
            const lc = c.toLowerCase();
            const lightBg = ['white', '#fff', '#ffffff', 'yellow'];
            if (lightBg.includes(lc)) {
              return 'black';
            }
            return 'white';
          };
          return h(
            NTag,
            { style: styleConfig, color: { color: colorVal, textColor: getTextColor(colorVal) }, size: 'small' },
            {
              default: () => {
                const rowVal = record[`${item.KeyOfEn}Text`] || record[`${item.KeyOfEn}T`] || record[item.KeyOfEn];
                const enumVal = item.enumList.find((enumItem) => enumItem.StrKey == rowVal || enumItem.IntKey == rowVal)?.Lab;
                return enumVal || rowVal;
              },
            },
          );
        },
      });
    });

    columns.value.push({
      title: '操作',
      key: 'Oper',
      dataIndex: 'Oper',
      align: 'center',
    });
    tableData.value = groupSearch;
    attrsOfGroup.forEach((item) => {
      totals.value[item.KeyOfEn + 'T'] = '';
    });
    attrsOfNum.forEach((item) => {
      if(item.KeyOfEn !='Group_Percentage'){
        let data = 0;
        tableData.value.forEach((obj) => {
          const val = !obj[item.KeyOfEn] ? 0 : parseFloat(obj[item.KeyOfEn]);
          data += val;
        });
        if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) totals.value[item.KeyOfEn] = item.MyDataType === 2 ? data.toFixed(0) : data.toFixed(4);
        if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG'))
          totals.value[item.KeyOfEn] = item.MyDataType === 2 ? (data / tableData.value.length).toFixed(0) : (data / tableData.value.length).toFixed(4);
      }
      
    });
    tempData.value++;
  };
  /**
   * 查看详情
   * @param record
   * @constructor
   */
  //弹窗显示
  const popModal = reactive({
    title: '查看详情',
    visible: false,
    width: window.innerWidth * 0.7,
    params: {},
  });
  const tempateData = ref(0);
  const OpenView = (record) => {
    popModal.title = ensInst.GetNewEntity._enMap.EnDesc + ':查看详情';
    popModal.visible = true;
    popModal.params['EnName'] = props.params.EnName;
    const keys = ',' + groupByArray.value.map((item) => item.Field).join(',') + ',';
    attrsOfGroup.value.forEach((item) => {
      if (keys.includes(',' + item.KeyOfEn + ',')) popModal.params[item.KeyOfEn] = record[item.KeyOfEn];
    });
    tempateData.value++;
  };
  InitPage();
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
  }
  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }
  .card-of-table {
    border-radius: 0;
    margin-top: 12px;
  }

  .search-container {
    align-items: center;

    .search-keys {
      flex: 4;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .search-key {
        align-items: center;
        width: 20%;
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
  //列名加粗
  :deep(.n-data-table .n-data-table-th .n-data-table-th__title-wrapper .n-data-table-th__title) {
    font-weight: 550;
  }
  :deep(.analy .ant-checkbox + span) {
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 60px;
    display: inline-block;
    overflow: hidden;
  }
</style>
