<template>
  <Spin :spinning="loading" style="background-color: white">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else class="vben-container">
      <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
        <div style="width: 70%; height: 100px">
          <Tree v-if="alldata.length" default-expand-all :tree-data="alldata" @select="clickNodeEvent" />
        </div>
        <div style="padding: 20px; width: 70%">
          <Table :dataSource="dataa" :pagination="false" :columns="columns" :row-selection="rowSelection" :scroll="{ x: 200, y: 200 }" />
          <Divider />
          <Table :dataSource="dataa1" :pagination="false" :columns="columns1" :scroll="{ x: 200, y: 200 }">
            <template #operation="{ record }">
              <Popconfirm v-if="dataa1.length" :title="'确定删除吗?'" @confirm="onDelete(record)">
                <a>{{ '删除' }}</a>
              </Popconfirm>
            </template>
          </Table>
        </div>
      </PageWrapper>
    </div>
  </Spin>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { Spin, Table, Divider, Popconfirm, message, Tree, type TreeSelectProps } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  const props = defineProps({
    params: {
      type: Object,
      dafault: () => {
        return {};
      },
    },
  });
  const data = reactive({
    Columns: [
      { id: 'No', name: '编号' },
      { id: 'Name', name: '名称' },
    ],
  });

  const dataa = ref<any>([]);
  const dataa1 = ref<any>([]);
  const columns = ref<any>([]);
  const columns1 = ref<any>([]);
  const selectedRowKey = ref<any>([]);
  const nodeID = ref('');
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  let ensOfMyPK: EntitiesMyPK;
  const { EnsOfMyPK, EnsOfDict, KeyRefPK, KeyDict, RootNo, SubDicts, SubDictRefKey, SubDictKeys, PKVal } = props.params;
  const alldata = ref<TreeSelectProps['treeData']>([]);
  const checkedList = ref<any>([]);
  const Data = ref<any>([]);
  const checkedKeys = ref<string[]>([]);
  const spinning = ref(true);
  fetch1();
  async function fetch1() {
    if (!EnsOfMyPK) {
      errorObj.hasError = true;
      errorObj.tips = '缺少参数 [ EnsOfMyPK ]';
      return;
    }
    ensOfMyPK = await ClassFactory.GetEns(EnsOfMyPK);
    await ensOfMyPK.Init();
    await ensOfMyPK.Retrieve(KeyRefPK, PKVal);
    const treeEns = await ClassFactory.GetEns(EnsOfDict);
    await treeEns.Init();
    await treeEns.RetrieveAll();
    alldata.value = [];
    treeEns
      .filter((f: any) => f.ParentNo == '0')
      .forEach((f: any, i) => {
        let d = { title: f.Name, No: f.No, key: '0-' + i, children: [] };
        gettree(treeEns, d.No, d);
        alldata.value.push(d);
      });
  }

  function gettree(arr, parentid, t) {
    arr
      .filter((f) => f.ParentNo == parentid)
      .forEach((f, i) => {
        let d = { title: f.Name, No: f.No, key: t.key + '-' + i, children: [] };
        t.children.push(d);
        gettree(arr, d.No, d);
      });
  }
  function dd(list, p, parentKey) {
    const cc = list.filter((x: any) => x.ParentNo == parentKey);
    cc.forEach((x) => {
      const children = { title: x.Name, key: x.No, children: [] };
      dd(list, children, children.key);
      p.children?.push(children);
    });
  }

  async function fetch() {
    if (!EnsOfMyPK) {
      errorObj.hasError = true;
      errorObj.tips = '缺少参数 [ EnsOfMyPK ]';
      return;
    }
    data.Columns.forEach((x) => {
      columns.value.push({ title: x.name, dataIndex: x.id, key: x.id });
      columns1.value.push({ title: x.name, dataIndex: x.id, key: x.id });
    });
    columns1.value.push({
      title: '操作',
      dataIndex: 'operation',
      key: data.Columns.length,
      slots: { customRender: 'operation' },
    });
  }
  async function handleSelect(deptId) {
    nodeID.value = deptId;
    const ens = await ClassFactory.GetEns(SubDicts);
    await ens.Init();
    await ens.Retrieve(SubDictRefKey, nodeID.value);
    dataa.value = [];
    ens.forEach((f) => {
      dataa.value.push({
        key: nodeID.value + '_' + f.GetValByKey('No'),
        No: f.GetValByKey('No'),
        Name: f.GetValByKey('Name'),
      });
    });

    await bindnodeemp();
    dataa1.value.forEach((item) => {
      const result = dataa.value.find((en) => en.No === item.No && en.key === nodeID.value + '_' + en.No);
      if (result != null) selectedRowKey.value.push(result.key);
    });
  }

  async function bindnodeemp() {
    const GetSubDicts = await ClassFactory.GetEns(EnsOfMyPK);
    await GetSubDicts.Init();
    await GetSubDicts.Retrieve(KeyRefPK, PKVal);
    dataa1.value = [];
    GetSubDicts.forEach((f, i) => {
      dataa1.value.push({
        key: i,
        No: f.GetValByKey(KeyDict),
        Name: f.GetValByKey(KeyDict + 'T'),
        NodeID: f.GetValByKey('FK_Node'),
      });
    });
  }
  fetch();
  const onDelete = async (record) => {
    const en = await ClassFactory.GetEn(EnsOfMyPK);
    await en.Init();
    console.log(PKVal + '_' + record['No']);
    en.SetValByKey('MyPK', PKVal + '_' + record['No']);
    await en.RetrieveFromDBSources();
    await en.Delete();
    bindnodeemp();
  };

  const clickNodeEvent = async (selectedKeys, e: any) => {
    try {
      selectedRowKey.value = [];
      spinning.value = true;
      await handleSelect(e.node.No);
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
      spinning.value = false;
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKey,
    onChange: (selectedRowKeys: (string | number)[], selectedRows) => {
      selectedRowKey.value = selectedRowKeys;
    },
    onSelect: (record, selected: boolean, selectedRows) => {
      if (selected) {
        SaveOneItem(record.No, record.Name);
      }
    },
    onSelectAll: (selected: boolean, selectedRows, changeRows) => {},
  };

  async function SaveOneItem(selectedID, selectName) {
    const en = await ClassFactory.GetEn(EnsOfMyPK);
    await en.Init();
    en.SetValByKey(KeyRefPK, PKVal);
    en.SetValByKey(KeyDict, selectedID);
    en.SetValByKey(KeyDict + 'T', selectName);
    en.SetValByKey('MyPK', PKVal + '_' + selectedID);
    await en.Save();
    message.success('保存成功');
    bindnodeemp();
  }
</script>
