<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <template v-else>
          <Card class="card-of-head" style="background-color: #f9f9f9">
            <div class="search-container">
              <div class="search-keys">
                <div class="search-key" style="max-width: 150px">
                  <Input v-model:value="keyword" :placeholder="'请输入'">
                    <template #prefix>
                      <SearchOutlined />
                    </template>
                  </Input>
                </div>
                <div class="search-key" style="max-width: 150px">
                  <Select v-model:value="flowRange.value" style="width: 100%" :allow-clear="true" :placeholder="'请选择范围'">
                    <SelectOption v-for="item in flowRange.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" style="max-width: 150px">
                  <Select v-model:value="flowStatus.value" style="width: 100%" :allow-clear="true" :placeholder="'请选择状态'">
                    <SelectOption v-for="item in flowStatus.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" v-for="condition in customQueryCondition" :key="condition.key">
                  <div class="label" v-if="condition.label">{{ condition.label }}</div>
                  <RadioGroup v-if="condition.display === 'radio'" v-model:value="condition.value">
                    <RadioButton v-for="item in condition.options" :key="item.value" :value="item.value">{{ item.label }}</RadioButton>
                  </RadioGroup>
                  <Select
                    v-else-if="condition.display === 'select'"
                    v-model:value="condition.value"
                    :mode="condition.isMultiSelect ? 'multiple' : undefined"
                    style="width: 120px"
                    :allow-clear="true"
                    :placeholder="'请选择' + condition.label"
                  >
                    <SelectOption v-for="item in condition.options" :key="item.value"> {{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div class="search-key" style="max-width: 215px">
                  <RangePicker v-model:value="dateRange" :placeholder="[`发起日期从`, `到`]" :clearable="true" />
                </div>
                <div class="search-key" style="max-width: 250px">
                  <AntButton type="primary" @click="query"><i class="icon-chart" style="margin-right: 5px"></i>{{ '分析' }}</AntButton>
                </div>
              </div>
              <!-- <div class="search-buttons">
                <Select v-model:value="feature.value" style="width: 100%; margin-left: 12px" :allow-clear="true" :placeholder="'选择范围'" @select="changeFeature">
                  <SelectOption v-for="item in feature.options" :key="item.value">
                    <i :class="item.icon" style="margin-right: 5px"></i><span>{{ item.label }}</span></SelectOption
                  >
                </Select>
              </div> -->
            </div>
          </Card>
          <div style="height: calc(100vh - 164px)">
            <Row :gutter="16" style="height: 100%">
              <!--左侧-->
              <Col class="gutter-row" :span="6" style="padding-top: 10px">
                <Card size="small" :title="'分组条件'" style="width: 100%; max-height: 35%; overflow-y: auto; margin-bottom: 10px">
                  <template v-for="item in groupByArray" :key="item.Field">
                    <Checkbox v-model:checked="item.Checked" @change="doChange()" style="margin-bottom: 5px">{{ item.Name }}</Checkbox
                    ><br />
                  </template>
                </Card>
                <Card size="small" :title="'分析项目'" style="width: 100%; max-height: 35%; overflow-y: auto; margin-bottom: 10px">
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
                <Card size="small" :title="'图表'" style="width: 100%; max-height: 20%">
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
                    <Table :columns="columns" :data-source="tableData" :key="tempData" bordered size="small" :pagination="false" />
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
                              {{ record[column.key] }}
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
          </div>
        </template>
      </Spin>
      <Drawer
        v-model:open="popModal.visible"
        :title="popModal.title"
        :width="popModal.width"
        centered
        :bodyStyle="{
          padding: '0px 12px !important',
        }"
        :footer="null"
        :style="500"
      >
        <ContrastDtl :params="popModal.params" :key="tempateData" />
      </Drawer>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { nextTick, reactive, ref, shallowRef } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { Spin, message, Card, Row, Col, Checkbox, InputNumber, Tabs, TableSummaryRow, TableSummaryCell, TypographyText, Button, TabPane, Table } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Button as AntButton, RangePicker, Input, Select, SelectOption, Drawer, Tooltip } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
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
  import { FlowExt } from '/@/WF/Admin/AttrFlow/FlowExt';
  import { downloadByData } from '/@/utils/file/download';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Entity from '../Admin/FoolFormDesigner/dto/Entity';
  import WebUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { AtPara } from '/@/bp/da/AtPara';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { SysEnums } from '../Admin/FrmLogic/SysEnum/SysEnum';
  import { SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';

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
  type RangeValue = [Dayjs, Dayjs];
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();

  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const rerrorObj = reactive({
    tips: '',
    hasError: false,
  });
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const flowNo = ref(props.params.FlowNo || props.params.PKVal?.replace('FlowRpt', ''));
  const keyword = ref('');
    // 自定义查询条件
  type CustomCondition = Array<{ label: string; key: any; display: 'select' | 'radio'; options: Array<{ label: string; value: string }>; value: any; isMultiSelect: boolean }>;
  const customQueryCondition = ref<CustomCondition>([]);
  //参与范围
  const flowRange = reactive({
    value: 0,
    options: [
      {
        label: '我参与的',
        value: 0,
      },
      {
        label: '我发起的',
        value: 1,
      },
      {
        label: '全部范围',
        value: 2,
      },
    ],
  });
  //流程状态
  const flowStatus = reactive({
    // WebUser.IsAdmin ? 2 :
    value: 0,
    options: [
      {
        label: '新工作',
        value: 0,
      },
      {
        label: '归档',
        value: 1,
      },
      {
        label: '其他',
        value: 2,
      },
      {
        label: '全部状态',
        value: 3,
      },
    ],
  });
  //参与范围
  const feature = reactive({
    value: 0,
    options: [
      {
        label: '发起',
        value: 0,
        icon: 'icon-paper-plane',
      },
      {
        label: '查询',
        value: 1,
        icon: 'icon-notebook',
      },
      {
        label: '导出',
        value: 2,
        icon: 'icon-logout',
      },
    ],
  });
  const changeFeature = (value) => {
    console.log(value);
    getOptionLabel(value);
    console.log(getOptionLabel(value));
    switch (getOptionLabel(value)) {
      case '发起':
        createNewFlow();
        break;
      case '查询':
        lookUp();
        break;
      case '导出':
        deriveFlow();
        break;
    }
  };
  const getOptionLabel = (value) => {
    const option = feature.options.find((option) => option.value === value);
    return option ? option.label : null;
  };
  const createNewFlow = async () => {
    //#穿透页面url地址
    const url = `/#/WF/MyFlow?FlowNo=${flowNo.value}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  };
  //跳转查询
  const lookUp = () => {
    const url = `/src/WF/Rpt/SearchFlow.vue?FlowNo=${flowNo.value}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  };
  //导出
  const deriveFlow = async () => {
    const flow = new Entity('BP.WF.Flow', flowNo.value);
    await flow.Init();

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
    handler.AddPara('FlowNo', flowNo.value);
    const data = await handler.DoMethodReturnString('ExpFlowTemplete');
    downloadByData(data, flow.getData().Name + '.xml', 'xml');
    return new GPNReturnObj(GPNReturnType.DoNothing, '');
  };
  // 获取本月初时间
  //const startOfMonth = dayjs().startOf('month');
  // 获取本月末时间
  //const endOfMonth = dayjs().endOf('month');
  //const dateRange = ref<RangeValue>([startOfMonth, endOfMonth]);
  const dateRange = ref<RangeValue>();
  const flow = ref<Record<string, any>>({});

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
    const frmID = 'FlowRpt' + flowNo.value;
  const PKVal = WebUser.No + frmID + '_SearchAttrs';
  const userRegedit = reactive(new UserRegedit());
  const createUserRegedit = async () => {
    userRegedit.MyPK = PKVal;
    userRegedit.SearchKey = '';
    userRegedit.AtPara = '';
    userRegedit.DTFrom = '';
    userRegedit.DTTo = '';
    userRegedit.FK_Emp = WebUser.No;
    userRegedit.CfgKey = 'SearchAttrs';
    userRegedit.Vals = '';
    userRegedit.FK_MapData = '';
    userRegedit.OrderBy = '';
    userRegedit.OrderWay = '';
    await userRegedit.Insert();
  };
  const InitUserRegedit = async () => {
    userRegedit.setPKVal(PKVal);
    const code = await userRegedit.RetrieveFromDBSources();
    if (code == 0) {
      await createUserRegedit();
    } 
  };
  const updateUR = async () => {
    let queryArgs = '';
    for (const condition of customQueryCondition.value) {
      if (condition.value) {
        queryArgs += `@${condition.key}=${condition.value}`;
      }
    }
    userRegedit.Vals = queryArgs;
    await userRegedit.Update();
    await userRegedit.RetrieveFromDBSources();
  };
  // 初始化自定义查询条件
  const initCustomQC = async () => {
    const frmID = 'FlowRpt' + flowNo.value;
    const enums = new SearchFKEnums();
    await enums.Retrieve('FrmID', frmID);
    for (const en of enums) {
      if (customQueryCondition.value.find((cqc) => cqc.key == en.KeyOfEn)) {
        continue;
      }
      if (en.IsEnum == 1) {
        const sysEnums = new SysEnums();
        await sysEnums.Retrieve('EnumKey', en.KeyOfEn);
        customQueryCondition.value.push({
          display: 'select',
          options: [{ label: '全部' + en.Name, value: '' }, ...sysEnums.map((en) => ({ label: en.Lab, value: (en.StrKey || en.IntKey) + '' }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      } else {
        const sfTable = new BSEntity('BP.Sys.SFTable', en.KeyOfEn);
        await sfTable.Retrieve();
        const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
        customQueryCondition.value.push({
          display: 'select',
          options: [{ label: '全部' + en.Name, value: '' }, ...ens.map((en) => ({ label: en.Name, value: en.No + '' }))],
          isMultiSelect: en.IsMultiSelect == 1,
          label: '',
          key: en.KeyOfEn,
          value: en.IsMultiSelect == 0 ? '' : [],
        });
      }
    }
    const atPara = new AtPara(userRegedit.Vals);
    for (const cqc of customQueryCondition.value) {
      const storedVal = atPara.GetValStrByKey(cqc.key);
      if (storedVal) {
        cqc.isMultiSelect ? (cqc.value = [storedVal]) : (cqc.value = storedVal);
      }
    }
  };
  /**
   * 初始化数据
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;
      flow.value = new FlowExt(flowNo.value);
      await flow.value.Retrieve();
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo.value);
      const data = await handler.DoMethodReturnJson('GroupFlow_Init');
      groupByArray.value = data['Group_MapAttr'];
      const selectGroupBy = groupByArray.value.filter((item) => item.Checked == true);
      if (selectGroupBy.length === 0 && groupByArray.value.length != 0) groupByArray.value[0].Checked = true;
      if (selectGroupBy.length > 1) {
        isDisabled.value = true;
        isShowPic.value = false;
      }
      const analysis = data['Analysis_MapAttr'];
      analysis.forEach((item) => {
        if(!!data[item.Field]){
          const select = data[item.Field].filter((obj) => obj.Selected === 'true');
          AnalysisArray.value.push({
            Field: item.Field,
            Name:  item.Name,
            checked: item.Checked  || item.Checked=='true'?true:false,
            options: data[item.Field].map((obj) => {
              return { value: obj.No, label:obj.Name };
            }),
            selected: select.length === 0 ? data[item.Field][0].No : select[0].No,
          });
        }
      });
      await InitUserRegedit();
      await initCustomQC();
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
    await query();
  };

  const groupSearch = ref<Record<string, any>[]>([]);
  const attrsOfNum = ref<Record<string, any>[]>([]);
  const attrsOfGroup = ref<Record<string, any>[]>([]);
  const query = async () => {
    try {
      rerrorObj.hasError = false;
      rerrorObj.tips = '';
      await updateUR();
      const DTFrom = dateRange.value?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      const DTTo = dateRange.value?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';

      loading.value = true; //获得数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo.value);
      handler.AddPara('KeyWords', keyword.value);
      handler.AddPara('DTFrom', DTFrom);
      handler.AddPara('DTTo', DTTo);
      handler.AddPara('SearchType', flowRange.value);
      handler.AddPara('WFSta', flowStatus.value);
      const SelectedGroupKey = groupByArray.value
        .filter((item) => item.Checked == true)
        .map((item) => {
          return item.Field;
        });
      if (SelectedGroupKey.length === 0) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '至少选择一项分组项目';
        return;
      }
      handler.AddPara('SelectedGroupKey', SelectedGroupKey.join('@'));
      let StateNumKey = '';
      AnalysisArray.value
        .filter((item) => item.checked === true)
        .forEach((item) => {
          if (!!item.selected) StateNumKey += '@' + item.Field + '=' + item.selected;
        });
      if (!StateNumKey) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '至少选择一项分析条件';
        return;
      }
      handler.AddPara('StateNumKey', StateNumKey);
      const data = await handler.DoMethodReturnJson('GroupFlow_Search');
      groupSearch.value = data['GroupSearch'];
      attrsOfNum.value = data['AttrsOfNum'];
      attrsOfGroup.value = data['AttrsOfGroup'];
      GenerTable(groupSearch.value, attrsOfNum.value, attrsOfGroup.value);
    } catch (e: any) {
      rerrorObj.hasError = true;
      rerrorObj.tips = e.toString();
    } finally {
      loading.value = false;
    }
  };
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
      dataSet.push('quarter');
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
      columns.value.push({
        title: item.Name,
        key: item.KeyOfEn + 'T',
        dataIndex: item.KeyOfEn + 'T',
        align: 'center',
      });
    });
    attrsOfNum.forEach((item) => {
      let title = item.Name;
      if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) title = item.Name + '(合计)';
      if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) title = item.Name + '(平均)';
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
        data += parseFloat(obj[item.KeyOfEn] || 0);
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
    title: '',
    visible: false,
    width: window.innerWidth * 0.7,
    params: {},
  });
  const tempateData = ref(0);
  const OpenView = (record) => {
    popModal.visible = true;
    popModal.title = flow.value.Name + ':查看详情';
    popModal.params['FlowNo'] = flowNo.value;
    const DTFrom = dateRange.value?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
    const DTTo = dateRange.value?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
    popModal.params['DTFrom'] = DTFrom;
    popModal.params['DTTo'] = DTTo;
    popModal.params['SearchType'] = flowRange.value;
    popModal.params['KeyWords'] = keyword.value;
    popModal.params['WFSta'] = flowStatus.value;
    groupByArray.value.forEach((item) => {
      if (item.Checked) popModal.params[item.Field || item.KeyOfEn] = record[item.Field || item.KeyOfEn];
    });
    tempateData.value++;
  };
  InitPage();
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
    background-color: #fff;
  }
  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }
  .card-of-table {
    border-radius: 0;
  }

  .search-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .search-keys {
      // flex: 3;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .search-key {
        align-items: center;
        margin: 6px 6px;
        display: flex;
      }
    }

    .search-buttons {
      // flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    }
  }
  .select-group-label {
    color: #1890ff;
    border-bottom: 1px solid #1890ff;
    font-size: 14px;
    padding-bottom: 12px;
    font-weight: 600;
  }
  :deep(.analy .ant-checkbox + span) {
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 60px;
    display: inline-block;
    overflow: hidden;
  }
</style>
