<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <ThemeWrapper>
      <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <div class="p-4">
          <Spin :spinning="loading" :tip="loadingTips">
            <div v-if="errorObj.errorType === 'error'" class="ant-tag-red">
              <FlowError :doc="errorObj.tips" />
            </div>
            <div v-else-if="errorObj.errorType === 'warning'" class="ant-tag-red">
              <FlowWarning :doc="errorObj.tips" />
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
                      <!-- <template v-if="condition.isBoolean">
                          <RadioGroup v-model:value="condition.selected">
                            <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">{{ item.label }}</RadioButton>
                          </RadioGroup>
                        </template> -->
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
                    <Card size="small" :title="'分组内容'" style="background-color: #f0f0f0; width: 100%; max-height: 33%; margin-bottom: 10px">
                      <label>维度1:</label>
                      <Select
                        v-model:value="w1"
                        style="width: 65%; margin-bottom: 5px; margin-left: 10px"
                        optionFilterProp="label"
                        @select="doChange"
                        :options="ddl1"
                        class="frmStyleType"
                      />
                      <br />
                      <div style="display: inline; margin-left: 77%; position: absolute; margin-top: -13px" @click="changeW(0)">
                        <i class="icon-shuffle" size="18" style="color: rgba(0, 0, 0, 0.85); font-size: 18px"></i
                      ></div>
                      <label>维度2:</label>
                      <Select
                        v-model:value="w2"
                        style="width: 65%; margin-bottom: 5px; margin-left: 10px"
                        optionFilterProp="label"
                        @select="doChange"
                        :options="ddl1"
                        class="frmStyleType"
                      />

                      <br />
                      <div style="display: inline; margin-left: 77%; position: absolute; margin-top: -13px" @click="changeW(1)">
                        <i class="icon-shuffle" size="18" style="color: rgba(0, 0, 0, 0.85); font-size: 18px"></i
                      ></div>
                      <label>维度3:</label>
                      <Select
                        v-model:value="w3"
                        style="width: 65%; margin-bottom: 5px; margin-left: 10px"
                        optionFilterProp="label"
                        @select="doChange"
                        :options="ddl2"
                        class="frmStyleType"
                      />
                      <br />
                    </Card>
                    <Card size="small" :title="'分析数据'" style="background-color: #f0f0f0; width: 100%; margin-bottom: 10px">
                      <template v-for="item in AnalysisArray" :key="item.Field">
                        <Radio v-model:checked="item.checked" @change="doRadioChange(item)" style="margin-bottom: 5px">{{ item.Name }}</Radio>
                        <br />
                      </template>
                    </Card>
                    <Card size="small" :title="'分析方式'" style="background-color: #f0f0f0; width: 100%; margin-bottom: 10px">
                      <RadioGroup v-model:value="analysisType" name="radioGroup" @change="doChange()">
                        <Radio value="AVG">{{ '求平均' }}</Radio>
                        <Radio value="SUM">{{ '求和' }}</Radio>
                      </RadioGroup>
                    </Card>
                  </Col>
                  <!--右侧-->
                  <Col class="gutter-row" :span="16" style="margin: 10px; height: 100%; background-color: white">
                    <div v-if="rerrorObj.hasError" class="ant-tag-red">{{ rerrorObj.tips }}</div>
                    <div v-else>
                      <div style="padding: 0 10px 10px 10px">
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
                                <template v-if="Array.isArray(item.children) && item.children.length > 0">
                                  <template v-for="subItem in item.children" :key="subItem.key">
                                    <TableSummaryCell
                                      v-if="subItem.key != 'SN' && subItem.key != 'indexColumn' && subItem.key != 'Oper'"
                                      style="text-align: center; background-color: #ffff0021"
                                    >
                                      <TypographyText> {{ totals[subItem.key] }}</TypographyText>
                                    </TableSummaryCell>
                                  </template>
                                </template>
                                <template v-else>
                                  <TableSummaryCell
                                    v-if="item.key != 'SN' && item.key != 'indexColumn' && item.key != 'Oper'"
                                    style="text-align: center; background-color: #ffff0021"
                                  >
                                    <TypographyText> {{ totals[item.key] }}</TypographyText>
                                  </TableSummaryCell>
                                </template>
                              </template>
                            </TableSummaryRow>
                          </template>
                        </Table>
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
  import { nextTick, reactive, ref, computed, VNodeChild, unref } from 'vue';
  import { Spin, message, Card, Row, Col, Checkbox, InputNumber, Tabs, TableSummaryRow, TableSummaryCell, TypographyText, Button, TabPane, Table } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Button as AntButton, Input, Radio, Select, SelectOption, Drawer, TreeSelect, Tooltip } from 'ant-design-vue';
  import { NDatePicker, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { DTSearchWay, SearchNormals } from '/@/bp/en/Map/SearchNormal';
  import { SearchFKEnums } from '/@/bp/en/Map/SearchFKEnum';
  import dayjs, { Dayjs } from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import ContrastDtl from './ContrastDtl.vue';
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
  import { Attrs } from '/@/bp/en/Map/Attrs';
  import FlowError from '/@/WF/FlowError.vue';
  import FlowWarning from '/@/WF/FlowWarning.vue';
  const { Group: RadioGroup, Button: RadioButton } = Radio;
  // const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
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
    DTSearchKeys: { label: string; value: any; type: DatePickerType }[];
  }

  const route = useRoute();

  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string);
  const loading = ref(false);
  const loadingTips = ref('');
  const loadingData = ref(false);
  const errorObj = reactive({
    tips: '',
    errorType: 'info',
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

  const columnSize = ref('');

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
      const SelectedGroupKey = w1.value + ',' + w2.value + ',' + w3.value;
      console.log({ SelectedGroupKey });
      queryArgs += '@SelectedGroupKey=' + SelectedGroupKey;
      let StateNumKey = '';
      if (AnalysisArray.value.length == 0) {
        errorObj.errorType = 'warning';
        errorObj.tips = '系统设置错误:缺少分析条件,请检查表单中是否含有可见的数值型字段';
        return false;
      }
      AnalysisArray.value
        .filter((item) => item.checked === true)
        .forEach((item) => {
          StateNumKey += ',' + item.Field + '=' + analysisType.value + ',';
        });
      if (!StateNumKey) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '系统设置错误:请至少选择一个分析条件,';
        return false;
      }
      queryArgs += '@StateNumKey=' + StateNumKey;
      userGroupRegedit.Vals = queryArgs;
      await userGroupRegedit.Update();
      //查询集合
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      const data = await handler.DoMethodReturnJson('Group_Search');
      console.log('group search:', data);
      groupSearch.value = data['MainData'];
      attrsOfNum.value = data['AttrsOfNum'];
      attrsOfGroup.value = data['Sys_MapAttr'];

      //生成数据.
      GenerTable(groupSearch.value, attrsOfNum.value, attrsOfGroup.value);
      //await userRegedit.Retrieve();
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
      errorObj.errorType = 'error';
      errorObj.tips = e as string;
      console.trace(e);
    }
  };

  //分组的项目
  const groupByArray = ref<Record<string, any>[]>([]);
  const AnalysisArray = ref<Record<string, any>[]>([]);
  const analysisType = ref('SUM');
  const isDisabled = ref(false);
  //维度
  const w1 = ref('');
  const w2 = ref('');
  const w3 = ref('');
  const ddl1 = ref<Record<string, any>[]>([]);
  const ddl2 = ref<Record<string, any>[]>([]);
  //表格
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  const tempData = ref(1);
  /**
   * 交换维度
   * @param type
   */
  const changeW = async (type) => {
    if (type === 0) {
      const val = w1.value;
      w1.value = w2.value;
      w2.value = val;
    }
    if (type === 1) {
      if (!w3.value) {
        message.error('维度3的值为空,维度2和维度3不能替换');
        return;
      }
      const val = w2.value;
      w2.value = w3.value;
      w3.value = val;
    }
    await query();
  };
  /**
   * 分组条件，分析项目，图表的选择
   */
  const doChange = async () => {
    const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
    if (selectGroupBy.length > 1) {
      isDisabled.value = true;
    } else {
      isDisabled.value = false;
    }
    await query();
  };
  const doRadioChange = async (selectCheckBox: any = '') => {
    AnalysisArray.value.forEach((item) => {
      if (item.Field == selectCheckBox.Field) {
        item.checked = selectCheckBox.checked;
      } else {
        item.checked = false;
      }
    });
    const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
    if (selectGroupBy.length > 1) {
      isDisabled.value = true;
    } else {
      isDisabled.value = false;
    }
    await query();
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
      if (groupByArray.value.length == 0) {
        errorObj.errorType = 'warning';
        errorObj.tips = '操作提示:该表单不存在分组内容,不可以做报表分析.';
        return false;
      }
      if (groupByArray.value.length == 1) {
        errorObj.errorType = 'warning';
        errorObj.tips = '操作提示:该表单存在一个分组内容,不可以做报表分析.';
        return false;
      }
      ddl2.value.push({
        value: '',
        label: '无',
      });
      groupByArray.value.forEach((item) => {
        ddl1.value.push({
          value: item.Field,
          label: item.Name,
        });
        ddl2.value.push({
          value: item.Field,
          label: item.Name,
        });
      });
      groupByArray.value.map((item) => (item.Checked === 'true' || item.Checked === true ? (item.Checked = true) : (item.Checked = false)));
      const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
      if (selectGroupBy.length === 0 && groupByArray.value.length > 0) {
        w1.value = ddl1.value[0].value;
        w2.value = ddl1.value[1].value;
      }
      if (selectGroupBy.length == 1) w1.value = selectGroupBy[0].Field;
      if (selectGroupBy.length == 2) {
        w1.value = selectGroupBy[0].Field;
        w2.value = selectGroupBy[1].Field;
      }
      if (selectGroupBy.length == 3) {
        w1.value = selectGroupBy[0].Field;
        w2.value = selectGroupBy[1].Field;
        w3.value = selectGroupBy[2].Field;
      }
      data = await handler.DoMethodReturnJson('Group_Analysis');

      const analysis = data['Attrs'];
      if (analysis.length == 0) {
        errorObj.errorType = 'warning';
        errorObj.tips = '操作提示:该表单不存在分析数据,不可以做报表分析.';
        return false;
      }
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
      AnalysisArray.value[0].checked = true;
      userGroupRegedit.setPKVal(myPK);
      const result = await userGroupRegedit.RetrieveFromDBSources();
      if (result === 0) await userGroupRegedit.Insert();
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

  // 聚合3维数据
  const convertTo3DTable = (columns, originalData, attrsOfNum, attrsOfGroup) => {
    const actualConditions = attrsOfGroup.filter((group) => !attrsOfNum.find((attrNum) => attrNum.KeyOfEn == group.KeyOfEn));
    console.log({ actualConditions });
    if (actualConditions.length != 3) {
      rerrorObj.hasError = true;
      rerrorObj.tips = '请选择三个不同维度分析';
      return;
    }
    const tableName = actualConditions.map((item) => item.Name).join(' \\ ');
    // 第一列
    columns.value.push({
      title: tableName,
      key: 'indexColumn',
      width: 200,
      align: 'center',
      customRender: ({ record }) => {
        return record['indexColumn'];
      },
      customCell: () => ({
        style: {
          backgroundColor: '#fafafa', //第一列单元格背景色与列明相同
        },
      }),
    });
    const fKey1 = actualConditions[0].KeyOfEn + 'Text';
    const fKey2 = actualConditions[0].KeyOfEn + 'T';
    const sKey1 = actualConditions[1].KeyOfEn + 'Text';
    const sKey2 = actualConditions[1].KeyOfEn + 'T';
    const tKey1 = actualConditions[2].KeyOfEn + 'Text';
    const tKey2 = actualConditions[2].KeyOfEn + 'T';
    const getConditionVals = (key1: string, key2: string) =>
      originalData.filter((tableItem) => !!tableItem[key1] || !!tableItem[key2]).map((tableItem) => tableItem[key1] || tableItem[key2]);
    // 去重复, 未知值错误值将被过滤
    const firstCondItems = Array.from(new Set(getConditionVals(fKey1, fKey2)));
    const secondCondItems = Array.from(new Set(getConditionVals(sKey1, sKey2)));
    const thirdCondItems = Array.from(new Set(getConditionVals(tKey1, tKey2)));

    // 第二维度列
    secondCondItems.forEach((sItem) => {
      columns.value.push({
        title: sItem,
        key: sItem,
        dataIndex: sItem,
        align: 'center',
        children: thirdCondItems.map((tItem) => {
          return {
            title: tItem,
            key: `${sItem}_${tItem}`,
            dataIndex: `${sItem}_${tItem}`,
            align: 'center',
          };
        }),
      });
    });

    // 统计列
    attrsOfNum.forEach((summary) => {
      columns.value.push({
        title: summary.Name,
        key: summary.KeyOfEn,
        dataIndex: summary.KeyOfEn,
        align: 'center',
        customCell: () => ({
          style: {
            backgroundColor: '#ffff0021', //第一列单元格背景色与列明相同
          },
        }),
      });
    });

    const newTableData: Recordable[] = [];

    for (const fc of firstCondItems) {
      const fTableRows = originalData.filter((tableRow) => tableRow[fKey1] == fc || tableRow[fKey2] == fc);
      console.log({ fTableRows });
      const row = {
        indexColumn: fc,
      };
      for (const sc of secondCondItems) {
        const sTableRow = fTableRows.filter((tableRow) => tableRow[sKey1] == sc || tableRow[sKey2] == sc);
        // row[sc as string] = sTableRow?.Group_Number || 0;

        for (const tc of thirdCondItems) {
          const tableRow = sTableRow.find((tableRow) => tableRow[tKey1] == tc || tableRow[tKey2] == tc);
          row[`${sc}_${tc}`] = tableRow?.[attrsOfNum[0].KeyOfEn] || 0;
        }
      }

      for (const summary of attrsOfNum) {
        const sum = fTableRows.map((row) => parseFloat(row[summary.KeyOfEn] || 0)).reduce((prev, curr) => parseFloat(prev) + parseFloat(curr), 0);
        if (summary.MyDataType != 2) row[summary.KeyOfEn] = sum.toFixed(2);
        else row[summary.KeyOfEn] = sum;
      }
      newTableData.push(row);
    }
    for (const sc of secondCondItems) {
      for (const tc of thirdCondItems) {
        let result = 0;
        for (const tRow of newTableData) {
          result += parseFloat(tRow[`${sc}_${tc}`]);
        }
        totals.value[`${sc}_${tc}`] = result;
      }
    }

    tableData.value = newTableData;
  };
  // 聚合2维数据
  const convertTo2DTable = (columns, originalData, attrsOfNum, attrsOfGroup) => {
    const actualConditions = attrsOfGroup.filter((group) => !attrsOfNum.find((attrNum) => attrNum.KeyOfEn == group.KeyOfEn));
    if (actualConditions.length != 2) {
      rerrorObj.hasError = true;
      rerrorObj.tips = '请选择两个不同维度分析';
      return;
    }
    const tableName = actualConditions.map((item) => item.Name).join(' \\ ');
    // 第一列
    columns.value.push({
      title: tableName,
      key: 'indexColumn',
      width: 200,
      align: 'center',
      customRender: ({ record }) => {
        return record['indexColumn'];
      },
      customCell: () => ({
        style: {
          backgroundColor: '#fafafa', //第一列单元格背景色与列明相同
        },
      }),
    });

    const fKey1 = actualConditions[0].KeyOfEn + 'Text';
    const fKey2 = actualConditions[0].KeyOfEn + 'T';
    const sKey1 = actualConditions[1].KeyOfEn + 'Text';
    const sKey2 = actualConditions[1].KeyOfEn + 'T';

    const getConditionVals = (key1: string, key2: string) =>
      originalData.filter((tableItem) => !!tableItem[key1] || !!tableItem[key2]).map((tableItem) => tableItem[key1] || tableItem[key2]);

    // 去重复
    const firstCondItems = Array.from(new Set(getConditionVals(fKey1, fKey2)));
    const secondCondItems = Array.from(new Set(getConditionVals(sKey1, sKey2)));

    // 第二维度列
    secondCondItems.forEach((sItem) => {
      columns.value.push({
        title: sItem,
        key: sItem,
        dataIndex: sItem,
        align: 'center',
      });
    });

    // 统计列
    attrsOfNum.forEach((summary) => {
      columns.value.push({
        title: summary.Name,
        key: summary.KeyOfEn,
        dataIndex: summary.KeyOfEn,
        align: 'center',
        customCell: () => ({
          style: {
            backgroundColor: '#ffff0021', //第一列单元格背景色与列明相同
          },
        }),
      });
    });

    const newTableData: Recordable[] = [];

    for (const fc of firstCondItems) {
      const fTableRows = originalData.filter((tableRow) => tableRow[fKey1] == fc || tableRow[fKey2] == fc);
      console.log({ fTableRows });
      const row = {
        indexColumn: fc,
      };
      for (const sc of secondCondItems) {
        const tableRow = fTableRows.find((tableRow) => tableRow[sKey1] == sc || tableRow[sKey2] == sc);
        row[sc as string] = tableRow?.[attrsOfNum[0].KeyOfEn] || 0;
      }
      for (const summary of attrsOfNum) {
        const sum = fTableRows.map((row) => parseFloat(row[summary.KeyOfEn] || 0)).reduce((prev, curr) => prev + curr, 0);
        if (summary.MyDataType != 2) row[summary.KeyOfEn] = sum.toFixed(2);
        else row[summary.KeyOfEn] = sum;
      }
      newTableData.push(row);
    }

    for (const sc of secondCondItems) {
      let result = 0;
      for (const tRow of newTableData) {
        result += parseFloat(tRow[sc as string]);
      }
      totals.value[sc as string] = result;
    }

    tableData.value = newTableData;
  };

  const getSelectAnalyTypes = () => {
    let count = 0;
    if (w1.value) count++;
    if (w2.value) count++;
    if (w3.value) count++;
    return count;
  };

  const totals = ref<Record<string, any>>({});
  const GenerTable = (groupSearch, attrsOfNum, attrsOfGroup) => {
    console.log({ groupSearch, attrsOfNum, attrsOfGroup });
    let StateNumKey = '';
    AnalysisArray.value
      .filter((item) => item.checked === true)
      .forEach((item) => {
        if (!!item.selected) StateNumKey += '@' + item.Field + '=' + analysisType.value;
      });

    columns.value = [];
    tableData.value = [];
    // 二维报表
    const selectGroupByCount = getSelectAnalyTypes();

    console.log({ selectGroupByCount });
    if (selectGroupByCount == 2) {
      convertTo2DTable(columns, unref(groupSearch), unref(attrsOfNum), unref(attrsOfGroup));
    } else if (selectGroupByCount == 3) {
      convertTo3DTable(columns, unref(groupSearch), unref(attrsOfNum), unref(attrsOfGroup));
    } else {
      // end
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
        //if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) title = item.Name + '(合计)';
        //if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) title = item.Name + '(平均)';
        columns.value.push({
          title: title,
          key: item.KeyOfEn,
          dataIndex: item.KeyOfEn,
          align: 'center',
        });
      });
      tableData.value = groupSearch;
    }

    attrsOfGroup.forEach((item) => {
      totals.value[item.KeyOfEn + 'T'] = '';
    });
    attrsOfNum.forEach((item) => {
      let data = 0;
      tableData.value.forEach((obj) => {
        data += parseFloat(obj[item.KeyOfEn] || 0);
      });
      if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) totals.value[item.KeyOfEn] = data;
      if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) totals.value[item.KeyOfEn] = (data / tableData.value.length).toFixed(2);
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
