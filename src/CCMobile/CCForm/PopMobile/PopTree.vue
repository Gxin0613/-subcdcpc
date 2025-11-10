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
      <Cell v-for="item in treeData" clickable :key="item.No" class="van_cell_override" :title="item.Name" @click="clickNode(item)">
        <template #right-icon>
          <Icon name="arrow" class="arrow-icon" />
        </template>
        <template #icon>
          <Radio :name="item" @click.stop="isRemove = true" />
        </template>
      </Cell>
    </CellGroup>
  </RadioGroup>
  <CheckboxGroup v-else v-model="checkedList">
    <CellGroup inset>
      <Cell v-for="item in treeData" clickable class="van_cell_override" :key="item.No" :title="item.Name" @click="clickNode(item)">
        <template #icon>
          <Checkbox style="margin-right: 12px" :name="item" @click.stop="isRemove = true" />
        </template>
        <template #right-icon>
          <Icon name="arrow" />
        </template>
      </Cell>
    </CellGroup>
  </CheckboxGroup>
</template>

<script lang="ts" setup>
  import { RadioGroup, CellGroup, Cell, Radio, CheckboxGroup, Checkbox, Icon, showFailToast, showToast } from 'vant';
  import { onMounted, ref, watch } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { cloneDeep } from 'lodash-es';
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
    selectedItemNames: {
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
    mainData: {
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

  // tree
  const islazy = ref(false);
  const parseTreeData = ref<TreeDataItem[]>([]);
  const loading = ref(false);
  const checkedList = ref<Recordable[]>([]); //选择的节点
  const allCheckList = ref<string[]>([]);
  const checkedNames = ref<string[]>([]);

  const preNodes = ref<any[]>([]); //点击的目录集合
  const treeData = ref<TreeDataItem[]>([]);
  const isRemove = ref(false);
  const isShowFullPath = ref(false);

  watch(
    () => checkedList.value,
    () => {
      const list: any[] = [];
      if (props.isMultiSelect == false) {
        if (isRemove.value == true) {
          allCheckList.value = [];
          checkedNames.value = [];
          allCheckList.value.push(checkedList.value.No);
          if (isShowFullPath.value) {
            let _name = '';
            preNodes.value.forEach((item) => {
              if (item.ParentNo != props.parentNo) {
                _name += item.Name + '/';
              }
            });
            _name += checkedList.value.Name;
            checkedNames.value.push(_name);
          } else {
            checkedNames.value.push(checkedList.value.Name);
          }
        }
        return;
      }
      for (const item of checkedList.value) {
        if (props.isMultiSelect == true) {
          if (allCheckList.value.includes(item.No) == false) {
            allCheckList.value.push(item.No);
            if (isShowFullPath.value) {
              let _name = '';
              preNodes.value.forEach((item) => {
                if (item.ParentNo != props.parentNo) {
                  _name += item.Name + '/';
                }
              });
              _name += item.Name;
              checkedNames.value.push(_name);
            } else {
              checkedNames.value.push(item.Name);
            }
          }
        }

        list.push(item.No);
      }
      if (isRemove.value == true) {
        const arr = treeData.value.filter((item) => list.includes(item.No) == false);
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
  const { listToTree } = useTreeConvert();
  const GetTree = async (parentNo: string, treeNode) => {
    try{
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.TreeDB";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:parentNo,...props.rowData});
      if (Array.isArray(data) && data.length == 0) {
        showToast('当前节点下数据为空');
        return;
      }
      if (!!treeNode) {
        const idx = preNodes.value.findIndex((item) => item.No == treeNode.No);
        if (idx != -1) {
          preNodes.value = preNodes.value.slice(0, idx);
        } else {
          preNodes.value.push({ No: treeNode.No, Name: treeNode.Name, ParentNo: treeNode.ParentNo });
        }
      }
      const tree = listToTree(parentNo, data.slice(0, data.length));

      treeData.value = tree as TreeDataItem[];
      parseTreeData.value = cloneDeep(treeData.value);
    }catch(e){
      showFailToast(e as string);
      console.log(e);
      parseTreeData.value=[];
    }
  };

  const clickNode = async (treeNode) => {
    isRemove.value = false;

    if (islazy.value == false) {
      if (!treeNode.children || (Array.isArray(treeNode.children) && treeNode.children.length == 0)) {
        showToast('当前节点下数据为空');
        return;
      }
      const idx = preNodes.value.findIndex((item) => item.No == treeNode.No);
      if (idx != -1) {
        preNodes.value = preNodes.value.slice(0, idx);
      } else {
        preNodes.value.push({ No: treeNode.No, Name: treeNode.Name, ParentNo: treeNode.ParentNo });
      }
      treeData.value = treeNode.children;
      if (idx != -1) {
        let data: TreeDataItem[] | undefined = [];
        for (let i = 0; i <= idx; i++) {
          if (i == 0) data = parseTreeData.value.filter((item) => item.No === preNodes.value[i].No)[0].children;
          else data = data?.filter((item) => item.No === preNodes.value[i].No)[0].children;
        }
        treeData.value = data || [];
      }

      for (const item of treeData.value) {
        if (allCheckList.value.includes(item.No) == true) {
          if (props.isMultiSelect == true) checkedList.value.push(item);
          else checkedList.value = item;
          break;
        }
      }

      return;
    }
    await GetTree(treeNode.No, treeNode);

    for (const item of treeData.value) {
      if (allCheckList.value.includes(item.No) == true) {
        if (props.isMultiSelect == true) checkedList.value.push(item);
        else checkedList.value = item;
      }
    }
  };

  onMounted(async () => {
    try {
      loading.value = true;
      await GetTree(props.parentNo,null);
      if (treeData.value.length === 0) {
        return;
      }
      islazy.value = props.mapExt.AtPara.includes('@IsLazy=1');
      isShowFullPath.value = props.mapExt.AtPara.includes('@IsShowFullPath=1');
      if (!props.selectedItems) return;
      allCheckList.value = props.selectedItems?.split(',') || [];
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
    } catch (e: any) {
      showFailToast(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  });
  defineExpose({
    allCheckList,
    checkedNames,
  });
</script>

<style lang="less" scoped>
  .van_cell_override {
    margin-left: 5px;
    align-items: center;
  }
</style>
