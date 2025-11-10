<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.errorType === 'error'" class="ant-tag-red">
          <FlowError :doc="errorObj.tips" />
        </div>
        <div v-else-if="errorObj.errorType === 'warning'" class="ant-tag-red">
          <FlowWarning :doc="errorObj.tips" />
        </div>
        <Card v-else ref="tableCardWrapper" class="card-of-table">
          <Row :gutter="16" style="height: calc(var(--viewport-height) - 160px)">
            <!--左侧-->
            <Col class="gutter-row" :span="6" style="padding-top: 10px">
              <Card size="small" :title="'分组条件'" style="background-color: #f0f0f0; width: 100%; max-height: 33%; overflow-y: auto; margin-bottom: 10px">
                <template v-for="item in groupByArray" :key="item.Field">
                  <Checkbox v-model:checked="item.Checked" @change="doChange()" style="margin-bottom: 5px">{{ item['Name' + sysLang] || item.Name }}</Checkbox
                  ><br />
                </template>
              </Card>
              <Card size="small" :title="'分析项目'" style="background-color: #f0f0f0; width: 100%; max-height: 33%; overflow-y: auto; margin-bottom: 10px">
                <template v-for="item in AnalysisArray" :key="item.Field">
                  <Checkbox v-model:checked="item.checked" @change="doChange()" style="margin-bottom: 5px; width: 45%" class="analy">
                    <Tooltip placement="topLeft" :title="item['Name' + sysLang] || item.Name">
                      {{ item['Name' + sysLang] || item.Name }}
                    </Tooltip>
                  </Checkbox>
                  <Select
                    v-model:value="item.selected"
                    style="width: 55%; margin-bottom: 5px"
                    optionFilterProp="label"
                    :options="item.options"
                    class="frmStyleType"
                    @change="doChange()"
                  />
                  <br />
                </template>
              </Card>
              <Card size="small" :title="'图表'" style="background-color: #f0f0f0; width: 100%; max-height: 26%">
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
                <div v-if="isShowPic === false" style="padding: 0 10px 10px 10px">
                  <Table :columns="columns" :dataSource="tableData" :key="tempData" bordered size="small" :pagination="false">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'Oper'">
                        <Button type="link" @click="OpenView(record)">{{ '查看' }}</Button>
                      </template>
                      <template v-else-if="column.key === 'SN'">
                        {{ index + 1 }}
                      </template>
                      <!--<template v-else>
                        {{ record[column.key + 'Text'] || record[column.key + 'T'] || record[column.key] }}
                      </template>-->
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
      </Spin>
    </ThemeWrapper>
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
  </NConfigProvider>
