<template>
  <div class="list-picker" v-for="group in groupOptions" :key="group.No">
    <div class="header">
      <Checkbox v-model="group.checked" :disabled="!isMultiSelect" @click="onCheckAllChange(group)">
        <span style="font-weight: bold">{{ group.Name }}</span>
      </Checkbox>
    </div>
    <br />
    <div class="body">
      <CheckboxGroup v-model="group.checkedList">
        <CellGroup inset>
          <Cell v-for="item in group.children" clickable :key="item.No" :title="item.Name" style="margin-left: 5px">
            <template #right-icon>
              <Checkbox :name="item" @click="singleCheckboxChange(item)" />
            </template>
          </Cell>
        </CellGroup>
      </CheckboxGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Checkbox, CheckboxGroup, CellGroup, Cell, showFailToast } from 'vant';
  import { onMounted, ref, watch } from 'vue';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';
  const props = defineProps({
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    selectedItems: {
      type: String,
      default: '',
    },
    refPKVal: {
      type: [String, Number],
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
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  interface CheckedItem {
    No: string;
    Name: string;
    checked: boolean;
    checkedList: any[];
    GroupNo?: string;
    children?: CheckedItem[];
  }

  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const groupOptions = ref<CheckedItem[]>([]);
  const checkedNames = ref<string[]>([]);
  const onCheckAllChange = (group: CheckedItem) => {
    group.checkedList = group.checked ? plainOptions.value.filter((item) => item.GroupNo === group.No) : [];
  };
  const singleCheckboxChange = (group: CheckedItem) => {
    if (!props.isMultiSelect) {
      groupOptions.value.forEach((groupOption) => {
        groupOption.checkedList = [];
      });
      setTimeout(() => {
        group.checkedList = [e.target.value];
      });
    }
    return true;
  };
  watch(
    () => groupOptions.value,
    (val) => {
      const groups = val.filter((group) => group.checkedList.length > 0).map((group) => group.checkedList || []);
      const tempCheckedNameList: string[] = [];
      const tempCheckedList: string[] = [];
      for (const option of groups) {
        for (const item of option) {
          tempCheckedList.push(item.No);
          tempCheckedNameList.push(item.Name);
        }
      }
      checkedNames.value = tempCheckedNameList;
      checkedList.value = tempCheckedList;
    },
    {
      deep: true,
    },
  );
  const loadingList = ref(false);
  // end
  const groupNoKey = ref('GroupNo');
  onMounted(async () => {
    try {
      loadingList.value = true;
      const groupMyPk='Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+'.Pop.Group';
      const listMyPK = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+'.Pop.Dtl';
      const groups:any = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(groupMyPk,props.rowData);
      const list:any = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(listMyPK,props.rowData);
      // 默认第三个参数为分组key
      if (list.length > 0) {
        const listItemKeys = Object.keys(list[0]);
        if (listItemKeys.includes('GroupNo')) {
          groupNoKey.value = 'GroupNo';
        } else if (listItemKeys.length >= 3) {
          groupNoKey.value = listItemKeys[2];
          list.forEach((item) => {
            item.GroupNo = item[groupNoKey.value];
          });
        }
      }

      const checkedItems = props.selectedItems ? props.selectedItems.split(',') : [];

      groupOptions.value = groups.map((groupItem) => {
        const children = list.filter((listItem) => listItem[groupNoKey.value] + '' === groupItem.No + '');
        return {
          No: groupItem.No,
          Name: groupItem.Name,
          checked: false,
          checkedList: children.filter((child) => checkedItems.includes(child.No)),
          children,
        };
      });

      plainOptions.value = list;
    } catch (e: any) {
      showFailToast(e.toString());
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
  .list-picker {
    height: 100%;
    padding-left: 6px;

    .header {
      padding: 12px;
      border-bottom: 1px solid #e8e8e8;
      border-top: 1px solid #e8e8e8;
      display: flex;
      align-items: center;
      background-color: #f2f5f7;
    }

    .body {
      padding-bottom: 20px;
    }

    :deep(.ant-checkbox-group) {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-left: 24px;

      & > .ant-checkbox-wrapper {
        width: 50%;
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
