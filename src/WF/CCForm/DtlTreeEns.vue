<template>
  <div class="flex p-1">
    <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="width: 100%">
      <FormItem :label="'关键字'">
        <Input v-model:value="searchKey" :placeholder="placeholder" @pressEnter="Search" allow-clear />
      </FormItem>
      <FormItem>
        <Button type="primary" class="btn_style" @click="Search">{{ '查询' }}</Button>
      </FormItem>
    </Form>
  </div>
  <Row v-if="isShow" :gutter="[8, 12]" style="height: 450px">
    <Col :span="12" style="height: 100%; overflow-y: auto">
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
    <Col :span="12" style="height: 100%; overflow-y: auto">
      <Spin :spinning="loadingList">
        <Table
          :row-selection="{ selectedRowKeys: tableSelectedRowKeys, onChange: onSelectChange }"
          :columns="columns"
          :data-source="tableData"
          bordered
          size="small"
          :rowKey="(record, index) => index"
          :pagination="false"
        />
        <Pagination size="middle" v-model="current" :pageSize="pagination.pageSize" @change="sizeChange" :total="pagination.total" />
      </Spin>
    </Col>
  </Row>
  <Row v-else :gutter="[8, 12]" style="height: 100%; overflow-y: auto">
    <Col :span="24">
      <Spin :spinning="loadingList">
        <Table
          :row-selection="{ selectedRowKeys: tableSelectedRowKeys, onChange: onSelectChange }"
          :columns="columns"
          :data-source="tableData"
          bordered
          size="small"
          :rowKey="(record, index) => index"
          :pagination="false"
        />
        <Pagination size="middle" v-model="current" :pageSize="pagination.pageSize" @change="sizeChange" :total="pagination.total" />
      </Spin>
    </Col>
  </Row>
</template>

