<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <ThemeWrapper>
      <Card ref="tableCardWrapper" class="card-of-table">
        <NDataTable
          v-if="!loading"
          :remote="remote"
          :columns="tableConfig.columns"
          :data="tableConfig?.dataSource"
          :row-key="rowKey"
          :checked-row-keys="tableConfig.checkedItems"
          :pagination="paginationReactive"
          @update:checked-row-keys="tableConfig.onUpdateCheckedItems"
          :row-props="rowProps"
          flex-height
          :scroll-x="totalWidth"
          :style="{
            height: `${dynamicHeight}px`,
          }"
          striped
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
    page: 1,
    pageCount: 1,
    onPageSizeChange: () => {},
    onPageNumberChange: () => {},
    primaryKey: '',
    checkedItems: [],
    onUpdateCheckedItems: () => {},
    onRowClick: () => {},
    ready: false,
  });
  const loading = ref(false);
  /*const refreshing = ref(false);
  const finished = ref(false);

  const checkIds = ref<any[]>([]);
  const onRefresh = () => {
    paginationReactive.page = 1;
    props.config?.onPageNumberChange?.(1);
  };
  const ListClick = (row) => {
    props.config?.onRowClick?.(row);
  };*/
  const dynamicHeight = ref(500);
  const tableCardWrapper = shallowRef<InstanceType<typeof Card>>();

  const rowKey = (rowData: RowData) => rowData[props.config?.primaryKey || ''];
  const rowProps = (row: RowData): any => {
    return {
      style: 'cursor: pointer',
      ondblclick: () => {
        props.config?.onRowClick?.(row);
      },
    };
  };
  const calcTableHeight = debounce(() => {
    const elem = tableCardWrapper.value?.$el;
    if (elem) {
      const rect = elem.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      dynamicHeight.value = windowHeight - rect.top - 70;
    }
  }, 50);
  const paginationReactive = reactive({
    page: props.config.page || 1,
    pageSize: props.config.pageSize || 20,
    showSizePicker: true,
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

  watch(
    () => props.config,
    (val) => {
      tableConfig.value = val;
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
  :deep(.van-checkbox__label) {
    width: calc(100% - 25px);
  }
  .item-list {
    width: 100%;
    text-align: left;
  }
  .item-content {
    font-size: 12px;
    line-height: 18px;
    span {
      color: #969799;
    }
  }
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 5px;
    background-color: #fff;
  }
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
  .vant-cell__value {
    position: relative;
    overflow: hidden;
    color: var(--van-cell-value-color);
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
  }
</style>
