<template>
  <Spin :spinning="loadingList">
    <div class="list-picker" v-for="group in groupOptions" :key="group.No">
      <div class="header">
        <Checkbox v-model:checked="group.checked" :indeterminate="group.indeterminate" @change="onCheckAllChange(group, $event)" :disabled="!isMultiSelect">
          <span style="font-weight: bold">{{ group.Name }}</span>
        </Checkbox>
      </div>
      <br />
      <div class="body">
        <CheckboxGroup v-model:value="group.checkedList">
          <Checkbox v-for="item in group.children" :key="item.No" :value="item.No" @change="singleCheckboxChange(group, item, $event)">{{ item.Name }}</Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { CheckboxGroup, Checkbox, Spin, message } from 'ant-design-vue';
  import { onMounted, ref, watch } from 'vue';
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
    indeterminate: boolean;
    checkedList: string[];
    GroupNo?: string;
    children?: CheckedItem[];
  }

  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const groupOptions = ref<CheckedItem[]>([]);
  const checkedNames = ref<string[]>([]);
  const onCheckAllChange = (group: CheckedItem, e: any) => {
    group.checkedList = e.target.checked ? plainOptions.value.filter((item: CheckedItem) => item[groupNoKey.value] === group.No).map((item) => item.No) : [];
    group.indeterminate = false;
  };
  const singleCheckboxChange = (group: CheckedItem, _: CheckedItem, e: any) => {
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
          tempCheckedList.push(item);
          tempCheckedNameList.push(plainOptions.value.find((po) => po.No === item)?.Name || '');
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
  const groupNoKey = ref('GroupNo');
  // end

  onMounted(async () => {
    try {
      loadingList.value = true;
      //获取分组和列表的MyPK
      const groupMyPk = 'Frm_' + props.mapExt.FK_MapData + '_' + props.mapExt.AttrOfOper + '_Pop.Group';
      const listMyPK = 'Frm_' + props.mapExt.FK_MapData + '_' + props.mapExt.AttrOfOper + '_Pop.Dtl';
      const groups: any = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(groupMyPk, props.rowData);
      const list: any = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(listMyPK, props.rowData);
      // 默认第三个参数为分组key
      if (list.length > 0) {
        const listItemKeys = Object.keys(list[0]);
        if (listItemKeys.includes('GroupNo')) {
          groupNoKey.value = 'GroupNo';
        } else if (listItemKeys.length >= 3) {
          groupNoKey.value = listItemKeys[2];
        }
      }

      const checkedItems = props.selectedItems ? props.selectedItems.split(',') : [];

      groupOptions.value = groups.map((groupItem) => {
        const children = list.filter((listItem) => listItem[groupNoKey.value] + '' === groupItem.No + '');
        return {
          No: groupItem.No,
          Name: groupItem.Name,
          checked: false,
          indeterminate: false,
          checkedList: children.filter((child) => checkedItems.includes(child.No)).map((child) => child.No),
          children,
        };
      });

      plainOptions.value = list;
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
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-left: 24px;

      & > .ant-checkbox-wrapper {
        width: calc(33% - 8px);
        white-space: pre-wrap;
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
