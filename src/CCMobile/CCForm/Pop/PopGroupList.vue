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
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  const props = defineProps({
    listSql: {
      type: String,
      default: '',
    },
    groupListSql: {
      type: String,
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
    group.checkedList = e.target.checked ? plainOptions.value.filter((item: CheckedItem) => item.GroupNo === group.No).map((item) => item.No) : [];
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
  // end

  onMounted(async () => {
    try {
      loadingList.value = true;
      const { getDBSource } = useDBSourceLoader();
      const { listSql, groupListSql } = props;
      if (!listSql || !groupListSql) {
        message.error('缺少必要的参数， 请检查分组sql 或者 列表sql 是否为空');
        return;
      }
      const groups = await getDBSource(groupListSql);
      const list = await getDBSource(listSql);
      // 默认第三个参数为分组key
      let groupNoKey = 'GroupNo';
      if (list.length > 0) {
        const listItemKeys = Object.keys(list[0]);
        if (listItemKeys.includes('GroupNo')) {
          groupNoKey = 'GroupNo';
        } else if (listItemKeys.length >= 3) {
          groupNoKey = listItemKeys[2];
        }
      }

      const checkedItems = props.selectedItems ? props.selectedItems.split(',') : [];

      groupOptions.value = groups.map((groupItem) => {
        const children = list.filter((listItem) => listItem[groupNoKey] + '' === groupItem.No + '');
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
      align-items: flex-start;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-left: 24px;

      & > .ant-checkbox-wrapper {
        width: 50%;
        & span:last-child {
          white-space: break-spaces;
        }
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
