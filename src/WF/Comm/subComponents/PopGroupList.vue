<template>
  <Spin :spinning="loadingList">
    <InputGroup v-if="isShowSearch" :style="{ width: '100%', marginBottom: '20px', display: 'flex' }" compact>
      <Input v-model:value="searchKey" :placeholder="'请输入关键字'" />
      <Button type="primary" @click="Search(false)" style="border-left: 1px solid #f2f5f7">{{ '搜索' }}</Button>
      <Button type="primary" @click="Search(true)">{{ '搜索分类' }}</Button>
    </InputGroup>

    <template v-if="hideSearchResult">
      <div class="list-picker" v-for="group in groupOptions.filter((group) => Array.isArray(group.children) && group.children.length > 0)" :key="group.No">
        <div class="header">
          <Checkbox v-model:checked="group.checked" :indeterminate="group.indeterminate" @change="onCheckAllChange(group, $event)" :disabled="!isMultiSelect">
            <span style="font-weight: bold">{{ group.Name }}</span>
          </Checkbox>
        </div>
        <br />
        <div class="body">
          <CheckboxGroup v-model:value="group.checkedList" @change="updateList">
            <Checkbox v-for="item in group.children" :key="item.No" :value="item.No" @change="singleCheckboxChange(group, item, $event)">{{ item.Name }}</Checkbox>
          </CheckboxGroup>
        </div>
      </div>
    </template>
    <div v-else>
      <template v-if="filterByType">
        <Divider orientation="left">{{ '分类搜索结果' }}</Divider>
        <div class="list-picker" v-for="group in srGroupOptions.filter((group) => Array.isArray(group.children) && group.children.length > 0)" :key="group.No">
          <div class="header">
            <Checkbox v-model:checked="group.checked" :indeterminate="group.indeterminate" @change="onCheckAllChange(group, $event)" :disabled="!isMultiSelect">
              <span style="font-weight: bold">{{ group.Name }}</span>
            </Checkbox>
          </div>
          <br />
          <div class="body">
            <CheckboxGroup v-model:value="group.checkedList" @change="updateList">
              <Checkbox v-for="item in group.children" :key="item.No" :value="item.No" @change="singleCheckboxChange(group, item, $event)">{{ item.Name }}</Checkbox>
            </CheckboxGroup>
          </div>
        </div>
        <Empty v-if="srGroupOptions.length === 0" />
      </template>
      <div v-else>
        <Divider orientation="left">{{ '全局搜索结果' }}</Divider>
        <CheckboxGroup v-model:value="checkedList" @change="updateList">
          <Checkbox v-for="item in searchList" :key="item.No" :value="item.No" @change="singleCheckboxChange(null, item, $event)">{{ item.Name }}</Checkbox>
        </CheckboxGroup>
        <Empty v-if="searchList.length === 0" />
      </div>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { CheckboxGroup, Checkbox, Spin, Input, Divider, Button, Empty, message, InputGroup } from 'ant-design-vue';
  import { inject, onMounted, ref, watch } from 'vue';
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
    isShowSearch: {
      type: Boolean,
      default: false,
    },
    selectedItems: {
      type: String,
      default: '',
    },
    selectedItemNames: {
      type: String,
      default: '',
    },
    refKey: {
      type: String,
      default: '',
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
  const searchKey = ref('');
  const hideSearchResult = ref(true); //是否显示分组
  const list = ref<CheckedItem[]>([]);
  const searchList = ref<CheckedItem[]>([]);
  const searchListArr = ref<CheckedItem[]>([]); //过滤查询数据源
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const groupOptions = ref<CheckedItem[]>([]);
  const srGroupOptions = ref<CheckedItem[]>([]); // 过滤的分组
  const filterByType = ref(false);
  const checkedNames = ref<string[]>([]);
  const onCheckAllChange = (group: CheckedItem, e: any) => {
    group.checkedList = e.target.checked ? plainOptions.value.filter((item: CheckedItem) => item.GroupNo === group.No).map((item) => item.No) : [];
    group.indeterminate = false;
    updateList();
  };
  const updateCount = inject('updateCount') as Function;
  const updateList = () => {
    if (hideSearchResult.value || filterByType.value) {
      const groups = groupOptions.value.filter((group) => group.checkedList.length > 0).map((group) => group.checkedList || []);
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
      return;
    }
    checkedNames.value = [];
    for (const item of checkedList.value) {
      checkedNames.value.push(searchList.value.find((po) => po.No == item)?.Name || '');
    }
  };
  const singleCheckboxChange = (group: CheckedItem | null, _: CheckedItem, e: any) => {
    if (!props.isMultiSelect) {
      if (group != null) {
        groupOptions.value.forEach((groupOption) => {
          groupOption.checkedList = [];
        });
        setTimeout(() => {
          group.checkedList = [e.target.value];
          if (updateCount) updateCount(checkedList.value.length);
          updateList();
        });
      } else {
        checkedList.value = [e.target.value];
        if (updateCount) updateCount(checkedList.value.length);
        updateList();
      }
    }
    return true;
  };
  //执行查询
  const Search = (byGroup = false) => {
    if (!searchKey.value) {
      hideSearchResult.value = true;
      filterByType.value = false;
      return;
    }
    if (byGroup) {
      filterByType.value = true;
      srGroupOptions.value = groupOptions.value.filter((group) => group.Name.includes(searchKey.value));
    } else {
      filterByType.value = false;
      searchList.value = searchListArr.value.filter((item) => item.No.includes(searchKey.value) || item.Name.includes(searchKey.value));
    }
    // checkedList.value = searchList.value.filter((child) => checkedList.value.includes(child.No)).map((child) => child.No);
    // checkedNames.value = searchList.value.filter((child) => checkedList.value.includes(child.No)).map((child) => child.Name);
    // console.log(checkedList.value, checkedNames.value);
    hideSearchResult.value = false;
  };
  // watch(
  //   [() => groupOptions.value, () => checkedList.value],
  //   ([val, val2]) => {
  //     console.log(val, val2);
  //     if (hideSearchResult.value) {
  //       const groups = val.filter((group) => group.checkedList.length > 0).map((group) => group.checkedList || []);
  //       const tempCheckedNameList: string[] = [];
  //       const tempCheckedList: string[] = [];
  //       for (const option of groups) {
  //         for (const item of option) {
  //           tempCheckedList.push(item);
  //           tempCheckedNameList.push(plainOptions.value.find((po) => po.No === item)?.Name || '');
  //         }
  //       }
  //       checkedNames.value = tempCheckedNameList;
  //       checkedList.value = tempCheckedList;
  //       return;
  //     }
  //     checkedNames.value = [];
  //     for (const item of checkedList.value) {
  //       checkedNames.value.push(searchList.value.find((po) => po.No === item)?.Name || '');
  //     }
  //   },
  //   {
  //     deep: true,
  //   },
  // );

  watch(
    () => checkedList.value,
    (val) => {
      if (updateCount) updateCount(val.length);
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
      list.value = await getDBSource(listSql);
      // 默认第三个参数为分组key
      // let groupNoKey = 'GroupNo';
      let groupNoKey = props.refKey;
      if ((groupNoKey == '' || groupNoKey == null || groupNoKey == undefined) && list.value.length > 0) {
        const listItemKeys = Object.keys(list.value[0]);
        if (listItemKeys.includes('GroupNo')) {
          groupNoKey = 'GroupNo';
        } else if (listItemKeys.length >= 3) {
          groupNoKey = listItemKeys[2];
        }
      }
      if (props.selectedItems) {
        checkedList.value = props.selectedItems.split(',');
        checkedNames.value = props.selectedItemNames?.split(',') || [];
        if (updateCount) updateCount(checkedList.value.length);
      }
      const checkedItems = props.selectedItems ? props.selectedItems.split(',') : [];

      groupOptions.value = groups.map((groupItem) => {
        const children = list.value.filter((listItem) => listItem[groupNoKey] + '' === groupItem.No + '');
        if (Array.isArray(children) && children.length > 0) {
          for (let child of children) {
            searchListArr.value.push(child);
          }
        }
        return {
          No: groupItem.No,
          Name: groupItem.Name,
          checked: false,
          indeterminate: false,
          checkedList: children.filter((child) => checkedItems.includes(child.No)).map((child) => child.No),
          children,
        };
      });

      plainOptions.value = list.value;

      updateList();
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
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    box-sizing: border-box;
    margin-bottom: 12px;
    .header {
      padding: 12px;
      border-bottom: 1px solid #ccc;
      border-top: 1px solid #ccc;
      display: flex;
      align-items: center;
      box-sizing: border-box;
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
        width: calc(33% - 8px);
        white-space: pre-wrap;
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
