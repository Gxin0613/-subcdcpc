<template>
  <Spin :spinning="loading" style="background-color: white">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else class="content">
      <div v-if="isShowMsg == false">
        <Table :columns="columns" :data-source="tableData" bordered size="small" :rowKey="(record, index) => index" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'Oper'">
              <Button type="link" @click="Done(record)" style="padding: 0px">{{ '执行' }}</Button>
            </template>
            <template v-else>
              {{ record[column.key] }}
            </template>
          </template>
        </Table>
      </div>
      <div v-else>
        <div v-html="msg" style="padding: 10px 20px"> </div>
        <div style="display: flex; justify-content: flex-end; margin-right: 100px">
          <Button type="primary" @click="Close(1)">{{ '关闭' }}</Button>
        </div>
      </div>
    </div>
    <Modal v-model:open="popModal.visible" :title="popModal.title" @ok="PopModalOK">
      <Textarea
        v-model:value="popModal.reason"
        :placeholder="'请输入回滚原因'"
        :style="{ margin: '10px', width: '90%', height: '100px' }"
        :allow-clear="true"
        class="frmStyleType"
      />
    </Modal>
  </Spin>
</template>
<script lang="ts">
  export default {
    name: 'Rollback',
  };
</script>
<script lang="ts" setup>
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { message, Table, Spin, Button, Modal, Textarea } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import BSEntity from '/@/utils/gener/BSEntity';
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '回滚原因',
    width: 800,
    record: {},
    reason: '',
  });
  const loading = ref(false);
  //定义从表表格展示的数据和列
  const columns = ref<any[]>([]);
  const tableData = ref<any[]>([]);
  //退回后显示的信息
  const isShowMsg = ref(false);
  const msg = ref('');
  const InitPage = async () => {
    try {
      loading.value = true;
      const gwf = new GenerWorkFlowExt(props.params.WorkID);
      await gwf.RetrieveFromDBSources();
      if (gwf.WFState != 3) {
        message.error('该流程尚未完成，您不能执行回滚操作。');
        return;
      }

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('Rollback_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      columns.value = [
        {
          title: '日期',
          key: 'RDT',
          align: 'center',
        },
        {
          title: '节点ID',
          key: 'NDFrom',
          align: 'center',
        },
        {
          title: '节点名称',
          key: 'NDFromT',
          align: 'center',
        },
        {
          title: '操作人',
          key: 'EmpFrom',
          align: 'center',
        },
        {
          title: '操作人名称',
          key: 'EmpFromT',
          align: 'center',
        },
        {
          title: '执行',
          key: 'Oper',
          align: 'center',
        },
      ];
      tableData.value = JSON.parse(JSON.stringify(data));
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  const Done = (record) => {
    popModal.visible = true;
    popModal.reason = '';
    popModal.record = record;
  };
  const PopModalOK = async () => {
    if (!popModal.reason) {
      message.warn('请输入回滚原因');
      return;
    }
    //执行回滚
    try {
      const en = new BSEntity('BP.WF.GenerWorkFlow', props.params.WorkID);
      await en.Init();
      await en.RetrieveFromDBSources();
      const data = await en.DoMethodReturnString('DoRollback', popModal.record.NDFrom, popModal.reason, popModal.record.EmpFrom);
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));

        return;
      }
      popModal.visible = false;
      msg.value = data;
      isShowMsg.value = true;
      Close(0);
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  const emit = defineEmits(['handleCancel']);
  const Close = (type: number) => {
    if (type == 0) emit('handleCancel', true);
    else emit('handleCancel', false);
  };
</script>
<style scoped></style>
