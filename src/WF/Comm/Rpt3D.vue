<template>
  <BaseComponent ref="baseComp" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <div class="three-dimension-table">
      <div>
        <div style="display: flex; justify-content: flex-start; align-items: center">
          <h2 style="text-align: center; width: 85%; height: 60px; padding: 20px">{{ pageTitle }}</h2>
          <template v-if="ready">
            <Button style="margin-left: 12px" type="primary" v-for="btn in getTopButtons()" :key="btn.label" @click="btn.onClick" :ghost="btn.ghost" :class="btn_style(btn.label!)"
              >{{ btn.label }}
            </Button>
          </template>
        </div>
      </div>
      <Table v-if="ready" :columns="tableColumns" :data-source="tableData" :pagination="false" :scroll="getScroll()" bordered size="small" class="three-d-table">
        <!-- 自定义单元格渲染 -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'dimension'">
            <strong>{{ record.dimension }}</strong>
          </template>
          <template v-else-if="column.dataIndex === 'sumAvg'">
            <span v-if="workModel === RptWorkModel.Readonly">{{ record.sumAvg }}</span>
            <span v-if="workModel === RptWorkModel.Edit">{{ getSumAvg(record) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'oper'">
            <Button style="padding: 0px" type="link" v-for="btn in getBtnsOfRow(record)" :key="btn.label" @click="btn.onClick" :ghost="btn.ghost">{{ btn.label }} </Button>
          </template>

          <template v-else-if="typeof record[column.dataIndex as string] === 'number'">
            <template
              v-if="
                column.dataIndex === dimensionConfig.d1Config.rowKey || column.dataIndex === dimensionConfig.d2Config.rowKey || column.dataIndex === dimensionConfig.d3Config.rowKey
              "
            >
              <span>{{ formatNumber(record[column.dataIndex as string]) }}</span>
            </template>
            <template v-else>
              <template v-if="workModel === RptWorkModel.Edit">
                <div :style="{ marginBottom: !!record[column.dataIndex.replace(rowValKey, 'Msg')] ? '-20px' : '0px' }">
                  <InputNumber
                    v-model:value="record[column.dataIndex]"
                    :controls="false"
                    :precision="dimensionConfig.CellDataBit"
                    style="text-align: right"
                    @blur="Inputblur(record, column, index)"
                  />
                  <template v-if="!!record[column.dataIndex.replace(rowValKey, 'Msg')]">
                    <div style="text-align: right"><CommentOutlined @click="PopClick(record, column, index)" /></div>
                  </template>
                </div>
              </template>
              <div v-else :style="{ marginBottom: !!record[column.dataIndex.replace(rowValKey, 'Msg')] ? '-20px' : '0px' }">
                <span>{{ formatNumber(record[column.dataIndex as string]) }}</span>
                <CommentOutlined v-if="!!record[column.dataIndex.replace(rowValKey, 'Msg')]" style="padding-left: 5px" @click="PopClick(record, column, index)" />
              </div>
            </template>
          </template>
        </template>
        <template v-if="dimensionConfig.SumAvgCol" #summary>
          <TableSummaryRow>
            <template v-if="rpt3DWorkType === Rpt3DWorkType.Top">
              <TableSummaryCell fixed="left" index="0" :style="getSumAvgCellColor()">{{ '总计' }}</TableSummaryCell>
            </template>
            <template v-if="rpt3DWorkType === Rpt3DWorkType.Left">
              <TableSummaryCell :colSpan="2" fixed="left" index="0" :style="getSumAvgCellColor()">{{ '总计' }}</TableSummaryCell>
              <TableSummaryCell :colSpan="0" fixed="left" index="1" :style="getSumAvgCellColor()" />
            </template>
            <TableSummaryCell v-for="item in dimensionConfig.keys" :key="item" :style="getSumAvgCellColor()">
              <TypographyText>{{ totals.arr[item] }}</TypographyText>
            </TableSummaryCell>
            <TableSummaryCell v-if="dimensionConfig.SumAvgRowColor" :colSpan="1" :style="getSumAvgCellColor()" />
            <TableSummaryCell v-if="!!dimensionConfig.BtnsOfRow" :colSpan="1" :style="getSumAvgCellColor()" />
          </TableSummaryRow>
        </template>
      </Table>
    </div>
  </BaseComponent>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, shallowRef } from 'vue';
  import { Button, InputNumber, Table, TableSummaryCell, TableSummaryRow, TypographyText } from 'ant-design-vue';
  import { CommentOutlined } from '@ant-design/icons-vue';
  import { ClassFactoryOfRpt3D } from './UIEntity/ClassFactoryOfRpt3D';
  import { Rpt3DBase, Rpt3DWorkType, RptWorkModel, SumAvg } from '/@/bp/UIEntity/Rpt3DBase';
  import { ActionItem } from '/@/components/Table';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { DataType } from '/@/bp/en/DataType';

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });

  interface TableRecord {
    key: string;
    dimension: string;
    [key: string]: any;
  }

  const pageTitle = ref('三维数据报表');
  const viewMode = ref<'d1' | 'd2' | 'd3'>('d1');
  const getBaseColumnTitle = (dimension: string): string => {
    switch (dimension) {
      case 'd1':
        return dimensionConfig.d1Config.title || '维度1';
      case 'd2':
        return dimensionConfig.d2Config.title || '维度2';
      case 'd3':
        return dimensionConfig.d3Config.title || '维度3';
      default:
        return '';
    }
  };
  const getScroll = () => {
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) return { x: false, y: 'calc(100vh - 200px)' };
    if (rpt3DWorkType.value === Rpt3DWorkType.Top) return { x: 'max-content', y: 'calc(100vh - 260px)' };
  };
  const getSumAvgCellColor = () => {
    return { backgroundColor: dimensionConfig.SumAvgColColor || '', border: '1px solid #d9d9d9', textAlign: 'center' };
  };
  const getSumAvgRowColor = () => {
    return { backgroundColor: dimensionConfig.SumAvgRowColor || '', border: '1px solid #d9d9d9' };
  };
  // 表格列配置
  const tableColumns = computed(() => {
    const baseColumns = [
      {
        title: getBaseColumnTitle(viewMode.value),
        dataIndex: 'dimension',
        key: 'dimension',
        fixed: 'left' as const,
        width: 80,
        align: 'center' as const,
        customCell: () => ({ style: { backgroundColor: dimensionConfig.d3Config.myColor || '', border: '1px solid #d9d9d9' } }),
        customHeaderCell: () => ({ style: { backgroundColor: dimensionConfig.d3Config.myColor || '', border: '1px solid #d9d9d9' } }),
      },
    ];
    let dynamicColumns: any[] = [];
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      dynamicColumns.push({
        title: '',
        dataIndex: dimensionConfig.d1Config.rowKey,
        key: dimensionConfig.d1Config.rowKey,
        width: 50,
        fixed: 'left' as const,
        align: 'center' as const,
        customCell: (record) => ({ rowSpan: record.rowSpan, style: { backgroundColor: dimensionConfig.d1Config.myColor || '', border: '1px solid #d9d9d9' } }),
        customHeaderCell: () => ({ style: { border: '1px solid #d9d9d9' } }), //backgroundColor: dimensionConfig.d1Config.myColor || '',
      });
      dynamicColumns.push({
        title: '',
        dataIndex: dimensionConfig.d2Config.rowKey,
        key: dimensionConfig.d2Config.rowKey,
        width: 80,
        align: 'center' as const,
        fixed: 'left' as const,
        customCell: (record) => ({
          style: { backgroundColor: dimensionConfig.d2Config.myColor || record['Color'] || '#ffff', border: '1px solid #d9d9d9' },
        }),
        customHeaderCell: () => ({ style: { border: '1px solid #d9d9d9' } }),
      });
      dimensionConfig.d3Config.list.forEach((d3Config, index) => {
        dynamicColumns.push({
          title: d3Config.Name,
          dataIndex: `${d3Config.No}_${rowValKey.value}`,
          key: `${d3Config.No}`,
          width: 40,
          align: 'center' as const,
          colIdx: index,
          customCell: (record) => ({ style: { backgroundColor: record['Color'] || '' } }),
          customHeaderCell: () => ({ style: { backgroundColor: dimensionConfig.d3Config.myColor || '', border: '1px solid #d9d9d9' } }),
        });
        dimensionConfig.keys.push(`${d3Config.No}_${rowValKey.value}`);
      });
      if (dimensionConfig.SumAvgRow != SumAvg.None) {
        dynamicColumns.push({
          title: dimensionConfig.SumAvgRow === SumAvg.Sum ? '汇总' : '平均',
          dataIndex: 'sumAvg',
          key: 'sumAvg',
          width: 30,
          align: 'center' as const,
          customCell: () => ({ style: getSumAvgRowColor() }),
          customHeaderCell: () => ({ style: getSumAvgRowColor() }),
        });
      }
      if (!!dimensionConfig.BtnsOfRow) {
        dynamicColumns.push({
          title: '操作',
          dataIndex: 'oper',
          key: 'oper',
          width: 30,
          align: 'center' as const,
        });
      }
      return dynamicColumns;
    } else if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      let colIdx = 0;
      dimensionConfig.d1Config.list.forEach((d1Config) => {
        let items = [];
        if (!!dimensionRefKey.value) items = dimensionConfig.d2Config.list.filter((d2Config) => d2Config[dimensionRefKey.value] === d1Config.No);
        else items = dimensionConfig.d2Config.list;
        if (items.length > 0)
          dynamicColumns.push({
            title: d1Config.Name,
            customHeaderCell: () => ({ style: { backgroundColor: dimensionConfig.d1Config.myColor || '', border: '1px solid #d9d9d9' } }),
            children: items.map((d2Config) => {
              dimensionConfig.keys.push(`${d1Config.No}_${d2Config.No}_${rowValKey.value}`);
              return {
                title: d2Config.Name,
                dataIndex: `${d1Config.No}_${d2Config.No}_${rowValKey.value}`,
                key: `${d1Config.No}_${d2Config.No}`,
                width: 100,
                align: 'right' as const,
                colIdx: colIdx++,
                customCell: (record) => ({ style: { backgroundColor: record[d1Config.No + '_' + d2Config.No + '_Color'] || '', border: '1px solid #d9d9d9' } }),
                customHeaderCell: () => ({ style: { backgroundColor: dimensionConfig.d2Config.myColor || d2Config.Color || '', border: '1px solid #d9d9d9' } }),
              };
            }),
          });
      });
    }
    if (dimensionConfig.SumAvgRow != SumAvg.None) {
      dynamicColumns.push({
        title: dimensionConfig.SumAvgRow === SumAvg.Sum ? '汇总' : '平均',
        dataIndex: 'sumAvg',
        key: 'sumAvg',
        width: 60,
        align: 'center' as const,
        customCell: () => ({ style: getSumAvgRowColor() }),
        customHeaderCell: () => ({ style: getSumAvgRowColor() }),
      });
    }
    if (!!dimensionConfig.BtnsOfRow) {
      dynamicColumns.push({
        title: '操作',
        dataIndex: 'oper',
        key: 'oper',
        width: 40,
        align: 'center' as const,
      });
    }
    return [...baseColumns, ...dynamicColumns];
  });
  const tableData = ref<any[]>([]);
  // 表格数据
  const InitData = () => {
    const data: TableRecord[] = [];

    const d1RowKey = dimensionConfig.d1Config.rowKey;
    const d2RowKey = dimensionConfig.d2Config.rowKey;
    const d3RowKey = dimensionConfig.d3Config.rowKey;

    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      // 按时间展开  dimensionRefKey.value
      dimensionConfig.d1Config.list.forEach((d1Config) => {
        let items = [];
        if (!!dimensionRefKey.value) items = dimensionConfig.d2Config.list.filter((d2Config) => d2Config[dimensionRefKey.value] === d1Config.No);
        else items = dimensionConfig.d2Config.list;
        items.forEach((d2Config, index) => {
          const record: TableRecord = {};
          record[d1RowKey] = d1Config.Name;
          record[d1RowKey + 'Key'] = d1Config.No;
          record[d2RowKey] = d2Config.Name;
          record[d2RowKey + 'Key'] = d2Config.No;
          record['Color'] = d2Config.Color || '#fff';
          record['SumAvg'] = dimensionConfig.SumAvgRow === SumAvg.ByPromiseExpModel ? d2Config.SumAvg || 0 : dimensionConfig.SumAvgRow;
          let val = 0;
          dimensionConfig.d3Config.list.forEach((d3Config) => {
            const targetRow = rowData.value.find((row) => row[d1RowKey] === d1Config.No && row[d2RowKey] === d2Config.No && row[d3RowKey] === d3Config.No);
            record[`${d3Config.No}_${rowValKey.value}`] = targetRow?.[rowValKey.value] || 0;
            record[`${d3Config.No}_Msg`] = targetRow?.['Msg'] || '';
            val += targetRow?.[rowValKey.value] || 0;
          });
          if (index == 0) record['rowSpan'] = items.length;
          else record['rowSpan'] = 0;
          record['sumAvg'] = record['SumAvg'] == SumAvg.None ? '-' : record['SumAvg'] == SumAvg.Avg ? parseFloat(val / dimensionConfig.d3Config.list.length).toFixed(2) : val;
          data.push(record);
        });
      });
    } else if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      // 按产品展开
      dimensionConfig.d3Config.list.forEach((d3Config) => {
        const record: TableRecord = {
          key: d3Config.No,
          dimension: d3Config.Name,
        };
        let val = 0;
        dimensionConfig.d1Config.list.forEach((d1Config) => {
          let items = [];
          if (!!dimensionRefKey.value) items = dimensionConfig.d2Config.list.filter((d2Config) => d2Config[dimensionRefKey.value] === d1Config.No);
          else items = dimensionConfig.d2Config.list;
          items.forEach((d2Config) => {
            const targetRow = rowData.value.find((row) => row[d1RowKey] === d1Config.No && row[d2RowKey] === d2Config.No && row[d3RowKey] === d3Config.No);
            record[`${d1Config.No}_${d2Config.No}_${rowValKey.value}`] = targetRow?.[rowValKey.value] || 0;
            record[`${d1Config.No}_${d2Config.No}_Msg`] = targetRow?.['Msg'] || '';
            record[`${d1Config.No}_${d2Config.No}_Color`] = d2Config.Color;
            val += targetRow?.[rowValKey.value] || 0;
          });
        });
        record['sumAvg'] = dimensionConfig.SumAvgRow == SumAvg.Avg ? parseFloat(val / dimensionConfig.d3Config.list.length).toFixed(2) : val;

        data.push(record);
      });
    }
    tableData.value = [];
    tableData.value = data;
  };

  // 工具函数
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  const getSumAvg = (record) => {
    if (!record) return 0;
    if (record['SumAvg'] === SumAvg.None) return '-';
    if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      const keys = Object.keys(record);
      let val = 0;
      keys.forEach((item) => {
        if (item != 'dimension' && item != 'sumAvg' && item != 'key' && typeof record[item] === 'number') val = parseFloat(val) + parseFloat(record[item]);
      });
      if (dimensionConfig.SumAvgRow === SumAvg.Avg) val = parseFloat(parseFloat(val / keys.length).toFixed(dimensionConfig.CellDataBit || 2));
      return val.toFixed(dimensionConfig.CellDataBit || 0);
    }
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      let val = 0;
      dimensionConfig.d3Config.list.forEach((item) => {
        val = parseFloat(val) + parseFloat(record[item.No + '_' + rowValKey.value]);
      });
      if (record['SumAvg'] === SumAvg.Avg) val = parseFloat(parseFloat(val / dimensionConfig.d3Config.list.length).toFixed(dimensionConfig.CellDataBit || 2));
      return val.toFixed(dimensionConfig.CellDataBit || 0);
    }
  };
  /**
   * 计算合计值
   */
  const totals = computed(() => {
    const arr = {};
    tableData.value.forEach((item) => {
      dimensionConfig.keys.forEach((key) => {
        arr[key] = parseFloat(arr[key] || 0) + item[key];
      });
    });
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      for (const key in arr) {
        arr[key] = dimensionConfig.SumAvgCol === SumAvg.Sum ? arr[key] : parseFloat(arr[key] / tableData.value.length).toFixed(dimensionConfig.CellDataBit);
      }
      return { arr };
    }
    if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      for (const key in arr) {
        if (dimensionConfig.SumAvgCol === SumAvg.ByPromiseExpModel) {
          const d2Key = key.split('_')[1];
          const d2Info = dimensionConfig.d2Config.list.find((item) => item.No.toString() === d2Key);
          if (d2Info.SumAvg === SumAvg.Sum) arr[key] = arr[key];
          if (d2Info.SumAvg === SumAvg.Avg) arr[key] = parseFloat(arr[key] / tableData.value.length).toFixed(dimensionConfig.CellDataBit);
          if (d2Info.SumAvg === SumAvg.None) arr[key] = '-';
        } else {
          arr[key] = dimensionConfig.SumAvgCol === SumAvg.Sum ? arr[key] : parseFloat(arr[key] / tableData.value.length).toFixed(dimensionConfig.CellDataBit);
        }
      }
      return { arr };
    }
  });
  const rowData = ref<Recordable[]>([]);
  const rpt3DWorkType = ref(Rpt3DWorkType.Left);
  const dimensionRefKey = ref<string>('');
  const rowValKey = ref<string>('');
  const workModel = ref(RptWorkModel.Readonly);
  const dimensionConfig = reactive<Recordable>({
    d1Config: {},
    d2Config: {},
    d3Config: {},
    BtnOfToolbar: '',
    BtnsOfRow: '',
    CellDataType: DataType.AppInt,
    CellDataBit: 0,
    SumAvgRow: SumAvg.None,
    SumAvgRowColor: '',
    SumAvgCol: SumAvg.None,
    SumAvgColColor: '',
    keys: [],
  });
  let reportEntity: Nullable<Rpt3DBase> = null;
  const ready = ref(false);
  const InitPage = async () => {
    const classId = props.params.EnName as string;
    reportEntity = await ClassFactoryOfRpt3D.GetEn(classId);
    reportEntity.setParams(props.params);
    await reportEntity.Init();
    dimensionConfig.keys = [];
    dimensionConfig.d1Config = reportEntity.D1Src; //一维
    dimensionConfig.d2Config = reportEntity.D2Src; //二维
    dimensionConfig.d3Config = reportEntity.D3Src; //三维
    dimensionConfig.BtnOfToolbar = reportEntity.BtnOfToolbar;
    dimensionConfig.BtnsOfRow = reportEntity.BtnsOfRow;
    dimensionConfig.SumAvgRow = reportEntity._SumAvgRow;
    dimensionConfig.SumAvgRowColor = reportEntity._SumAvgRowColor;
    dimensionConfig.SumAvgCol = reportEntity._SumAvgCol;
    dimensionConfig.SumAvgColColor = reportEntity._SumAvgColColor;
    dimensionConfig.CellDataType = reportEntity.CellDataType;
    dimensionConfig.CellDataBit = dimensionConfig.CellDataType == DataType.AppInt ? 0 : reportEntity.CellDataBit;
    workModel.value = reportEntity.WorkModel;
    rowData.value = reportEntity.Rows; //集合
    rpt3DWorkType.value = reportEntity.WorkType; //一维数据的位置
    dimensionRefKey.value = reportEntity.RefKey || ''; //一维二维直接的关系
    rowValKey.value = reportEntity.RowValKey; //分析值
    pageTitle.value = reportEntity.PageTitle || '三维数据报表';
    viewMode.value = 'd3';
    InitData();
    ready.value = true;
  };
  // 初始化
  onMounted(async () => {
    await InitPage();
  });

  const getTopButtons = () => {
    const actions: Array<ActionItem> = [];
    if (dimensionConfig.BtnOfToolbar.length !== 0) {
      dimensionConfig.BtnOfToolbar?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            if (!!reportEntity) reportEntity.TableData = tableData.value;
            const result = reportEntity?.BtnClick(btnName, InputblurInfo.record, InputblurInfo.d1, InputblurInfo.d2, InputblurInfo.d3, InputblurInfo.rowIdx, InputblurInfo.colIdx);
            if (!!result && result?.hasOwnProperty?.('ReturnType')) {
              baseComp.value?.handleGPNCallback(result, btnName);
            }
          },
        });
      });
    }
    return actions;
  };

  const getBtnsOfRow = (_record) => {
    const actions: Array<ActionItem> = [];
    if (dimensionConfig.BtnsOfRow.length !== 0) {
      dimensionConfig.BtnsOfRow?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            if (!!reportEntity) reportEntity.TableData = tableData.value;
            const d1Key = dimensionConfig.d1Config.rowKey;
            const d2Key = dimensionConfig.d2Config.rowKey;
            const d3Key = dimensionConfig.d3Config.rowKey;
            let val1 = '';
            let val2 = '';
            let val3 = '';
            if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
              val3 = _record.key;
            }
            if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
              //获取一维、二维、三维的数据
              val1 = _record[d1Key + 'Key'];
              val2 = _record[d2Key + 'Key'];
            }
            const result = reportEntity?.BtnClick(btnName, _record, val1, val2, val3);
            if (!!result && result?.hasOwnProperty?.('ReturnType')) {
              baseComp.value?.handleGPNCallback(result, btnName);
            }
          },
        });
      });
    }
    return actions;
  };

  const PopClick = (record, column, index) => {
    if (!!reportEntity) reportEntity.TableData = tableData.value;
    const d1Key = dimensionConfig.d1Config.rowKey;
    const d2Key = dimensionConfig.d2Config.rowKey;
    const d3Key = dimensionConfig.d3Config.rowKey;
    let val1 = '';
    let val2 = '';
    let val3 = '';
    let colIdx = 0;
    const keys = Object.keys(record) || [];
    for (const key of keys) {
      if (key.endsWith(rowValKey.value)) {
        if (key === column.dataIndex) break;
        colIdx++;
      }
    }
    if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      const key = column.key;
      val1 = key.split('_')[0];
      val2 = key.split('_')[1];
      val3 = record.key;
    }
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      //获取一维、二维、三维的数据
      val1 = record[d1Key + 'Key'];
      val2 = record[d2Key + 'Key'];
      val3 = column.key;
    }
    const result = reportEntity?.BtnClick('PopClick', record, val1, val2, val3, index, colIdx);
    if (!!result && result?.hasOwnProperty?.('ReturnType')) {
      baseComp.value?.handleGPNCallback(result, 'PopClick');
    }
  };

  const InputblurInfo = reactive<Recordable>({
    record: {},
    d1: '',
    d2: '',
    d3: '',
    rowIdx: 0,
    colIdx: 0,
  });
  const Inputblur = async (record, column, index) => {
    if (record[column.dataIndex] === null || record[column.dataIndex] === undefined) {
      record[column.dataIndex] = 0;
    }
    const d1Key = dimensionConfig.d1Config.rowKey;
    const d2Key = dimensionConfig.d2Config.rowKey;
    const d3Key = dimensionConfig.d3Config.rowKey;
    if (!!reportEntity) reportEntity.TableData = tableData.value;
    if (rpt3DWorkType.value === Rpt3DWorkType.Top) {
      const strs = column.key.split('_');
      //获取一维、二维、三维的数据
      const val1 = strs[0];
      const val2 = strs[1];
      const val3 = record.key;

      InputblurInfo.record = record;
      InputblurInfo.d1 = val1;
      InputblurInfo.d2 = val2;
      InputblurInfo.d3 = val3;
      InputblurInfo.rowIdx = index;
      InputblurInfo.colIdx = column.colIdx;
      //获取历史数据
      const result = rowData.value.find((item) => item[d1Key].toString() === val1 && item[d2Key].toString() === val2 && item[d3Key] === val3);
      const data = await reportEntity?.CellOnBlur(record, val1, val2, val3, record[column.dataIndex], !!result ? result[rowValKey.value] : '', index, column.colIdx);
      if (!!data && data?.hasOwnProperty?.('ReturnType')) {
        baseComp.value?.handleGPNCallback(data);
        return;
      }
      if (typeof data === 'object' && !!data[d1Key] && !!data[d2Key] && !!data[d3Key]) {
        const item = tableData.value.find((item) => item['key'] == data[d3Key]);
        item[data[d1Key] + '_' + data[d2Key] + '_' + rowValKey.value] = parseFloat(parseFloat(data[rowValKey.value] || 0).toFixed(dimensionConfig.CellDataBit));
      }
      return;
    }
    if (rpt3DWorkType.value === Rpt3DWorkType.Left) {
      //获取一维、二维、三维的数据
      const val1 = record[d1Key + 'Key'];
      const val2 = record[d2Key + 'Key'];
      const val3 = column.key;

      InputblurInfo.record = record;
      InputblurInfo.d1 = val1;
      InputblurInfo.d2 = val2;
      InputblurInfo.d3 = val3;
      InputblurInfo.rowIdx = index;
      InputblurInfo.colIdx = column.colIdx;
      //获取历史数据
      const result = rowData.value.find((item) => item[d1Key] === val1 && item[d2Key] === val2 && item[d3Key].toString() === val3);
      const data = await reportEntity?.CellOnBlur(record, val1, val2, val3, record[column.dataIndex], !!result ? result[rowValKey.value] : '', index, column.colIdx);
      if (!!data && data?.hasOwnProperty?.('ReturnType')) {
        baseComp.value?.handleGPNCallback(data);
        return;
      }
      if (typeof data === 'object' && !!data[d1Key] && !!data[d2Key] && !!data[d3Key]) {
        const item = tableData.value.find((item) => item[d1Key + 'Key'] == data[d1Key] && item[d2Key + 'Key'] == data[d2Key]);
        item[data[d3Key] + '_' + rowValKey.value] = parseFloat(parseFloat(data[rowValKey.value] || 0).toFixed(dimensionConfig.CellDataBit));
      }
      return;
    }
  };
  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('保存')) {
        return 'btn_style btn_save';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else {
        return 'btn_style';
      }
    };
  });
</script>

<style lang="less" scoped>
  .btn_style {
    height: 30px;
    border-radius: 5px;
  }

  .btn_add {
    background-color: #f6ffed !important;
    color: #52c41a !important;
    border: 1px solid #b7eb8f !important;
  }

  .btn_save {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
    border: 1px solid #91d5ff !important;
  }

  .btn_del {
    background-color: #fff2f0 !important;
    border: 1px solid #ffadd2 !important;
    color: #ff6666 !important;
  }
  :deep(.ant-input-number) {
    min-width: 72px;
    width: 72px;
  }
  :deep(.ant-input-number-input) {
    text-align: right;
  }
</style>
