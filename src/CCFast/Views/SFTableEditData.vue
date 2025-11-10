<template>
  <div class="ButtonGroup">
    <Button type="success" ghost @click="Save"><FileOutlined />{{ '保存' }}</Button>
    <Button type="primary" ghost @click="New"><PlusOutlined />{{ '新建' }}</Button>
    <Button type="primary" danger ghost @click="Delete"><DeleteOutlined />{{ '删除' }}</Button>
  </div>
  <Table :row-selection="rowSelection" :row-key="`No`" :data-source="dataAll" :columns="columns" :pagination="false" :bordered="true" style="width: 500px">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'key'">
        <Input type="text" :value="record.key + 1" style="width: 40px" />
      </template>
      <template v-else-if="column.dataIndex === 'No'">
        <Input type="text" :value="record.No" style="width: 50px" />
      </template>
      <template v-else>
        <Input type="text" v-model:value="record.Name" />
      </template>
    </template>
  </Table>
</template>

<script lang="ts" setup>
  import { message, Button, Table, Input } from 'ant-design-vue';
  import { FileOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { ref, onMounted, reactive } from 'vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  // 举个例子，可以这样实现
  const columns = [
    // {
    //   title: '',
    //   dataIndex: 'selection',
    //   customRender: (row) => {
    //     return {
    //       ...
    //     }
    //   }
    // },
    {
      title: '#',
      dataIndex: 'key',
    },
    {
      title: '编号',
      dataIndex: 'No',
    },
    {
      title: '名称',
      dataIndex: 'Name',
    },
  ];

  const rowSelection = reactive({
    //获取选择框对应行数据
    onChange: (selectedRowKeys) => {
      rowSelection.selectedRowKeys = selectedRowKeys;
    },
    selectedRowKeys: [],
  });
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  //数据
  const dataAll = ref<Recordable>([]);
  const maxIndx = ref<any>();
  const InitPage = async () => {
    console.log(props.params);
    const FK_SFTable = props.params?.FK_SFTable;
    //获取数据
    const sfTable = new BSEntity('BP.Sys.SFTable', FK_SFTable);
    await sfTable.Retrieve();
    const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
    dataAll.value = ens;
    console.log(dataAll.value);
    dataAll.value = dataAll.value?.map((item, index) => {
      return {
        MyPK: item.MyPK,
        Name: item.Name,
        No: item.No,
        key: index,
      };
    });
    maxIndx.value = dataAll.value.length - 1;
  };
  // 是否保存过了.
  const isSave = ref<boolean>(true);
  const currNewNo = ref<any>(0);
  let dataNo = ref<any>(0);
  // 新建.
  const New = async () => {
    maxIndx.value++;
    if (isSave.value == true) {
      //获取No
      const FK_SFTable = props.params.FK_SFTable;
      const sfTable = new BSEntity('BP.Sys.SFTable', FK_SFTable);
      const generNewNo = await sfTable.DoMethodReturnString('GenerSFTableNewNo');
      dataNo.value = generNewNo;
      currNewNo.value = dataNo.value;
    }
    if (isSave.value == false) {
      if (currNewNo.value != '') {
        dataNo.value = parseInt(currNewNo.value) + 1;
        if (dataNo.value >= 10) {
          dataNo.value = '0' + dataNo.value;
        }
        if (dataNo.value > 0 && dataNo.value < 10) {
          dataNo.value = '00' + dataNo.value;
        }
        currNewNo.value++;
      } else {
        dataNo.value = '';
      }
    }
    console.log(dataAll.value);
    console.log(dataNo.value);
    const MyPK = props.params.FK_SFTable + '_' + dataNo.value;
    dataAll.value.push({
      MyPK: MyPK,
      Name: '',
      No: dataNo.value,
      key: maxIndx.value,
    });
    console.log('NMEWALL', dataAll.value);
    // //按全拼生成编号
    // if (sfTable.NoGenerModel == 2) {
    //   $('#TB_Name_' + maxIndx.value).blur(function () {
    //     var TB_Name = $('#TB_Name_' + maxIndx.value).val();
    //     ParsePinYin(TB_Name, true, 'TB_No_' + maxIndx.value);
    //   });
    // }
    // //按简拼生成编号
    // if (sfTable.NoGenerModel == 3) {
    //   $('#TB_Name_' + maxIndx.value).blur(function () {
    //     var TB_Name = $('#TB_Name_' + maxIndx.value).val();
    //     ParsePinYin(TB_Name, false, 'TB_No_' + maxIndx.value);
    //   });
    // }
    isSave.value = false;
  };
  const dataJson = ref<any>();
  //更新.
  const Save = async () => {
    //保存更新
    const FK_SFTable = props.params.FK_SFTable;
    const SFTable = new BSEntity('BP.Sys.SFTable', FK_SFTable);
    const ens = await SFTable.DoMethodReturnJSON('GenerDataOfJson');
    dataJson.value = ens;
    for (let i = 0; i < dataJson.value.length; i++) {
      var No = dataAll.value[i].No;
      if (props.params.QueryType == 'Dict') {
        No = dataAll.value[i].No;
      }
      const newName = dataAll.value[i]?.Name;
      await SFTable.DoMethodReturnString('UpdateData', No, newName, FK_SFTable);
    }
    console.log('all', dataJson.value);
    console.log('NALL', dataAll.value);
    //保存新增
    for (let j = dataJson.value.length; j < dataAll.value.length; j++) {
      const No = dataAll.value[j]?.No;
      const Name = dataAll.value[j]?.Name;
      console.log('No:' + No, 'Name:' + Name);
      if (No == '' || No == null) {
        message.info('编号不能为空');
        return;
      }
      if (No != undefined || Name != undefined) {
        await SFTable.DoMethodReturnString('InsertData', No, Name, FK_SFTable);
      }
    }
    isSave.value = true;
    await InitPage(); //刷新.
  };
  // 删除;
  const Delete = async () => {
    if (window.confirm('您确定要删除吗？') == false) return;
    const FK_SFTable = props.params.FK_SFTable;
    const sfTable = new BSEntity('BP.Sys.SFTable', FK_SFTable);
    const deleteQueue: Promise<void>[] = [];
    rowSelection.selectedRowKeys.forEach((rowKey) => {
      deleteQueue.push(sfTable.DoMethodReturnString('DeleteData', rowKey, FK_SFTable));
    });
    await Promise.all(deleteQueue);
    // for (let i = 0; i < chooseData.value.length; i++) {
    //   await sfTable.DoMethodReturnString('DeleteData', chooseData.value[i]?.No, FK_SFTable);
    // }
    // chooseData.value = [];
    rowSelection.selectedRowKeys = [];
    await InitPage(); //刷新.
  };
  onMounted(async () => {
    await InitPage();
  });
</script>
<style lang="less" scoped>
  .ButtonGroup {
    button {
      margin: 10px;
    }
  }
  .numSort {
    width: 246px;
  }
  .sortNo {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 4px 11px;
    border: 1px solid gray;
  }
  .checkBoxClick {
    display: flex;
    justify-content: center;
    align-items: center;
    .inputBor {
      outline: none;
      border: 0;
    }
  }
</style>
