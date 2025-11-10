<template>
  <div class="" style="height: calc(var(--viewport-height))">
    <BasicTable @register="registerTable" :pagination="false" style="height: calc(var(--viewport-height))">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'Vals'"><Input v-model:value="record.Vals" /> </template>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
  import { message, Input } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import BasicTable from '/@/components/Table/src/BasicTable.vue';
  import { BasicColumn, useTable } from '/@/components/Table';
  import BSEntity from '/@/utils/gener/BSEntity';
  import WebUser from '/@/bp/web/WebUser';
  import BSEntities from '/@/utils/gener/BSEntities';
  const props = defineProps({
    attrKey: {
      //请求参数集合
      type: String,
      default: '',
    },
  });

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const tableData = ref<Record<string, any>[]>([]);
  const columns = [
    {
      title: 'Vals',
      dataIndex: 'Vals',
      align: 'left',
      edit: true,
    },
  ];
  const modalVisible = ref(false);
  const textDoc = ref('');
  const isNew = ref(false);
  const currMyPK = ref('');
  const currDoc = ref('');
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取数据
      const ens = new BSEntities('BP.Sys.FastInputs');
      await ens.Init();
      const data = await ens.DoMethodReturnJSON('InitData_Flow');
      console.log(data);
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return;
      }
      tableData.value = JSON.parse(JSON.stringify(data));
      setTableData(tableData.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const [registerTable, { setTableData, getSelectRows, clearSelectedRowKeys }] = useTable({
    title: '',
    columns: columns as BasicColumn[],
    dataSource: tableData.value,
    showIndexColumn: false,
    showTableSetting: false,
    tableSetting: { fullScreen: false },
    showHeader: false,
    scroll: { y: 400 },
    rowKey: 'MyPK',
    clickToRowSelect: false, //默认选中，关闭选择行选中
  });
  // rowSelection: {
  //     type: 'checkbox',
  //   },

  //确定
  const handlerOK = async () => {
    if (textDoc.value === '') {
      message.error('请填写数据');
      return;
    }
    if (isNew.value == false && textDoc.value === currDoc.value) {
      // message.error('数据没有任何改变');
      return;
    }
    //判断是否存在
    let result = tableData.value.filter((item) => item.Vals === textDoc.value);
    if (isNew.value == false) result = tableData.value.filter((item) => item.Vals === textDoc.value && item.MyPK != currMyPK.value);
    if (result.length > 0) {
      message.error('该数据已经存在，请重新填写');
      textDoc.value = '';
      return;
    }

    let en = new BSEntity('BP.Sys.FastInput');
    if (isNew.value == false) en = new BSEntity('BP.Sys.FastInput', currMyPK.value);
    en.setVal('EnsName', 'Flow');
    en.setVal('CfgKey', 'Flow');
    en.setVal('AttrKey', props.attrKey);
    en.setVal('FK_Emp', WebUser.No);
    en.setVal('Vals', textDoc.value);
    if (isNew.value == true) await en.Insert();
    else {
      en.setVal('MyPK', currMyPK.value);
      await en.Update();
    }
    textDoc.value = '';
    modalVisible.value = false;
    await InitPage();
  };
  defineExpose({ getSelectRows, clearSelectedRowKeys, tableData });
</script>
<style lang="less"></style>
