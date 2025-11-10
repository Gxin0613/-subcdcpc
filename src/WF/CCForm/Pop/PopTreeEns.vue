<template>
  <div class="flex p-1">
    <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="width: 100%">
      <FormItem :label="'关键字'">
        <Input v-model:value="searchKey" :placeholder="placeholder" @change="validateInputKey" @pressEnter="Search" allow-clear />
      </FormItem>
      <FormItem>
        <Button type="primary" class="btn_style" @click="Search">{{ '查询' }}</Button>
      </FormItem>
    </Form>
  </div>
  <Row v-if="isShow" :gutter="[8, 12]">
    <Col :span="12">
      <Tree
        v-if="islazy == false"
        :tree-data="treeData"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :fieldNames="fieldNames"
        @select="clickNodeEvent"
      />
      <Tree
        v-else
        :tree-data="treeData"
        :load-data="onLoadData"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :fieldNames="fieldNames"
        @select="clickNodeEvent"
      />
    </Col>
    <Col :span="12">
      <Spin :spinning="loadingList">
        <div class="list-picker">
          <div class="header">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect">{{ '全选' }}</Checkbox>
          </div>
          <br />
          <CheckboxGroup v-model:value="checkedList">
            <Checkbox v-for="item in plainOptions" :key="item.No" :value="item.No" @change="singleCheckboxChange">{{ item.Name }}</Checkbox>
          </CheckboxGroup>
        </div>
      </Spin>
    </Col>
  </Row>
  <Row v-else :gutter="[8, 12]">
    <Col :span="24">
      <Spin :spinning="loadingList">
        <div class="search-picker">
          <div class="header">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect">{{ '全选' }}</Checkbox>
          </div>
          <br />
          <template v-if="plainOptions.length === 0">{{ '无数据' }}</template>
          <CheckboxGroup v-else v-model:value="checkedList">
            <Checkbox v-for="item in plainOptions" :key="item.No" :value="item.No" @change="singleCheckboxChange">
              <span>{{ item.Name }}({{ item.No }})</span>
              <span v-if="!!item.DeptName" style="color: #9ca3af"><br />{{ item.DeptName }}</span>
            </Checkbox>
          </CheckboxGroup>
        </div>
      </Spin>
    </Col>
  </Row>
</template>

<script lang="ts" setup>
  import { Checkbox, CheckboxGroup, Spin, Col, message, Row, Tree, Form, FormItem, Input, Button } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { debounce } from 'lodash';
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
    DeptName?: string;
  }
  //关键字查询
  const searchKey = ref('');
  const isShow = ref(true);
  const placeholder = GetPara(props.mapExt.AtPara, 'SearchTip') || '请输入关键字';
  const islazy = ref(false);
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const allCheckList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const checkedNames = ref<string[]>([]);
  const onCheckAllChange = (e: any) => {
    if (e.target.checked == true) {
      plainOptions.value.forEach((option) => {
        const idx = allCheckList.value.findIndex((item) => item === option.No);
        if (idx < 0) {
          allCheckList.value.push(option.No);
          checkedNames.value.push(option.Name);
        }
      });
    }
    if (e.target.checked == false) {
      plainOptions.value.forEach((option) => {
        const idx = allCheckList.value.findIndex((item) => item === option.No);
        if (idx >= 0) {
          allCheckList.value.splice(idx, 1);
          checkedNames.value.splice(idx, 1);
        }
      });
    }
    checkedList.value = e.target.checked ? plainOptions.value.map((item: CheckedItem) => item.No) : [];
    indeterminate.value = false;
  };
  const singleCheckboxChange = (e: any) => {
    if (!props.isMultiSelect) {
      allCheckList.value = [];
      setTimeout(() => {
        allCheckList.value = [e.target.value];
        checkedList.value = [e.target.value];
        GetCheckedNames(e.target.value, -1, true);
      });
    } else {
      setTimeout(() => {
        //如果存在就是不选，不存在就是选择
        const idx = allCheckList.value.findIndex((item) => item === e.target.value);
        if (idx < 0) allCheckList.value.push(e.target.value);
        else allCheckList.value.splice(idx, 1);
        GetCheckedNames(e.target.value, idx, false);
      });
    }
    return true;
  };
  const GetCheckedNames = (checkedNo, idx, isClear) => {
    if (isClear == true) checkedNames.value = [];
    if (idx >= 0) checkedNames.value.splice(idx, 1);
    if (idx < 0) {
      const arr = plainOptions.value.filter((item) => item.No == checkedNo);
      if (arr.length > 0) checkedNames.value.push(arr[0].Name);
    }
  };
  const Search = debounce(async () => {
    try {
      if (!searchKey.value) {
        isShow.value = true;
        return;
      }
      loadingList.value = true;
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.TreeSearch";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:searchKey.value,OID:props.refPKVal,...props.rowData});
      if (Array.isArray(data[0])) plainOptions.value = [];
      else plainOptions.value = data;
      indeterminate.value = true;
      checkedList.value = allCheckList.value.filter((item) => plainOptions.value.filter((option) => option.No === item).length > 0);
      isShow.value = false;
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = false;
    }
  }, 300);
  const loadingList = ref(false);
  // end
  const onLoadData = async (treeNode) => {
    try {
      loadingList.value = true;
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.Tree";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:treeNode.dataRef.No,OID:props.refPKVal,...props.rowData});
      treeNode.dataRef.children = data.filter((item) => item.No != treeNode.No);
      treeData.value = [...treeData.value];
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = false;
    }
  };
  // tree
  const clickNodeEvent = async (e: any) => {
    try {
      loadingList.value = true;
      const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.Dtl";
      const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:e[0],OID:props.refPKVal,...props.rowData});
      plainOptions.value = data.filter((item) => item.No != e[0]);
      indeterminate.value = true;
      checkedList.value = allCheckList.value.filter((item) => plainOptions.value.filter((option) => option.No === item).length > 0);
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = false;
    }
  };
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const fieldNames = ref({
    title: 'Name',
    key: 'No',
  });
  const treeData = ref<TreeDataItem[]>([]);
  // end
  const { listToTree } = useTreeConvert();

  onMounted(async () => {
    let { parentNo} = props;
    islazy.value = props.mapExt.AtPara.includes('@IsLazy=1');
    const mypk = 'Frm.'+props.mapExt.FK_MapData+'_'+props.mapExt.AttrOfOper+".Pop.Tree";
    const data =  await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:parentNo,OID:props.refPKVal,...props.rowData});
    const tree = listToTree(parentNo, data.slice(0, data.length));
    treeData.value = tree as TreeDataItem[];
    if (treeData.value.length === 0) {
      return;
    }
    expandedKeys.value = [treeData.value[0].No];
    if (props.selectedTreeNode) selectedKeys.value = props.selectedTreeNode?.split(',') || [treeData.value[0].No];
    if (props.selectedItems) {
      checkedList.value = props.selectedItems.split(',');
      allCheckList.value = checkedList.value;
      checkedNames.value = props.selectedItemNames.split(',');
    }
    await clickNodeEvent([treeData.value[0].No]);
  });

  const validateInputKey = () => {
    let value: string = (searchKey.value || '') as string;
    if (!!value) {
      const forbiddenChars = ';*--\'"';
      let isHave = false;
      for (const c of forbiddenChars) {
        if (value.includes(c)) {
          isHave = true;
          value = value.replaceAll(c, '');
        }
      }
      if (isHave) message.warn('禁止输入含有' + forbiddenChars + '的字符,防止SQL注入');
      searchKey.value = value;
    }
  };
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
  .search-picker {
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
  :deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background-color: #ffd4c4;
  }
</style>
