<template>
  <Tabs style="margin-top: 20px" v-model:activeKey="activeKey" type="card">
    <TabPane v-for="subTable in subTables" :tab="subTable.Title" :key="subTable.ClassMethod">
      <div class="en-sub-table-wrapper">
        <!-- <div class="sub-table-title">{{ subTable.Title }}</div> -->
        <div class="sub-table-content">
          <component :is="useCachedComponentLoader(subTable.ClassMethod as string)" :params="getParams(subTable.ClassMethod as string)" />
        </div>
      </div>
    </TabPane>
  </Tabs>
</template>

<script lang="ts" setup>
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { Tabs, TabPane } from 'ant-design-vue';
  import { onMounted, ref, type PropType } from 'vue';
  const props = defineProps({
    subTables: {
      type: Object as PropType<Array<RefMethod>>,
    },
    entityName: {
      type: String,
    },
    innerPKVal: {
      type: [String, Number],
    },
  });
  const activeKey = ref<any>('');
  const getSubPagesUrl = (url: string) => {
    const hasQuerySymbol = url.includes('?');
    return url + `${hasQuerySymbol ? '&' : '?'}EnClassID=${props.entityName}&PKVal=${props.innerPKVal}`;
  };
  const getParams = (url: string) => getAllRequestParams(getSubPagesUrl(url));

  onMounted(() => {
    if (Array.isArray(props.subTables) && props.subTables.length > 0) {
      activeKey.value = props.subTables?.[0]?.ClassMethod;
    } else {
      activeKey.value = '';
    }
  });
</script>

<style lang="less" scoped>
  :deep(.ant-tabs-nav-wrap) {
    background-color: transparent !important;
  }
  .en-sub-table-wrapper {
    background-color: white;
    box-sizing: border-box;
    position: relative;
    :deep(.vben-basic-table .ant-table-wrapper) {
      margin-bottom: 0 !important;
    }
    .sub-table-title {
      font-size: 16px;
      font-weight: bold;
      box-sizing: border-box;
      padding: 8px 14px 0 14px;
      position: absolute;
      background-color: white;
      left: 0px;
      top: -20px;
      z-index: 50;
    }
    .sub-table-content {
      height: 100%;
    }
  }
</style>
