<template>
  <div class="content">
    <Tabs v-model:activeKey="activeKey">
      <TabPane key="1" :tab="'我的词汇'">
        <Button @click="AddRow" class="marginAuto"><PlusOutlined />{{ '新增' }}</Button>
        <Popconfirm :title="'确定要删除选择的行吗?'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="DeleteRows()">
          <Button class="marginAuto"><CloseOutlined />{{ '删除' }}</Button>
        </Popconfirm>
        <Table
          bordered
          :data-source="tableData2"
          :columns="columns"
          :row-selection="{ selectedRowKeys: selectedRowKeys2, onChange: onSelectChange }"
          :rowKey="(record) => record.MyPK"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'Vals'">
              <div class="editable-cell">
                <Input v-model:value="record.Vals" @blur="Save(index)" />
              </div>
            </template>
          </template>
        </Table>
      </TabPane>
      <TabPane v-if="isShowSystemWord" key="2" :tab="'系统词汇'">
        <Table
          bordered
          :data-source="tableData1"
          :columns="columns"
          :row-selection="{ selectedRowKeys: selectedRowKeys1, onChange: onSelectChange }"
          :rowKey="(record) => record.MyPK"
        />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
  import { message, Tabs, TabPane, Input, Table, Popconfirm, Button } from 'ant-design-vue';
  import { PlusOutlined, CloseOutlined } from '@ant-design/icons-vue';
  // 父组件传过来的属性
  import { ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import BSEntities from '/@/utils/gener/BSEntities';
  import WebUser from '/@/bp/web/WebUser';
  import BSEntity from '/@/utils/gener/BSEntity';
  const props = defineProps({
    attrKey: {
      //请求参数集合
      type: String,
      default: '',
    },
    frmID: {
      //请求参数集合
      type: String,
      default: '',
    },
    mapExt: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const activeKey = ref('1');
  const loading = ref(false);
  const isShowSystemWord = ref(false);
  const tableData1 = ref<Record<string, any>[]>([]);
  const tableData2 = ref<Record<string, any>[]>([]);
  const selectedRowKeys1 = ref<string[]>([]);
  const selectedRowKeys2 = ref<string[]>([]);

  const selectNames = ref<string[]>([]);
  const columns = [
    {
      title: '词汇',
      dataIndex: 'Vals',
      align: 'left',
      edit: true,
    },
  ];
  const InitPage = async () => {
    try {
      loading.value = true;
      const doc = props.mapExt.Doc;
      if (!!doc) {
        //系统词汇
        isShowSystemWord.value = true;
        doc.split('@').forEach((item, idx) => {
          if (!!item) {
            tableData1.value.push({ MyPK: idx.toString(), Vals: item });
          }
        });
      }
      //获取我的词汇
      await MyWords();
    } catch (e) {
      message.error(e as string);
    } finally {
      loading.value = false;
    }
  };
  //获取到我的词汇
  const MyWords = async () => {
    tableData2.value = [];
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('AttrKey', props.attrKey);
    handler.AddPara('FK_MapData', props.frmID);
    handler.AddPara('lb', 'myWords');
    const data = await handler.DoMethodReturnString('HelperWordsData');
    JSON.parse(JSON.stringify(data))['MainTable'].forEach((item) => {
      if (!!item) {
        tableData2.value.push({ MyPK: item.MyPK, Vals: item.CurValue });
      }
    });
  };

  const DeleteRows = async () => {
    if (selectedRowKeys2.value.length == 0) {
      message.error('请选择需要删除的行');
      return;
    }
    for (const item of tableData2.value) {
      if (selectedRowKeys2.value.includes(item.MyPK)) {
        const defVal = new BSEntity('BP.Sys.DefVal');
        defVal.setPK(item.MyPK);
        await defVal.Delete();
      }
    }
    message.info('删除成功');
    await MyWords();
  };
  const AddRow = () => {
    tableData2.value.push({ MyPK: '', Vals: '' });
  };
  /**
   * 保存
   * @param index
   * @constructor
   */
  const Save = async (index) => {
    const defVal = new BSEntity('BP.Sys.DefVal');
    defVal.setVal('FrmID', props.frmID);
    defVal.setVal('EmpNo', WebUser.No);
    defVal.setVal('AttrKey', props.attrKey);
    defVal.setVal('LB', '1');
    defVal.setVal('CurValue', tableData2.value[index]['Vals']);
    await defVal.Insert();
    tableData2.value[index]['MyPK'] = defVal.MyPK;
  };

  const onSelectChange = (selectedRowKeys: string[]) => {
    selectNames.value = [];
    if (activeKey.value === '1') selectedRowKeys2.value = selectedRowKeys;
    else selectedRowKeys1.value = selectedRowKeys;
    tableData1.value.forEach((item) => {
      if (selectedRowKeys1.value.includes(item.MyPK)) selectNames.value.push(item.Vals);
    });
    tableData2.value.forEach((item) => {
      if (selectedRowKeys2.value.includes(item.MyPK)) selectNames.value.push(item.Vals);
    });
  };
  InitPage();

  defineExpose({ selectNames });
</script>
<style lang="less"></style>