<script lang="ts" setup>
  import { Spin, Col, message, Row, Tree, Form, FormItem, Input, Button, Table, Pagination } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
  import { TreeDataItem } from 'ant-design-vue/es/tree/Tree';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import { debounce } from 'lodash';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { AtPara } from '/@/bp/da/AtPara';

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
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    selectedTreeNode: {
      type: String,
      default: '',
    },
    selectedItems: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return [];
      },
    },
    selectedItemNames: {
      type: String,
      default: '',
    },
    refPKVal: {
      type: String,
      default: '0',
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
    columnTag: {
      type: String,
      default: '',
    },
  });

  //关键字查询
  const searchKey = ref('');
  const isShow = ref(true);
  const placeholder = GetPara(props.mapExt.AtPara, 'SearchTip') || '请输入关键字';
  const DBSource = ref();
  const { getDBSource } = useDBSourceLoader();
  const islazy = props.treeSql?.includes('@Key');
  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<Record<string, any>[]>([]);
  const tableData = ref<Record<string, any>[]>([]);
  const indeterminate = ref(true);
  const columns = ref<Record<string, any>[]>([]);
  const tableSelectedRowKeys = ref<number[]>([]); //选择的行数
  const checkInfoList = ref<any[]>([]);
  const { GetDataTableByDB } = mapExtParse();
  const current = ref(1);
  const pagination = {
    current: 1, // 当前页码
    pageSize: 10, // 每页显示条数
    total: 0, // 数据总数，通过接口获取
  };

  const Search = debounce(async () => {
    try {
      if (!searchKey.value) {
        isShow.value = true;
        return;
      }
      loadingList.value = true;
      if (!props.mapExt.Tag1) {
        isShow.value = true;
        message.error('请配置查询的SQL=' + props.mapExt.Tag1);
        return;
      }
      tableSelectedRowKeys.value = [];
      const data = await GetDataTableByDB(props.mapExt, 'Tag1', searchKey.value, props.refPKVal, props.rowData, '');
      if (Array.isArray(data[0])) plainOptions.value = [];
      else plainOptions.value = data;
      plainOptions.value.forEach((item, idx) => {
        if (checkedList.value.includes(item[columns.value[0].key])) tableSelectedRowKeys.value.push(idx);
      });
      current.value = 1;
      pagination.total = plainOptions.value.length;
      tableData.value = getShowSource();
      indeterminate.value = true;
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
      const data = await getDBSource(props.treeSql.replace(/@Key/g, treeNode.dataRef.No));
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
        message.error('不合法的SQL,需要配置关键字@Key SQL=' + props.listSql);
        return;
      }
      tableSelectedRowKeys.value = [];
      const data = await getDBSource(props.listSql.replace(/@Key/g, e[0]), DBSource.value);
      plainOptions.value = data.filter((item) => item.No != e[0]);
      plainOptions.value.forEach((item, idx) => {
        if (checkedList.value.includes(item[columns.value[0].key])) tableSelectedRowKeys.value.push(idx);
      });
      current.value = 1;
      pagination.total = plainOptions.value.length;
      tableData.value = getShowSource();
      indeterminate.value = true;
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      loadingList.value = false;
    }
  };
  const getShowSource = () => {
    let keyValue = 0;
    const data = plainOptions.value; //后端返回的全部数据
    for (let i = 0; i < data.length; i++) {
      keyValue = keyValue + 1;
      let key = { key: keyValue };
      data[i] = Object.assign(data[i], key);
    }
    const start = pagination.pageSize * current.value - pagination.pageSize;
    const end = pagination.pageSize * current.value;
    return data.slice(start, end);
  };
  //  分页显示条数的变化
  const sizeChange = (page, pageSize) => {
    current.value = page;
    pagination.pageSize = pageSize;
    tableSelectedRowKeys.value = [];
    tableData.value = getShowSource();
    tableData.value.forEach((item, idx) => {
      if (checkedList.value.includes(item[columns.value[0].key])) tableSelectedRowKeys.value.push(idx);
    });
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
    let { treeSql, parentNo, mapExt, columnTag } = props;
    if (!treeSql) {
      message.error(`未能执行SQL- 传入 props.TreeSQL 为空 [ ${treeSql} ]`);
      return;
    }
    if (!columnTag) {
      columns.value = [
        {
          title: '编码',
          dataIndex: 'No',
          key: 'No',
        },
        {
          title: '名称',
          dataIndex: 'Name',
          key: 'Name',
        },
      ];
    } else {
      columnTag = '@' + columnTag.replace(/,/g, '@');
      const atPara = new AtPara(columnTag);
      atPara.HisHT.forEach((value, key) => {
        columns.value.push({
          title: value,
          dataIndex: key,
          key: key,
        });
      });
    }
    if (treeSql.toLowerCase().includes('@key')) treeSql = treeSql.replace(/@Key/g, parentNo).replace(/@key/g, parentNo);
    treeSql = DealExp(treeSql, null);
    DBSource.value = mapExt.FK_DBSrc;
    const data = await getDBSource(treeSql, DBSource.value);
    const tree = treeSql.includes('ParentNo') === false ? data : listToTree(parentNo, data.slice(0, data.length));
    treeData.value = tree as TreeDataItem[];
    if (treeData.value.length === 0) {
      return;
    }
    expandedKeys.value = [treeData.value[0].No];
    selectedKeys.value = [treeData.value[0].No];

    await clickNodeEvent([treeData.value[0].No]);
  });
  const onSelectChange = (selectedRowKeys: number[]) => {
    tableSelectedRowKeys.value = selectedRowKeys;
    if (selectedRowKeys.length == 0) {
      //排除该行的所有选择
      tableData.value.forEach((item) => {
        const idx = checkedList.value.findIndex((str) => str === item[columns.value[0].key]);
        if (idx >= 0) {
          checkedList.value.splice(idx, 1);
          checkInfoList.value.splice(idx, 1);
        }
      });
    } else {
      tableData.value.forEach((item, rowIdx) => {
        const isPush = selectedRowKeys.includes(rowIdx);
        const idx = checkedList.value.findIndex((str) => str === item[columns.value[0].key]);
        if (idx >= 0 && isPush == false) {
          checkedList.value.splice(idx, 1);
          checkInfoList.value.splice(idx, 1);
        }
        if (idx < 0 && isPush == true) {
          checkedList.value.push(item[columns.value[0].key]);
          item['OID'] = 0;
          checkInfoList.value.push(item);
        }
      });
    }
  };
  defineExpose({
    checkInfoList,
    checkedList,
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
</style>
