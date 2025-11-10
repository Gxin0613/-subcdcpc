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
                            <TableSummaryCell v-if="item.key != 'SN' && item.key != 'indexColumn' && item.key != 'Oper'" style="text-align: center; background-color: #ffff0021">
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
      </Spin>
    </ThemeWrapper>
  </NConfigProvider>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { Spin, message, Card, Row, Col, TableSummaryRow, TableSummaryCell, TypographyText, Button, Table } from 'ant-design-vue';
  import { Select, RadioGroup, Radio } from 'ant-design-vue';
  import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import webUser from '/@/bp/web/WebUser';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import { TableConfig } from '/@/components/SearchComponent/src/types';
  import FlowError from '/@/WF/FlowError.vue';
  import FlowWarning from '/@/WF/FlowWarning.vue';
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

  //分组的项目
  const groupByArray = ref<Record<string, any>[]>([]);
  const AnalysisArray = ref<Record<string, any>[]>([]);
  const isDisabled = ref(false);
  const analysisType = ref('SUM');
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
  const query = async () => {
    try {
      rerrorObj.hasError = false;
      rerrorObj.tips = '';
      loadingData.value = true;
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
        let title = item['Name' + sysLang] || item.Name;
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
  const sysLang = WebUser.SysLang || 'CH';
  /**
   * 初始化数据
   * @constructor
   */
  const GroupInitPage = async () => {
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
          label: item['Name' + sysLang] || item.Name,
        });
        ddl2.value.push({
          value: item.Field,
          label: item['Name' + sysLang] || item.Name,
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
            Name: item['Name' + sysLang] || item.Name,
            checked: false,
            options: data[item.Field].map((obj) => {
              return { value: obj.No, label: obj['Name' + sysLang] || obj.Name };
            }),
            selected: select.length === 0 ? data[item.Field][0].No : select[0].No,
          });
        }
        
      });
      // const selectAnalysis = AnalysisArray.value.filter((item) => item.checked == true);
      // if (selectAnalysis.length === 0 && AnalysisArray.value.length > 0)
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
    attrsOfGroup.value.forEach((item) => {
      popModal.params[item.KeyOfEn] = record[item.KeyOfEn];
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
</style>
