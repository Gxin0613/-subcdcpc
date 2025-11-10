<template>
  <Spin :spinning="loading">
    <Tree
      v-if="islazy == false"
      :checkable="isMultiSelect"
      :tree-data="treeData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="selectedKeys"
      :fieldNames="fieldNames"
      @check="checkNodes"
    />
    <!--懒加载-->
    <Tree
      v-else
      :checkable="isMultiSelect"
      :tree-data="treeData"
      :load-data="onLoadData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="selectedKeys"
      :fieldNames="fieldNames"
      @check="checkNodes"
    />
  </Spin>
</template>

<script lang="ts" setup>
  import { message, Tree, Spin } from 'ant-design-vue';
  import { onMounted, ref, watch } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';

  const props = defineProps({
    treeSql: {
      type: String,
      default: '',
    },
    parentNo: {
      type: String,
      default: '',
    },
    selectedItems: {
      type: String,
      default: '',
    },
    isMultiSelect: {
      type: Boolean,
      default: true,
    },
    isLazily: {
      type: Boolean,
      default: false,
    },
  });

  // tree
  const islazy = props.isLazily;
  let originalList: Array<CheckedItem> = []; // 原始数据
  const loading = ref(false);
  const checkedNames = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const fieldNames = ref({
    title: 'Name',
    key: 'No',
  });
  const treeData = ref<TreeDataItem[]>([]);
  const checkNodes = (items: string[]) => {
    selectedKeys.value = [...items];
  };
  watch(
    () => selectedKeys.value,
    (val) => {
      const tempArr: string[] = [];
      for (const option of originalList) {
        if (val.includes(option.No)) {
          tempArr.push(option.Name);
        }
      }
      checkedNames.value = tempArr;
    },
  );

  // end
  interface CheckedItem {
    No: string;
    Name: string;
  }

  const { listToTree } = useTreeConvert();
  const { getDBSource } = useDBSourceLoader();
  onMounted(async () => {
    try {
      loading.value = true;
      let { treeSql, parentNo } = props;
      if (!treeSql) {
        message.error(`未能执行SQL- 传入 props.TreeSQL 为空 [ ${treeSql} ]`);
        return;
      }
      if (treeSql.toLowerCase().includes('@key')) treeSql = treeSql.replace(/@Key/g, parentNo).replace(/@key/g, parentNo);
      const data = await getDBSource(treeSql);
      originalList = cloneDeep(data);
      const tree = listToTree(parentNo, data.slice(0, data.length));
      treeData.value = tree as TreeDataItem[];
      if (treeData.value.length === 0) {
        return;
      }
      expandedKeys.value = [treeData.value[0].No];
      if (!props.selectedItems) return;
      selectedKeys.value = props.selectedItems?.split(',') || [];
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  });
  const onLoadData = async (treeNode) => {
    try {
      loading.value = true;
      treeNode.dataRef.children = await getDBSource(props.treeSql.replace(/@Key/g, treeNode.dataRef.No));
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  defineExpose({
    checkedNames,
    checkedList: selectedKeys,
  });
</script>

<style lang="less" scoped>
  .list-picker {
    height: 100%;
    border-left: 1px solid #e8e8e8;
    padding-left: 6px;

    .header {
      padding-bottom: 12px;
      padding-left: 12px;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.ant-checkbox-group) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      padding-left: 12px;
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
