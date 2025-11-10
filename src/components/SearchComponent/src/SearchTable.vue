<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <ThemeWrapper>
      <Card ref="tableCardWrapper" class="card-of-table">
        <NDataTable
          v-if="!loading"
          :loading="loading"
          :remote="remote"
          :single-line="false"
          :columns="tableConfig.columns"
          :data="tableConfig?.dataSource"
          :row-key="rowKey"
          :checked-row-keys="tableConfig.checkedItems"
          :pagination="paginationReactive"
          @update:checked-row-keys="tableConfig.onUpdateCheckedItems"
          :row-props="rowProps"
          flex-height
          :scroll-x="0"
          :style="{
            height: `${dynamicHeight}px`,
          }"
          @update:sorter="tableConfig.onhandleUpdateSorter"
          :striped="!props.rowColor"
          @unstable-column-resize="
            (w, _limitWidth, col) => {
              col?.onResize?.(w);
            }
          "
        />
      </Card>
    </ThemeWrapper>
  </NConfigProvider>
</template>

<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { NDataTable, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { onMounted, onUnmounted, reactive, ref, shallowRef, watch } from 'vue';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { TableConfig } from '/@/components/SearchComponent/src/types';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { debounce } from 'lodash';

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    remote: {
      type: Boolean,
      default: false,
    },
    rowColor: {
      type: String,
      default: '',
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
    totalWidth: {
      type: Number,
      default: 1000,
    },
  });
  const tableConfig = ref<TableConfig>({
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
    ready: false,
    page: 1,
  });

  defineEmits(['update-col-width']);
  const dynamicHeight = ref(500);

  const tableCardWrapper = shallowRef<InstanceType<typeof Card>>();

  const rowKey = (rowData: RowData) => rowData[props.config?.primaryKey || ''];
  const rowProps = (row: RowData): any => {
    if (!!props.rowColor && !!row[props.rowColor]) {
      return {
        style: 'cursor: pointer;background:' + row[props.rowColor],
        ondblclick: (e: MouseEvent) => {
          // 若双击发生在展开图标单元格内，则阻止触发行的双击事件
          const target = e.target as HTMLElement | null;
          if (target && target.closest('.expand-trigger-cell')) {
            e.stopPropagation();
            return;
          }
          props.config?.onRowClick?.(row);
        },
      };
    }
    return {
      style: 'cursor: pointer',
      ondblclick: (e: MouseEvent) => {
        // 若双击发生在展开图标单元格内，则阻止触发行的双击事件
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.expand-trigger-cell')) {
          e.stopPropagation();
          return;
        }
        props.config?.onRowClick?.(row);
      },
    };
  };
  const calcTableHeight = debounce(() => {
    const elem = tableCardWrapper.value?.$el;
    if (elem) {
      const rect = elem.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      dynamicHeight.value = windowHeight - rect.top - 25;
    }
  }, 50);
  const paginationReactive = reactive({
    page: props.config.page || 1,
    pageSize: props.config.pageSize || 20,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 15, 20],
    itemCount: props.config?.itemCount,
    pageCount: props.config?.pageCount,
    suffix: () => {
      return `总计: ${paginationReactive.itemCount || props.config?.dataSource.length || 0} 条记录`;
    },
    onChange: (page: number) => {
      paginationReactive.page = page;
      props.config?.onPageNumberChange?.(page);
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
      props.config?.onPageSizeChange?.(pageSize);
    },
  });

  watch(props.config?.dataSource, () => {
    calcTableHeight();
  });

  // const handleUpdateSorter = (sorter) => {
  //   tableConfig.value.columns.forEach((column) => {
  //     if (column.sortOrder === undefined) return;
  //     if (!sorter) {
  //       column.sortOrder = false;
  //       return;
  //     }
  //     if (column.key === sorter.columnKey) {
  //       column.sortOrder = sorter.order;
  //     } else {
  //       column.sortOrder = false;
  //     }
  //   });
  // };
  watch(
    () => props.config,
    (val) => {
      tableConfig.value = val;
      paginationReactive.itemCount = tableConfig.value.itemCount;
      paginationReactive.pageCount = tableConfig.value.pageCount;
      paginationReactive.page = tableConfig.value.page;
    },
    {
      deep: true,
      immediate: true,
    },
  );
  onMounted(() => {
    window.addEventListener('resize', calcTableHeight, {
      passive: false,
    });
    calcTableHeight();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', calcTableHeight);
  });
</script>
<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
  }
  :deep(.n-data-table-td--last-col) {
    padding: 0;
  }
  :deep(.class-name) {
    background-color: transparent !important;
  }
  :deep(.n-data-table .n-data-table-tr:not(.n-data-table-tr--summary):hover > .n-data-table-td) {
    // background-color: #eaf6ff;
    background-color: #fafafa;
    color: #f4a14c;
  }
  :deep(.n-data-table .n-data-table-th) {
    // background-color: #eff8ff;
    background-color: #fafafa;
    // border-bottom: 1px solid #d9d9d9;
    border-bottom: 1px solid #eee;
    // padding: 12px;
  }
  :deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-th) {
    border-right: 1px solid #eee;
  }
</style>
