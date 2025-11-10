<template>
  <Spin :spinning="loading">
    <div v-if="isShowSearch && islazy === false" class="flex p-1">
      <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="width: 100%">
        <FormItem :label="'关键字'">
          <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @pressEnter="Search" allow-clear />
        </FormItem>
        <FormItem>
          <Button type="primary" class="btn_style" @click="Search">{{ '查询' }}</Button>
        </FormItem>
      </Form>
    </div>
    <Tree
      v-if="islazy == false"
      :checkStrictly="true"
      :checkable="isMultiSelect"
      :tree-data="treeData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="checkedKeys"
      :fieldNames="fieldNames"
      @check="checkNodes"
      @select="treeNodeSelect"
    >
      <template #title="{ Name }">
        <span v-if="Name.indexOf(searchKey) > -1">
          {{ Name.substr(0, Name.indexOf(searchKey)) }}
          <span style="color: #f50">{{ searchKey }}</span>
          {{ Name.substr(Name.indexOf(searchKey) + searchKey.length) }}
        </span>
        <span v-else>{{ Name }}</span>
      </template>
    </Tree>
    <!--懒加载-->
    <Tree
      v-else
      :virtual="true"
      :checkStrictly="true"
      :checkable="isMultiSelect"
      :tree-data="treeData"
      :load-data="onLoadData"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="checkedKeys"
      :fieldNames="fieldNames"
      @check="checkNodes"
      @select="treeNodeSelect"
    />
  </Spin>
</template>

<script lang="ts" setup>
  import { message, Tree, Form, FormItem, Input, Button, Spin } from 'ant-design-vue';
  import { inject, onMounted, ref, watch } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import type { Key } from 'ant-design-vue/es/vc-tree/interface';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  import _ from 'lodash';
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
    isShowSearch: {
      type: Boolean,
      default: false,
    },
    isLazily: {
      type: Boolean,
      default: false,
    },
  });
  const searchKey = ref('');
  // tree
  const islazy = ref(props.isLazily); //props.treeSql?.includes('@Key');
  let originalList: Array<CheckedItem> = []; // 原始数据
  const _arrMap = new Map();
  const loading = ref(false);
  const checkedNames = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<Key[]>([]);
  const checkedKeys = ref<string[]>([]);
  const fieldNames = ref({
    title: 'Name',
    key: 'No',
  });
  //获取query数据
  const { query }: any = useRoute();
  type CheckedKeys = { checked: Key[]; halfChecked: Key[] };
  const treeData = ref<TreeDataItem[]>([]);
  const checkNodes = (items: CheckedKeys | Key[]) => {
    if (!!(items as CheckedKeys).checked) selectedKeys.value = [...(items as CheckedKeys).checked];
    else selectedKeys.value = [...(items as Key[])];
  };
  const treeNodeSelect = async (selectedKeys, e) => {
    const toArray = (list) => Array.from(list || []);
    // 获取被点击的树节点
    const node = e.nativeEvent?.target?.closest('.ant-tree-treenode');
    // 获取复选框
    const checkbox: any = toArray(node?.childNodes).find((item: any) => {
      return toArray(item?.classList).findIndex((className) => className == 'ant-tree-checkbox') != -1;
    });
    // 模拟点击
    checkbox?.click();
  };
  const updateCount = inject('updateCount') as Function;

  watch(
    () => selectedKeys.value,
    (val) => {
      const tempArr: string[] = [];
      for (const key of val) {
        const item = _arrMap.get(key);
        if (item) {
          tempArr.push(item.Name);
        }
      }
      checkedNames.value = tempArr;
      updateCount?.(tempArr.length);
    },
  );

  // end
  interface CheckedItem {
    No: string;
    Name: string;
  }
  // 处理获取树数据的sql，替换@Key（SAAS模式admin用户替换@FlowNo）
  const treeSQLData = async (sqlStr, keyReplace) => {
    let treeSql: string = sqlStr;
    if (treeSql.toLowerCase().includes('@flowno')) {
      if (!query?.FlowNo) {
        message.info('地址栏没有获取到FlowNo');
      }
      //增加SAAS模式FlowNo关键字替换
      if (CCBPMRunModel.SAAS == WebUser.CCBPMRunModel) {
        treeSql = treeSql.replace(/@FlowNo/g, query?.FlowNo).replace(/@flowno/g, query?.FlowNo);
      }
    }
    if (treeSql.toLowerCase().includes('@webuser.orgno')) {
      if (CCBPMRunModel.SAAS == WebUser.CCBPMRunModel) {
        treeSql = treeSql.replace(/@WebUser.OrgNo/g, WebUser.OrgNo || '').replace(/@webuser.orgno/g, WebUser.OrgNo || '');
      }
    }
    // if (treeSql.toLowerCase().includes('@key')) {
    //   treeSql = treeSql.replace(/@Key/g, keyReplace).replace(/@key/g, keyReplace);
    // }
    if (treeSql.startsWith('DBSrc.')) treeSql += '@Key=' + keyReplace;
    const data = await getDBSource(treeSql, 'local', '@Key=' + keyReplace);
    return data;
  };

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
      const data = await treeSQLData(treeSql, parentNo);
      originalList = cloneDeep(data);
      for (const item of originalList) {
        _arrMap.set(item.No, item);
      }
      const tree = listToTree(parentNo, data.slice(0, data.length));
      treeData.value = tree as TreeDataItem[];
      if (treeData.value.length === 0) {
        return;
      }
      expandedKeys.value = [treeData.value[0].No];
      if (!props.selectedItems) return;
      const preSelectKeys = props.selectedItems?.split(',') || [];
      selectedKeys.value = preSelectKeys;
      checkedKeys.value = preSelectKeys;
      expandedKeys.value = expandedKeys.value.concat(preSelectKeys);
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  });
  const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.No === key)) {
          parentKey = node.No;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };
  /**
   * 查询
   * @constructor
   */
  const Search = () => {
    const expanded = originalList
      .map((item) => {
        if (item.Name.includes(searchKey.value)) {
          return getParentKey(item.No, treeData.value);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    expandedKeys.value = expanded;
  };
  const onLoadData = async (treeNode) => {
    try {
      loading.value = true;
      const data = await treeSQLData(props.treeSql, treeNode.dataRef.No);
      treeNode.dataRef.children = data.filter((item) => item.No != treeNode.No);
      treeData.value = [...treeData.value];
      for (const item of data) {
        _arrMap.set(item.No, item);
      }
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
    .text-blue {
      color: blue !important;
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
