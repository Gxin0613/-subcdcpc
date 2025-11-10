import Sortable from 'sortablejs';
import { onUnmounted, Ref, ShallowRef } from 'vue';
import BSEntities from '/@/utils/gener/BSEntities';
import { message } from 'ant-design-vue';

export function useEditTableSort(props: Recordable, tableRef: ShallowRef<HTMLElement | undefined>, reload_func: Ref<Function | undefined>) {
  let sortablejsRef: Nullable<Sortable> = null;
  // 初始化拖动事件
  const initSortable = async () => {
    setTimeout(() => {
      const tbodyEl = tableRef.value?.querySelector('.ant-table-body')?.querySelector('tbody');
      if (!tbodyEl) {
        console.error('拖动功能初始化失败');
        return;
      }
      sortablejsRef = new Sortable(tbodyEl, {
        animation: 150,
        dataIdAttr: 'data-row-key',
        handle: '.drag-icon',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: async () => {
          const sortedList = sortablejsRef?.toArray() || [];
          // 因为这个表格有个隐藏列，需要去掉第1项
          if (sortedList.length < 3) {
            return;
          }
          const targetList = sortedList.slice(1).join(',');
          try {
            const ens = new BSEntities('BP.Sys.MapExts');
            const fkMapdata = props.params?.FK_MapData || props.params?.PKVal;
            if (!fkMapdata) {
              message.info('没有FK_MapData.');
              return;
            }
            const str = await ens.DoMethodReturnString('List_MoveByIdx', targetList);
            await reload_func.value?.();
            message.success(str);
          } catch (e: any) {
            message.error(e.toString());
          }
        },
      });
    }, 200);
  };

  // 移除所有拖动事件
  const removeAllSortablejs = () => {
    if (sortablejsRef) {
      sortablejsRef.destroy();
    }
  };

  onUnmounted(() => {
    removeAllSortablejs();
  });

  return {
    initSortable,
  };
}
