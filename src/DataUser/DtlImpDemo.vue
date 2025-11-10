<template xmlns:value="">
  <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px">
    <Table
      :row-selection="{ selectedRowKeys: checkedList, onChange: onSelectChange }"
      :columns="columns"
      :data-source="tableData"
      bordered
      size="small"
      :rowKey="(record, index) => index"
      :pagination="false"
    />
  </div>
</template>
<!--嵌入式表单 组件例子-->
<script setup lang="ts">
  import { message, Table } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
  import DBAccess from '/@/utils/gener/DBAccess';
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  type Key = string | number;
  // 选中的节点
  const checkedList = ref<Key[]>([]);
  const checkInfoList = ref<any[]>([]);
  //查询字段值集合
  const columns = ref<Record<string, string>[]>([]);
  const tableData = ref<any[]>([]); //数据集合

  const onSelectChange = (selectedRowKeys: Key[]) => {
    checkedList.value = selectedRowKeys;
    checkInfoList.value = tableData.value.filter((item, idx) => {
      item['OID'] = 0;
      if (selectedRowKeys.includes(idx)) {
        return item;
      }
    });
    console.log('checkInfoList', checkInfoList.value);
  };
  onMounted(async () => {
    try {
      //const sql = 'SELECT No AS BianHao,Name AS MingCheng,Addr,Age,Tel,Email AS YouJian From Demo_Student';
      const data = (await DBAccess.RunSQLReturnTable('DemoStudent_Student_DtlImpDemo')) || [];
      tableData.value = data;
      columns.value = [
        {
          title: '编号',
          dataIndex: 'BianHao',
          key: '',
        },
        {
          title: '名称',
          dataIndex: 'MingCheng',
          key: '',
        },
        {
          title: '地址',
          dataIndex: 'Addr',
          key: '',
        },
        {
          title: '年龄',
          dataIndex: 'Age',
          key: '',
        },
        {
          title: '电话',
          dataIndex: 'Tel',
          key: '',
        },
        {
          title: '邮件',
          dataIndex: 'YouJian',
          key: '',
        },
      ];
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    }
  });

  defineExpose({
    checkInfoList,
    checkedList,
  });
</script>
