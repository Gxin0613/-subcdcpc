import { h, type Ref } from 'vue';
import type { Entity } from '/@/bp/en/Entity';
import useFieldType from '../ens/useFieldType';
import type { DataTableCreateSummary } from 'naive-ui';
import type { RowData } from 'naive-ui/es/data-table/src/interface';

export function useSummary(enInst: Ref<Entity | null>) {
  const { isNumber, isMoney } = useFieldType();
  // 统计列
  let summaryColumns: string[] = [];
  const getSumColumns = () => {
    summaryColumns = enInst.value?._enMap.enMapExts.filter((ext) => ext.ExtModel === 'Summary').map((ext) => ext.Tag1) || [];
    // 自动处理数字和金额
    const numKeys = enInst.value?._enMap.attrs.filter((attr) => isMoney(attr) || isNumber(attr)).map((attr) => attr.Key);
    if (Array.isArray(numKeys) && numKeys.length > 0) {
      summaryColumns = summaryColumns.concat(numKeys);
    }
    // 去重
    summaryColumns = Array.from(new Set(summaryColumns));
  };
  const createSummary: DataTableCreateSummary = (pageData) => {
    if (!enInst.value?._enMap?.ShowSummary || summaryColumns.length === 0) return [];
    const summaryObject = {};
    summaryColumns.forEach((column) => {
      summaryObject[column] = {
        value: h(
          'span',
          {
            style: {
              // color: '#333',
              fontWeight: 'normal',
            },
          },
          parseFloat((pageData as RowData[]).reduce((prevValue, row) => prevValue + parseFloat(row[column]) || 0, 0)).toFixed(2),
        ),
      };
    });
    if (summaryColumns.length > 0) {
      summaryObject['MyPK'] = {
        value: h(
          'span',
          {
            style: {
              color: '#333',
              textAlign: 'left',
            },
          },
          '合计',
        ),
        colSpan: 1,
      };
      summaryObject['No'] = {
        value: h(
          'span',
          {
            style: {
              color: '#333',
              textAlign: 'left',
            },
          },
          '合计',
        ),
        colSpan: 1,
      };
    }
    return summaryObject;
  };
  // end

  return {
    getSumColumns,
    createSummary,
  };
}
