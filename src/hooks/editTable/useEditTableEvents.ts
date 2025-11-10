// useEditTableEvents.ts - 替代方案
import { onUnmounted, Ref, watch, nextTick } from 'vue';
import { useDtlEventsStore } from '../../store/modules/dtlEvents';
import { debounce } from 'lodash-es';

type DtlEventParam = {
  type: string;
  dtlKey: string;
  dtlColumn: string;
  val: any;
};

export function useEditTableEvents(props: Recordable, tableColumns: Ref<any>, reload_func: Ref<Function | undefined>) {
  const dtlEventsStore = useDtlEventsStore();
  let eventWatchStop: Function | null = null;
  console.log({ props });
  const mainTableKey = props.PKVal || props.params?.PKVal;
  const eventKey = mainTableKey + '-' + props.dtlKey;

  // 使用防抖来减少重复调用
  const debouncedReload = debounce(() => {
    reload_func.value?.();
  }, 100);

  const handleUpdateColPrefix = (colKey: string, val: any) => {
    let hasChanges = false;

    // 直接修改列配置，不触发响应式更新
    const columns = tableColumns.value;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col.key === colKey) {
        if (!col.originTitle) {
          col.originTitle = col.title;
        }
        const newTitle = !!val ? val + col.originTitle : col.originTitle;
        if (col.title !== newTitle) {
          col.title = newTitle;
          hasChanges = true;
        }
      }
    }

    // 如果有变化，延迟重新加载
    if (hasChanges) {
      debouncedReload();
    }
  };

  const handleDtlEvent = (params: DtlEventParam) => {
    console.log({ params });
    switch (params.type) {
      case 'updateColPrefix':
        handleUpdateColPrefix(params.dtlColumn, params.val);
        break;
    }
  };

  const handleEvents = (events) => {
    if (Array.isArray(events) && events.length > 0) {
      // 批量处理事件，减少重复操作
      const groupedEvents = events.reduce((acc, event) => {
        const key = `${event.type}-${event.dtlColumn}`;
        acc[key] = event; // 后面的事件会覆盖前面的
        return acc;
      }, {}) as DtlEventParam[];

      Object.values(groupedEvents).forEach((event) => {
        handleDtlEvent(event);
      });
    }
  };

  const loadEvents = () => {
    const events = dtlEventsStore.getEvents(eventKey);
    if (events && events.length > 0) {
      handleEvents(events);
      dtlEventsStore.clearEvents(eventKey); // 处理完立即清除
    }
  };

  const watchSource = () => {
    eventWatchStop = watch(
      () => dtlEventsStore.getEvents(eventKey),
      (events, oldEvents) => {
        // 只有当事件真的发生变化时才处理
        if (events && events !== oldEvents && events.length > 0) {
          handleEvents(events);
          // 延迟清除事件，避免在 watch 回调中修改被监听的数据
          nextTick(() => {
            dtlEventsStore.clearEvents(eventKey);
          });
        }
      },
      { deep: false }, // 不使用深度监听，减少触发频率
    );
  };

  // 简化初始化逻辑
  const initializeEvents = () => {
    if (tableColumns.value && Array.isArray(tableColumns.value) && tableColumns.value.length > 0) {
      loadEvents();
      watchSource();
      return true;
    }
    return false;
  };

  // 只监听一次表格列的初始化
  const stopWatch = watch(
    () => tableColumns.value?.length > 0,
    (hasColumns) => {
      if (hasColumns && initializeEvents()) {
        stopWatch(); // 成功初始化后立即停止监听
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (eventWatchStop) {
      eventWatchStop();
    }
    debouncedReload.cancel(); // 取消防抖函数
  });
}
