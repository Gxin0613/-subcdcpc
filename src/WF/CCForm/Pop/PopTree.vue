<template>
  <Spin :spinning="loading">
    <div class="pop-tree">
      <div class="search-input" style="margin-bottom: 16px">
        <div class="item">
          <span>{{ '关键字' }}</span>
          <Input v-model:value="searchKey" style="width: 100%" :placeholder="placeholder" @press-enter="Search" allow-clear />
        </div>
        <Button type="primary" class="btn_style" @click="Search">{{ '查询' }}</Button>
      </div>
      <Tree
        v-if="islazy == false"
        :checkable="isMultiSelect"
        :multiple="PopSelectType == 0 ? false : true"
        :tree-data="treeData"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        :fieldNames="fieldNames"
        :checkStrictly="checkStrictly"
        @check="(items) => checkNodes(items)"
        @select="(items) => SelectNodes(items)"
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
        :checkable="isMultiSelect"
        :tree-data="treeData"
        :load-data="onLoadData"
        :multiple="PopSelectType == 0 ? false : true"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        :fieldNames="fieldNames"
        :checkStrictly="checkStrictly"
        @check="(items) => checkNodes(items)"
        @select="(items) => SelectNodes(items)"
      >
        <template #title="{ Name }">
          <span v-if="!!Name && Name.indexOf(searchKey) > -1">
            {{ Name.substr(0, Name.indexOf(searchKey)) }}
            <span style="color: #f50">{{ searchKey }}</span>
            {{ Name.substr(Name.indexOf(searchKey) + searchKey.length) }}
          </span>
          <span v-else>{{ Name }}</span>
        </template>
      </Tree>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { message, Tree, Input, Button, Spin } from 'ant-design-vue';
  import { computed, onMounted, ref } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import type { Key } from 'ant-design-vue/es/vc-tree/interface';
  import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

  const props = defineProps({
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
    mapExt: {
      type: Object,
      default: () => {
        return {};
      },
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selectedItemNames: {
      type: String,
      default: '',
    },
    refPKVal: {
      type: [String, Number],
      default: '',
    },
  });
  const searchKey = ref('');
  const placeholder = GetPara(props.mapExt.AtPara, 'SearchTip') || '请输入关键字';
  const PopSelectType = GetPara(props.mapExt.AtPara, 'PopSelectType') || 0;
  // 父子节点关联配置, 参数不包含 NodeCascade = 1 时为严格模式，即选中全部子节点时父节点不选中
  const checkStrictly = !props.mapExt.AtPara.includes('@NodeCascade=1');
  // tree
  const islazy = ref(false); //props.treeSql?.includes('@Key');
  const isShowFullPath = ref(false);
  let originalList: Array<CheckedItem> = []; // 原始数据
  const loading = ref(false);
  const checkedNames = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const parentNo = ref('0');
  // const selectedKeys = ref<string[]>([]); // 如果不需要父子关联
  type CheckedKeys = {
    checked: Key[];
    halfChecked: Key[];
  };

  const linkedKeys = ref<string[]>([]);
  const normalKeys = ref<CheckedKeys>({
    checked: [],
    halfChecked: [],
  }); // 如果需要父子关联
  const checkedKeys = computed({
    get: () => {
      if (checkStrictly) {
        return normalKeys.value;
      }
      return linkedKeys.value;
    },
    set: (val) => {
      if (checkStrictly) {
        normalKeys.value = val as CheckedKeys;
      }
      linkedKeys.value = val as string[];
    },
  });
  const fieldNames = ref({
    title: 'Name',
    key: 'No',
  });
  const checkedList = ref<Key[]>([]);
  const treeData = ref<TreeDataItem[]>([]);
  const checkNodes = (items: CheckedKeys | Key[]) => {
    if (Array.isArray(items)) {
      checkedList.value = items;
    } else {
      checkedList.value = items.checked;
    }
    const tempArr: string[] = [];
    for (const option of originalList) {
      if (checkedList.value.includes(option.No)) {
        if (isShowFullPath.value === true) {
          tempArr.push(GetFullPathName(option));
        } else {
          tempArr.push(option.Name);
        }
      }
    }
    checkedNames.value = tempArr;
  };
  const GetFullPathName = (option) => {
    //不是顶级的
    if (option.ParentNo == parentNo.value) return option.Name;
    let name = [];
    name.push(option.Name);
    let node = option;
    let _parentNo = option.ParentNo;
    while (node.ParentNo != parentNo.value) {
      node = originalList.filter((node) => node.No == _parentNo)[0];
      _parentNo = node.ParentNo;
      if (node.ParentNo == parentNo.value) break;
      name.push(node.Name);
    }

    return name.reverse().join('/');
  };
  const SelectNodes = (items: CheckedKeys | Key[]) => {
    if (props.isMultiSelect == false) checkNodes(items);
  };
  // end
  interface CheckedItem {
    No: string;
    Name: string;
  }

  const { listToTree } = useTreeConvert();
  onMounted(async () => {
    try {
      loading.value = true;
      let { mapExt } = props;
      parentNo.value = props.parentNo;
      if (parentNo.value.includes('@')) parentNo.value = DealExp(parentNo.value, props.rowData);
     
      islazy.value = props.mapExt.AtPara.includes('@IsLazy=1');
      isShowFullPath.value = props.mapExt.AtPara.includes('@IsShowFullPath=1');
      const mypk = 'Frm.'+mapExt.FK_MapData+'_'+mapExt.AttrOfOper+".Pop.TreeDB";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:parentNo.value,OID:props.refPKVal,...props.rowData});
      originalList = cloneDeep(data);
      let tree = data;
      if (islazy.value == false) tree = listToTree(parentNo.value, data.slice(0, data.length));
      console.log({ tree });
      treeData.value = tree as TreeDataItem[];
      if (treeData.value.length === 0) {
        message.warn('根节点[' + parentNo.value + ']没有获取到对应的子节点数据');
        return;
      }
      expandedKeys.value = [treeData.value[0].No];
      if (!props.selectedItems) return;
      const preSelectKeys = props.selectedItems?.split(',') || [];
      checkedNames.value = props.selectedItemNames?.split(',') || [];
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
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.TreeDB";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:treeNode.dataRef.No,OID:props.refPKVal,...props.rowData});
      treeNode.dataRef.children = data.filter((item) => item.No != treeNode.No);
      treeData.value = [...treeData.value];
      if (data.length === 1 && typeof data[0].No === 'undefined') treeNode.dataRef.children = [];
      else {
        treeNode.dataRef.children = data;
        originalList = originalList.concat(data);
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
    checkedList,
  });
</script>

<style lang="less" scoped>
  .pop-tree {
    padding: 6px 14px;

    .search-input {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item {
        display: flex;
        align-items: center;
        margin-right: 16px;

        span {
          margin-right: 8px;
          width: 60px;
        }
      }
    }
  }
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
