<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <div class="filter-panel">
      <div class="search-keys" style="margin-bottom: 10px">
        <Input
          v-for="sInfo in searchInfo"
          :key="sInfo.key"
          :style="{ width: '100%', marginRight: '4px' }"
          enter-button
          :placeholder="'请输入' + sInfo.title"
          v-model:value="sInfo.value"
          @keydown.enter="filterByKeyWord()"
        />
      </div>
      <div class="action">
        <Button type="primary" style="margin-right: 12px" @click="filterByKeyWord()">{{ '查询' }}</Button>
        <Button type="default" @click="resetSearch()">{{ '重置' }}</Button>
      </div>
    </div>
    <NDataTable
      v-if="!loadingList"
      :columns="columns"
      :data="dataSource"
      :row-key="rowKey"
      :checked-row-keys="checkedList"
      :scroll-x="0"
      :pagination="paginationReactive"
      @update:checked-row-keys="handleCheck"
      flex-height
      :style="{
        height: `${dynamicHeight}px`,
      }"
      striped
    />
  </NConfigProvider>
</template>

<script lang="ts" setup>
  import { Input, Button, message } from 'ant-design-vue';
  import { DataTableColumns, NDataTable, NConfigProvider, zhCN, dateZhCN, DataTableRowKey } from 'naive-ui';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { RowData, RowKey } from 'naive-ui/es/data-table/src/interface';
  import { h, inject, onMounted, reactive, ref } from 'vue';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { debounce } from 'lodash';
  import { Page } from '/@/bp/UIEntity/Page';
  import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
  const props = defineProps({
    listSql: {
      type: [String, Function, Array],
      default: '',
    },
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    selectedItems: {
      type: String,
      default: '',
    },
    columns: {
      type: Object as PropType<DataTableColumns<RowData>>,
      default: () => ({}),
    },
    currentPage: {
      type: Object as PropType<Page>,
      default: () => ({}),
    },
    pageObj: {
      type: Object as PropType<PageBaseGroupNew>,
      default: () => ({}),
    },
    searchKeys: {
      type: String,
      default: () => '',
    },
  });

  // const keyword = ref('');
  const columns = ref<DataTableColumns<RowData>>([]);
  const searchInfo = ref<Recordable[]>([]);
  const dynamicHeight = ref(400);
  const rowKey = (row: RowData) => {
    return row['No'] || row['OID'] || row['WorkID'];
  };

  const resetSearch = () => {
    dataSource.value = originDataSource.value;
    for (const sInfo of searchInfo.value) {
      sInfo.value = '';
    }
  };
  const filterByKeyWord = debounce(() => {
    const isEmpty = searchInfo.value.filter((s) => s.value == '').length == searchInfo.value.length;
    if (!isEmpty) {
      dataSource.value = originDataSource.value;
    }

    // 多条件查询
    let tableData: Array<Recordable> = originDataSource.value;
    for (const sInfo of searchInfo.value) {
      if (sInfo.value == '') {
        continue;
      }
      if (sInfo.key == '名称') {
        tableData = tableData.filter((td) => td['Name'].includes(sInfo.value));
        continue;
      }
      tableData = tableData.filter((td) => (td[sInfo.key] + '').includes(sInfo.value));
    }
    dataSource.value = tableData;
  }, 200);

  const updateCount = inject('updateCount') as Function;

  const handlePreSelectItems = () => {
    if (props.selectedItems) {
      const selectedItems = props.selectedItems.split(',').map((item) => item.trim());
      checkedList.value = selectedItems;
      updateCount?.(checkedList.value.length);
    }
  };

  const paginationReactive = reactive({
    page: 1,
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [10, 15, 20],
    onChange: (page: number) => {
      paginationReactive.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
      paginationReactive.pageSize = pageSize;
      paginationReactive.page = 1;
    },
  });

  // 选中的节点
  const checkedList = ref<RowKey[]>([]);
  const checkedNames = ref<string[]>([]);

  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedList.value = rowKeys;
    checkedNames.value = originDataSource.value.filter((row) => rowKeys.includes(row['No'] || row['OID'] || row['WorkID'])).map((row) => row['Name']);
    // 如果是多选模式，checkedNames.value 需要包含所有选中行的
    // checkedNames.value = rowList.map((row) => row.Name);
    updateCount?.(checkedList.value.length);
  };
  const loadingList = ref(false);
  // end
  const dataSource = ref<Recordable[]>([]);
  const originDataSource = ref<Recordable[]>([]);
  onMounted(async () => {
    try {
      const { getDBSource } = useDBSourceLoader();
      loadingList.value = true;
      const { listSql } = props;
      if (!listSql || typeof listSql === 'function') {
      }
      let data;
      if (Array.isArray(listSql)) data = listSql as [];
      else data = await getDBSource(listSql as string);
      if (!Array.isArray(data)) {
        return;
      }
      // 如果定义了表格列
      if (Array.isArray(props.columns) && props.columns.length > 0) {
        columns.value = [
          {
            type: 'selection',
            fixed: 'left',
            multiple: props.isMultiSelect,
          },
          ...(props.columns as DataTableColumns<RowData>),
        ];
        // 使用预设规则 Name列 处理原始数据
      } else {
        let keys: string[] = [];
        if (typeof props.currentPage?.ex_params?.columns === 'function') {
          const func = props.currentPage.ex_params.columns.bind(props.pageObj);
          const columns1 = await func();
          columns.value = [
            {
              type: 'selection',
              fixed: 'left',
              multiple: props.isMultiSelect,
            },
            ...columns1,
          ];
        } else {
          if (data.length == 0) {
          } else {
            keys = Object.keys(data[0]);
          }

          if (Array.isArray(keys) && keys.includes('Name')) {
            keys = keys.map((key) => {
              if (key === 'Name') {
                return '名称';
              }
              return key;
            });
          }
          columns.value = columns.value.concat(
            [
              {
                type: 'selection',
                fixed: 'left',
                multiple: props.isMultiSelect,
              },
            ],
            keys
              .filter((key) => key.toLowerCase() !== 'no')
              .map((key) => {
                const obj: any = {
                  title: key,
                  width: 200,
                  key: key,
                };
                if (key !== 'No') {
                  obj.render = (row) => {
                    return h('div', {
                      innerHTML: row[key],
                    });
                  };
                }
                if (key === '名称') {
                  obj.render = (row) => {
                    return h('div', {
                      innerHTML: row['Name'],
                    });
                  };
                }
                return obj;
              }),
          );
        }
      }

      let sKeys: string[] = [];
      if (typeof props.searchKeys === 'string') {
        sKeys = props.searchKeys
          .split(',')
          .map((sk) => sk.trim())
          .filter((sk) => !!sk);
      }

      searchInfo.value = columns.value
        .filter((c) => c.type !== 'selection')
        .map((c) => {
          return {
            key: c['key'],
            title: c['title'],
            value: '',
          };
        });

      if (sKeys.length > 0) {
        searchInfo.value = searchInfo.value.filter((s) => sKeys.includes(s.key));
      }

      originDataSource.value = data;

      filterByKeyWord();
      handlePreSelectItems();
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });

  defineExpose({
    checkedList,
    checkedNames,
  });
</script>

<style lang="less" scoped>
  .filter-panel {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 12px;
    .search-keys {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    .action {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }
  }
</style>
