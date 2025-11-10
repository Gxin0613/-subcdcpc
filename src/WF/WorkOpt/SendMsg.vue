<template>
  <template v-if="msgType === 'msg'">
    <p v-for="(item, index) in msg" :key="index" v-html="item"></p>
    <div style="text-align: right; margin-right: 35px">
      <Button v-if="isTask" type="primary" @click="ToAllotTask" style="margin-right: 8px; background: #eeeeee; color: #000; border-color: #eeeeee">
        <i class="icon-people"></i>{{ '指定特定的处理人处理' }}</Button
      >
      <Button v-if="isHaveUnSend" type="primary" @click="UnSend" style="margin-right: 8px; background: #eeeeee; color: #000; border-color: #eeeeee">
        <i class="icon-action-undo"></i>{{ '撤销本次发送' }}</Button
      >
      <Button type="primary" @click="handleCancel" style="background: #2279d6; border-color: #2279d6"><i class="icon-close" style="vertical-align: -1px"></i>{{ '关闭' }}</Button>
    </div>
  </template>
  <template v-if="msgType === 'AllotTask'">
    <AllotTask :params="props.params" @handle-cancel="handleCancel" />
  </template>
</template>

<script lang="ts" setup>
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { message, Button } from 'ant-design-vue';
  import { WaiGuaFlow } from '/@/WF/CCForm/WaiGuaFlow';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { PropType, ref } from 'vue';
  import AllotTask from '/@/WF/WorkOpt/AllotTask.vue';
  import { userMyFlowSelfLoader } from '/@/DataUser/OverrideFiles/WF_MyFlow';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    sendFlow: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    WGFlow: {
      type: Object as PropType<WaiGuaFlow>,
      default: null,
    },
  });
  const isOnlyClose = ref(false);
  const isShowMsg = ref(false);
  const isHaveUnSend = ref(false);
  const isTask = ref(false);
  const msgType = ref('');
  const msg = ref([]);
  const { afterSend } = userMyFlowSelfLoader(props.params);
  const InitPage = async () => {
    const { res, methodName } = props.sendFlow;
    let result = res['data'] || '';
    if (res.ReturnType === GPNReturnType.DoNothing && (methodName === 'ShiftFlow' || methodName === 'SendFlow' || methodName === 'DoHungup' || methodName === 'SendCC')) {
      isOnlyClose.value = true;
    } else if (res.ReturnType === GPNReturnType.Message && (methodName === 'ShiftFlow' || methodName === 'DoHungup')) {
      isShowMsg.value = true;
      msgType.value = 'msg';
      msg.value.push(result);
      if (methodName === 'ShiftFlow') {
        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).ShiftAfter();
      }
      isOnlyClose.value = true;
    } else {
      if (methodName === 'SendFlow') {
        if (props.WGFlow != null) await new WaiGuaFlow(props.WGFlow).SendSuccess();
        await afterSend(props.mainData, '', props.params.FK_Flow, props.params.FK_Node, props.params.WorkID);
      }
      isShowMsg.value = true;
      //发送、移交成功后关闭弹窗的关闭按钮
      const eles = document.getElementsByClassName('ant-modal-close-x') as unknown as NodeListOf<HTMLElement>;
      if (eles && eles.length > 0) eles[0].style.display = 'none';
      if (result.includes('@IsCanUnSend=1') == true) {
        isHaveUnSend.value = true;
        result = result.replace('@IsCanUnSend=1', '');
      }
      if (result.includes('@IsCanTask=1') == true) {
        isTask.value = true;
        result = result.replace('@IsCanTask=1', '');
      }
      msgType.value = 'msg';
      msg.value = splitAtString(result);
      if (['SendFlow', 'ShiftFlow', 'DoHungup'].includes(methodName)) isOnlyClose.value = false;
      if (['HuiQian_Send', 'SendCC'].includes(methodName)) isOnlyClose.value = true;
    }
  };
  const emit = defineEmits(['handleCancel', 'UnSend']);

  //分配任务
  const ToAllotTask = () => {
    msgType.value = 'AllotTask';
  };
  //撤销发送
  const UnSend = () => {
    emit('UnSend');
  };
  const handleCancel = () => {
    emit('handleCancel', isOnlyClose.value);
  };
  InitPage();
</script>

<style scoped></style>
