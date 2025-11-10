import { ref, type Ref } from 'vue';
import type { Entity } from '/@/bp/en/Entity';
import type { SortColumns, Sorter } from '/#/search';

export function useSorter(enInst: Ref<Entity | null>, dataSource: Ref<Recordable[]>) {
  const sortColumn = ref<SortColumns[]>([]);
  const handleSorterChange = (sorterList: Sorter[]) => {
    let sorter: Sorter | null = null;
    if (sorterList.length === 0) {
      sorter = sorterList[0];
    } else {
      const usedSorter = sorterList
        .filter((s) => !!s.order)
        .sort((a, b) => {
          return a.sorter.multiple - b.sorter.multiple;
        });
      if (usedSorter.length > 0) sorter = usedSorter[0];
      else sorter = sorterList[0];
    }
    dataSource.value = dataSource.value.sort((prev, curr) => {
      if (!sorter) return 0;
      const val = prev[sorter.columnKey];
      const nextVal = curr[sorter.columnKey];
      let result: number;
      if (typeof val === 'string' && /^[\u4E00-\u9FA5]+$/.test(val)) {
        // 如果 val 是中文字符串，使用 localeCompare 方法
        result = val.localeCompare(nextVal);
      } else if (typeof val === 'number' && typeof nextVal === 'number') {
        // 如果 val 是数字，使用减法操作
        result = val - nextVal;
      } else {
        // 如果 val 是其他类型，转换为字符串并使用 localeCompare 方法
        result = String(val).localeCompare(String(nextVal));
      }
      if (sorter.order === 'descend') {
        return result;
      } else {
        return -result;
      }
    });
  };
  const getSortColumns = () => {
    sortColumn.value =
      enInst.value?._enMap.enMapExts
        .filter((ext) => ext.ExtModel === 'Sort')
        .map((ext) => {
          return {
            key: ext.Tag1,
            priority: parseInt(ext.Tag2),
          };
        }) || [];
  };
  // end
  return {
    sortColumn,
    handleSorterChange,
    getSortColumns,
  };
}
