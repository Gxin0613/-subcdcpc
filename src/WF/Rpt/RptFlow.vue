<template>
  <BaseComponent ref="wrapperRef" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.errorType === 'error'" class="ant-tag-red">
          <FlowError :doc="errorObj.tips" />
        </div>
        <div v-else-if="errorObj.errorType === 'warning'" class="ant-tag-red">
          <FlowWarning :doc="errorObj.tips" />
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
                <div class="search-key" style="max-width: 215px">
                  <RangePicker :clearable="true" v-model:value="dateRange" :placeholder="'[`发起日期从`, `到`]'" :locale="locale" />
                </div>
                <div class="search-key" style="max-width: 250px">
                  <AntButton type="primary" @click="query"><i class="icon-chart" style="margin-right: 5px"></i>{{ '分析' }}</AntButton>
                </div>
              </div>
              <div class="search-buttons">
                <Select v-model:value="feature.value" style="width: 100%; margin-left: 12px" :allow-clear="true" :placeholder="'选择范围'" @select="changeFeature">
                  <SelectOption v-for="item in feature.options" :key="item.value">
                    <i :class="item.icon" style="margin-right: 5px"></i><span>{{ item.label }}</span></SelectOption
                  >
                </Select>
              </div>
            </div>
          </Card>
          <Card ref="tableCardWrapper" class="card-of-table">
            <Row :gutter="16" style="height: calc(100vh - 160px)">
              <!--左侧-->
              <Col class="gutter-row" :span="6" style="padding-top: 10px">
                <Card size="small" :title="'分组内容'" style="width: 100%; max-height: 33%; overflow-y: auto; margin-bottom: 10px">
                  <label>维度1:</label>
                  <Select
                    v-model:value="w1"
                    style="width: 140px; margin-bottom: 5px; margin-left: 10px"
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
                    style="width: 140px; margin-bottom: 5px; margin-left: 10px"
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
                    style="width: 140px; margin-bottom: 5px; margin-left: 10px"
                    optionFilterProp="label"
                    @select="doChange"
                    :options="ddl2"
                    class="frmStyleType"
                  />
                  <br />
                </Card>
                <Card size="small" :title="'分析数据'" style="width: 100%; margin-bottom: 10px">
                  <template v-for="item in AnalysisArray" :key="item.Field">
                    <Radio v-model:checked="item.checked" @change="doRadioChange(item)" style="margin-bottom: 5px">{{ item.Name }}</Radio>
                    <br />
                  </template>
                </Card>
                <Card size="small" :title="'分析方式'" style="width: 100%; margin-bottom: 10px">
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
                                <TableSummaryCell v-if="subItem.key != 'SN' && subItem.key != 'indexColumn' && subItem.key != 'Oper'" style="text-align: center">
                                  <TypographyText> {{ totals[subItem.key] }}</TypographyText>
                                </TableSummaryCell>
                              </template>
                            </template>
                            <template v-else>
                              <TableSummaryCell v-if="item.key != 'SN' && item.key != 'indexColumn' && item.key != 'Oper'" style="text-align: center">
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
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { reactive, ref, shallowRef, unref } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { Spin, message, Card, Row, Col, RadioGroup, Radio, TableSummaryRow, TableSummaryCell, TypographyText, Button, Table } from 'ant-design-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Button as AntButton, RangePicker, Input, Select, SelectOption } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '../Comm/ThemeWrapper.vue';
  import { FlowExt } from '/@/WF/Admin/AttrFlow/FlowExt';
  import { downloadByData } from '/@/utils/file/download';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Entity from '../Admin/FoolFormDesigner/dto/Entity';
  import FlowError from '/@/WF/FlowError.vue';
  import FlowWarning from '/@/WF/FlowWarning.vue';

  type RangeValue = [Dayjs, Dayjs];
  const wrapperRef = shallowRef<InstanceType<typeof BaseComponent>>();
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    errorType: 'info',
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
  const keyword = ref('');
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
        label: '进行中',
        value: 0,
      },
      {
        label: '已完成',
        value: 1,
      },
      {
        label: '全部状态',
        value: 2,
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
  const getOptionLabel = (value) => {
    const option = feature.options.find((option) => option.value === value);
    return option ? option.label : null;
  };
  const createNewFlow = async () => {
    const flowNo = props.params.FlowNo;
    //#穿透页面url地址
    const url = `/#/WF/MyFlow?FlowNo=${flowNo}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  };
  //跳转查询
  const lookUp = () => {
    const flowNo = props.params.FlowNo;
    const url = `/src/WF/Rpt/SearchFlow.vue?FlowNo=${flowNo}`;
    wrapperRef.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
  };
  //导出
  const deriveFlow = async () => {
    const flowNo = props.params.FlowNo;
    const flow = new Entity('BP.WF.Flow', flowNo);
    await flow.Init();

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
    handler.AddPara('FlowNo', flowNo);
    const data = await handler.DoMethodReturnString('ExpFlowTemplete');
    downloadByData(data, flow.getData().Name + '.xml', 'xml');
    return new GPNReturnObj(GPNReturnType.DoNothing, '');
  };
  // 获取本月初时间
  const startOfMonth = dayjs().startOf('month');
  // 获取本月末时间
  const endOfMonth = dayjs().endOf('month');
  const dateRange = ref<RangeValue>([startOfMonth, endOfMonth]);
  const flow = ref<Record<string, any>>({});

  //分组的项目
  const groupByArray = ref<Record<string, any>[]>([]);
  const AnalysisArray = ref<Record<string, any>[]>([]);
  const analysisType = ref('AVG');
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
   * 初始化数据
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;
      flow.value = new FlowExt(props.params.FlowNo);
      await flow.value.Retrieve();
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', props.params.FlowNo);
      const data = await handler.DoMethodReturnJson('GroupFlow_Init');
      groupByArray.value = data['Group_MapAttr'];
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
      groupByArray.value.map((item) => (item.Checked === 'true' ? (item.Checked = true) : (item.Checked = false)));
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

      const analysis = data['Analysis_MapAttr'];
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
      const DTFrom = dateRange.value?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      const DTTo = dateRange.value?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
      const flowNo = props.params.FlowNo;

      loading.value = true; //获得数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo);
      handler.AddPara('KeyWords', keyword.value);
      handler.AddPara('DTFrom', DTFrom);
      handler.AddPara('DTTo', DTTo);
      handler.AddPara('SearchType', flowRange.value);
      handler.AddPara('WFSta', flowStatus.value);
      let SelectedGroupKey = w1.value + '@' + w2.value;
      if (!!w3.value) SelectedGroupKey += '@' + w3.value;
      console.log({ SelectedGroupKey });
      handler.AddPara('SelectedGroupKey', SelectedGroupKey);

      let StateNumKey = '';
      if (AnalysisArray.value.length == 0) {
        errorObj.errorType = 'warning';
        errorObj.tips = '系统设置错误:缺少分析条件,请检查表单中是否含有可见的数值型字段';
        return false;
      }

      AnalysisArray.value
        .filter((item) => item.checked === true)
        .forEach((item) => {
          StateNumKey += '@' + item.Field + '=' + analysisType.value;
        });
      if (!StateNumKey) {
        rerrorObj.hasError = true;
        rerrorObj.tips = '系统设置错误:请至少选择一个分析条件,';
        return false;
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

  const totals = ref<Record<string, any>>({});
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
    const fKey = actualConditions[0].KeyOfEn + 'T';
    const sKey = actualConditions[1].KeyOfEn + 'T';
    const tKey = actualConditions[2].KeyOfEn + 'T';
    const getConditionVals = (key: string) => originalData.filter((tableItem) => !!tableItem[key]).map((tableItem) => tableItem[key]);
    // 去重复, 未知值错误值将被过滤
    const firstCondItems = Array.from(new Set(getConditionVals(fKey)));
    const secondCondItems = Array.from(new Set(getConditionVals(sKey)));
    const thirdCondItems = Array.from(new Set(getConditionVals(tKey)));

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
      });
    });

    const newTableData: Recordable[] = [];

    for (const fc of firstCondItems) {
      const fTableRows = originalData.filter((tableRow) => tableRow[fKey] == fc);
      console.log({ fTableRows });
      const row = {
        indexColumn: fc,
      };
      for (const sc of secondCondItems) {
        const sTableRow = fTableRows.filter((tableRow) => tableRow[sKey] == sc);
        // row[sc as string] = sTableRow?.Group_Number || 0;

        for (const tc of thirdCondItems) {
          const tableRow = sTableRow.find((tableRow) => tableRow[tKey] == tc);
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

    const fKey = actualConditions[0].KeyOfEn + 'T';
    const sKey = actualConditions[1].KeyOfEn + 'T';

    const getConditionVals = (key: string) => originalData.filter((tableItem) => !!tableItem[key]).map((tableItem) => tableItem[key]);

    // 去重复
    const firstCondItems = Array.from(new Set(getConditionVals(fKey)));
    const secondCondItems = Array.from(new Set(getConditionVals(sKey)));

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
      });
    });

    const newTableData: Recordable[] = [];

    for (const fc of firstCondItems) {
      const fTableRows = originalData.filter((tableRow) => tableRow[fKey] == fc);
      console.log({ fTableRows });
      const row = {
        indexColumn: fc,
      };
      for (const sc of secondCondItems) {
        const tableRow = fTableRows.find((tableRow) => tableRow[sKey] == sc);
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
        data += parseFloat(obj[item.KeyOfEn]);
      });
      if (StateNumKey.includes('@' + item.KeyOfEn + '=SUM')) totals.value[item.KeyOfEn] = data;
      if (StateNumKey.includes('@' + item.KeyOfEn + '=AVG')) totals.value[item.KeyOfEn] = (data / tableData.value.length).toFixed(2);
    });
    tempData.value++;
  };
  /**
   * 分组条件，分析项目，图表的选择
   */
  const doChange = async () => {
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
    await query();
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
</style>
