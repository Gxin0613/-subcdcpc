<template>
  <div v-if="isShowSearch" class="flex" style="margin-bottom: 12px">
    <!-- <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="width: 100%">
      <FormItem :label="'关键字'" label-position="left">
        <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @change="Search" allow-clear />
      </FormItem>
      <FormItem>
        <Button type="primary" class="btn_style" @click="Search">{{'查询'}}</Button>
      </FormItem>
    </Form> -->
    <InputSearch v-model:value="searchKey" :placeholder="'请输入关键字'" @search="Search" />
  </div>
  <Row v-if="isShow" justify="space-between">
    <Col :span="12" style="border: 1px solid #eaedf6; padding: 10px">
      <!-- <div v-if="isHaveUpperLevel === true && parseInt(parentNo) !== 0"><Button size="small" type="primary" style="margin: 5px" @click="UpperLevel">{{'上一级'}}</Button></div> -->
      <Tree
        v-if="!islazy"
        :tree-data="treeData"
        :virtual="true"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :fieldNames="fieldNames"
        @select="clickNodeEvent"
      />
      <Tree
        v-else
        :tree-data="treeData"
        :load-data="onLoadData"
        :virtual="true"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :fieldNames="fieldNames"
        @select="clickNodeEvent"
      />
    </Col>
    <Col :span="12" :style="{ border: '1px solid #EAEDF6', padding: '10px' }">
      <Spin :spinning="loadingList">
        <div class="list-picker">
          <div class="header">
            <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect">{{ '全选' }}</Checkbox>
          </div>
          <br />
          <template v-if="plainOptions.length === 0">{{ '无数据' }}</template>
          <CheckboxGroup v-else v-model:value="checkedList">
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
  import { Checkbox, CheckboxGroup, Spin, Col, message, Row, Tree, InputSearch } from 'ant-design-vue';
  import { inject, onMounted, ref } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { useRoute } from 'vue-router';
  import { debounce } from 'lodash';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import WebUser from '/@/bp/web/WebUser';
  const props = defineProps({
    treeSql: {
      type: String,
      default: '',
    },
    listSql: {
      type: String,
      default: '',
    },
    parentNo: {
      type: String,
      default: '',
    },
    searchSql: {
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
    isHaveUpperLevel: {
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
    isLazily: {
      type: Boolean,
      default: false,
    },
  });

  interface CheckedItem {
    No: string;
    Name: string;
    DeptName: string;
  }
  //关键字查询
  const searchKey = ref('');
  const isShow = ref(true);
  const rootNo = ref<string>(props.parentNo);
  const { getDBSource } = useDBSourceLoader();
  const islazy = ref(props.isLazily); //props.treeSql?.includes('@Key');
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const allCheckList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const checkedNames = ref<string[]>([]);

  //获取query数据
  const { query }: any = useRoute();
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
  const updateCount = inject('updateCount') as Function;
  const singleCheckboxChange = (e: any) => {
    if (!props.isMultiSelect) {
      allCheckList.value = [];
      setTimeout(() => {
        allCheckList.value = [e.target.value];
        checkedList.value = [e.target.value];
        GetCheckedNames(e.target.value, -1, true);
        if (updateCount) updateCount(allCheckList.value.length);
      });
    } else {
      setTimeout(() => {
        //如果存在就是不选，不存在就是选择
        const idx = allCheckList.value.findIndex((item) => item === e.target.value);
        if (idx < 0) allCheckList.value.push(e.target.value);
        else allCheckList.value.splice(idx, 1);
        GetCheckedNames(e.target.value, idx, false);
        if (updateCount) updateCount(allCheckList.value.length);
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
  // 处理获取树数据的sql，替换@Key（SAAS模式admin用户替换@FlowNo）
  const treeSQLData = async (sqlStr, keyReplace) => {
    let treeSql = sqlStr || '';
    if (treeSql.toLowerCase().includes('@flowno')) {
      if (!query?.FlowNo) {
        message.info('地址栏没有获取到FlowNo');
      }
      //增加SAAS模式FlowNo关键字替换
      if (CCBPMRunModel.SAAS == WebUser.CCBPMRunModel) {
        treeSql = treeSql.replace(/@FlowNo/g, query?.FlowNo).replace(/@flowno/g, query?.FlowNo);
      }
    }
    if (treeSql.toLowerCase().includes('@webuser.orgno')) {
      if (CCBPMRunModel.SAAS == WebUser.CCBPMRunModel) {
        treeSql = treeSql.replace(/@WebUser.OrgNo/g, WebUser.OrgNo).replace(/@webuser.orgno/g, WebUser.OrgNo);
      }
    }
    // if (treeSql.toLowerCase().includes('@key')) {
    //   treeSql = treeSql.replace(/@Key/g, keyReplace).replace(/@key/g, keyReplace);
    // }
    if (treeSql.startsWith('DBSrc.')) treeSql += '@Key=' + keyReplace;
    const data = await getDBSource(treeSql, 'local', '@Key=' + keyReplace);
    return data;
  };
  const Search = debounce(async () => {
    try {
      if (!searchKey.value) {
        isShow.value = true;
        return;
      }
      loadingList.value = true;
      if (!props.searchSql) {
        isShow.value = true;
        message.error('请配置查询的SQL=' + props.searchSql);
        return;
      }
      const data = await treeSQLData(props.searchSql, searchKey.value);
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
      const data = await treeSQLData(props.treeSql, treeNode.dataRef.No);
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
      if (!props.listSql?.includes('@Key')) {
        //   message.error('不合法的SQL,需要配置关键字@Key SQL=' + props.listSql);
        //   return;
      }
      const data = await treeSQLData(props.listSql, e[0]);
      if (Array.isArray(data[0])) plainOptions.value = [];
      else plainOptions.value = data.filter((item) => item.No != e[0]);
      indeterminate.value = true;
      checkedList.value = allCheckList.value.filter((item) => plainOptions.value.filter((option) => option.No === item).length > 0);
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = false;
    }
  };

  // const UpperLevel = async () => {
  //   if (rootNo.value == null || rootNo.value === '0') {
  //     message.info('已到第一级机构');
  //     return;
  //   }
  //   if (WebUser.CCBPMRunModel != CCBPMRunModel.Single && rootNo.value === '100') {
  //     message.info('已到第一级机构');
  //     return;
  //   }
  //   await InitPage();
  // };
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
    await InitPage();
  });
  const InitPage = async () => {
    let { treeSql } = props;
    let parentNo = rootNo.value;
    if (!treeSql) {
      message.error(`未能执行SQL- 传入 props.TreeSQL 为空 [ ${treeSql} ]`);
      return;
    }
    const data = await treeSQLData(treeSql, parentNo);
    const tree = listToTree(parentNo, data.slice(0, data.length));
    rootNo.value = tree?.[0].ParentNo + '';
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
      if (updateCount) updateCount(allCheckList.value.length);
    }
    await clickNodeEvent([treeData.value[0].No]);
  };
  defineExpose({
    checkedList: allCheckList,
    allCheckList,
    checkedNames,
  });
</script>

<style lang="less" scoped>
  .list-picker {
    height: 100%;
    // border-left: 1px solid #e8e8e8;
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
        & > .ant-checkbox {
          // top: 0.8em;
          top: 0;
        }
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
  :deep(.ant-col-12) {
    flex: 0 0 49%;
  }
</style>
