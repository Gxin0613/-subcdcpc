<template>
  <Spin :spinning="loading" style="background-color: white">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else class="content">
      <div v-if="isShowMsg == false">
        <Grid :gutter="10">
          <GridItem v-for="(item, idx) in tableData" :key="idx" style="padding-bottom: 5px; flex-basis: 50% !important">
            <span v-for="column in columns" :key="column.Key">
              <div class="vant-gl-text" v-if="column.key != 'Oper'">
                <span style="color: #808399"> {{ column.title }}</span>
                <span>{{ item[column.key] }}</span>
              </div>
              <div v-else>
                <Button color="linear-gradient(to right, rgb(52 128 255), rgb(10 150 238))" size="small" @click="Done(item)" style="width: 100px">{{'执行'}}</Button>
              </div>
            </span>
          </GridItem>
        </Grid>
      </div>
      <div v-else>
        <div v-html="msg" style="padding: 10px 20px"> </div>
        <div style="display: flex; justify-content: flex-end; margin-right: 100px">
          <Button type="primary" @click="Close(1)">{{'关闭'}}</Button>
        </div>
      </div>
    </div>
    <Popup v-model:show="popModal.visible" :closeable="true" @close="PopModalOK">
      <CellGroup inset>
        <Field v-model="popModal.reason" rows="3" autosize :label="'回滚原因'" type="textarea" maxlength="50" :placeholder="'请输入回滚原因'" show-word-limit />
      </CellGroup>
    </Popup>
  </Spin>
</template>
<script lang="ts">
  export default {
    name: 'Rollback',
  };
</script>
<script lang="ts" setup>
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Grid, GridItem, Button, showToast, showFailToast, Popup, CellGroup, Field, showConfirmDialog } from 'vant';
  import { Spin } from 'ant-design-vue';
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
        showFailToast('该流程尚未完成，您不能执行回滚操作。');
        return;
      }

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('Rollback_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        showFailToast(data.replace('err@', ''));
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
    PopModalOK(record);
  };
  const dialogText = ref('');
  const PopModalOK = async (record: string) => {
//    debugger;
    showConfirmDialog({
      title: '请输入内容',
      message: `
            <textarea id="dialogText" rows="2" class="van-field__control" placeholder="请输入回滚原因" aria-labelledby="van-field-21-label" style="height: 48px;"></textarea>
           `,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      allowHtml: true,
      beforeClose: (action) => {
        const value = document.getElementById('dialogText').value;
        dialogText.value = value;
        if (action === 'confirm' && !value) {
          showToast('请输入回滚原因');
          return false;
        }
        return true;
      },
    })
      .then(async () => {
        const flow = new BSEntity('BP.WF.Template.FlowExt', props.params.FK_Flow);
        await flow.Init();
        await flow.RetrieveFromDBSources();
        const data = await flow.DoMethodReturnString('DoRebackFlowData', props.params.WorkID, record.NDFrom, dialogText.value);
        if (typeof data === 'string' && data.includes('err@')) {
          showFailToast(data.replace('err@', ''));
          return;
        }

        showToast(data);
      })
      .catch(() => {});
  };
  const emit = defineEmits(['handleCancel']);
  const Close = (type: number) => {
    if (type == 0) emit('handleCancel', true);
    else emit('handleCancel', false);
  };
</script>
<style lang="less">
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
  :deep(.van-grid-item) {
    flex-basis: 100% !important;
  }
</style>