</template>
<script lang="ts" setup>
  import { h, nextTick, reactive, ref } from 'vue';
  import { Spin, message, Card, Row, Col, Checkbox, InputNumber, Tabs, TableSummaryRow, TableSummaryCell, TypographyText, Button, TabPane, Table, Tooltip } from 'ant-design-vue';
  import { Select, Drawer } from 'ant-design-vue';
  import { NConfigProvider, zhCN, dateZhCN, NTag } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import ContrastDtl from './ContrastDtl.vue';
  import { BarChart } from 'echarts/charts';
  import { PieChart } from 'echarts/charts';
  import { LineChart } from 'echarts/charts';
  import * as echarts from 'echarts/core';
  import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
  import { LabelLayout, UniversalTransition } from 'echarts/features';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { TableConfig } from '/@/components/SearchComponent/src/types';
  import { CanvasRenderer } from 'echarts/renderers';
  import FlowError from '/@/WF/FlowError.vue';
  import FlowWarning from '/@/WF/FlowWarning.vue';
  import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object as PropType<TableConfig>,
      default: () => {
        return {
          dataSource: [],
          columns: [],
          pageSize: 10,
          pageCount: 1,
          onPageSizeChange: () => {},
          onPageNumberChange: () => {},
          primaryKey: '',
          checkedItems: [],
          onUpdateCheckedItems: () => {},
          onRowClick: () => {},
        };
      },
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    totalWidth: {
      type: Number,
      default: 1000,
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
  const loading = ref(false);
  const loadingData = ref(false);
  const errorObj = reactive({
    tips: '',
    errorType: 'info',
  });
  const rerrorObj = reactive({
    tips: '',
    hasError: false,
  });
  const EnName = props.params.FrmID;
  const sysLang = WebUser.SysLang || 'CH';
  const ChangeIsShowPic = () => {
    if (isShowPic.value) activeKey.value = 'Table';
  };
  // 初始化Search页面
  const InitSearch = async () => {
    try {
      await query();
    } catch (e: any) {
      console.trace(e);
    }
  };
  const myPK = webUser.No + EnName + '_Group';
  // UserRegedit为查询对象
  const userGroupRegedit = reactive<UserRegedit>(new UserRegedit());

  const query = async () => {
    try {
      rerrorObj.hasError = false;
      rerrorObj.tips = '';
      loadingData.value = true;
      //userRegedit.SearchKey = searchInfo.SearchKey;
      //await userRegedit.Update();

      let queryArgs = '';

      const SelectedGroupKey = groupByArray.value
        .filter((item) => item.Checked == true)
        .map((item) => {
          return item.Field;
        });
      if (SelectedGroupKey.length === 0) {
        if (groupByArray.value.length == 0) {
          errorObj.errorType = 'warning';
          errorObj.tips = '操作提示:该表单不能使用该组件,技术信息：表单里没有包含外键枚举字段.';
          return false;
        }
        rerrorObj.hasError = true;
        rerrorObj.tips = '操作提示:请至少选择一个分组条件';
        return false;
      }
      queryArgs += '@SelectedGroupKey=' + SelectedGroupKey.join(',');
      let StateNumKey = '';
      if (AnalysisArray.value.length == 0) {
        errorObj.errorType = 'warning';
        errorObj.tips = '操作提示:缺少分析条件,请检查表单中是否含有可见的数值型字段';
        return false;
      }
      AnalysisArray.value
        .filter((item) => item.checked === true)
        .forEach((item) => {
          if (!!item.selected) StateNumKey += ',' + item.Field + '=' + item.selected + ',';
        });
      if (!StateNumKey) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '操作提示:请至少选择一个分析条件,';
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
      //await userRegedit.Retrieve();
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loadingData.value = false;
    }
  };
  const enumMains = ref<Record<string, any>[]>([]);
  const enums = ref<Record<string, any>[]>([]);
  /**
   * 初始化数据
   * @constructor
   */
  const GroupInitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);

      //获得枚举外键.
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

      //获得数字字段.
      data = await handler.DoMethodReturnJson('Group_Analysis');
      const analysis = data['Attrs'];
      analysis.forEach((item) => {
        if(!!data[item.Field]){
          const select = data[item.Field].filter((obj) => obj.Selected === 'true');
          AnalysisArray.value.push({
            Field: item.Field,
            Name: item['Name' + sysLang] || item.Name,
            checked: item.Checked === 'true' ? (item.Checked = true) : (item.Checked = false),
            options: data[item.Field].map((obj) => {
              return { value: obj.No, label: obj['Name' + sysLang] || obj.Name };
            }),
            selected: select.length === 0 ? data[item.Field][0].No : select[0].No,
          });
        }
        
      });
      const selectAnalysis = AnalysisArray.value.filter((item) => item.checked == true);
      if (selectAnalysis.length === 0 && AnalysisArray.value.length > 0) AnalysisArray.value[0].checked = true;
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

  /**
   * 分组条件,分析项目,图表的选择.
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
          //自定义柱状图颜色
          const color: any[] = ['#5470c6', '#91cc75', '#fac858', '#ffdb5c', '#ff9f7f', '#e062ae', '#e690d1', '#e7bcf3', '#9d96f5', '#8378EA'];
          groupSearch.value.forEach((obj, Idx) => {
            data.push({
              value: obj[item.KeyOfEn] || 0,
              itemStyle: {
                color: color[Idx],
              },
            });
          });
          seriesData.push({
            name: item.Name,
            data: data,
            type: 'bar',
            smooth: true,
          });
        }
      });
      console.log(seriesData);
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
              value: obj[item.KeyOfEn] || 0,
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
            data.push(obj[item.KeyOfEn] || 0);
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
      let title = item['Name' + sysLang] || item.Name;
      columns.value.push({
        title: title,
        key: item.KeyOfEn,
        dataIndex: item.KeyOfEn,
        align: 'center',
        customRender: ({ _text, record, _column }: Recordable) => {
          const enumEntity = item.enumList?.find((enumItem) => enumItem.IntKey == record[item.KeyOfEn]);
          if (!item.enableEnumColor)
            return h(
              'span',
              {},
              {
                default: () => {
                  if (item.enumList.length == 0) return record[item.KeyOfEn];
                  const rowVal = record[item.KeyOfEn] === -1 ? '无' : record[`${item.KeyOfEn}Text`] || record[`${item.KeyOfEn}T`] || record[item.KeyOfEn];
                  const enumVal = enumEntity['Name' + sysLang] || enumEntity?.Lab;
                  return enumVal || rowVal;
                },
              },
            );
          const rowVal = record[`${item.KeyOfEn}Text`] || record[`${item.KeyOfEn}T`] || record[item.KeyOfEn];
          const enumVal = enumEntity['Name' + sysLang] || enumEntity?.Lab;
          const text = enumVal || rowVal;
          const colorVal = enumEntity?.ValColor || '#000';
          const styleConfig = {
            maxWidth: (item.UIWidth < text.length * 20 ? text.length * 20 : item.UIWidth) + 'px',
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
                const enumVal = enumEntity['Name' + sysLang] || enumEntity?.Lab;
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
          obj[item.KeyOfEn] = obj[item.KeyOfEn] || 0;
          if (item.MyDataType != 2) obj[item.KeyOfEn] = obj[item.KeyOfEn].toFixed(2);
          data += parseFloat(obj[item.KeyOfEn] || 0);
        });
        if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) totals.value[item.KeyOfEn] = item.MyDataType == 2 ? data : data.toFixed(2);
        if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) totals.value[item.KeyOfEn] = (data / tableData.value.length).toFixed(2);
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
    popModal.title = '查看详情';
    popModal.visible = true;
    popModal.params = props.params;
    delete popModal.params['Title'];
    delete popModal.params['title'];
    groupByArray.value.forEach((item) => {
      if (item.Checked) popModal.params[item.Field || item.KeyOfEn] = record[item.Field || item.KeyOfEn];
    });
    tempateData.value++;
  };
  GroupInitPage();
  defineExpose({ GroupInitPage });
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: calc(100% - 80px);

    .setting-panel {
      width: 320px;

      .group {
        background-color: white;
        border-radius: 12px;
        .title {
          font-size: 18px;
        }
      }

      .group + .group {
        margin-top: 24px;
      }
    }
  }
  :deep(.ant-card-body) {
    padding: 8px 24px;
  }
  :deep(.analy .ant-checkbox + span) {
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 60px;
    display: inline-block;
    overflow: hidden;
  }
</style>
