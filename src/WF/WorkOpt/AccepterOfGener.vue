<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <EnOnly v-if="isLoad" :params="query" :PKVal="pkVal" :EnName="enName" @handleCancel="handleCancel" @UnSend="UnSend" />
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'AccepterOfGener',
  };
</script>
<script lang="ts" setup>
  import { message, Spin } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import EnOnly from '/@/WF/Comm/EnOnly.vue';
  import { Node } from '/@/WF/TSClass/Node';
  import WebUser from '/@/bp/web/WebUser';
  import { Send } from '/@/WF/WorkOpt/SendAndCC/Send';
  import { SendAndCC } from '/@/WF/WorkOpt/SendAndCC/SendAndCC';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  dayjs.extend(duration);
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
  const loading = ref(false);
  // const isMultiSelect = ref(true); //true 多选
  const isSend = ref(false);
  const enName = ref('');
  const pkVal = ref('');
  const query = ref<Record<string, any>>();
  const en = ref();
  const isLoad = ref(false);
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      query.value = props.params;
      isSend.value = props.params.IsSend || false;
      //如果是通用选择器，判断使用的类
      const nodeExt = new Node(props.params.FK_Node);
      await nodeExt.RetrieveFromDBSources();
      pkVal.value = props.params.PKVal || WebUser.No + '_' + props.params.FK_Node + '_' + props.params.ToNode + '_' + props.params.WorkID;

      //审核状态是启用.
      if (nodeExt.CCRole == 1 || nodeExt.CCRole == 3) {
        enName.value = 'TS.WorkOpt.SendAndCC';
        en.value = new SendAndCC(pkVal.value);
      } else {
        enName.value = 'TS.WorkOpt.Send';
        en.value = new Send(pkVal.value);
      }
      if ((await en.value.RetrieveFromDBSources()) == 0) {
        en.value.WorkID = props.params.WorkID;
        en.value.NodeID = props.params.FK_Node;
        en.value.ToNodeID = props.params.ToNode || 0;
        en.value.EmpNo = WebUser.No;
        en.value.EmpName = WebUser.Name;
        await en.value.Insert();

        //处理发送,自动装载人员.
        if (nodeExt.IsAutoLoadEmps === 1) {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handler.AddPara('WorkID', en.value.WorkID);
          handler.AddPara('NodeID', en.value.NodeID);
          handler.AddPara('ToNodeID', en.value.ToNodeID);
          handler.AddPara('FK_Flow', en.value.FK_Flow);
          handler.AddPara('MyPK', en.value.MyPK);
          const data = await handler.DoMethodReturnString('SendWorkOpt_Init');
          if (typeof data === 'string' && data.includes('err@')) {
            message.error(data.replace('@', ''));
            return;
          }
          await en.value.RetrieveFromDBSources();
        }

        //修改耗时时间
        const gwf = new GenerWorkFlowExt();
        gwf.WorkID = props.params.WorkID;
        await gwf.RetrieveFromDBSources();
        const useTimeFlow = dayjs(new Date()).diff(gwf.RDT, 'second') || 0;
        const useTimeNode = dayjs(new Date()).diff(gwf.SendDT, 'second') || 0;
        en.value.UseTimeFlow = (useTimeFlow > 0 ? '' : '-') + dayjs.duration(useTimeFlow).format('DD天 HH时mm分ss秒');
        en.value.UseTimeNode = (useTimeNode > 0 ? '' : '-') + dayjs.duration(useTimeNode).format('DD天 HH时mm分ss秒');
        en.value.Title = gwf.Title;
        en.value.StarterName = gwf.StarterName;
        en.value.StartRDT = gwf.StartRDT;
        en.value.NodeName = gwf.NodeName;
        en.value.StartRDT = gwf.StartRDT;
        await en.value.Update();
      }
      isLoad.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  //撤销本次发送
  const UnSend = async () => {
    emit('UnSend');
  };
  const emit = defineEmits(['handleCancel', 'UnSend']);
  const handleCancel = () => {
    emit('handleCancel');
  };
</script>
<style lang="less" scoped>
  .ant-divider-horizontal {
    margin: 12px !important;
  }
  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
</style>
