<template>
  <div style="margin-left: 16px; line-height: 40px">
    <template v-if="preNodes.length != 0">
      <template v-if="preNodes.length == 1">{{ preNodes[0].Name }}</template>
      <template v-else>
        <a href="javaScript:void(0)" @click="clickNode(preNodes[preNodes.length - 2])">{{ preNodes[preNodes.length - 2].Name }}</a>
        <span> / {{ preNodes[preNodes.length - 1].Name }}</span>
      </template>
    </template>
  </div>

  <RadioGroup v-if="isMultiSelect === false" v-model="checkedList">
    <CellGroup inset>
      <Cell v-for="item in plainOptions" clickable :key="item.No" :title="item.Name" @click="checkedList = item">
        <template #right-icon>
          <Radio :name="item" @click="isRemove = true" />
        </template>
      </Cell>
      <Cell v-for="tree in treeData" clickable :key="tree.No" :title="tree.Name" is-link class="icon-folder" @click="clickNode(tree)" />
    </CellGroup>
  </RadioGroup>
  <CheckboxGroup v-else v-model="checkedList">
    <CellGroup inset>
      <Cell v-for="(item, index) in plainOptions" clickable :key="item.No" :title="item.Name" @click="toggle(index)">
        <template #right-icon>
          <Checkbox :name="item" :ref="(el) => (checkboxRefs[index] = el)" @click.stop @click="isRemove = true" />
        </template>
      </Cell>
      <Cell v-for="tree in treeData" clickable :key="tree.No" :title="tree.Name" is-link class="icon-folder" @click="clickNode(tree)" />
    </CellGroup>
  </CheckboxGroup>
</template>

<script lang="ts" setup>
  import { RadioGroup, CellGroup, Cell, Radio, CheckboxGroup, Checkbox, showFailToast } from 'vant';
  import { onMounted, ref, watch } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

  const props = defineProps({
    parentNo: {
      type: String,
      default: '',
    },
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    selectedTreeNode: {
      type: String,
      default: '',
    },
    selectedItems: {
      type: String,
      default: '',
    },
    selectedItemNames: {
      type: String,
      default: '',
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
  });

  interface CheckedItem {
    No: string;
    Name: string;
  }

  const islazy = ref(false);
  // 选中的节点
  const checkedList = ref(); //选择的节点
  const allCheckList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]); //当前目录下的实体集合
  const checkedNames = ref<string[]>([]); //选择节点的名称集合
  const checkboxRefs = ref([]);
  const preNodes = ref<any[]>([]); //点击的目录集合
  const loadingList = ref(false);
  const treeData = ref<TreeDataItem[]>([]);
  const { listToTree } = useTreeConvert();
  const isRemove = ref(false);
  const toggle = (index) => {
    isRemove.value = true;
    checkboxRefs.value[index].toggle();
  };
  watch(
    () => checkedList.value,
    () => {
      const list: any[] = [];
      if (props.isMultiSelect == false) {
        if (isRemove.value == true) {
          allCheckList.value = [];
          checkedNames.value = [];
          allCheckList.value.push(checkedList.value.No);
          checkedNames.value.push(checkedList.value.Name);
        }
        return;
      }
      for (const item of checkedList.value) {
        if (props.isMultiSelect == true) {
          if (allCheckList.value.includes(item.No) == false) {
            allCheckList.value.push(item.No);
            checkedNames.value.push(item.Name);
          }
        }

        list.push(item.No);
      }
      if (isRemove.value == true) {
        const arr = plainOptions.value.filter((item) => list.includes(item.No) == false);
        for (const option of arr) {
          const index = allCheckList.value.findIndex((item) => item === option.No);
          if (index != -1) {
            allCheckList.value.splice(index, 1);
            checkedNames.value.splice(index, 1);
          }
        }
      }
    },
  );
  const parseTreeData = ref<TreeDataItem[]>([]);
  const GetTree = async (parentNo: string) => {
    const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.Tree";
    const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:parentNo,...props.rowData});
    const tree = listToTree(parentNo, data.slice(0, data.length));
    treeData.value = tree as TreeDataItem[];
    parseTreeData.value = cloneDeep(treeData.value);
  };
  const GetEns = async (treeNo: any) => {
    try {
      loadingList.value = true;
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.Dtl";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:treeNo,...props.rowData});
      plainOptions.value = data.filter((item) => item.No != treeNo);
      checkedList.value = allCheckList.value.filter((item) => plainOptions.value.filter((option) => option.No === item).length > 0);
    } catch (e: any) {
      console.error(e);
      showFailToast(e.toString());
    } finally {
      loadingList.value = false;
    }
  };

  const clickNode = async (treeNode) => {
    isRemove.value = false;
    //判断是否存在当前集合中
    const idx = preNodes.value.findIndex((item) => item.No == treeNode.No);
    if (idx != -1) {
      preNodes.value = preNodes.value.slice(0, idx);
    }
    preNodes.value.push({ No: treeNode.No, Name: treeNode.Name });
    if (islazy.value == false) {
      treeData.value = treeNode.children;
      if (idx != -1) {
        let data: TreeDataItem[] | undefined = [];
        for (let i = 0; i <= idx; i++) {
          if (i == 0) data = parseTreeData.value.filter((item) => item.No === preNodes.value[i].No)[0].children;
          else data = data?.filter((item) => item.No === preNodes.value[i].No)[0].children;
        }
        treeData.value = data || [];
      }
      await GetEns(treeNode.No);
      for (const item of plainOptions.value) {
        if (allCheckList.value.includes(item.No) == true) {
          if (props.isMultiSelect == true) checkedList.value.push(item);
          else checkedList.value = item;
          break;
        }
      }
      return;
    }
    await GetTree(treeNode.No);
    await GetEns(treeNode.No);
    for (const item of plainOptions.value) {
      if (allCheckList.value.includes(item.No) == true) {
        if (props.isMultiSelect == true) checkedList.value.push(item);
        else checkedList.value = item;
      }
    }
  };

  onMounted(async () => {
    islazy.value = props.mapExt.AtPara.includes('@IsLazy=1');
    await GetTree(props.parentNo);
    if (treeData.value.length === 0) {
      return;
    }
    if (props.selectedItems) {
      allCheckList.value = props.selectedItems === ',' ? [] : props.selectedItems.split(',');
      checkedNames.value = props.selectedItemNames === ',' ? [] : props.selectedItemNames.split(',');
      if (props.isMultiSelect === true) {
        for (let i = 0; i < allCheckList.value.length; i++) {
          checkedList.value.push({
            No: allCheckList.value[i],
            Name: checkedNames.value[i],
          });
        }
      } else {
        if (allCheckList.value.length > 0) checkedList.value = { No: allCheckList.value[0], Name: checkedNames.value[0] };
      }
    }
    await GetEns(props.parentNo);
    if (props.parentNo != '0') preNodes.value.push({ No: treeData.value[0].No, Name: treeData.value[0].Name });
  });

  defineExpose({
    allCheckList,
    checkedNames,
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
  :deep(.icon-folder > .van-cell__title) {
    padding-left: 5px;
  }
</style>
