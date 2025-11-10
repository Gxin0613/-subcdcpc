<template>
  <Table :columns="columns" :data-source="treeData" :pagination="false">
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.key === 'name'">
        <Input v-if="editableData.key == record.key" v-model:value="record.name" />
        <template v-else>
          {{ text }}
        </template>
      </template>
      <template v-else-if="column.key === 'op'">
        <Tooltip>
          <template #title>{{ '增加子节点' }}</template>
          <Button @click="addChildren(record)">
            <template #icon><PlusCircleOutlined /> </template>
          </Button>
        </Tooltip>
        <Tooltip>
          <template #title>{{ '删除本节点' }}</template>
          <Button @click="deleteNode(record)">
            <template #icon><DeleteOutlined /> </template>
          </Button>
        </Tooltip>
        <span v-if="editableData.key == record.key">
          <Button @click="saveNode(record.name)">{{ '保存' }}</Button>
          <!-- <a-typography-link >{{'保存'}}</a-typography-link> -->
          <Button @click="cancel()">{{ '取消' }}</Button>
          <!-- <a-popconfirm title="Sure to cancel?" @confirm="cancel(record.key)">
            <Button>{{'取消'}}</Button>
          </a-popconfirm> -->
        </span>
        <span v-else>
          <Tooltip>
            <template #title>{{ '编辑本节点名称' }}</template>
            <Button @click="edit(record)">
              <template #icon><EditOutlined /> </template>
            </Button>
          </Tooltip>
          <!-- <a @click="edit(record.key)">Edit</a> -->
        </span>
      </template>
    </template>
  </Table>
</template>

<script lang="ts" setup>
  import { onMounted, ref, reactive } from 'vue';
  import { Table, message, Button, Tooltip, Input } from 'ant-design-vue';
  import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { SFTableDtl, SFTableDtls } from '/@/WF/Admin/FrmLogic/SFTable/SFTableDtl';

  const maxIndx = ref<number>();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  interface TreeDataItem {
    key: string;
    No: number;
    name: string;
    parentNo: number;
    children?: TreeDataItem[];
  }
  const TreeDictData = ref<any>([]);
  const columns = [
    {
      title: '编号',
      dataIndex: 'No',
      key: 'No',
      width: '40%',
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '操作',
      key: 'op',
      width: '30%',
    },
  ];
  const treeData = ref<TreeDataItem[]>([]);
  const editableData = reactive({
    key: '',
    No: '',
    name: '',
    parentNo: '',
  }); //修改的节点信息

  const InitPage = async () => {
    treeData.value = [];
    //外键是sql形式的时候，只能查看
    // if (props.params.QueryType == 'Sql') {
    //   $('#Btns').hide();
    // }
    const sfTable = new SFTableDtls();
    await sfTable.Retrieve('FK_SFTable', props.params.FK_SFTable, 'Idx');
    if (sfTable.toString().indexOf('err@') != -1) {
      alert(sfTable);
      return;
    }
    if (sfTable.length == 0) {
      // message.info('新建');
      let en = new SFTableDtl();
      en.FK_SFTable = props.params.FK_SFTable;
      en.BH = '001';
      en.ParentNo = '0';
      en.Name = '根目录';
      en.MyPK = en.FK_SFTable + '_' + en.BH;
      await en.Insert();

      en.BH = '002';
      en.Name = 'Node 002';
      en.MyPK = en.FK_SFTable + '_' + en.BH;
      en.ParentNo = '001';
      await en.Insert();

      en.BH = '003';
      en.Name = 'Node 003';
      en.MyPK = en.FK_SFTable + '_' + en.BH;
      en.ParentNo = '001';
      await en.Insert();
      InitPage();
    }

    //ens.value = JSON.parse(ens);
    maxIndx.value = 1;
    // console.log('字典表数据', sfTable);
    TreeDictData.value = sfTable;
    BindData();
    return;
  };
  //绑定列表数据
  const BindData = () => {
    const root = TreeDictData.value.filter((i: SFTableDtl) => i.ParentNo == '0')[0];
    treeData.value = [];
    treeData.value.push({
      key: root.MyPK,
      No: root.BH,
      name: root.Name,
      parentNo: root.ParentNo,
    });
    // maxIndx.value = maxIndx.value + 1;
    toTree(TreeDictData.value, treeData.value);
    // console.log('树形结构', treeData.value);
  };

  //新增
  const addChildren = async (record) => {
    // message.success('新增ji');
    // console.log('新增', record);
    // console.log('原始数据', TreeDictData);
    const length = TreeDictData.value.length;
    let BH = Number(TreeDictData.value[length - 1].BH) + 1; //生成新的编号
    let BHStr = `00${BH}`;
    if (BH > 9) BHStr = `0${BH}`;
    // if (BH > 99) BHStr = `${BH}`;
    let en = new SFTableDtl();
    en.FK_SFTable = props.params.FK_SFTable;
    en.BH = BHStr;
    en.ParentNo = record.No;
    en.Name = `Node ${en.BH}`;
    en.MyPK = en.FK_SFTable + '_' + en.BH;
    await en.Insert();
    TreeDictData.value.push(en);
    BindData();
  };

  //删除
  const deleteNode = async (record: TreeDataItem) => {
    let en = new SFTableDtl();
    en.FK_SFTable = props.params.FK_SFTable;
    en.BH = record.No;
    en.ParentNo = record.parentNo;
    en.Name = record.name;
    en.MyPK = en.FK_SFTable + '_' + en.BH;
    if (record.children?.length == undefined || record.children?.length == 0) {
      await en.Delete();
      TreeDictData.value.forEach((item, index) => {
        if (item.MyPK == en.MyPK) delete TreeDictData.value[index];
      });
      BindData();
    } else message.error('该节点有子节点，不能删除！');
  };

  //编辑
  const edit = (record) => {
    const Node = TreeDictData.value.filter((item) => record.key === item.MyPK)[0];
    // editableData = Node;
    editableData.name = Node.Name;
    editableData.No = Node.BH;
    editableData.key = Node.MyPK;
    editableData.parentNo = Node.ParentNo;
  };
  const saveNode = async (name) => {
    let en = new SFTableDtl();
    en.FK_SFTable = props.params.FK_SFTable;
    en.BH = editableData.No;
    en.ParentNo = editableData.parentNo;
    en.Name = name;
    en.MyPK = en.FK_SFTable + '_' + en.BH;
    await en.Update();
    cancel();
  };
  const cancel = () => {
    editableData.name = '';
    editableData.No = '';
    editableData.key = '';
    editableData.parentNo = '';
  };
  //将后端返回的数组处理成Table需要的树形结构
  //data是后端传回来的数组，tree为树形结构的当前层级
  const toTree = (data, tree) => {
    tree.forEach((item) => {
      const children = data.filter((u) => u.ParentNo === item.No);
      if (children && children.length > 0) {
        item.children = item.children || [];
        children.forEach((i) => {
          item.children.push({
            key: i.MyPK,
            No: i.BH,
            name: i.Name,
            parentNo: i.ParentNo,
          });
        });
        toTree(data, item.children);
      }
    });
  };
  onMounted(async () => {
    await InitPage();
  });
</script>
