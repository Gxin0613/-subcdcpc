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
                  <div class="search-keys" :style="searchFieldsStyle">
                    <div class="search-key flex" style="width: 120px">
                      <!-- <div class="label">{{ enCfg.Label || '关键字' }}:</div> -->
                      <Input class="input-search" v-model:value="searchInfo.SearchKey" :placeholder="enCfg.KeyPlaceholder || '请输入关键字'" />
                    </div>
                    <div class="search-key flex" style="width: 130px" v-if="searchInfo.DTSearchWay !== DTSearchWay.None">
                      <Select
                        v-model:value="searchInfo.DTSearchKey"
                        :mode="enCfg.IsSelectMore ? 'multiple' : undefined"
                        style="width: 100%"
                        :virtual="false"
                        :allow-clear="true"
                        :placeholder="'请选择'"
                      >
                        <SelectOption v-for="item in searchInfo.DTSearchKeys" :key="item.value"> {{ item.label }}</SelectOption>
                      </Select>
                    </div>
                    <div class="search-key flex" :style="searchDateFlexWidth" v-if="searchInfo.DTSearchWay !== DTSearchWay.None">
                      <!-- <div class="label">{{ searchInfo.DTSearchLabel }}:</div> -->
                      <NDatePicker
                        v-if="[DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)"
                        :type="DTSearchWay.ByDateTime === searchInfo.DTSearchWay ? 'datetimerange' : 'daterange'"
                        v-model:value="DTRangeSearchKeys"
                        @update-value="dateRangeChange"
                        :update-value-on-close="true"
                        :actions="null"
                        :clearable="true"
                      />
                      <NDatePicker
                        v-else-if="[DTSearchWay.ByYear, DTSearchWay.ByYearMonth].includes(searchInfo.DTSearchWay)"
                        :type="searchInfo.DTSearchWay === DTSearchWay.ByYear ? 'year' : 'month'"
                        v-model:value="searchInfo.DTSearchKey"
                        @update-value="dateChange"
                        :update-value-on-close="true"
                        :actions="null"
                        :clearable="true"
                      />
                    </div>
                    <div class="search-key flex" :style="searchFlexWidth" v-for="condition in [...fkConditions, ...normalConditions]" :key="condition.title">
                      <!-- <div class="label">{{ condition.title }}:</div> -->
                      <template v-if="condition.isBoolean">
                        <RadioGroup v-model:value="condition.selected">
                          <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">{{ item.label }}</RadioButton>
                        </RadioGroup>
                      </template>
                      <template v-else>
                        <Select
                          v-model:value="condition.selected"
                          :mode="enCfg.IsSelectMore ? 'multiple' : undefined"
                          style="width: 100%"
                          :virtual="false"
                          :allow-clear="true"
                          :placeholder="'请选择' + condition.title"
                        >
                          <SelectOption v-for="item in condition.options" :key="item.value"> {{ item.label }}</SelectOption>
                        </Select>
                      </template>
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
                        <Checkbox v-model:checked="item.checked" @change="doChange()" style="margin-bottom: 5px">{{ item.Name }}</Checkbox>
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
                            <template v-else>
                              {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
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
                                <template v-else>
                                  {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
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
  import { nextTick, reactive, ref, shallowRef, computed, VNodeChild } from 'vue';
  import { Spin, message, Card, Row, Col, Checkbox, InputNumber, Tabs, TableSummaryRow, TableSummaryCell, TypographyText, Button, TabPane, Table } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Button as AntButton, Input, Radio, Select, SelectOption, Drawer, Dropdown, Menu, MenuItem, Tooltip } from 'ant-design-vue';
  import { NDatePicker, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
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
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { parseValByType, useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { FieldType } from '/@/bp/en/EnumLab';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Entities } from '/@/bp/en/Entities';

  const { Group: RadioGroup, Button: RadioButton } = Radio;
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
    DTSearchKey: number | null;
    DTSearchLabel: string;
    DTSearchWay: DTSearchWay;
    searchNormals: SearchNormals;
    searchFKEnums: SearchFKEnums;
    hiddenCondition: SearchNormals;
    SearchKey: string;
    DTFrom?: Dayjs;
    DTTo?: Dayjs;
    DTSearchKeys: { label: string; value: any }[];
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
    DTSearchKey: null,
    DTSearchLabel: '',
    DTSearchWay: DTSearchWay.None,
    searchNormals: new SearchNormals(),
    searchFKEnums: new SearchFKEnums(),
    hiddenCondition: new SearchNormals(),
    SearchKey: '',
    DTSearchKeys: [],
  });

  const DTRangeSearchKeys = ref<[number, number] | null>(null);
  const dateRangeChange = (timeStamp: [number, number]) => {
    DTRangeSearchKeys.value = timeStamp;
  };
  const dateChange = (timeStamp: number) => {
    searchInfo.DTSearchKey = timeStamp;
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
    if ([DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)) {
      userRegedit.DTFrom = handleTimestamp(DTRangeSearchKeys.value?.[0]);
      userRegedit.DTTo = handleTimestamp(DTRangeSearchKeys.value?.[1]);
    } else if ([DTSearchWay.ByYear, DTSearchWay.ByYearMonth].includes(searchInfo.DTSearchWay)) {
      userRegedit.DTFrom = handleTimestamp(searchInfo.DTSearchKey);
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
    for (const hiddenCondition of searchInfo.hiddenCondition) {
      const { RefAttrKey, DefaultSymbol, DefaultVal } = hiddenCondition;
      queryArgs += `@${RefAttrKey}${DefaultSymbol}${GloWF.DealExp(DefaultVal, {}) || ''}`;
    }
    userRegedit.Vals = queryArgs;
    return;
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
  const searchFieldsStyle = computed(() => {
    return {
      flexWrap: toggleConditions.value ? 'wrap' : '',
      overflow: toggleConditions.value ? '' : 'hidden',
    };
  });
  const searchFlexWidth = computed(() => {
    return {
      width: '120px',
    };
  });
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
  const initUserRegedit = async () => {
    userRegedit.setPKVal(urMyPK);
    const res = await userRegedit.RetrieveFromDBSources();
    if (res == 0) {
      await resetUserRegedit();
    } else {
      // 范围选择器
      if ([DTSearchWay.ByDate, DTSearchWay.ByDateTime].includes(searchInfo.DTSearchWay)) {
        const fts = getValidDateStr(userRegedit.DTFrom);
        const tts = getValidDateStr(userRegedit.DTTo);
        if (fts == 0 || tts == 0) {
          DTRangeSearchKeys.value = null;
        } else {
          DTRangeSearchKeys.value = [fts, tts];
        }
      } else {
        searchInfo.DTSearchKey = getValidDateStr(userRegedit.DTTo);
      }

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
  // 准备查询条件和列数据
  const prepareConditions = async (_, enInst) => {
    const { getDDLData } = useDDLDataLoader(enInst);
    const { DTSearchLabel, DTSearchWay, searchFKEnums, attrs } = enInst._enMap;
    const searchNormals = enInst?._enMap.searchNormals.filter((condition) => !condition.IsHidden);
    searchInfo.DTSearchKeys = enInst?._enMap.attrs.filter((attr) => attr.MyDataType == 7).map((attr) => ({ label: attr.Desc, value: attr.Key }));

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
          selected: attr.IsBoolean ? '' : [],
          title: '未知条件',
          isBoolean: attr.IsBoolean,
          dataType: attr.MyDataType,
          options: Promise.resolve([]),
        };
      }
      fkConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
      });
    }
    normalConditions.value = [];
    for await (const sn of searchNormals) {
      const attr = attrs.find((attr) => attr.Key === sn.Key);
      if (!attr) {
        return {
          selected: attr.IsBoolean ? '' : [],
          title: '未知条件',
          isBoolean: attr.IsBoolean,
          dataType: attr.MyDataType,
          options: Promise.resolve([]),
        };
      }
      normalConditions.value.push({
        selected: attr.IsBoolean ? '' : [],
        title: attr.Desc,
        key: attr.Key,
        dataType: attr.MyDataType,
        isBoolean: attr.IsBoolean,
        options: attr.IsBoolean ? booleanToRadioGroup() : await getDDLData(attr),
      });
    }
    searchInfo.DTSearchLabel = DTSearchLabel;
    searchInfo.DTSearchWay = DTSearchWay;
    searchInfo.searchNormals = searchNormals;
    searchInfo.searchFKEnums = searchFKEnums;
    searchInfo.hiddenCondition = enInst?._enMap.searchNormals.filter((condition) => condition.IsHidden);
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
            Name:  item.Name,
            checked: false,
            options: data[item.Field].map((obj) => {
              return { value: obj.No, label:obj.Name };
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
          if (center == 0) center += 25;
          else center += 25;
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
      let title = item.Name;
      columns.value.push({
        title: title,
        key: item.KeyOfEn,
        dataIndex: item.KeyOfEn,
        align: 'center',
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
      let data = 0;
      tableData.value.forEach((obj) => {
        data += parseFloat(obj[item.KeyOfEn]);
      });
      if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) totals.value[item.KeyOfEn] = data;
      if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) totals.value[item.KeyOfEn] = (data / tableData.value.length).toFixed(4);
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
    popModal.params = props.params;
    attrsOfGroup.value.forEach((item) => {
      popModal.params[item.KeyOfEn] = record[item.KeyOfEn];
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
      flex: 3;
      display: flex;
      align-items: center;

      .search-key {
        align-items: center;
        width: 33%;
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
</style>
