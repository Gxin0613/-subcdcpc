<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <div class="header">
        <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect">{{ '全选' }}</Checkbox>
        <div v-if="isShowSearch" class="search-box">
          <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @change="Search" allow-clear />
          <!-- <Button type="primary" class="btn_style" @click="Search">{{'查询'}}</Button> -->
        </div>
      </div>
      <br />
      <CheckboxGroup v-model:value="checkedList" v-if="plainOptions.length > 0">
        <Checkbox v-for="item in plainOptions" :key="item.No" :value="item.No" @change="singleCheckboxChange">
          <template v-if="isShowNo">{{ item.No }}-{{ item.Name }}</template>
          <template v-else> {{ item.Name }} </template>
        </Checkbox>
      </CheckboxGroup>
      <span v-else>{{ '请点击帮助根据说明进行配置' }}</span>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Checkbox, CheckboxGroup, Input, message, Spin } from 'ant-design-vue';
  import { inject, onMounted, ref, watch } from 'vue';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';

  const props = defineProps({
    listSql: {
      type: [String, Function],
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
    isShowNo: {
      type: Boolean,
      default: false,
    },
    selectedItems: {
      type: String,
      default: '',
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
  const searchKey = ref('');
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const checkedNames = ref<string[]>([]);
  const onCheckAllChange = (e: any) => {
    checkedList.value = e.target.checked ? plainOptions.value.map((item: CheckedItem) => item.No) : [];
    indeterminate.value = false;
  };
  const updateCount = inject('updateCount') as Function;
  const singleCheckboxChange = (e: any) => {
    if (!props.isMultiSelect) {
      checkedList.value = [];
      setTimeout(() => {
        checkedList.value = [e.target.value];
        if (updateCount) updateCount(checkedList.value.length);
      });
    }
    return true;
  };
  const Search = async () => {
    if (!searchKey.value) {
      await InitPage();
      return;
    }
    plainOptions.value = plainOptions.value.filter((item) => item.No.toString().includes(searchKey.value) || item.Name.toString().includes(searchKey.value));
    checkedList.value = plainOptions.value.filter((child) => checkedList.value.includes(child.No)).map((child) => child.No);
    checkedNames.value = plainOptions.value.filter((child) => checkedList.value.includes(child.No)).map((child) => child.Name);
  };
  watch(
    () => checkedList.value,
    (val) => {
      const tempArr: string[] = [];
      for (const item of val) {
        const option = plainOptions.value.find((child) => child.No === item);
        if (option) tempArr.push(option.Name);
      }
      checkedNames.value = tempArr;
      if (updateCount) updateCount(val.length);
    },
  );
  const loadingList = ref(false);
  // end
  const InitPage = async () => {
    const { getDBSource } = useDBSourceLoader();
    let { listSql } = props;
    if (!listSql) {
      return;
    }
    // 如果是方法暂不处理
    if (typeof listSql === 'function') {
      return;
    }
    let paras = '';
    for (const key in props.rowData) paras += '@' + key + '=' + props.rowData[key];
    if (listSql.includes('DBSrc.')) {
      if (listSql.includes('@')) {
        for (const key in props.rowData) listSql = listSql.replace('@' + key, props.rowData[key]).replace('@' + key, props.rowData[key]);
      } else {
        listSql += paras;
      }
    } else {
      if (listSql.includes('@')) {
        for (const key in props.rowData) listSql = listSql.replace('@' + key, props.rowData[key]).replace('@' + key, props.rowData[key]);
      }
    }

    plainOptions.value = await getDBSource(listSql, 'local', paras);
    indeterminate.value = true;
  };
  onMounted(async () => {
    try {
      loadingList.value = true;
      await InitPage();
      if (props.selectedItems) {
        checkedList.value = props.selectedItems.split(',');
        if (updateCount) updateCount(checkedList.value.length);
      }
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

    .header {
      padding: 12px;
      background-color: #f7f7f7;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .search-box {
        width: 300px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
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
