<template>
  <Spin :spinning="loadingList">
    <div class="list-picker">
      <div class="header">
        <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect"> {{ '全选' }}</Checkbox>
      </div>
      <br />
      <CheckboxGroup v-model:value="checkedList">
        <Checkbox v-for="item in plainOptions" :key="item.No" :value="item.No" @change="singleCheckboxChange">{{ item.Name }}</Checkbox>
      </CheckboxGroup>
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Checkbox, CheckboxGroup, message, Spin } from 'ant-design-vue';
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
  }

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
  const singleCheckboxChange = (e: any) => {
    if (!props.isMultiSelect) {
      checkedList.value = [];
      setTimeout(() => {
        checkedList.value = [e.target.value];
      });
    }
    return true;
  };
  watch(
    () => checkedList.value,
    (val) => {
      const tempArr: string[] = [];
      for (const option of plainOptions.value) {
        if (val.includes(option.No)) {
          tempArr.push(option.Name);
        }
      }
      checkedNames.value = tempArr;
    },
  );
  const loadingList = ref(false);
  // end

  onMounted(async () => {
    try {
      loadingList.value = true;
      const listMyPK = 'Frm.' + props.mapExt.FK_MapData + '_' + props.mapExt.AttrOfOper + '.Pop.Dtl';
      plainOptions.value = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(listMyPK, props.rowData);
      indeterminate.value = true;
      if (props.selectedItems) checkedList.value = props.selectedItems.split(',');
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
    border-left: 1px solid #e8e8e8;
    padding-left: 6px;

    .header {
      padding-bottom: 12px;
      padding-left: 12px;
      border-bottom: 1px solid #e8e8e8;
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
