<template>
  <Card ref="tableCardWrapper" class="card-of-table">
    <NDataTable
      :loading="loadingData"
      remote
      :columns="columns"
      :data="dataSource"
      :row-key="rowKey"
      :checked-row-keys="checkedRowKeysRef"
      :pagination="paginationReactive"
      @update:checked-row-keys="handleCheck"
      @update:page="query"
      @update:sorter="handleSorterChange"
      :row-props="rowProps"
      :summary="createSummary"
      :scroll-x="0"
      flex-height
      :style="{
        height: `${dynamicHeight}px`,
      }"
      striped
      :size="columnSize ? columnSize : 'large'"
    />
  </Card>
</template>

<script lang="tsx">
  const props = {
    loadingData: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    dataSource: {
      type: Array,
      default: () => [],
    }
  };
  export default defineComponent({
    name: 'EnTable',
    props: {},
  });
</script>
